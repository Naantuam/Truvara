import { PrismaClient } from "../../node_modules/.prisma/tenant-client/index.js";
import { TENANT_TABLES } from "./tenantSecurity.js";

// One tenant schema, many physical databases -- which one a request talks
// to is resolved per-company (via Company.tenantDatabaseUrl in the
// directory) and passed here at runtime. Clients are cached by connection
// string so a company's pooled connections are reused across requests
// instead of reconnecting every time; companies sharing the pooled tier
// naturally share one cached client since they share one URL.
const clientCache = new Map();
const verificationCache = new Map();

// Each cached client opens its own pool. Prisma's default pool size is
// (CPU cores x 2 + 1), which on a many-core host multiplied by every
// dedicated database could exhaust a Neon compute's connection slots. The
// cap applies per database: the shared tier has ONE client for all its
// companies, so its limit is the total the shared database ever sees from
// one server instance. A connection_limit already in the stored URL wins.
const DEFAULT_CONNECTION_LIMIT = 5;

export function withConnectionLimit(url, limit = process.env.TENANT_CONNECTION_LIMIT) {
  const parsed = new URL(url);
  if (parsed.searchParams.has("connection_limit")) return url;
  const n = Number.parseInt(limit, 10);
  parsed.searchParams.set("connection_limit", String(Number.isInteger(n) && n > 0 ? n : DEFAULT_CONNECTION_LIMIT));
  return parsed.toString();
}

export function getTenantClient(tenantDatabaseUrl) {
  if (!tenantDatabaseUrl) {
    throw new Error("getTenantClient called without a tenantDatabaseUrl.");
  }

  let client = clientCache.get(tenantDatabaseUrl);
  if (!client) {
    client = new PrismaClient({ datasourceUrl: withConnectionLimit(tenantDatabaseUrl) });
    clientCache.set(tenantDatabaseUrl, client);
  }
  return client;
}

// Pure check, separated from the query so it can be unit tested. Returns a
// list of problems; empty means the connection is safely restricted.
export function findRestrictionProblems({ role, ownedTables, tablesWithoutRls }) {
  const problems = [];
  if (!role) problems.push("could not read the connected role");
  else {
    if (role.rolsuper) problems.push(`role ${role.rolname} is a superuser`);
    if (role.rolbypassrls) problems.push(`role ${role.rolname} can bypass Row-Level Security`);
  }
  if (ownedTables.length) problems.push(`role owns tenant tables: ${ownedTables.join(", ")}`);
  if (tablesWithoutRls.length) problems.push(`Row-Level Security is off for: ${tablesWithoutRls.join(", ")}`);
  return problems;
}

async function verifyRestricted(client) {
  const tables = Object.keys(TENANT_TABLES);
  const [role] = await client.$queryRaw`
    SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
  const rows = await client.$queryRaw`
    SELECT c.relname, c.relrowsecurity, pg_get_userbyid(c.relowner) = current_user AS owned
    FROM pg_class c
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r' AND c.relname = ANY(${tables})`;
  const byName = new Map(rows.map((r) => [r.relname, r]));

  const problems = findRestrictionProblems({
    role,
    ownedTables: rows.filter((r) => r.owned).map((r) => r.relname),
    tablesWithoutRls: tables.filter((t) => !byName.get(t)?.relrowsecurity),
  });
  if (problems.length) {
    // Deliberately vague to the client, specific in the server log; never
    // includes the connection string.
    console.error(`Tenant database failed the restricted-access check: ${problems.join("; ")}`);
    throw new Error("Tenant database is not configured for restricted access.");
  }
}

// When REQUIRE_RESTRICTED_TENANT_ROLE=true, refuse to serve a company whose
// database connection could bypass Row-Level Security (owner account,
// superuser, or RLS switched off). Checked once per connection string, then
// cached; a failed check is retried on the next request rather than cached.
// Off by default only until the existing companies have been migrated to the
// restricted account -- it must be switched on before signup launches.
export async function getVerifiedTenantClient(tenantDatabaseUrl) {
  const client = getTenantClient(tenantDatabaseUrl);
  if (process.env.REQUIRE_RESTRICTED_TENANT_ROLE !== "true") return client;

  let check = verificationCache.get(tenantDatabaseUrl);
  if (!check) {
    check = verifyRestricted(client).catch((err) => {
      verificationCache.delete(tenantDatabaseUrl);
      throw err;
    });
    verificationCache.set(tenantDatabaseUrl, check);
  }
  await check;
  return client;
}
