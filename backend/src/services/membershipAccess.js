// The one rule for whether a membership lets someone into a company: it
// must exist, not be suspended, and not be an invitation still waiting to
// be accepted. Every login, company switch, token refresh and per-request
// permission load goes through this, so a pending invite can never be used
// as access by any route.
export const grantsAccess = (membership) => Boolean(membership && membership.isActive && !membership.invitePending);

// Prisma `where` fragment for the same rule, for queries that list memberships.
export const ACCESS_GRANTING = { isActive: true, invitePending: false };
