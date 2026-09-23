import { prisma } from "../db/prisma.js";
import { recordAuditEvent } from "../utils/audit.js";

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

// The frontend needs a name to display, not just creatorId/approverId UUIDs --
// work-scope §5.2 lists "Decision maker / responsible authority" as required
// decision content, so this is minimum viable UI data, not scope creep.
const PERSON_SELECT = { id: true, fullName: true, email: true };
const decisionInclude = {
  creator: { select: PERSON_SELECT },
  approver: { select: PERSON_SELECT },
};

// Prisma's default interactive-transaction timeout (5s) is too tight for this
// network path to Neon, which has genuine latency variance (not just a first
// cold-start query) -- a plain create+audit-log transaction has been observed
// to exceed it. This is a real fix, not an environment-specific workaround.
const TRANSACTION_OPTIONS = { timeout: 15000 };

// Every read/write of a decision goes through this -- filtering by
// req.user.companyId, never a client-supplied value. A decision that exists
// but belongs to another company is indistinguishable from one that doesn't
// exist: both return null here, and callers turn that into a 404, never 403.
async function findCompanyDecision(companyId, id) {
  return prisma.decision.findFirst({ where: { id, companyId }, include: decisionInclude });
}

export async function listDecisions(companyId) {
  return prisma.decision.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: decisionInclude,
  });
}

export async function getDecision(companyId, id) {
  const decision = await findCompanyDecision(companyId, id);
  if (!decision) throw new DecisionError("Decision not found.", 404);
  return decision;
}

export async function createDecision(actor, input) {
  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.create({
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
      include: decisionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.created",
      entityType: "Decision",
      entityId: decision.id,
      changes: { title: decision.title, status: decision.status },
    });

    return decision;
  }, TRANSACTION_OPTIONS);
}

export async function updateDecision(actor, id, input) {
  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "DRAFT") {
      throw new DecisionError("Only draft decisions can be edited.", 409);
    }
    if (decision.creatorId !== actor.userId && actor.role !== "Owner") {
      throw new DecisionError("Only the creator (or Owner) can edit this decision.", 403);
    }

    const updated = await tx.decision.update({
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
      include: decisionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.edited",
      entityType: "Decision",
      entityId: id,
      changes: input,
    });

    return updated;
  }, TRANSACTION_OPTIONS);
}

export async function submitDecision(actor, id) {
  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "DRAFT") {
      throw new DecisionError("Only draft decisions can be submitted.", 409);
    }
    if (decision.creatorId !== actor.userId && actor.role !== "Owner") {
      throw new DecisionError("Only the creator (or Owner) can submit this decision.", 403);
    }

    const updated = await tx.decision.update({
      where: { id },
      data: { status: "PENDING_APPROVAL" },
      include: decisionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.submitted",
      entityType: "Decision",
      entityId: id,
      changes: { from: "DRAFT", to: "PENDING_APPROVAL" },
    });

    return updated;
  }, TRANSACTION_OPTIONS);
}

export async function approveDecision(actor, id) {
  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "PENDING_APPROVAL") {
      throw new DecisionError("Only decisions pending approval can be approved.", 409);
    }
    if (!canApproveDecision(actor, decision)) {
      throw new DecisionError("You cannot approve a decision you created.", 403);
    }

    const updated = await tx.decision.update({
      where: { id },
      data: { status: "APPROVED", approverId: actor.userId, approvedAt: new Date() },
      include: decisionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.approved",
      entityType: "Decision",
      entityId: id,
      changes: { from: "PENDING_APPROVAL", to: "APPROVED" },
    });

    return updated;
  }, TRANSACTION_OPTIONS);
}

export async function rejectDecision(actor, id, reason) {
  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.findFirst({ where: { id, companyId: actor.companyId } });
    if (!decision) throw new DecisionError("Decision not found.", 404);

    if (decision.status !== "PENDING_APPROVAL") {
      throw new DecisionError("Only decisions pending approval can be rejected.", 409);
    }
    if (!canApproveDecision(actor, decision)) {
      throw new DecisionError("You cannot reject a decision you created.", 403);
    }

    const updated = await tx.decision.update({
      where: { id },
      data: { status: "REJECTED", approverId: actor.userId, rejectionReason: reason },
      include: decisionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "decision.rejected",
      entityType: "Decision",
      entityId: id,
      changes: { from: "PENDING_APPROVAL", to: "REJECTED", reason },
    });

    return updated;
  }, TRANSACTION_OPTIONS);
}
