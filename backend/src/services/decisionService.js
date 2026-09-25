import { recordAuditEvent } from "../utils/audit.js";
import { loadUserMap, attachUser } from "../utils/hydrateUsers.js";

export class DecisionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DecisionError";
    this.status = status;
  }
}

// Segregation of duties (work-scope §11 discussion with Precious): a decision's
// creator cannot also approve it. Owner is the single agreed exception, for a
// single-founder company where there may be no one else to approve.
export function canApproveDecision(actor, decision) {
  if (actor.role === "Owner") return true;
  return decision.creatorId !== actor.userId;
}

// Prisma's default interactive-transaction timeout (5s) is too tight for real
// observed latency to Neon -- kept generous here too.
const TRANSACTION_OPTIONS = { timeout: 15000 };

// creatorId/approverId reference Users in the separate directory database --
// resolved here per call rather than via Prisma `include` (not possible
// across two physical databases). department, tasks, transactions, and
// documents all live in the same tenant DB as Decision, so those stay as
// normal Prisma includes.
async function hydrate(db, decisions) {
  const list = Array.isArray(decisions) ? decisions : [decisions];
  const userMap = await loadUserMap(list.flatMap((d) => [d.creatorId, d.approverId]));
  const withUsers = list.map((d) => ({
    ...d,
    creator: attachUser(userMap, d.creatorId),
    approver: attachUser(userMap, d.approverId),
  }));
  return Array.isArray(decisions) ? withUsers : withUsers[0];
}

async function findCompanyDecision(db, companyId, id) {
  return db.decision.findFirst({ where: { id, companyId } });
}

export async function listDecisions(db, companyId) {
  const decisions = await db.decision.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  return hydrate(db, decisions);
}

export async function getDecision(db, companyId, id) {
  const decision = await findCompanyDecision(db, companyId, id);
  if (!decision) throw new DecisionError("Decision not found.", 404);
  return hydrate(db, decision);
}

export async function createDecision(db, actor, input) {
  const decision = await db.$transaction(async (tx) => {
    const created = await tx.decision.create({
      data: {
        companyId: actor.companyId,
        creatorId: actor.userId,
        title: input.title,
        description: input.description ?? null,
        proposedAction: input.proposedAction ?? null,
        stakeholders: input.stakeholders ?? null,
        departmentId: input.departmentId ?? null,
        priority: input.priority ?? null,
        expectedAmount: input.expectedAmount ?? null,
      },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.created",
      entityType: "Decision",
      entityId: created.id,
      changes: { title: created.title, status: created.status },
    });

    return created;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, decision);
}

export async function updateDecision(db, actor, id, input) {
  const updated = await db.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "DRAFT") {
      throw new DecisionError("Only draft decisions can be edited.", 409);
    }
    if (decision.creatorId !== actor.userId && actor.role !== "Owner") {
      throw new DecisionError("Only the creator (or Owner) can edit this decision.", 403);
    }

    const result = await tx.decision.update({
      where: { id },
      data: {
        title: input.title ?? decision.title,
        description: input.description ?? decision.description,
        proposedAction: input.proposedAction ?? decision.proposedAction,
        stakeholders: input.stakeholders ?? decision.stakeholders,
        departmentId: input.departmentId ?? decision.departmentId,
        priority: input.priority ?? decision.priority,
        expectedAmount: input.expectedAmount ?? decision.expectedAmount,
      },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.edited",
      entityType: "Decision",
      entityId: id,
      changes: input,
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

export async function submitDecision(db, actor, id) {
  const updated = await db.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "DRAFT") {
      throw new DecisionError("Only draft decisions can be submitted.", 409);
    }
    if (decision.creatorId !== actor.userId && actor.role !== "Owner") {
      throw new DecisionError("Only the creator (or Owner) can submit this decision.", 403);
    }

    const result = await tx.decision.update({
      where: { id },
      data: { status: "PENDING_APPROVAL" },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.submitted",
      entityType: "Decision",
      entityId: id,
      changes: { from: "DRAFT", to: "PENDING_APPROVAL" },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

export async function approveDecision(db, actor, id) {
  const updated = await db.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "PENDING_APPROVAL") {
      throw new DecisionError("Only decisions pending approval can be approved.", 409);
    }
    if (!canApproveDecision(actor, decision)) {
      throw new DecisionError("You cannot approve a decision you created.", 403);
    }

    const result = await tx.decision.update({
      where: { id },
      data: { status: "APPROVED", approverId: actor.userId, approvedAt: new Date() },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.approved",
      entityType: "Decision",
      entityId: id,
      changes: { from: "PENDING_APPROVAL", to: "APPROVED" },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

export async function rejectDecision(db, actor, id, reason) {
  const updated = await db.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "PENDING_APPROVAL") {
      throw new DecisionError("Only decisions pending approval can be rejected.", 409);
    }
    if (!canApproveDecision(actor, decision)) {
      throw new DecisionError("You cannot reject a decision you created.", 403);
    }

    const result = await tx.decision.update({
      where: { id },
      data: { status: "REJECTED", approverId: actor.userId, rejectionReason: reason },
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.rejected",
      entityType: "Decision",
      entityId: id,
      changes: { from: "PENDING_APPROVAL", to: "REJECTED", reason },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}
