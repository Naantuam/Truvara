import { directoryPrisma } from "../src/db/directoryPrisma.js";

// One-off, one-time fix for the ONE physical database that plays both
// roles (directory + Ta-vora's tenant data, see DIRECTORY_DATABASE_URL /
// TAVORA_DATABASE_URL in .env). `prisma db push` computes drift over the
// *entire* Postgres "public" schema/namespace, so running directory's push
// and tenant's push against the same database each saw the other's tables
// as unwanted drift and wanted to drop them.
//
// Fix: move the directory tables into their own Postgres namespace
// ("directory"), leaving the tenant tables in "public". Each schema.prisma
// now scopes itself to just its own namespace (see the `schemas` array
// added to both datasource blocks), so db push only ever sees its own
// tables. Safe to run more than once (every statement is idempotent).
//
// Only needs to run against the shared database -- Foundry's and Knit
// Energy's databases only ever hold tenant tables in "public", nothing to
// partition there.

const DIRECTORY_TABLES = [
  "companies",
  "users",
  "roles",
  "permissions",
  "role_permissions",
  "company_memberships",
];

async function main() {
  await directoryPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS directory`);

  for (const table of DIRECTORY_TABLES) {
    await directoryPrisma.$executeRawUnsafe(
      `ALTER TABLE IF EXISTS public.${table} SET SCHEMA directory`
    );
  }

  // Leftover bookkeeping table from the old single-schema `prisma migrate`
  // workflow -- everything now goes through `db push`, which doesn't use it.
  await directoryPrisma.$executeRawUnsafe(`DROP TABLE IF EXISTS public._prisma_migrations`);

  console.log("Directory tables moved into their own namespace. Done.");
}

main()
  .catch((err) => {
    console.error("Failed to partition shared database:", err);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
