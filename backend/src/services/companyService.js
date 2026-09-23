import { prisma } from "../db/prisma.js";

// Any authenticated company member can see their teammates -- needed to
// assign a task to someone. Broader than admin:users:manage on purpose:
// picking an assignee is a routine action for Managers and Owners alike,
// not an admin operation. Inviting/removing members is a separate,
// not-yet-built concern (see bms_system_open_concerns memory).
export async function listCompanyMembers(companyId) {
  const memberships = await prisma.companyMembership.findMany({
    where: { companyId },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      role: { select: { name: true } },
    },
  });

  return memberships.map((m) => ({
    id: m.user.id,
    fullName: m.user.fullName,
    email: m.user.email,
    role: m.role.name,
  }));
}
