import crypto from "node:crypto";
import { sendMail } from "../utils/mailer.js";

const ACTIVATION_TOKEN_TTL_HOURS = 48;

// The raw token is only ever seen once (in the email link). Only its SHA-256
// hash is stored -- deterministic (unlike argon2) so it can be looked up by
// equality, which is fine here since the token itself is 32 random bytes,
// not a low-entropy human-chosen secret that needs slow hashing.
function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateActivationToken() {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);
  return { rawToken, tokenHash: hashToken(rawToken), expiresAt };
}

export { hashToken };

export async function sendActivationEmail({ to, fullName, rawToken }) {
  const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
  const link = `${frontendUrl}/activate?token=${rawToken}`;

  await sendMail({
    to,
    subject: "Activate your Truvara account",
    text: `Hi ${fullName},\n\nYou've been added to a company on Truvara. Set your password to activate your account:\n\n${link}\n\nThis link expires in ${ACTIVATION_TOKEN_TTL_HOURS} hours.`,
  });
}
