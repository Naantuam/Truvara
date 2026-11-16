import "dotenv/config";
import { directoryPrisma } from "../src/db/directoryPrisma.js";
import { decryptSecret, isEncrypted } from "../src/utils/secretBox.js";

// EMERGENCY UNDO for encrypt:tenant-urls: turns every encrypted
// Company.tenantDatabaseUrl back into plain text, so a server that cannot
// decrypt (missing or wrong TENANT_URL_ENCRYPTION_KEY) works again. Uses the
// key in your local .env. Re-encrypt with `npm run encrypt:tenant-urls` once
// the server's key is fixed. Prints company names only, never the URLs.
async function main() {
  const companies = await directoryPrisma.company.findMany({
    select: { id: true, name: true, tenantDatabaseUrl: true },
  });

  let restored = 0;
  for (const company of companies) {
    if (!isEncrypted(company.tenantDatabaseUrl)) {
      console.log(`Already plain: ${company.name}`);
      continue;
    }
    await directoryPrisma.company.update({
      where: { id: company.id },
      data: { tenantDatabaseUrl: decryptSecret(company.tenantDatabaseUrl) },
    });
    console.log(`Restored: ${company.name}`);
    restored += 1;
  }
  console.log(`Done. ${restored} restored to plain text.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => directoryPrisma.$disconnect());
