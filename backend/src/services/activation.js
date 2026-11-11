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

export function generateActivationToken(ttlHours = ACTIVATION_TOKEN_TTL_HOURS) {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  return { rawToken, tokenHash: hashToken(rawToken), expiresAt };
}

export { hashToken };

export async function sendActivationEmail({ to, fullName, rawToken }) {
  const link = `${frontendUrl()}/activate?token=${rawToken}`;

  await sendMail({
    to,
    subject: "Activate your Truvara account",
    text: `Hi ${fullName},\n\nYou've been added to a company on Truvara. Set your password to activate your account:\n\n${link}\n\nThis link expires in ${ACTIVATION_TOKEN_TTL_HOURS} hours.`,
  });
}

const frontendUrl = () => (process.env.CORS_ORIGIN || "http://localhost:5173").split(",")[0].trim();

// Self-service signup: the link both proves the person owns this inbox and
// lets them choose their password. The password is deliberately NOT taken
// at the signup form -- otherwise anyone could register someone else's email
// first and plant a password on the account before its owner arrived.
export async function sendSignupVerificationEmail({ to, fullName, rawToken }) {
  const link = `${frontendUrl()}/activate?token=${rawToken}&signup=1`;
  await sendMail({
    to,
    subject: "Verify your email to finish creating your Truvara account",
    text: `Hi ${fullName},\n\nConfirm this is your email address and choose a password to finish creating your Truvara account:\n\n${link}\n\nThis link expires in ${ACTIVATION_TOKEN_TTL_HOURS} hours. If you didn't sign up for Truvara, you can ignore this email.`,
  });
}

// Sent when someone tries to sign up with an email that already has an
// active account. The signup response itself never reveals this (so the
// form can't be used to check who uses Truvara); only the inbox owner learns.
export async function sendAccountExistsEmail({ to, fullName }) {
  await sendMail({
    to,
    subject: "You already have a Truvara account",
    text: `Hi ${fullName},\n\nSomeone (hopefully you) tried to create a Truvara account with this email address, but one already exists.\n\nSign in: ${frontendUrl()}/login\nForgot your password? ${frontendUrl()}/forgot-password\n\nIf this wasn't you, you can ignore this email; your account has not been changed.`,
  });
}

// Password reset reuses the same single-use emailed token as activation:
// either way the link proves the person controls this inbox, then lets them
// set a password. Requesting a new link invalidates any earlier one.
export async function sendPasswordResetEmail({ to, fullName, rawToken }) {
  const link = `${frontendUrl()}/activate?token=${rawToken}&reset=1`;
  await sendMail({
    to,
    subject: "Reset your Truvara password",
    text: `Hi ${fullName},\n\nWe received a request to reset your Truvara password. Choose a new one here:\n\n${link}\n\nThis link expires in ${ACTIVATION_TOKEN_TTL_HOURS} hours. If you didn't ask for this, ignore this email; your password hasn't changed.`,
  });
}

// Invitations last longer than activation links: the person may not be
// expecting the email and shouldn't have to chase the Owner for a new one.
export const INVITE_TTL_DAYS = 7;

// One email whether or not the invitee already has a Truvara account -- the
// Owner never learns which. The link opens a page that either lets a new
// person choose a password or asks an existing user to accept.
export async function sendInvitationEmail({ to, inviteeName, inviterName, companyName, roleName, rawToken }) {
  const link = `${frontendUrl()}/invite?token=${rawToken}`;
  await sendMail({
    to,
    subject: `${inviterName} invited you to join ${companyName} on Truvara`,
    text: `Hi ${inviteeName},\n\n${inviterName} has invited you to join ${companyName} on Truvara as ${roleName}.\n\nReview and accept the invitation here:\n\n${link}\n\nYou won't be added to ${companyName} unless you accept. The invitation expires in ${INVITE_TTL_DAYS} days. If you weren't expecting it, you can decline from the same link or ignore this email.`,
  });
}
