import "dotenv/config";
import { directoryPrisma } from "../src/db/directoryPrisma.js";
import { encryptSecret, isEncrypted } from "../src/utils/secretBox.js";

// One-time (and safely re-runnable) migration: encrypts every
// Company.tenantDatabaseUrl still stored in plain text. Rows already in the
// "enc:v1:" format are skipped, so running it twice changes nothing.
// Prints company names only -- never the URLs themselves.
async function main() {
  const companies = await directoryPrisma.company.findMany({
    select: { id: true, name: true, tenantDatabaseUrl: true },
  });

  let encrypted = 0;
  for (const company of companies) {
    if (isEncrypted(company.tenantDatabaseUrl)) {
      console.log(`Already encrypted: ${company.name}`);
      continue;
    }
    await directoryPrisma.company.update({
      where: { id: company.id },
      data: { tenantDatabaseUrl: encryptSecret(company.tenantDatabaseUrl) },
    });
    console.log(`Encrypted: ${company.name}`);
    encrypted += 1;
  }

  console.log(`Done. ${encrypted} encrypted, ${companies.length - encrypted} already encrypted.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
