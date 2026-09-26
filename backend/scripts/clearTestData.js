import "dotenv/config";
import { directoryPrisma } from "../src/db/directoryPrisma.js";
import { getTenantClient } from "../src/db/tenantPrisma.js";

// One-off cleanup: clears everything so seeding can start fresh (dev/test
// rows, or an earlier real-company seed run being redone). Safe to run
// against the reused original Neon project, since that's the same physical
// database Ta-vora's tenant tables now live in too.
//
// Table names are schema-qualified since the shared database is namespace-
// partitioned (see partitionSharedDatabase.js): companies/users/etc. live in
// the `directory` namespace, decisions/tasks/etc. in `public`.
//
// Deletes in FK-safe child-to-parent order. Idempotent -- no-ops on an
// already-empty database.

async function main() {
  await directoryPrisma.$transaction([
    directoryPrisma.$executeRawUnsafe(`DELETE FROM public.audit_events`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM public.decisions`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM public.tasks`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM public.transactions`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM public.documents`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM public.departments`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM directory.company_memberships`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM directory.users`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM directory.companies`),
  ]);

  console.log("Shared database (directory + Ta-vora tenant tables) cleared.");

  // Knit Energy and Foundry each live in their own separate physical
  // database -- not reachable via directoryPrisma's raw queries above, so
  // clear each one's tenant tables individually. Skip any that share the
  // same URL as the directory DB (already covered above) or aren't set yet.
  const otherTenantUrls = [process.env.KNITENERGY_DATABASE_URL, process.env.FOUNDRY_DATABASE_URL].filter(
    (url) => url && url !== process.env.DIRECTORY_DATABASE_URL
  );

  for (const url of otherTenantUrls) {
    const tenantClient = getTenantClient(url);
    await tenantClient.$transaction([
      tenantClient.$executeRawUnsafe(`DELETE FROM audit_events`),
      tenantClient.$executeRawUnsafe(`DELETE FROM decisions`),
      tenantClient.$executeRawUnsafe(`DELETE FROM tasks`),
      tenantClient.$executeRawUnsafe(`DELETE FROM transactions`),
      tenantClient.$executeRawUnsafe(`DELETE FROM documents`),
      tenantClient.$executeRawUnsafe(`DELETE FROM departments`),
    ]);
    await tenantClient.$disconnect();
    console.log(`Tenant database cleared: ${url}`);
  }

  console.log("All data cleared.");
}

main()
  .catch((err) => {
    console.error("Failed to clear test data:", err);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
