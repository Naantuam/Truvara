import jwt from "jsonwebtoken";
import { loadPermissionContext } from "../services/permissions.js";
import { getTenantClient } from "../db/tenantPrisma.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

// Tenant isolation happens here, once. company_id always comes from this
// verified token claim -- never from req.body/req.params/req.query. Every
// downstream query filters by req.user.companyId, AND now also only ever
// touches req.user.tenantDb -- the specific physical database this
// company's data lives in, resolved from the directory, never guessable or
// overridable by the client.
export async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Authentication required." });

  let decoded;
  try {
    decoded = jwt.verify(token, ACCESS_SECRET);
  } catch {
    return res.status(401).json({ detail: "Invalid or expired token." });
  }

  if (!decoded.company_id) {
    return res.status(401).json({ detail: "No company selected for this session." });
  }

  const ctx = await loadPermissionContext(decoded.sub, decoded.company_id);
  if (!ctx) return res.status(401).json({ detail: "Invalid session." });

  req.user = {
    id: decoded.sub,
    userId: decoded.sub,
    companyId: decoded.company_id,
    role: ctx.role,
    scopeType: ctx.scopeType,
    departmentId: ctx.departmentId,
    permissions: ctx.permissions,
    tenantDb: getTenantClient(ctx.tenantDatabaseUrl),
  };

  next();
}
