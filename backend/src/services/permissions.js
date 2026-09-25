import { directoryPrisma } from "../db/directoryPrisma.js";

// Loaded fresh per request rather than cached in the JWT: a permission change
// (or a role change) must take effect on the user's very next request, not
// only after their token expires.
export async function loadPermissionContext(userId, companyId) {
  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } },
      company: { select: { tenantDatabaseUrl: true } },
    },
  });

  if (!membership) return null;

  const permissions = new Set(membership.role.rolePermissions.map((rp) => rp.permission.code));

  return {
    membershipId: membership.id,
    role: membership.role.name,
    scopeType: membership.scopeType,
    departmentId: membership.departmentId,
    permissions,
    tenantDatabaseUrl: membership.company.tenantDatabaseUrl,
  };
}

// Central authorization check, parameterized per work-scope §11/§9 and the
// agreed Role -> Permission -> Scope model. `resource` carries whatever the
// caller needs to evaluate scope (e.g. { departmentId, creatorId }) -- kept
// generic now so Phase 2 can tighten scope rules without changing call sites.
export function can(actor, permissionCode, resource = {}) {
  if (!actor?.permissions?.has(permissionCode)) return false;

  if (actor.scopeType === "DEPARTMENT" && resource.departmentId) {
    return actor.departmentId === resource.departmentId;
  }

  if (actor.scopeType === "ASSIGNED_ONLY" && resource.assigneeId) {
    return actor.userId === resource.assigneeId;
  }

  return true;
}
