import { z } from "zod";
import { directoryPrisma } from "../db/directoryPrisma.js";
import { getVerifiedTenantClient } from "../db/tenantPrisma.js";
import { scopeToCompany } from "../db/companyScopedClient.js";
import { encryptSecret } from "../utils/secretBox.js";
import { recordAuditEvent } from "../utils/audit.js";
import { selfSignupEnabled, sessionForMembership } from "./authService.js";

export class OnboardingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "OnboardingError";
    this.status = status;
  }
}

const TRANSACTION_OPTIONS = { timeout: 15000 };

// A person can create several businesses themselves (multi-business owners
// are a target audience), but not without limit -- caps abuse of free
// workspace creation. Raise via env if a real customer needs more.
const MAX_SELF_SERVICE_WORKSPACES = Number(process.env.MAX_SELF_SERVICE_WORKSPACES || 5);

// Nigeria and the US are the first release countries (PRD section 18).
export const COUNTRIES = { NG: { currency: "NGN" }, US: { currency: "USD" } };
export const currencyForCountry = (country) => COUNTRIES[country]?.currency || "NGN";

// ── Wizard steps (PRD section 6) ───────────────────────────────────────────
// Every field is optional: partial answers, "not_sure" and "Complete later"
// are all valid. Unknown fields are stripped, so nothing outside this
// allowlist is ever stored. Step 6 (documents) is deliberately absent until
// document storage and access rules are agreed.
const text = (max = 200) => z.string().trim().max(max).optional();
const yesNoUnsure = z.enum(["yes", "no", "not_sure"]).optional();
const list = (values) => z.array(z.enum(values)).max(values.length).optional();

export const STEP_SCHEMAS = {
  identity: z.object({
    tradingName: text(120),
    legalName: text(160),
    countryOfRegistration: z.enum(["NG", "US", "other", "not_registered"]).optional(),
    operatingCountry: z.enum(["NG", "US", "other"]).optional(),
    stateCity: text(120),
    operatingLocations: text(400),
    website: text(200),
    startYear: z.coerce.number().int().min(1900).max(2100).optional(),
    stage: z.enum(["idea", "newly_launched", "operating", "expanding"]).optional(),
  }),
  industry: z.object({
    primaryIndustry: text(80),
    secondaryCategories: z.array(z.string().trim().max(80)).max(5).optional(),
    otherIndustry: text(120),
    description: text(1000),
    productsServices: text(500),
    customers: text(300),
    revenueModel: text(300),
    importsExports: yesNoUnsure,
    handlesCustomerFunds: yesNoUnsure,
    operatesPremises: yesNoUnsure,
    employsFieldWorkers: yesNoUnsure,
    regulatedSector: yesNoUnsure,
  }),
  registration: z.object({
    status: z
      .enum([
        "not_registered",
        // Nigeria (CAC)
        "business_name",
        "partnership",
        "ltd",
        "public_or_other",
        "outside_nigeria",
        // United States
        "sole_proprietorship",
        "llc",
        "corporation",
        "not_sure",
      ])
      .optional(),
    registrationNumber: text(60),
    registrationDate: text(20),
    wantsStructureReview: z.boolean().optional(),
  }),
  workforce: z.object({
    ownersCount: z.coerce.number().int().min(1).max(1000).optional(),
    staffBand: z.enum(["0", "1-4", "5-9", "10-19", "20-49", "50+"]).optional(),
    employmentTypes: list(["full_time", "part_time", "contract", "casual", "outsourced"]),
    runsPayroll: yesNoUnsure,
    workplaceTypes: list([
      "office",
      "shop",
      "depot",
      "workshop",
      "vessel",
      "construction_site",
      "field_operations",
      "multiple_locations",
      "remote",
    ]),
  }),
  tax: z.object({
    hasTaxRegistration: yesNoUnsure,
    filesTaxes: z.enum(["yes", "no", "not_sure", "need_advice"]).optional(),
    hasAdviser: yesNoUnsure,
    // Private notes -- never written to the audit log (see saveProfileStep).
    taxNotes: text(1000),
    licences: z
      .array(
        z.object({
          type: text(120),
          number: text(60),
          issuingBody: text(120),
          expiryDate: text(20),
        })
      )
      .max(20)
      .optional(),
  }),
};

export const STEP_ORDER = Object.keys(STEP_SCHEMAS);

// Pure: the profile after saving one step. Kept separate from the database
// call so it can be unit tested.
export function applyStep(profile, step, parsedAnswers, markComplete) {
  const answers = { ...(profile?.answers || {}), [step]: parsedAnswers };
  const completed = new Set(profile?.completedSteps || []);
  if (markComplete) completed.add(step);
  return { answers, completedSteps: STEP_ORDER.filter((s) => completed.has(s)) };
}

export function parseStep(step, answers) {
  const schema = STEP_SCHEMAS[step];
  if (!schema) throw new OnboardingError("Unknown onboarding step.", 404);
  const parsed = schema.safeParse(answers ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new OnboardingError(`${issue.path.join(".") || "answers"}: ${issue.message}`);
  }
  return parsed.data;
}

const EMPTY_PROFILE = { answers: {}, completedSteps: [], completedAt: null };

function present(profile) {
  if (!profile) return { ...EMPTY_PROFILE, steps: STEP_ORDER };
  return {
    answers: profile.answers,
    completedSteps: profile.completedSteps,
    completedAt: profile.completedAt,
    steps: STEP_ORDER,
  };
}

// ── Workspace creation (PRD section 5) ─────────────────────────────────────
export async function createWorkspace(userId, { companyName, country }) {
  const pooledUrl = process.env.POOLED_TENANT_DATABASE_URL;
  if (!selfSignupEnabled() || !pooledUrl) {
    throw new OnboardingError("Creating a new workspace isn't available yet. Please check back soon.", 503);
  }

  const [ownerRole, user] = await Promise.all([
    directoryPrisma.role.findUnique({ where: { name: "Owner" } }),
    directoryPrisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!ownerRole) throw new Error("Owner role is missing -- run the roles seed.");
  if (!user || !user.passwordHash) throw new OnboardingError("Please verify your email before creating a workspace.", 403);

  const ownedCount = await directoryPrisma.companyMembership.count({ where: { userId, roleId: ownerRole.id, invitePending: false } });
  if (ownedCount >= MAX_SELF_SERVICE_WORKSPACES) {
    throw new OnboardingError("You've reached the limit of workspaces you can create yourself. Contact support to add more.", 409);
  }

  // The creator becomes the initial Owner (PRD section 5). New companies go
  // into the shared tenant database; its connection string is stored
  // encrypted like every other company's.
  const company = await directoryPrisma.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: { name: companyName, currency: currencyForCountry(country), tenantDatabaseUrl: encryptSecret(pooledUrl) },
    });
    await tx.companyMembership.create({ data: { userId, companyId: created.id, roleId: ownerRole.id } });
    if (!user.primaryCompanyId) {
      await tx.user.update({ where: { id: userId }, data: { primaryCompanyId: created.id } });
    }
    return created;
  }, TRANSACTION_OPTIONS);

  // Seed the profile with what was just entered. If the tenant database is
  // briefly unreachable the workspace still exists; the profile is created
  // on the first save instead, so nothing is lost.
  try {
    const db = scopeToCompany(await getVerifiedTenantClient(pooledUrl), company.id);
    await db.$transaction(async (tx) => {
      await tx.businessProfile.create({
        data: {
          companyId: company.id,
          answers: { identity: { tradingName: companyName, countryOfRegistration: country, operatingCountry: country } },
          updatedById: userId,
        },
      });
      await recordAuditEvent(tx, {
        companyId: company.id,
        actorId: userId,
        action: "company.created",
        entityType: "Company",
        entityId: company.id,
      });
    }, TRANSACTION_OPTIONS);
  } catch (err) {
    console.error(`Workspace ${company.id} created; initial profile deferred: ${err.message}`);
  }

  return sessionForMembership(userId, company.id);
}

// ── Business profile ───────────────────────────────────────────────────────
export async function getProfile(db, companyId) {
  const profile = await db.businessProfile.findUnique({ where: { companyId } });
  return present(profile);
}

export async function saveProfileStep(db, actor, step, answers, markComplete) {
  const parsed = parseStep(step, answers);

  const saved = await db.$transaction(async (tx) => {
    const existing = await tx.businessProfile.findUnique({ where: { companyId: actor.companyId } });
    const next = applyStep(existing, step, parsed, markComplete);
    const profile = existing
      ? await tx.businessProfile.update({
          where: { companyId: actor.companyId },
          data: { ...next, updatedById: actor.userId },
        })
      : await tx.businessProfile.create({
          data: { companyId: actor.companyId, ...next, updatedById: actor.userId },
        });
    // Records which step changed and who changed it -- never the answers
    // themselves, which can include private tax notes.
    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "business_profile.updated",
      entityType: "BusinessProfile",
      entityId: profile.id,
      changes: { step },
    });
    return profile;
  }, TRANSACTION_OPTIONS);

  return present(saved);
}

// The owner has reviewed their answers (PRD: "review/correct information
// before submission"). Steps may still be incomplete -- every field is
// optional and can be filled in later from Settings.
export async function completeProfile(db, actor) {
  const saved = await db.$transaction(async (tx) => {
    const existing = await tx.businessProfile.findUnique({ where: { companyId: actor.companyId } });
    if (!existing) throw new OnboardingError("Fill in at least one step before finishing.", 409);
    const profile = await tx.businessProfile.update({
      where: { companyId: actor.companyId },
      data: { completedAt: existing.completedAt || new Date(), updatedById: actor.userId },
    });
    await recordAuditEvent(tx, {
      companyId: actor.companyId,
      actorId: actor.userId,
      action: "business_profile.completed",
      entityType: "BusinessProfile",
      entityId: profile.id,
    });
    return profile;
  }, TRANSACTION_OPTIONS);
  return present(saved);
}
