import { PrismaClient } from "../../node_modules/.prisma/directory-client/index.js";

// Single shared client for the directory ("control plane") database --
// identity only: Company, User, Role, Permission, CompanyMembership.
export const directoryPrisma = new PrismaClient();
