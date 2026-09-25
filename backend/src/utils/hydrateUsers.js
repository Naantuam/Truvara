import { directoryPrisma } from "../db/directoryPrisma.js";

// Tenant records only store bare user-id columns (creatorId, approverId,
// assigneeId, recordedById, actorId...) since the User itself lives in the
// separate directory database -- Prisma (like Postgres) can't join across
// two physical databases. This resolves {id, fullName, email} for a batch of
// ids in one query, instead of one directory round-trip per record.
export async function loadUserMap(userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const users = await directoryPrisma.user.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, fullName: true, email: true },
  });
  return new Map(users.map((u) => [u.id, u]));
}

export function attachUser(userMap, id) {
  if (!id) return null;
  return userMap.get(id) || null;
}
