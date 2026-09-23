// Append-only audit trail (work-scope §8). Callers should run this inside the
// same Prisma transaction as the mutation it describes, so an audit row can
// never be written for a change that didn't actually commit (or vice versa).
export async function recordAuditEvent(tx, { companyId, actorId, action, entityType, entityId, changes }) {
  return tx.auditEvent.create({
    data: {
      companyId,
      actorId: actorId ?? null,
      action,
      entityType,
      entityId,
      changes: changes ?? undefined,
    },
  });
}
