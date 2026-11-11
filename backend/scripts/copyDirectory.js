import "dotenv/config";
import { PrismaClient } from "../node_modules/.prisma/directory-client/index.js";

// Copies the directory (identity: companies, users, roles, permissions,
// memberships, product feedback) from its current home -- shared with
// Ta-vora's tenant data -- into its own database in the new Truvara project.
//
//   npm run copy:directory
//
// Reads from DIRECTORY_DATABASE_URL, writes to NEW_DIRECTORY_DATABASE_URL.
// Before running:
//   1. Back up the current database (Neon branch).
//   2. Push the directory schema to BOTH databases, so they match:
//        npm run prisma:push:directory                        (current)
//        DIRECTORY_DATABASE_URL=<new> npm run prisma:push:directory   (new)
//
// Safety: refuses to run unless the new database is empty; copies
// everything in one transaction (all or nothing); verifies row counts at
// the end; never modifies or deletes the source. Prints counts only.
// Afterwards, switch DIRECTORY_DATABASE_URL (locally and on Render) to the
// new database. The old copy stays untouched until you remove it.

const TABLES = [
  // Parent tables first, so every foreign key already has its target.
  "role",
  "permission",
  "rolePermission",
  "company",
  "user",
  "companyMembership",
  "productFeedback",
];

async function main() {
  const sourceUrl = process.env.DIRECTORY_DATABASE_URL;
  const targetUrl = process.env.NEW_DIRECTORY_DATABASE_URL;
  if (!sourceUrl || !targetUrl) throw new Error("Set both DIRECTORY_DATABASE_URL and NEW_DIRECTORY_DATABASE_URL.");
  if (sourceUrl === targetUrl) throw new Error("Source and target are the same database.");

  const source = new PrismaClient({ datasourceUrl: sourceUrl });
  const target = new PrismaClient({ datasourceUrl: targetUrl });

  try {
    for (const table of TABLES) {
      if ((await target[table].count()) > 0) {
        throw new Error(`The new database already has ${table} rows -- refusing to copy over existing data.`);
      }
    }

    const data = {};
    for (const table of TABLES) data[table] = await source[table].findMany();

    // users.primary_company_id points at companies, so companies go first
    // (TABLES order). Everything lands together or not at all.
    await target.$transaction(
      async (tx) => {
        for (const table of TABLES) {
          if (data[table].length) await tx[table].createMany({ data: data[table] });
        }
      },
      { timeout: 120000 }
    );

    let ok = true;
    for (const table of TABLES) {
      const copied = await target[table].count();
      const match = copied === data[table].length;
      ok &&= match;
      console.log(`${match ? "OK  " : "FAIL"} ${table}: ${data[table].length} -> ${copied}`);
    }
    if (!ok) throw new Error("Row counts don't match. Do not switch over; investigate first.");
    console.log("\nDirectory copied. Next: point DIRECTORY_DATABASE_URL (local + Render) at the new database.");
  } finally {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
