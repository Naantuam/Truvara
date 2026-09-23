// Workaround for this dev sandbox (no outbound IPv6 route) combined with a
// real Prisma quirk: Prisma's Rust connection engine resolves DNS on its own,
// separately from Node's `dns` module, so `--dns-result-order=ipv4first`
// (set in every script that runs Node directly) does NOT reach it. When the
// DB host has an IPv6 record, the engine's own resolver tries it, gets no
// route, and times out instead of falling back -- reported as a generic
// "can't reach database server" (P1001), even though `psql`/`curl` to the
// exact same host succeed instantly.
//
// Fix: resolve the current IPv4 address ourselves (glibc's getaddrinfo,
// which Prisma's engine binary DOES consult via HOSTALIASES) and write it to
// a HOSTALIASES file, so hostname->IP mapping happens before Prisma's own
// resolver ever runs -- while still sending the real hostname over TLS (SNI),
// which Neon's proxy needs to route to the right compute. Re-resolved fresh
// on every run (not hardcoded) since Neon's IPs aren't guaranteed stable.
import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const backendRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const hostAliasesPath = path.join(backendRoot, ".hostaliases");

function extractHostname(databaseUrl) {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return null;
  }
}

async function main() {
  const hostname = extractHostname(process.env.DATABASE_URL);

  if (!hostname || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    fs.writeFileSync(hostAliasesPath, "");
    return;
  }

  try {
    const addresses = await dns.resolve4(hostname);
    fs.writeFileSync(hostAliasesPath, `${hostname} ${addresses[0]}\n`);
    console.log(`[resolve-db-host] ${hostname} -> ${addresses[0]} (IPv4 pin for Prisma's DNS resolver)`);
  } catch (err) {
    console.warn(`[resolve-db-host] Could not resolve ${hostname} over IPv4, leaving HOSTALIASES empty:`, err.message);
    fs.writeFileSync(hostAliasesPath, "");
  }
}

main();
