// Single source of truth for the database-level isolation rules applied to
// every tenant database (dedicated or shared). Used by the setup script
// (scripts/secureTenantDatabase.js) and by the runtime check in
// tenantPrisma.js, so the two can never disagree about which tables are
// protected.

// The restricted account the running server connects as. It can read and
// write business records but owns no tables, so it cannot switch off
// Row-Level Security, alter tables, or edit the audit trail.
export const TENANT_APP_ROLE = "truvara_app";

// Postgres session setting that carries the requesting company. Set with
// set_config(..., true) -- transaction-local, so Postgres discards it when
// the transaction ends and a reused connection never inherits it.
export const COMPANY_SETTING = "app.company_id";

// Every company-specific table. A table added to the tenant schema must be
// added here too -- test/tenantSecurity.test.js fails the build if any
// tenant model with a company_id column is missing from this list.
export const TENANT_TABLES = {
  departments: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  decisions: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  tasks: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  transactions: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  documents: ["SELECT", "INSERT", "UPDATE", "DELETE"],
  // A profile is corrected, never deleted, by the application.
  business_profiles: ["SELECT", "INSERT", "UPDATE"],
  // Append-only at the database level: the server may add audit entries and
  // read them, never change or remove them.
  audit_events: ["SELECT", "INSERT"],
};

// Fails closed: with no company set, current_setting(..., true) returns
// NULL, the comparison is never true, and no rows are visible or writable.
export const POLICY_EXPRESSION = `company_id = current_setting('${COMPANY_SETTING}', true)`;
