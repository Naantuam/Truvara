import { describe, it, expect, beforeAll } from "vitest";
import crypto from "node:crypto";
import { encryptSecret, decryptSecret, isEncrypted } from "../src/utils/secretBox.js";

const URL = "postgresql://user:s3cret@ep-example.neon.tech/db?sslmode=require";

describe("secretBox", () => {
  beforeAll(() => {
    process.env.TENANT_URL_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
  });

  it("round-trips a connection string without exposing it", () => {
    const stored = encryptSecret(URL);
    expect(isEncrypted(stored)).toBe(true);
    expect(stored).not.toContain("s3cret");
    expect(decryptSecret(stored)).toBe(URL);
  });

  it("uses a fresh IV each time", () => {
    expect(encryptSecret(URL)).not.toBe(encryptSecret(URL));
  });

  it("does not double-encrypt", () => {
    const stored = encryptSecret(URL);
    expect(encryptSecret(stored)).toBe(stored);
  });

  it("passes legacy plain-text values through", () => {
    expect(decryptSecret(URL)).toBe(URL);
  });

  it("rejects tampered ciphertext", () => {
    const stored = encryptSecret(URL);
    const tampered = stored.slice(0, -4) + (stored.endsWith("AAAA") ? "BBBB" : "AAAA");
    expect(() => decryptSecret(tampered)).toThrow();
  });

  it("fails with the wrong key", () => {
    const stored = encryptSecret(URL);
    process.env.TENANT_URL_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
    expect(() => decryptSecret(stored)).toThrow();
  });
});
