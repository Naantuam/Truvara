import { directoryPrisma } from "../src/db/directoryPrisma.js";

// One-off cleanup: removes the old Sprint 1-5 dev/test data
// (owner@truvara.dev etc.) left over from before the directory+tenant
// migration. Safe to run against the reused original Neon project, since
// that's the same physical database Ta-vora's tenant tables now live in
// too -- these are all leftover rows, not real client data.
//
// Deletes in FK-safe child-to-parent order. Run once, then delete this file
// or leave it -- it's idempotent (no-ops on an already-empty database).

async function main() {
  await directoryPrisma.$transaction([
    directoryPrisma.$executeRawUnsafe(`DELETE FROM audit_events`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM decisions`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM tasks`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM transactions`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM documents`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM departments`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM company_memberships`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM users`),
    directoryPrisma.$executeRawUnsafe(`DELETE FROM companies`),
  ]);

  console.log("Old test/dev data cleared.");
}

main()
  .catch((err) => {
    console.error("Failed to clear test data:", err);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
