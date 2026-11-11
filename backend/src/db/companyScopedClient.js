import { COMPANY_SETTING } from "./tenantSecurity.js";

// Wraps a tenant PrismaClient so every query it runs carries the requesting
// company's identity into Postgres, where Row-Level Security enforces it.
//
// - A model call (db.decision.findMany(...)) becomes a two-statement batch
//   transaction: set the company, then run the query.
// - An interactive transaction (db.$transaction(async (tx) => ...)) sets the
//   company once as its first statement; everything inside runs on that
//   same transaction.
//
// The setting is transaction-local (set_config's third argument = true), so
// it disappears when the transaction ends: a pooled connection reused by the
// next request -- for any company -- starts with no company set, and RLS then
// returns nothing rather than another company's rows.
//
// Raw SQL and other client-level methods are deliberately not exposed: they
// would run outside this scoping. Maintenance scripts that need them use the
// unwrapped client from getTenantClient() directly.
export function scopeToCompany(client, companyId) {
  if (!companyId || typeof companyId !== "string") {
    throw new Error("scopeToCompany requires the authenticated company's id.");
  }

  const setCompany = (c) => c.$executeRaw`SELECT set_config(${COMPANY_SETTING}, ${companyId}, true)`;
  const delegates = new Map();

  const scopedTransaction = (arg, options) => {
    if (typeof arg === "function") {
      return client.$transaction(async (tx) => {
        await setCompany(tx);
        return arg(tx);
      }, options);
    }
    if (Array.isArray(arg)) {
      return client.$transaction([setCompany(client), ...arg], options).then((results) => results.slice(1));
    }
    throw new TypeError("$transaction expects a callback or an array of queries.");
  };

  const wrapDelegate = (name, delegate) =>
    new Proxy(delegate, {
      get(target, method) {
        const fn = target[method];
        if (typeof fn !== "function") return fn;
        return (...args) =>
          client.$transaction([setCompany(client), fn.apply(target, args)]).then((results) => results[1]);
      },
    });

  return new Proxy(client, {
    get(target, prop) {
      if (prop === "$transaction") return scopedTransaction;
      if (typeof prop === "string" && prop.startsWith("$")) {
        throw new Error(`${prop} is not available on a company-scoped client.`);
      }
      const value = target[prop];
      if (typeof prop === "string" && value && typeof value === "object" && typeof value.findMany === "function") {
        if (!delegates.has(prop)) delegates.set(prop, wrapDelegate(prop, value));
        return delegates.get(prop);
      }
      return value;
    },
  });
}
