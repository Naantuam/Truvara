// Seeds the three real companies from Precious's brief
// (Truvara_MVP_—_Next_Development_Phase_&_Real_Data_Validation.docx §3).
// Requires TAVORA_DATABASE_URL, KNITENERGY_DATABASE_URL,
// FOUNDRY_DATABASE_URL in .env -- each pointing at its own, freshly
// migrated, empty tenant database. Run `npm run prisma:migrate:tenant`
// against each one first (temporarily set TENANT_DATABASE_URL to that
// company's URL to do so).
//
// Role assignments below are a reasonable default, NOT confirmed by
// Precious: Jimoh Precious Mohammed is Owner everywhere he appears (he's the
// product lead). Everyone else defaults to Team Member (the safest, most
// restrictive tier, easy to upgrade) since the doc names who's on each team
// but not their exact role. Confirm and adjust before treating these as
// final.
import "dotenv/config";
import { directoryPrisma as prisma } from "../src/db/directoryPrisma.js";
import { generateActivationToken, sendActivationEmail } from "../src/services/activation.js";

const COMPANIES = [
  {
    name: "Ta-vora International Limited",
    tenantDatabaseUrlEnv: "TAVORA_DATABASE_URL",
    members: [
      // Standing in for Precious (Owner) until he shares his own real email --
      // Emily's own address, used for testing. Same person as the Knit
      // Energy entry below, on purpose: exercises the real multi-company
      // login/select-company flow.
      { email: "nathaniellongmen@gmail.com", fullName: "Nathaniel Longmen", role: "Owner" },
      // Real emails not yet available -- uncomment once known:
      // { email: "martins@tavora.example", fullName: "Martins Brengshak", role: "Team Member" },
      // { email: "anyaegbu@tavora.example", fullName: "Anyaegbu Eric Chibuzor", role: "Team Member" },
      // { email: "ifeanyi@tavora.example", fullName: "Ifeanyi Benjamin", role: "Team Member" },
    ],
  },
  {
    name: "Knit Energy Ltd",
    tenantDatabaseUrlEnv: "KNITENERGY_DATABASE_URL",
    members: [
      { email: "nathaniellongmen@gmail.com", fullName: "Nathaniel Longmen", role: "Owner" },
    ],
  },
  {
    name: "The Foundry Business Services LLC",
    tenantDatabaseUrlEnv: "FOUNDRY_DATABASE_URL",
    members: [
      { email: "emily@thefoundrybiz.com", fullName: "Emily Sharlene", role: "Team Member" },
      // Joe's email not yet confirmed -- uncomment once known:
      // { email: "joe@thefoundrybiz.com", fullName: "Joe Benny Kunze", role: "Team Member" },
    ],
  },
];

async function main() {
  const roles = await prisma.role.findMany();
  const roleIdByName = Object.fromEntries(roles.map((r) => [r.name, r.id]));
  if (!roleIdByName.Owner) {
    throw new Error("Roles not seeded yet -- run `npm run prisma:seed` first.");
  }

  const pendingActivations = [];

  for (const companyDef of COMPANIES) {
    const tenantDatabaseUrl = process.env[companyDef.tenantDatabaseUrlEnv];
    if (!tenantDatabaseUrl) {
      console.log(`Skipping ${companyDef.name} -- ${companyDef.tenantDatabaseUrlEnv} is not set in .env.`);
      continue;
    }

    let company = await prisma.company.findFirst({ where: { name: companyDef.name } });
    if (!company) {
      company = await prisma.company.create({ data: { name: companyDef.name, tenantDatabaseUrl } });
      console.log(`Created company: ${companyDef.name}`);
    }

    for (const member of companyDef.members) {
      let user = await prisma.user.findUnique({ where: { email: member.email } });

      if (!user) {
        const { rawToken, tokenHash, expiresAt } = generateActivationToken();
        user = await prisma.user.create({
          data: {
            email: member.email,
            fullName: member.fullName,
            passwordHash: null,
            activationTokenHash: tokenHash,
            activationTokenExpiresAt: expiresAt,
            primaryCompanyId: company.id,
          },
        });
        pendingActivations.push({ company: companyDef.name, ...member });
        await sendActivationEmail({ to: member.email, fullName: member.fullName, rawToken });
      }

      const existingMembership = await prisma.companyMembership.findUnique({
        where: { userId_companyId: { userId: user.id, companyId: company.id } },
      });
      if (!existingMembership) {
        await prisma.companyMembership.create({
          data: { userId: user.id, companyId: company.id, roleId: roleIdByName[member.role], scopeType: "COMPANY" },
        });
        console.log(`  Added ${member.fullName} to ${companyDef.name} as ${member.role}`);
      }
    }
  }

  if (pendingActivations.length > 0) {
    console.log("\n=== New users created -- activation email sent to each (or logged above if SMTP isn't configured yet) ===");
    for (const p of pendingActivations) {
      console.log(`${p.company} | ${p.fullName} <${p.email}> | ${p.role}`);
    }
  } else {
    console.log("\nNo new users created (all already existed).");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
