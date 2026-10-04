import { directoryPrisma } from "../db/directoryPrisma.js";
import { generateActivationToken, sendActivationEmail } from "./activation.js";
import { recordAuditEvent } from "../utils/audit.js";

export class SettingsError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "SettingsError";
    this.status = status;
  }
}

// HIGH priority per work-scope §10: Profile edit/save/persist-after-relogin.
export async function updateProfile(userId, { fullName }) {
  return directoryPrisma.user.update({
    where: { id: userId },
    data: { fullName },
    select: { id: true, fullName: true, email: true },
  });
}

// HIGH priority: Company edit/save/persist. Only the company's own name is
// user-editable here -- tenantDatabaseUrl is an infrastructure concern, not
// something exposed through Settings.
export async function updateCompany(companyId, { name, currency, employeeCount }) {
  return directoryPrisma.company.update({
    where: { id: companyId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(employeeCount !== undefined ? { employeeCount } : {}),
    },
    select: { id: true, name: true, currency: true, employeeCount: true },
  });
}

// MEDIUM priority: Team Members - add member. New people get an activation
// email instead of an admin-generated password (see activation.js) -- they
// set their own password, the admin never sees or handles it.
export async function addMember(companyId, { email, fullName, roleName }) {
  const role = await directoryPrisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new SettingsError("Unknown role.", 400);

  const existingUser = await directoryPrisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMembership = await directoryPrisma.companyMembership.findUnique({
      where: { userId_companyId: { userId: existingUser.id, companyId } },
    });
    if (existingMembership) throw new SettingsError("This person is already a member of this company.", 409);

    await directoryPrisma.companyMembership.create({
      data: { userId: existingUser.id, companyId, roleId: role.id, scopeType: "COMPANY" },
    });
    return { id: existingUser.id, email: existingUser.email, fullName: existingUser.fullName, role: role.name, activationSent: false };
  }

  const { rawToken, tokenHash, expiresAt } = generateActivationToken();
  const user = await directoryPrisma.user.create({
    data: {
      email,
      fullName,
      passwordHash: null,
      activationTokenHash: tokenHash,
      activationTokenExpiresAt: expiresAt,
      primaryCompanyId: companyId,
    },
  });
  await directoryPrisma.companyMembership.create({
    data: { userId: user.id, companyId, roleId: role.id, scopeType: "COMPANY" },
  });
  await sendActivationEmail({ to: email, fullName, rawToken });

  return { id: user.id, email: user.email, fullName: user.fullName, role: role.name, activationSent: true };
}

// MEDIUM priority: Team Members - assign role, edit member info,
// activate/deactivate.
export async function updateMember(companyId, userId, { fullName, roleName, isActive }) {
  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
  if (!membership) throw new SettingsError("This person is not a member of this company.", 404);

  if (fullName !== undefined) {
    await directoryPrisma.user.update({ where: { id: userId }, data: { fullName } });
  }

  // isActive is scoped to this one membership, not the person's whole
  // account -- suspending them from this company never touches any other
  // company they belong to.
  if (roleName !== undefined || isActive !== undefined) {
    const roleId = roleName !== undefined ? (await resolveRoleId(roleName)) : undefined;
    await directoryPrisma.companyMembership.update({
      where: { userId_companyId: { userId, companyId } },
      data: {
        ...(roleId !== undefined ? { roleId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  }

  const user = await directoryPrisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true },
  });
  const updatedMembership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { role: { select: { name: true } } },
  });

  return { ...user, role: updatedMembership.role.name, isActive: updatedMembership.isActive };
}

// Owner-only (admin:users:manage): removes someone's access to this one
// company. The User account itself is never touched -- their fullName stays
// resolvable on every Decision/Task/Transaction/AuditEvent they ever
// touched here, so deleting a person's access never erases the company's
// own history of what they did. A reason is required and recorded in that
// same audit trail, same as void/reject elsewhere in the app.
export async function removeMember(tenantDb, companyId, actor, targetUserId, reason) {
  if (!reason) throw new SettingsError("A reason is required to remove a member.", 400);
  if (targetUserId === actor.userId) throw new SettingsError("You cannot remove yourself.", 400);

  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: targetUserId, companyId } },
  });
  if (!membership) throw new SettingsError("This person is not a member of this company.", 404);

  const user = await directoryPrisma.user.findUnique({
    where: { id: targetUserId },
    select: { fullName: true, email: true },
  });

  await directoryPrisma.companyMembership.delete({
    where: { userId_companyId: { userId: targetUserId, companyId } },
  });

  await recordAuditEvent(tenantDb, {
    companyId,
    actorId: actor.userId,
    action: "member.removed",
    entityType: "User",
    entityId: targetUserId,
    changes: { fullName: user?.fullName, email: user?.email, reason },
  });

  return { id: targetUserId, removed: true };
}

async function resolveRoleId(roleName) {
  const role = await directoryPrisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new SettingsError("Unknown role.", 400);
  return role.id;
}
