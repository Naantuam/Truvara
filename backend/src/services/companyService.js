import { directoryPrisma } from "../db/directoryPrisma.js";

// Any authenticated company member can see their teammates -- needed to
// assign a task to someone. Broader than admin:users:manage on purpose:
// picking an assignee is a routine action for Managers and Owners alike,
// not an admin operation. Adding/editing members (Settings, admin only) is a
// separate concern in settingsService.js.
export async function listCompanyMembers(companyId) {
  const memberships = await directoryPrisma.companyMembership.findMany({
    where: { companyId },
    include: {
      user: { select: { id: true, fullName: true, email: true, isActive: true } },
      role: { select: { name: true } },
    },
  });

  return memberships.map((m) => ({
    id: m.user.id,
    fullName: m.user.fullName,
    email: m.user.email,
    role: m.role.name,
    isActive: m.user.isActive,
  }));
}
