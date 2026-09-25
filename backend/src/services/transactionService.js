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

// recordedById references a User in the separate directory database.
async function hydrate(db, transactions) {
  const list = Array.isArray(transactions) ? transactions : [transactions];
  const userMap = await loadUserMap(list.map((t) => t.recordedById));
  const withUsers = list.map((t) => ({ ...t, recordedBy: attachUser(userMap, t.recordedById) }));
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

export async function listTransactions(db, companyId, { decisionId, taskId, type } = {}) {
  const transactions = await db.transaction.findMany({
    where: {
      companyId,
      ...(decisionId ? { decisionId } : {}),
      ...(taskId ? { taskId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { occurredAt: "desc" },
    include: includeRelated,
  });
  return hydrate(db, transactions);
}

export async function getTransaction(db, companyId, id) {
  const transaction = await db.transaction.findFirst({ where: { id, companyId }, include: includeRelated });
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

    const result = await tx.transaction.update({
      where: { id },
      data: {
        narration: input.narration ?? transaction.narration,
        counterparty: input.counterparty ?? transaction.counterparty,
        category: input.category ?? transaction.category,
        amount: input.amount ?? transaction.amount,
        occurredAt: input.occurredAt ?? transaction.occurredAt,
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
  const transactions = await db.transaction.findMany({ where: { companyId } });
  return computeSummary(transactions);
}
