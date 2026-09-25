import { directoryPrisma } from "../db/directoryPrisma.js";
import { generateActivationToken, sendActivationEmail } from "./activation.js";

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
export async function updateCompany(companyId, { name }) {
  return directoryPrisma.company.update({
    where: { id: companyId },
    data: { name },
    select: { id: true, name: true },
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

  if (fullName !== undefined || isActive !== undefined) {
    await directoryPrisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  }

  if (roleName !== undefined) {
    const role = await directoryPrisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new SettingsError("Unknown role.", 400);
    await directoryPrisma.companyMembership.update({
      where: { userId_companyId: { userId, companyId } },
      data: { roleId: role.id },
    });
  }

  const user = await directoryPrisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, isActive: true },
  });
  const updatedMembership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { role: { select: { name: true } } },
  });

  return { ...user, role: updatedMembership.role.name };
}
