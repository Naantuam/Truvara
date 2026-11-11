import crypto from "node:crypto";

// Reversible encryption for secrets the backend must read back in full --
// currently Company.tenantDatabaseUrl, which holds a database password.
// (User passwords and activation tokens are *hashed* instead, since those
// are only ever compared, never recovered.)
//
// AES-256-GCM: authenticated, so a tampered value fails to decrypt rather
// than silently producing a wrong URL. The key lives only in the server's
// environment (TENANT_URL_ENCRYPTION_KEY), never in the database -- a leaked
// copy of the directory DB alone exposes no tenant credentials.
//
// Stored format: "enc:v1:<iv>:<authTag>:<ciphertext>" (base64 parts). The
// version tag leaves room for key rotation later without guessing formats.
const PREFIX = "enc:v1:";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

function getKey() {
  const raw = process.env.TENANT_URL_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("TENANT_URL_ENCRYPTION_KEY is not set -- cannot encrypt/decrypt tenant credentials.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("TENANT_URL_ENCRYPTION_KEY must be 32 bytes, base64-encoded (generate with: openssl rand -base64 32).");
  }
  return key;
}

export function isEncrypted(value) {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(plainText) {
  if (isEncrypted(plainText)) return plainText; // never double-encrypt
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const cipherText = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${cipherText.toString("base64")}`;
}

// Transitional: a value without the "enc:v1:" prefix is returned as-is, so
// rows written before encryption existed keep working until
// `npm run encrypt:tenant-urls` converts them. Once every row is encrypted,
// this passthrough can be removed to make plain-text rows a hard error.
export function decryptSecret(stored) {
  if (!isEncrypted(stored)) return stored;
  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}
