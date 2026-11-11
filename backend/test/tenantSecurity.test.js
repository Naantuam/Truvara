import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { scopeToCompany } from "../src/db/companyScopedClient.js";
import { findRestrictionProblems, withConnectionLimit } from "../src/db/tenantPrisma.js";
import { planTenantTargets } from "../scripts/lib/tenantAccess.js";
import { TENANT_TABLES, POLICY_EXPRESSION, COMPANY_SETTING } from "../src/db/tenantSecurity.js";

// A stand-in for PrismaClient that records what would be sent to Postgres.
function fakeClient() {
  const log = [];
  const makeDelegate = (model) => ({
    findMany: (args) => ({ kind: "query", model, op: "findMany", args }),
    create: (args) => ({ kind: "query", model, op: "create", args }),
  });
  const client = {
    log,
    decision: makeDelegate("decision"),
    task: makeDelegate("task"),
    $executeRaw: (strings, ...values) => ({ kind: "setCompany", sql: strings.join("?"), values }),
    $queryRawUnsafe: () => "raw",
    $transaction: async (arg) => {
      if (typeof arg === "function") {
        const txLog = [];
        log.push({ type: "interactive", statements: txLog });
        const tx = {
          $executeRaw: (strings, ...values) => {
            txLog.push({ kind: "setCompany", values });
            return Promise.resolve(1);
          },
          decision: { create: async (args) => (txLog.push({ kind: "query", op: "create", args }), "created") },
        };
        return arg(tx);
      }
      log.push({ type: "batch", statements: arg });
      return arg.map((s) => (s.kind === "setCompany" ? 1 : `result:${s.model}.${s.op}`));
    },
  };
  return client;
}

describe("scopeToCompany", () => {
  it("sets the company in the same transaction, before every model query", async () => {
    const client = fakeClient();
    const db = scopeToCompany(client, "company-a");
    const result = await db.decision.findMany({ where: { status: "DRAFT" } });

    expect(result).toBe("result:decision.findMany");
    const [batch] = client.log;
    expect(batch.type).toBe("batch");
    expect(batch.statements[0]).toMatchObject({ kind: "setCompany", values: [COMPANY_SETTING, "company-a"] });
    // Transaction-local (third argument true): discarded when the transaction
    // ends, so a reused connection never carries it into another request.
    expect(batch.statements[0].sql).toBe("SELECT set_config(?, ?, true)");
    expect(batch.statements[1]).toMatchObject({ model: "decision", op: "findMany" });
  });

  it("sets the company first inside an interactive transaction", async () => {
    const client = fakeClient();
    const db = scopeToCompany(client, "company-b");
    const out = await db.$transaction(async (tx) => tx.decision.create({ data: {} }));

    expect(out).toBe("created");
    const [{ type, statements }] = client.log;
    expect(type).toBe("interactive");
    expect(statements[0]).toMatchObject({ kind: "setCompany", values: [COMPANY_SETTING, "company-b"] });
    expect(statements[1]).toMatchObject({ kind: "query", op: "create" });
  });

  it("prefixes array transactions and strips the setup result", async () => {
    const client = fakeClient();
    const db = scopeToCompany(client, "company-a");
    const results = await db.$transaction([client.task.findMany()]);
    expect(results).toEqual(["result:task.findMany"]);
    expect(client.log[0].statements[0].kind).toBe("setCompany");
  });

  it("keeps two companies' clients independent", async () => {
    const client = fakeClient();
    await scopeToCompany(client, "company-a").decision.findMany();
    await scopeToCompany(client, "company-b").decision.findMany();
    expect(client.log[0].statements[0].values[1]).toBe("company-a");
    expect(client.log[1].statements[0].values[1]).toBe("company-b");
  });

  it("refuses to scope without a company", () => {
    expect(() => scopeToCompany(fakeClient(), undefined)).toThrow();
    expect(() => scopeToCompany(fakeClient(), "")).toThrow();
  });

  it("blocks raw SQL, which would bypass the scoping", () => {
    const db = scopeToCompany(fakeClient(), "company-a");
    expect(() => db.$queryRawUnsafe).toThrow(/not available/);
    expect(() => db.$executeRaw).toThrow(/not available/);
  });
});

describe("findRestrictionProblems", () => {
  const safeRole = { rolname: "truvara_app", rolsuper: false, rolbypassrls: false };

  it("passes a restricted role with RLS on every table", () => {
    expect(findRestrictionProblems({ role: safeRole, ownedTables: [], tablesWithoutRls: [] })).toEqual([]);
  });

  it("flags an owner account, superuser, bypass and missing RLS", () => {
    const problems = findRestrictionProblems({
      role: { rolname: "neondb_owner", rolsuper: true, rolbypassrls: true },
      ownedTables: ["decisions"],
      tablesWithoutRls: ["tasks"],
    });
    expect(problems).toHaveLength(4);
  });
});

describe("tenant table coverage", () => {
  // Fails the build if a company-specific table is added to the tenant
  // schema without being added to TENANT_TABLES (and so without RLS).
  it("covers every tenant model that has a company_id", () => {
    const schema = fs.readFileSync(new URL("../prisma/tenant/schema.prisma", import.meta.url), "utf8");
    const models = [...schema.matchAll(/^model \w+ \{([\s\S]*?)^\}/gm)].map((m) => m[1]);
    const companyTables = models
      .filter((body) => /@map\("company_id"\)/.test(body))
      .map((body) => body.match(/@@map\("([^"]+)"\)/)?.[1]);

    expect(companyTables).not.toContain(undefined);
    expect(companyTables.sort()).toEqual(Object.keys(TENANT_TABLES).sort());
  });

  it("keeps the audit trail append-only", () => {
    expect(TENANT_TABLES.audit_events).toEqual(["SELECT", "INSERT"]);
  });

  it("uses a fail-closed policy", () => {
    expect(POLICY_EXPRESSION).toBe("company_id = current_setting('app.company_id', true)");
  });
});

describe("tenant connection limits", () => {
  it("adds a per-database connection cap", () => {
    const url = new URL(withConnectionLimit("postgresql://u:p@db.example/app?sslmode=require", undefined));
    expect(url.searchParams.get("connection_limit")).toBe("5");
    expect(url.searchParams.get("sslmode")).toBe("require");
  });

  it("uses a configured limit, ignoring nonsense", () => {
    expect(new URL(withConnectionLimit("postgresql://u:p@h/db", "3")).searchParams.get("connection_limit")).toBe("3");
    expect(new URL(withConnectionLimit("postgresql://u:p@h/db", "0")).searchParams.get("connection_limit")).toBe("5");
    expect(new URL(withConnectionLimit("postgresql://u:p@h/db", "abc")).searchParams.get("connection_limit")).toBe("5");
  });

  it("keeps a limit already set on the stored URL", () => {
    const url = "postgresql://u:p@h/db?connection_limit=2";
    expect(withConnectionLimit(url, "9")).toBe(url);
  });
});

describe("migration fan-out coverage", () => {
  const owners = [
    { name: "SHARED", url: "postgresql://owner:x@shared.neon/tenants" },
    { name: "SHARED_AGAIN", url: "postgresql://owner:y@shared.neon/tenants" },
    { name: "FOUNDRY", url: "postgresql://owner:z@foundry.neon/neondb" },
  ];

  it("maps companies to their database by host + database, ignoring credentials", () => {
    const { targets, uncovered } = planTenantTargets(
      [
        { name: "Acme", url: "postgresql://truvara_app:secret@shared.neon/tenants?connection_limit=5" },
        { name: "Foundry", url: "postgresql://truvara_app:s@foundry.neon/neondb" },
      ],
      owners
    );
    expect(uncovered).toEqual([]);
    expect(targets.map((t) => [t.name, t.companies])).toEqual([
      ["SHARED", ["Acme"]],
      ["FOUNDRY", ["Foundry"]],
    ]);
  });

  it("migrates each physical database once even if listed twice", () => {
    expect(planTenantTargets([], owners).targets.map((t) => t.name)).toEqual(["SHARED", "FOUNDRY"]);
  });

  it("reports companies whose database is not listed, so none is skipped silently", () => {
    const { uncovered } = planTenantTargets(
      [
        { name: "Knit", url: "postgresql://truvara_app:s@knit.neon/neondb" },
        { name: "Broken", url: null },
      ],
      owners
    );
    expect(uncovered.map((c) => c.name)).toEqual(["Knit", "Broken"]);
  });

  it("treats a different database on the same host as a different database", () => {
    const { uncovered } = planTenantTargets([{ name: "Dir", url: "postgresql://a:b@shared.neon/directory" }], owners);
    expect(uncovered.map((c) => c.name)).toEqual(["Dir"]);
  });
});
