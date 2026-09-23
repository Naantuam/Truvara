// Maps each nav item / route "app" key to the backend permission code that
// gates it. Single source of truth for Sidebar.jsx and ProtectedRoute.jsx so
// they can't drift out of sync with each other or with the backend's seed
// data (backend/prisma/seed.js).
export const MODULE_PERMISSIONS = {
  dashboard: "dashboard:view",
  decisions: "governance:decision:view",
  approvals: "governance:decision:approve",
  responsibilities: "operations:task:view",
  actions: "operations:task:view",
  expenses: "finance:transaction:view",
  reports: "dashboard:view",
};

// Owner's seeded role already includes every permission, so no separate
// superuser/admin bypass is needed here -- checking the permission list
// directly is correct for every role.
export function hasModuleAccess(user, appKey) {
  if (!user) return false;
  if (appKey === "settings") return true; // self-service account page
  const required = MODULE_PERMISSIONS[appKey];
  if (!required) return false;
  return Boolean(user.permissions?.includes(required));
}
