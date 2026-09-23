import { prisma } from "../db/prisma.js";
import { recordAuditEvent } from "../utils/audit.js";

export class TaskError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TaskError";
    this.status = status;
  }
}

const PERSON_SELECT = { id: true, fullName: true, email: true };
const taskInclude = {
  assignee: { select: PERSON_SELECT },
  decision: { select: { id: true, title: true, status: true } },
};

// Prisma's default interactive-transaction timeout (5s) is too tight for real
// observed latency to Neon -- see decisionService.js for the same fix.
const TRANSACTION_OPTIONS = { timeout: 15000 };

const ACTIVE_STATUSES = ["PENDING", "IN_PROGRESS"];

// Only Manager/Owner (operations:task:assign) can touch any task; a Team
// Member (view+edit but not assign) can only touch a task assigned to them --
// the "Responsibility" step of Decision -> Action -> Responsibility ->
// Execution -> Outcome shouldn't let one team member edit another's work.
export function canEditTask(actor, task) {
  if (actor.permissions?.has("operations:task:assign")) return true;
  return task.assigneeId === actor.userId;
}

function withComputedFields(task) {
  if (!task) return task;
  const isOverdue = Boolean(
    task.dueDate && ACTIVE_STATUSES.includes(task.status) && new Date(task.dueDate) < new Date()
  );
  return { ...task, isOverdue };
}

async function findCompanyTask(companyId, id) {
  return prisma.task.findFirst({ where: { id, companyId }, include: taskInclude });
}

export async function listTasks(companyId, { decisionId } = {}) {
  const tasks = await prisma.task.findMany({
    where: { companyId, ...(decisionId ? { decisionId } : {}) },
    orderBy: { createdAt: "desc" },
    include: taskInclude,
  });
  return tasks.map(withComputedFields);
}

export async function getTask(companyId, id) {
  const task = await findCompanyTask(companyId, id);
  if (!task) throw new TaskError("Task not found.", 404);
  return withComputedFields(task);
}

// If a decisionId is given, it must be a real decision in the SAME company --
// otherwise this would be a way to link a task into another tenant's data.
async function assertDecisionInCompany(tx, companyId, decisionId) {
  if (!decisionId) return;
  const decision = await tx.decision.findFirst({ where: { id: decisionId, companyId } });
  if (!decision) throw new TaskError("Decision not found.", 404);
}

// Same tenant check for assigning a task to a user -- the assignee must be a
// member of the acting user's company.
async function assertAssigneeInCompany(tx, companyId, assigneeId) {
  if (!assigneeId) return;
  const membership = await tx.companyMembership.findUnique({
    where: { userId_companyId: { userId: assigneeId, companyId } },
  });
  if (!membership) throw new TaskError("Assignee is not a member of this company.", 400);
}

export async function createTask(actor, input) {
  return prisma.$transaction(async (tx) => {
    await assertDecisionInCompany(tx, actor.companyId, input.decisionId);
    await assertAssigneeInCompany(tx, actor.companyId, input.assigneeId);

    const task = await tx.task.create({
      data: {
        companyId: actor.companyId,
        decisionId: input.decisionId ?? null,
        title: input.title,
        description: input.description ?? null,
        assigneeId: input.assigneeId ?? null,
        priority: input.priority ?? null,
        dueDate: input.dueDate ?? null,
      },
      include: taskInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.created",
      entityType: "Task",
      entityId: task.id,
      changes: { title: task.title, decisionId: task.decisionId },
    });

    return withComputedFields(task);
  }, TRANSACTION_OPTIONS);
}

export async function updateTask(actor, id, input) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, companyId: actor.companyId } });
    if (!task) throw new TaskError("Task not found.", 404);
    if (!canEditTask(actor, task)) {
      throw new TaskError("You do not have permission to edit this task.", 403);
    }

    const updated = await tx.task.update({
      where: { id },
      data: {
        title: input.title ?? task.title,
        description: input.description ?? task.description,
        priority: input.priority ?? task.priority,
        dueDate: input.dueDate !== undefined ? input.dueDate : task.dueDate,
      },
      include: taskInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.edited",
      entityType: "Task",
      entityId: id,
      changes: input,
    });

    return withComputedFields(updated);
  }, TRANSACTION_OPTIONS);
}

export async function assignTask(actor, id, assigneeId) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, companyId: actor.companyId } });
    if (!task) throw new TaskError("Task not found.", 404);

    await assertAssigneeInCompany(tx, actor.companyId, assigneeId);

    const updated = await tx.task.update({
      where: { id },
      data: { assigneeId },
      include: taskInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.assigned",
      entityType: "Task",
      entityId: id,
      changes: { assigneeId },
    });

    return withComputedFields(updated);
  }, TRANSACTION_OPTIONS);
}

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export async function updateTaskStatus(actor, id, status, outcome) {
  if (!VALID_STATUSES.includes(status)) {
    throw new TaskError("Invalid status.", 400);
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, companyId: actor.companyId } });
    if (!task) throw new TaskError("Task not found.", 404);
    if (!canEditTask(actor, task)) {
      throw new TaskError("You do not have permission to update this task.", 403);
    }
    if (task.status === "COMPLETED") {
      throw new TaskError("This task is already completed and cannot be reopened here.", 409);
    }

    const updated = await tx.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : task.completedAt,
        outcome: status === "COMPLETED" ? (outcome ?? task.outcome) : task.outcome,
      },
      include: taskInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.status_changed",
      entityType: "Task",
      entityId: id,
      changes: { from: task.status, to: status, outcome: outcome ?? null },
    });

    return withComputedFields(updated);
  }, TRANSACTION_OPTIONS);
}
