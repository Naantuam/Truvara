import { recordAuditEvent } from "../utils/audit.js";
import { loadUserMap, attachUser } from "../utils/hydrateUsers.js";
import { directoryPrisma } from "../db/directoryPrisma.js";

export class TaskError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TaskError";
    this.status = status;
  }
}

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

// assigneeId references a User in the separate directory database; decision
// stays a normal Prisma include since Task and Decision share the same
// tenant DB.
async function hydrate(db, tasks) {
  const list = Array.isArray(tasks) ? tasks : [tasks];
  const userMap = await loadUserMap(list.map((t) => t.assigneeId));
  const withUsers = list.map((t) => ({ ...withComputedFields(t), assignee: attachUser(userMap, t.assigneeId) }));
  return Array.isArray(tasks) ? withUsers : withUsers[0];
}

async function findCompanyTask(db, companyId, id) {
  return db.task.findFirst({ where: { id, companyId }, include: { decision: { select: { id: true, title: true, status: true } } } });
}

export async function listTasks(db, companyId, { decisionId } = {}) {
  const tasks = await db.task.findMany({
    where: { companyId, ...(decisionId ? { decisionId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { decision: { select: { id: true, title: true, status: true } } },
  });
  return hydrate(db, tasks);
}

export async function getTask(db, companyId, id) {
  const task = await findCompanyTask(db, companyId, id);
  if (!task) throw new TaskError("Task not found.", 404);
  return hydrate(db, task);
}

// If a decisionId is given, it must be a real decision in the SAME company --
// otherwise this would be a way to link a task into another tenant's data.
async function assertDecisionInCompany(tx, companyId, decisionId) {
  if (!decisionId) return;
  const decision = await tx.decision.findFirst({ where: { id: decisionId, companyId } });
  if (!decision) throw new TaskError("Decision not found.", 404);
}

// The assignee must be a real member of this company -- checked against the
// directory, since Task only stores a bare user id, not a relation.
async function assertAssigneeInCompany(companyId, assigneeId) {
  if (!assigneeId) return;
  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: assigneeId, companyId } },
  });
  if (!membership) throw new TaskError("Assignee is not a member of this company.", 400);
}

export async function createTask(db, actor, input) {
  const task = await db.$transaction(async (tx) => {
    await assertDecisionInCompany(tx, actor.companyId, input.decisionId);
    await assertAssigneeInCompany(actor.companyId, input.assigneeId);

    const created = await tx.task.create({
      data: {
        companyId: actor.companyId,
        decisionId: input.decisionId ?? null,
        title: input.title,
        description: input.description ?? null,
        assigneeId: input.assigneeId ?? null,
        priority: input.priority ?? null,
        dueDate: input.dueDate ?? null,
      },
      include: { decision: { select: { id: true, title: true, status: true } } },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.created",
      entityType: "Task",
      entityId: created.id,
      changes: { title: created.title, decisionId: created.decisionId },
    });

    return created;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, task);
}

export async function updateTask(db, actor, id, input) {
  const updated = await db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, companyId: actor.companyId } });
    if (!task) throw new TaskError("Task not found.", 404);
    if (!canEditTask(actor, task)) {
      throw new TaskError("You do not have permission to edit this task.", 403);
    }

    const result = await tx.task.update({
      where: { id },
      data: {
        title: input.title ?? task.title,
        description: input.description ?? task.description,
        priority: input.priority ?? task.priority,
        dueDate: input.dueDate !== undefined ? input.dueDate : task.dueDate,
      },
      include: { decision: { select: { id: true, title: true, status: true } } },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.edited",
      entityType: "Task",
      entityId: id,
      changes: input,
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

export async function assignTask(db, actor, id, assigneeId) {
  const updated = await db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, companyId: actor.companyId } });
    if (!task) throw new TaskError("Task not found.", 404);

    await assertAssigneeInCompany(actor.companyId, assigneeId);

    const result = await tx.task.update({
      where: { id },
      data: { assigneeId },
      include: { decision: { select: { id: true, title: true, status: true } } },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.assigned",
      entityType: "Task",
      entityId: id,
      changes: { assigneeId },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export async function updateTaskStatus(db, actor, id, status, outcome) {
  if (!VALID_STATUSES.includes(status)) {
    throw new TaskError("Invalid status.", 400);
  }

  const updated = await db.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, companyId: actor.companyId } });
    if (!task) throw new TaskError("Task not found.", 404);
    if (!canEditTask(actor, task)) {
      throw new TaskError("You do not have permission to update this task.", 403);
    }
    if (task.status === "COMPLETED") {
      throw new TaskError("This task is already completed and cannot be reopened here.", 409);
    }

    const result = await tx.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : task.completedAt,
        outcome: status === "COMPLETED" ? (outcome ?? task.outcome) : task.outcome,
      },
      include: { decision: { select: { id: true, title: true, status: true } } },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "task.status_changed",
      entityType: "Task",
      entityId: id,
      changes: { from: task.status, to: status, outcome: outcome ?? null },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}
