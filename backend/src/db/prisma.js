import { PrismaClient } from "@prisma/client";

// Single shared client. Every query that touches a tenant-scoped table must
// filter by companyId derived from the verified JWT (req.user.companyId) --
// never from a client-supplied body/query/param value.
export const prisma = new PrismaClient();
