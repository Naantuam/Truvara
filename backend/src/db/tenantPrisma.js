import { PrismaClient } from "../../node_modules/.prisma/tenant-client/index.js";

// One tenant schema, many physical databases -- which one a request talks
// to is resolved per-company (via Company.tenantDatabaseUrl in the
// directory) and passed here at runtime. Clients are cached by connection
// string so a company's pooled connections are reused across requests
// instead of reconnecting every time; companies sharing the pooled tier
// naturally share one cached client since they share one URL.
const clientCache = new Map();

export function getTenantClient(tenantDatabaseUrl) {
  if (!tenantDatabaseUrl) {
    throw new Error("getTenantClient called without a tenantDatabaseUrl.");
  }

  let client = clientCache.get(tenantDatabaseUrl);
  if (!client) {
    client = new PrismaClient({ datasourceUrl: tenantDatabaseUrl });
    clientCache.set(tenantDatabaseUrl, client);
  }
  return client;
}
