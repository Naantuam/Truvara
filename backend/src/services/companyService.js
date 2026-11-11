import { directoryPrisma } from "../db/directoryPrisma.js";
import { presentMember } from "./invitationService.js";

// Any authenticated company member can see their teammates -- needed to
// assign a task to someone. Broader than admin:users:manage on purpose:
// picking an assignee is a routine action for Managers and Owners alike,
// not an admin operation. Adding/editing members (Settings, admin only) is a
// separate concern in settingsService.js / invitationService.js.
//
// Pending invitations are left out unless asked for (includeInvited), and
// the route only allows that for admin:users:manage: an invited person isn't
// a teammate yet, can't be assigned work, and their invite is the Owner's
// business, not the whole team's.
export async function listCompanyMembers(companyId, { includeInvited = false } = {}) {
  const memberships = await directoryPrisma.companyMembership.findMany({
    where: { companyId, ...(includeInvited ? {} : { invitePending: false }) },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      role: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map(presentMember);
}
