import { prisma } from "../db/prisma.js";

// Pure and exported for testing -- work-scope §5.5 says the dashboard must
// not be a separately-populated data source, so this just narrates the
// append-only audit_events log (§8), which already records every action.
const ACTION_DESCRIPTIONS = {
  "decision.created": "created a decision",
  "decision.edited": "edited a decision",
  "decision.submitted": "submitted a decision for approval",
  "decision.approved": "approved a decision",
  "decision.rejected": "rejected a decision",
  "task.created": "created a task",
  "task.edited": "edited a task",
  "task.assigned": "reassigned a task",
  "task.status_changed": "updated a task",
  "transaction.created": "recorded a transaction",
  "transaction.edited": "edited a transaction",
};

export function describeAction(action) {
  return ACTION_DESCRIPTIONS[action] || action;
}

// Batch-resolve a human-readable "target" (title/narration) per audit event
// by entity type, instead of one query per event.
async function resolveTargets(events) {
  const idsByType = { Decision: [], Task: [], Transaction: [] };
  for (const e of events) {
    if (idsByType[e.entityType]) idsByType[e.entityType].push(e.entityId);
  }

  const [decisions, tasks, transactions] = await Promise.all([
    idsByType.Decision.length
      ? prisma.decision.findMany({ where: { id: { in: idsByType.Decision } }, select: { id: true, title: true } })
      : [],
    idsByType.Task.length
      ? prisma.task.findMany({ where: { id: { in: idsByType.Task } }, select: { id: true, title: true } })
      : [],
    idsByType.Transaction.length
      ? prisma.transaction.findMany({ where: { id: { in: idsByType.Transaction } }, select: { id: true, narration: true } })
      : [],
  ]);

  const titleMap = new Map();
  decisions.forEach((d) => titleMap.set(`Decision:${d.id}`, d.title));
  tasks.forEach((t) => titleMap.set(`Task:${t.id}`, t.title));
  transactions.forEach((t) => titleMap.set(`Transaction:${t.id}`, t.narration || "a transaction"));
  return titleMap;
}

export async function getRecentActivity(companyId, limit = 15) {
  const events = await prisma.auditEvent.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: { fullName: true } } },
  });

  const titleMap = await resolveTargets(events);

  return events.map((e) => ({
    id: e.id,
    actor: e.actor?.fullName || "Someone",
    action: describeAction(e.action),
    target: titleMap.get(`${e.entityType}:${e.entityId}`) || null,
    createdAt: e.createdAt,
  }));
}
