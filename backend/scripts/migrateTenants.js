import "dotenv/config";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../node_modules/.prisma/tenant-client/index.js";
import { directoryPrisma } from "../src/db/directoryPrisma.js";
import { TENANT_APP_ROLE } from "../src/db/tenantSecurity.js";
import { decryptSecret } from "../src/utils/secretBox.js";
import { roleExists, applyAccessRules, planTenantTargets } from "./lib/tenantAccess.js";

// Applies prisma/tenant/schema.prisma to EVERY tenant database, then
// re-applies grants + Row-Level Security so new tables are never left open.
//
//   npm run migrate:tenants -- --check
//   npm run migrate:tenants
//
// Which databases: the env var NAMES listed in TENANT_OWNER_URL_VARS (your
// local .env), each holding one database's OWNER connection string, e.g.
//   TENANT_OWNER_URL_VARS="SHARED_TENANT_DATABASE_URL,TAVORA_DATABASE_URL,FOUNDRY_DATABASE_URL,KNITENERGY_DATABASE_URL"
// Names can also be passed as arguments instead.
//
// Safety:
//   - Refuses to start if any company in the directory lives in a database
//     not on that list, so no company is silently left on the old schema.
//   - --check only reports which databases are behind; changes nothing.
//   - Never accepts data loss: a change that would drop a column or table
//     with data in it fails for that database instead of applying. Those
//     need a hand-written migration.
//   - One database failing doesn't stop the others; the summary lists each
//     result and the exit code is non-zero if any failed.
//   - Connection strings are never printed; databases are named by env var.

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = "prisma/tenant/schema.prisma";
const prismaBin = path.join(backendDir, "node_modules", ".bin", "prisma");

// The URL goes to Prisma through the schema's own env var, not the command
// line, so it never appears in a process listing. stdin is closed so Prisma
// can never stop to ask "accept data loss?" -- it fails instead.
function prisma(args, ownerUrl) {
  return spawnSync(prismaBin, args, {
    cwd: backendDir,
    env: { ...process.env, TENANT_DATABASE_URL: ownerUrl },
    stdio: ["ignore", "inherit", "inherit"],
  }).status;
}

// Exit codes from `migrate diff --exit-code`: 0 = in sync, 2 = changes, else error.
const isBehind = (url) =>
  prisma(["migrate", "diff", "--from-schema-datasource", schemaPath, "--to-schema-datamodel", schemaPath, "--exit-code"], url);

async function reapplyAccessRules(url) {
  const owner = new PrismaClient({ datasourceUrl: url });
  try {
    return await owner.$transaction(async (tx) => {
      if (!(await roleExists(tx))) return false;
      await applyAccessRules(tx);
      return true;
    }, { timeout: 60000 });
  } finally {
    await owner.$disconnect();
  }
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const argNames = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const names = argNames.length
    ? argNames
    : (process.env.TENANT_OWNER_URL_VARS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!names.length) {
    throw new Error("No databases listed. Set TENANT_OWNER_URL_VARS in .env (see the top of scripts/migrateTenants.js).");
  }

  const owners = names.map((name) => {
    const url = process.env[name];
    if (!url) throw new Error(`${name} is not set in .env.`);
    if (new URL(url).username === TENANT_APP_ROLE) {
      throw new Error(`${name} is the restricted account's URL; migrations need the owner's.`);
    }
    return { name, url };
  });

  const companies = await directoryPrisma.company.findMany({ select: { name: true, tenantDatabaseUrl: true } });
  const { targets, uncovered } = planTenantTargets(
    companies.map((c) => ({ name: c.name, url: decryptSecret(c.tenantDatabaseUrl) })),
    owners
  );

  if (uncovered.length) {
    console.error("These companies' databases are not in your list, so they would be skipped:");
    for (const c of uncovered) console.error(`  - ${c.name}`);
    console.error("Add the owner URL for each to .env and TENANT_OWNER_URL_VARS, then re-run.");
    process.exitCode = 1;
    return;
  }

  const results = [];
  for (const target of targets) {
    const who = target.companies.length ? target.companies.join(", ") : "no companies yet";
    console.log(`\n── ${target.name} (${who})`);

    const diff = isBehind(target.url);
    if (diff === 0) {
      if (checkOnly) {
        results.push({ name: target.name, status: "up to date" });
        continue;
      }
    } else if (diff !== 2) {
      results.push({ name: target.name, status: "FAILED: could not compare schema" });
      continue;
    } else if (checkOnly) {
      results.push({ name: target.name, status: "behind (changes listed above)" });
      continue;
    } else if (prisma(["db", "push", `--schema=${schemaPath}`, "--skip-generate"], target.url) !== 0) {
      results.push({ name: target.name, status: "FAILED: schema not applied (see above); nothing changed" });
      continue;
    }

    // Re-applied even when the schema was already current: cheap, idempotent,
    // and repairs grants/policies if a table was ever recreated by hand.
    try {
      const secured = await reapplyAccessRules(target.url);
      const prefix = diff === 2 ? "migrated" : "up to date";
      results.push({
        name: target.name,
        status: secured ? `${prefix}, access rules applied` : `${prefix}; NOT secured yet -- run secure:tenant`,
      });
    } catch (err) {
      results.push({ name: target.name, status: `FAILED applying access rules: ${err.message}` });
    }
  }

  console.log("\nSummary");
  for (const r of results) console.log(`  ${r.name}: ${r.status}`);
  if (results.some((r) => r.status.startsWith("FAILED"))) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
