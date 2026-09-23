import { can } from "../services/permissions.js";

// Permission denial within the user's own tenant is a legitimate 403.
// Contrast with cross-tenant resource lookups (handled in each route/service),
// which must return 404 -- never 403 -- so a probing request can't learn
// whether a resource exists in a company the caller isn't a member of.
export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!can(req.user, permissionCode)) {
      return res.status(403).json({ detail: "You do not have permission to perform this action." });
    }
    next();
  };
}
