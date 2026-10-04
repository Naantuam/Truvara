import { recordAuditEvent } from "../utils/audit.js";
import { loadUserMap, attachUser } from "../utils/hydrateUsers.js";

export class TransactionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TransactionError";
    this.status = status;
  }
}

const TRANSACTION_OPTIONS = { timeout: 15000 };
const includeRelated = { decision: { select: { id: true, title: true } }, task: { select: { id: true, title: true } } };

// Maker-checker, same rule as canApproveDecision: Owner may always approve
// (the agreed single-founder exception); anyone else can't approve/reject/
// void a transaction they recorded themselves.
export function canApproveTransaction(actor, transaction) {
  if (actor.role === "Owner") return true;
  return transaction.recordedById !== actor.userId;
}

// recordedById references a User in the separate directory database.
async function hydrate(db, transactions) {
  const list = Array.isArray(transactions) ? transactions : [transactions];
  const userMap = await loadUserMap(list.flatMap((t) => [t.recordedById, t.modifiedById, t.approverId, t.voidedById]));
  const withUsers = list.map((t) => ({
    ...t,
    recordedBy: attachUser(userMap, t.recordedById),
    modifiedBy: attachUser(userMap, t.modifiedById),
    approver: attachUser(userMap, t.approverId),
    voidedBy: attachUser(userMap, t.voidedById),
  }));
  return Array.isArray(transactions) ? withUsers : withUsers[0];
}

async function assertDecisionInCompany(tx, companyId, decisionId) {
  if (!decisionId) return;
  const decision = await tx.decision.findFirst({ where: { id: decisionId, companyId } });
  if (!decision) throw new TransactionError("Decision not found.", 404);
}

async function assertTaskInCompany(tx, companyId, taskId) {
  if (!taskId) return;
  const task = await tx.task.findFirst({ where: { id: taskId, companyId } });
  if (!task) throw new TransactionError("Task not found.", 404);
}

// Voided transactions are excluded by default -- Precious's explicit ask was
// "I don't want to see them," and leaving the API returning them to anyone
// with plain view access (even though the UI didn't render them) would be
// exactly the kind of unchecked exposure worth closing. They're never
// deleted -- `includeVoided` is how an Owner (the same tier that can void in
// the first place) can still retrieve them for audit purposes.
export async function listTransactions(db, companyId, { decisionId, taskId, type, includeVoided } = {}) {
  const transactions = await db.transaction.findMany({
    where: {
      companyId,
      ...(decisionId ? { decisionId } : {}),
      ...(taskId ? { taskId } : {}),
      ...(type ? { type } : {}),
      ...(includeVoided ? {} : { isVoided: false }),
    },
    orderBy: { occurredAt: "desc" },
    include: includeRelated,
  });
  return hydrate(db, transactions);
}

export async function getTransaction(db, companyId, id, { includeVoided } = {}) {
  const transaction = await db.transaction.findFirst({
    where: { id, companyId, ...(includeVoided ? {} : { isVoided: false }) },
    include: includeRelated,
  });
  if (!transaction) throw new TransactionError("Transaction not found.", 404);
  return hydrate(db, transaction);
}

export async function createTransaction(db, actor, input) {
  const transaction = await db.$transaction(async (tx) => {
    await assertDecisionInCompany(tx, actor.companyId, input.decisionId);
    await assertTaskInCompany(tx, actor.companyId, input.taskId);

    const created = await tx.transaction.create({
      data: {
        companyId: actor.companyId,
        recordedById: actor.userId,
        decisionId: input.decisionId ?? null,
        taskId: input.taskId ?? null,
        type: input.type,
        amount: input.amount,
        // Always the company's own configured currency, never client-supplied
        // -- there's no multi-currency-per-company feature, so this is the
        // single source of truth rather than something the request could
        // get wrong or spoof.
        currency: actor.companyCurrency || "NGN",
        narration: input.narration ?? null,
        counterparty: input.counterparty ?? null,
        category: input.category ?? null,
        occurredAt: input.occurredAt,
      },
      include: includeRelated,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.created",
      entityType: "Transaction",
      entityId: created.id,
      changes: { type: created.type, amount: String(created.amount) },
    });

    return created;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, transaction);
}

export async function updateTransaction(db, actor, id, input) {
  const updated = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, companyId: actor.companyId } });
    if (!transaction) throw new TransactionError("Transaction not found.", 404);
    if (transaction.status !== "PENDING_APPROVAL") {
      throw new TransactionError("Only a transaction still awaiting approval can be edited.", 409);
    }

    const result = await tx.transaction.update({
      where: { id },
      data: {
        narration: input.narration ?? transaction.narration,
        counterparty: input.counterparty ?? transaction.counterparty,
        category: input.category ?? transaction.category,
        amount: input.amount ?? transaction.amount,
        occurredAt: input.occurredAt ?? transaction.occurredAt,
        modifiedById: actor.userId,
      },
      include: includeRelated,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.edited",
      entityType: "Transaction",
      entityId: id,
      changes: input,
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

export async function approveTransaction(db, actor, id) {
  const updated = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, companyId: actor.companyId } });
    if (!transaction) throw new TransactionError("Transaction not found.", 404);
    if (transaction.status !== "PENDING_APPROVAL") {
      throw new TransactionError("Only a transaction awaiting approval can be approved.", 409);
    }
    if (!canApproveTransaction(actor, transaction)) {
      throw new TransactionError("You cannot approve a transaction you recorded yourself.", 403);
    }

    const result = await tx.transaction.update({
      where: { id },
      data: { status: "APPROVED", approverId: actor.userId, approvedAt: new Date(), modifiedById: actor.userId },
      include: includeRelated,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.approved",
      entityType: "Transaction",
      entityId: id,
      changes: { from: "PENDING_APPROVAL", to: "APPROVED" },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

export async function rejectTransaction(db, actor, id, reason) {
  const updated = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, companyId: actor.companyId } });
    if (!transaction) throw new TransactionError("Transaction not found.", 404);
    if (transaction.status !== "PENDING_APPROVAL") {
      throw new TransactionError("Only a transaction awaiting approval can be rejected.", 409);
    }
    if (!canApproveTransaction(actor, transaction)) {
      throw new TransactionError("You cannot reject a transaction you recorded yourself.", 403);
    }

    const result = await tx.transaction.update({
      where: { id },
      data: { status: "REJECTED", approverId: actor.userId, rejectionReason: reason, modifiedById: actor.userId },
      include: includeRelated,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.rejected",
      entityType: "Transaction",
      entityId: id,
      changes: { from: "PENDING_APPROVAL", to: "REJECTED", reason },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

// Void is the only way to retract a posted (APPROVED) transaction -- never
// edited, never deleted. The row stays forever; it just stops counting.
export async function voidTransaction(db, actor, id, reason) {
  if (!reason) throw new TransactionError("A reason is required to void a transaction.", 400);

  const updated = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, companyId: actor.companyId } });
    if (!transaction) throw new TransactionError("Transaction not found.", 404);
    if (transaction.status !== "APPROVED") {
      throw new TransactionError("Only an approved transaction can be voided.", 409);
    }
    if (transaction.isVoided) {
      throw new TransactionError("This transaction is already voided.", 409);
    }
    if (!canApproveTransaction(actor, transaction)) {
      throw new TransactionError("You cannot void a transaction you recorded yourself.", 403);
    }

    const result = await tx.transaction.update({
      where: { id },
      data: { isVoided: true, voidedById: actor.userId, voidedAt: new Date(), voidReason: reason, modifiedById: actor.userId },
      include: includeRelated,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.voided",
      entityType: "Transaction",
      entityId: id,
      changes: { reason },
    });

    return result;
  }, TRANSACTION_OPTIONS);

  return hydrate(db, updated);
}

// Pure aggregation, kept separate from the DB call so it's testable without
// Prisma (work-scope §5.4 "transaction history and basic summaries").
export function computeSummary(transactions) {
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);

  const byCategory = {};
  for (const t of transactions) {
    const key = t.category || "Uncategorized";
    byCategory[key] = (byCategory[key] || 0) + Number(t.amount) * (t.type === "EXPENSE" ? -1 : 1);
  }

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    count: transactions.length,
    byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
  };
}

export async function getSummary(db, companyId) {
  const transactions = await db.transaction.findMany({ where: { companyId, status: "APPROVED", isVoided: false } });
  return computeSummary(transactions);
}
