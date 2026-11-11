import { TENANT_APP_ROLE, TENANT_TABLES, POLICY_EXPRESSION } from "../../src/db/tenantSecurity.js";

// Shared by secure:tenant (first-time setup + password rotation) and
// migrate:tenants (re-applied after every schema push, so a new table never
// goes live without its grants and Row-Level Security policy).

export const quoteIdent = (name) => `"${name.replace(/"/g, '""')}"`;

// Same physical database = same host and database name; credentials differ
// between the owner and restricted accounts, so they're ignored.
export const sameDatabase = (a, b) => {
  const x = new URL(a);
  const y = new URL(b);
  return x.hostname === y.hostname && x.pathname === y.pathname;
};

export async function roleExists(tx) {
  const [{ exists }] = await tx.$queryRaw`
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${TENANT_APP_ROLE}) AS exists`;
  return exists;
}

// Grants + RLS for every table in TENANT_TABLES. Idempotent. Does not touch
// the role's password. Run inside a transaction.
export async function applyAccessRules(tx, log = console.log) {
  const role = quoteIdent(TENANT_APP_ROLE);

  await tx.$executeRawUnsafe(`REVOKE ALL ON SCHEMA public FROM ${role}`);
  await tx.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO ${role}`);
  // On the database shared with the directory, the app role must not reach
  // identity tables through this connection.
  await tx.$executeRawUnsafe(
    `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'directory') THEN
       EXECUTE 'REVOKE ALL ON SCHEMA directory FROM ${TENANT_APP_ROLE}';
       EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA directory FROM ${TENANT_APP_ROLE}';
     END IF; END $$`
  );

  for (const [table, privileges] of Object.entries(TENANT_TABLES)) {
    const t = `public.${quoteIdent(table)}`;
    await tx.$executeRawUnsafe(`REVOKE ALL ON ${t} FROM ${role}`);
    await tx.$executeRawUnsafe(`GRANT ${privileges.join(", ")} ON ${t} TO ${role}`);
    await tx.$executeRawUnsafe(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);
    await tx.$executeRawUnsafe(`DROP POLICY IF EXISTS company_isolation ON ${t}`);
    await tx.$executeRawUnsafe(
      `CREATE POLICY company_isolation ON ${t} FOR ALL TO ${role} USING (${POLICY_EXPRESSION}) WITH CHECK (${POLICY_EXPRESSION})`
    );
    log(`  secured ${table} (${privileges.join(", ")})`);
  }
}

// Pure: groups the owner URLs into distinct physical databases, attaches
// the companies living in each, and reports companies whose database isn't
// covered by any owner URL. `companies` carry already-decrypted URLs.
export function planTenantTargets(companies, owners) {
  const targets = [];
  for (const owner of owners) {
    if (targets.some((t) => sameDatabase(t.url, owner.url))) continue;
    targets.push({ name: owner.name, url: owner.url, companies: [] });
  }
  const uncovered = [];
  for (const company of companies) {
    const target = company.url && targets.find((t) => sameDatabase(t.url, company.url));
    if (target) target.companies.push(company.name);
    else uncovered.push({ name: company.name });
  }
  return { targets, uncovered };
}
