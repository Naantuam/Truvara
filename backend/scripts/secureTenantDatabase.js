import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "../node_modules/.prisma/tenant-client/index.js";
import { directoryPrisma } from "../src/db/directoryPrisma.js";
import { TENANT_APP_ROLE } from "../src/db/tenantSecurity.js";
import { quoteIdent, sameDatabase, roleExists, applyAccessRules } from "./lib/tenantAccess.js";
import { encryptSecret, decryptSecret } from "../src/utils/secretBox.js";

// Applies the restricted-access setup to ONE tenant database, then points
// every company stored in that database at the restricted account.
//
//   npm run secure:tenant -- FOUNDRY_DATABASE_URL
//   npm run secure:tenant -- SHARED_TENANT_DATABASE_URL --print-url
//
// The argument is the NAME of an env var holding that database's OWNER
// connection string (from your local .env -- never the server's). Owner
// credentials are only used here, from your machine, for setup and
// migrations; the server never receives them.
//
// What it does, all idempotent (safe to re-run):
//   1. Creates the truvara_app role (or rotates its password if it exists).
//   2. Revokes everything from it, then grants only what TENANT_TABLES lists
//      -- read/write on business tables, read + insert only on audit_events.
//   3. Enables Row-Level Security on every tenant table with one policy:
//      a row is visible/writable only when its company_id matches the
//      company set for the current transaction.
//   4. Re-points matching companies in the directory at a connection string
//      for truvara_app, encrypted. Nothing secret is printed, unless...
//   5. --print-url: prints the restricted connection string once, for the
//      shared database only -- it goes into Render as
//      POOLED_TENANT_DATABASE_URL, which new workspaces are created with.
//      Re-running rotates the password, so Render must be updated each time.
//
// Requires TENANT_URL_ENCRYPTION_KEY to be set (step 4 encrypts).

async function main() {
  const envName = process.argv[2];
  const ownerUrl = envName && process.env[envName];
  if (!ownerUrl) {
    throw new Error("Usage: npm run secure:tenant -- <ENV_VAR_WITH_OWNER_URL> (e.g. FOUNDRY_DATABASE_URL)");
  }
  if (new URL(ownerUrl).username === TENANT_APP_ROLE) {
    throw new Error(`${envName} is the restricted account's URL; this script needs the owner's.`);
  }

  // Generated before any change so a failure later leaves nothing half-set.
  const password = crypto.randomBytes(32).toString("base64url");
  const role = quoteIdent(TENANT_APP_ROLE);
  const owner = new PrismaClient({ datasourceUrl: ownerUrl });

  try {
    await owner.$transaction(async (tx) => {
      const exists = await roleExists(tx);
      // DDL can't take bind parameters; the password is base64url (no quotes
      // possible), and the role name is a fixed constant.
      await tx.$executeRawUnsafe(
        exists
          ? `ALTER ROLE ${role} WITH LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE PASSWORD '${password}'`
          : `CREATE ROLE ${role} WITH LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE PASSWORD '${password}'`
      );

      await applyAccessRules(tx);
    }, { timeout: 60000 });
  } finally {
    await owner.$disconnect();
  }

  const restricted = new URL(ownerUrl);
  restricted.username = TENANT_APP_ROLE;
  restricted.password = password;
  const restrictedUrl = restricted.toString();

  const companies = await directoryPrisma.company.findMany({ select: { id: true, name: true, tenantDatabaseUrl: true } });
  const matching = companies.filter((c) => sameDatabase(decryptSecret(c.tenantDatabaseUrl), ownerUrl));
  for (const company of matching) {
    await directoryPrisma.company.update({
      where: { id: company.id },
      data: { tenantDatabaseUrl: encryptSecret(restrictedUrl) },
    });
    console.log(`Now using the restricted account: ${company.name}`);
  }
  if (!matching.length) console.log("No company in the directory uses this database yet.");
  if (process.argv.includes("--print-url")) {
    console.log("\nRestricted connection string -- set it on Render as POOLED_TENANT_DATABASE_URL, then clear your terminal:");
    console.log(restrictedUrl);
  }
  console.log("Done. The server switches to the restricted account on its next request for these companies.");
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
