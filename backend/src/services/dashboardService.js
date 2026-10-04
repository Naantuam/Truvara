import { directoryPrisma } from "../db/directoryPrisma.js";

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
  "transaction.approved": "approved a transaction",
  "transaction.rejected": "rejected a transaction",
  "transaction.voided": "voided a transaction",
  "member.removed": "removed a team member",
};

export function describeAction(action) {
  return ACTION_DESCRIPTIONS[action] || action;
}

// Batch-resolve a human-readable "target" (title/narration) per audit event
// by entity type, instead of one query per event.
async function resolveTargets(db, events) {
  const idsByType = { Decision: [], Task: [], Transaction: [] };
  for (const e of events) {
    if (idsByType[e.entityType]) idsByType[e.entityType].push(e.entityId);
  }

  const [decisions, tasks, transactions] = await Promise.all([
    idsByType.Decision.length
      ? db.decision.findMany({ where: { id: { in: idsByType.Decision } }, select: { id: true, title: true } })
      : [],
    idsByType.Task.length
      ? db.task.findMany({ where: { id: { in: idsByType.Task } }, select: { id: true, title: true } })
      : [],
    idsByType.Transaction.length
      ? db.transaction.findMany({ where: { id: { in: idsByType.Transaction } }, select: { id: true, narration: true } })
      : [],
  ]);

  const titleMap = new Map();
  decisions.forEach((d) => titleMap.set(`Decision:${d.id}`, d.title));
  tasks.forEach((t) => titleMap.set(`Task:${t.id}`, t.title));
  transactions.forEach((t) => titleMap.set(`Transaction:${t.id}`, t.narration || "a transaction"));
  return titleMap;
}

export async function getRecentActivity(db, companyId, limit = 15) {
  const events = await db.auditEvent.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const [titleMap, actorMap] = await Promise.all([
    resolveTargets(db, events),
    (async () => {
      const actorIds = [...new Set(events.map((e) => e.actorId).filter(Boolean))];
      if (actorIds.length === 0) return new Map();
      const actors = await directoryPrisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, fullName: true },
      });
      return new Map(actors.map((a) => [a.id, a.fullName]));
    })(),
  ]);

  return events.map((e) => ({
    id: e.id,
    actor: (e.actorId && actorMap.get(e.actorId)) || "Someone",
    action: describeAction(e.action),
    target: titleMap.get(`${e.entityType}:${e.entityId}`) || null,
    createdAt: e.createdAt,
    // Full detail for the notification details modal -- actionCode is the
    // raw audit action ("decision.approved"), changes is whatever that
    // action recorded (e.g. {from, to} for a status change, {reason} for a
    // rejection/void), entityType/entityId identify the underlying record.
    actionCode: e.action,
    entityType: e.entityType,
    entityId: e.entityId,
    changes: e.changes,
  }));
}

// Unread tracking is a single timestamp per membership, not a row per
// notification -- an item counts as unread if it happened after the last
// time this person opened the bell, same pattern as a basic "mark all read."
export async function markNotificationsRead(userId, companyId) {
  const membership = await directoryPrisma.companyMembership.update({
    where: { userId_companyId: { userId, companyId } },
    data: { notificationsReadAt: new Date() },
    select: { notificationsReadAt: true },
  });
  return membership.notificationsReadAt;
}
