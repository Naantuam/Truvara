import { prisma } from "../db/prisma.js";
import { recordAuditEvent } from "../utils/audit.js";

export class TransactionError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TransactionError";
    this.status = status;
  }
}

const PERSON_SELECT = { id: true, fullName: true, email: true };
const transactionInclude = {
  recordedBy: { select: PERSON_SELECT },
  decision: { select: { id: true, title: true } },
  task: { select: { id: true, title: true } },
};

// Prisma's default interactive-transaction timeout (5s) is too tight for real
// observed latency to Neon -- see decisionService.js for the same fix.
const TRANSACTION_OPTIONS = { timeout: 15000 };

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

export async function listTransactions(companyId, { decisionId, taskId, type } = {}) {
  return prisma.transaction.findMany({
    where: {
      companyId,
      ...(decisionId ? { decisionId } : {}),
      ...(taskId ? { taskId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { occurredAt: "desc" },
    include: transactionInclude,
  });
}

export async function getTransaction(companyId, id) {
  const transaction = await prisma.transaction.findFirst({ where: { id, companyId }, include: transactionInclude });
  if (!transaction) throw new TransactionError("Transaction not found.", 404);
  return transaction;
}

export async function createTransaction(actor, input) {
  return prisma.$transaction(async (tx) => {
    await assertDecisionInCompany(tx, actor.companyId, input.decisionId);
    await assertTaskInCompany(tx, actor.companyId, input.taskId);

    const transaction = await tx.transaction.create({
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
      include: transactionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.created",
      entityType: "Transaction",
      entityId: transaction.id,
      changes: { type: transaction.type, amount: String(transaction.amount) },
    });

    return transaction;
  }, TRANSACTION_OPTIONS);
}

export async function updateTransaction(actor, id, input) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({ where: { id, companyId: actor.companyId } });
    if (!transaction) throw new TransactionError("Transaction not found.", 404);

    const updated = await tx.transaction.update({
      where: { id },
      data: {
        narration: input.narration ?? transaction.narration,
        counterparty: input.counterparty ?? transaction.counterparty,
        category: input.category ?? transaction.category,
        amount: input.amount ?? transaction.amount,
        occurredAt: input.occurredAt ?? transaction.occurredAt,
      },
      include: transactionInclude,
    });

    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "transaction.edited",
      entityType: "Transaction",
      entityId: id,
      changes: input,
    });

    return updated;
  }, TRANSACTION_OPTIONS);
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

export async function getSummary(companyId) {
  const transactions = await prisma.transaction.findMany({ where: { companyId } });
  return computeSummary(transactions);
}
