import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { directoryPrisma } from "../db/directoryPrisma.js";
import {
  hashToken,
  generateActivationToken,
  sendSignupVerificationEmail,
  sendAccountExistsEmail,
  sendActivationEmail,
  sendPasswordResetEmail,
} from "./activation.js";
import { grantsAccess, ACCESS_GRANTING } from "./membershipAccess.js";
import { resendPendingInvitationsFor } from "./invitationService.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
// Short-lived on purpose -- this token can only be used to pick a company
// from the list the password check already proved this user belongs to. It
// cannot access anything else (authenticate.js requires a company_id claim,
// which this token deliberately never carries).
const PRE_AUTH_TTL = "10m";
// Issued to a verified user who belongs to no company yet. Like the pre-auth
// token it carries no company_id, so authenticate.js rejects it everywhere;
// it is accepted only by the create-workspace endpoint (purpose check in
// verifyIdentityToken below).
const ONBOARDING_TTL = "30m";

// Every no-company token carries a purpose, and each endpoint that accepts
// one checks it -- a token minted to pick a company can't be replayed to
// create a workspace, and vice versa.
export const TOKEN_PURPOSE = { SELECT_COMPANY: "select_company", ONBOARDING: "onboarding" };

export const selfSignupEnabled = () => process.env.SELF_SIGNUP_ENABLED === "true";

function signOnboardingToken(userId) {
  return jwt.sign({ sub: userId, purpose: TOKEN_PURPOSE.ONBOARDING }, ACCESS_SECRET, { expiresIn: ONBOARDING_TTL });
}

// Verifies a no-company token for a specific purpose. Returns the user id.
export function verifyIdentityToken(token, purpose) {
  let decoded;
  try {
    decoded = jwt.verify(token, ACCESS_SECRET);
  } catch {
    throw new AuthError("Invalid or expired session. Please sign in again.");
  }
  if (decoded.company_id || decoded.purpose !== purpose) throw new AuthError("Invalid session token.");
  return decoded.sub;
}

export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

function signSessionTokens(userId, companyId, roleName) {
  const access = jwt.sign({ sub: userId, company_id: companyId, role: roleName }, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });
  // Refresh embeds the same company_id so a refresh restores the exact
  // workspace that was selected at login, rather than guessing.
  const refresh = jwt.sign({ sub: userId, company_id: companyId }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { access, refresh };
}

async function buildSessionResponse(user, membership) {
  const tokens = signSessionTokens(user.id, membership.companyId, membership.role.name);
  const permissionCodes = new Set((membership.role.rolePermissions || []).map((rp) => rp.permission.code));

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      company_id: membership.companyId,
      company_name: membership.company.name,
      company_currency: membership.company.currency || "NGN",
      // Not sent at all to anyone without this permission -- not just
      // hidden in the UI, since that alone would still leak it over the
      // network to a Team Member who looked.
      ...(permissionCodes.has("admin:settings:manage")
        ? { company_employee_count: membership.company.employeeCount ?? null }
        : {}),
      role: membership.role.name,
      notifications_read_at: membership.notificationsReadAt,
    },
  };
}

// Shared by login() and activateAccount() -- once a user's identity is
// proven (password checked, or password just set via activation), the
// "which workspace(s) can they reach" resolution is identical either way.
async function resolveSessionForUser(user) {
  // Only active memberships are reachable -- suspension is scoped per
  // company, so a user suspended from one company can still log in and use
  // any other they belong to.
  const memberships = await directoryPrisma.companyMembership.findMany({
    where: { userId: user.id, ...ACCESS_GRANTING },
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } },
      company: { select: { id: true, name: true, currency: true, employeeCount: true } },
    },
  });

  if (memberships.length === 0) {
    // Invited but hasn't accepted yet: point them at the invitation rather
    // than at creating a workspace of their own.
    const pendingInvites = await directoryPrisma.companyMembership.count({
      where: { userId: user.id, invitePending: true },
    });
    if (pendingInvites) {
      throw new AuthError(
        "You've been invited to a company but haven't accepted yet. Open the invitation email to accept it.",
        "INVITATION_PENDING"
      );
    }
    // A verified person with no company yet -- typically someone who just
    // signed up. Hand them to workspace creation instead of a dead end, but
    // only while self-service signup is open.
    if (!selfSignupEnabled()) {
      throw new AuthError("You don't have active access to any company. Contact your company's Owner.");
    }
    return {
      onboarding_required: true,
      onboarding_token: signOnboardingToken(user.id),
      user: { id: user.id, email: user.email, full_name: user.fullName },
    };
  }

  if (memberships.length === 1) {
    return buildSessionResponse(user, memberships[0]);
  }

  // Multiple companies (e.g. an Owner/Founder involved in more than one
  // business) -- prove identity now, defer picking a workspace to a second
  // step rather than guessing which one they meant.
  const preAuthToken = jwt.sign({ sub: user.id, purpose: TOKEN_PURPOSE.SELECT_COMPANY }, ACCESS_SECRET, {
    expiresIn: PRE_AUTH_TTL,
  });
  return {
    companies_available: memberships.map((m) => ({ id: m.company.id, name: m.company.name })),
    pre_auth_token: preAuthToken,
  };
}

export async function login(email, password) {
  // Case-insensitive: self-signup stores emails lowercased, but people type
  // them however they like.
  const user = await directoryPrisma.user.findFirst({ where: { email: { equals: email.trim(), mode: "insensitive" } } });
  if (!user) throw new AuthError("Invalid email or password.");

  if (!user.passwordHash) {
    throw new AuthError(
      "This account hasn't been activated yet. Check your email for the activation link.",
      "ACCOUNT_NOT_ACTIVATED"
    );
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new AuthError("Invalid email or password.");

  return resolveSessionForUser(user);
}

export async function activateAccount(rawToken, newPassword) {
  const user = await directoryPrisma.user.findUnique({ where: { activationTokenHash: hashToken(rawToken) } });
  if (!user || !user.activationTokenExpiresAt || user.activationTokenExpiresAt < new Date()) {
    throw new AuthError("This activation link is invalid or has expired.");
  }

  const passwordHash = await argon2.hash(newPassword);
  const updated = await directoryPrisma.user.update({
    where: { id: user.id },
    data: { passwordHash, activationTokenHash: null, activationTokenExpiresAt: null },
  });

  return resolveSessionForUser(updated);
}

export async function selectCompany(preAuthToken, companyId) {
  // Rejects full access tokens (they carry company_id) and onboarding tokens
  // (wrong purpose) alike.
  const userId = verifyIdentityToken(preAuthToken, TOKEN_PURPOSE.SELECT_COMPANY);

  const user = await directoryPrisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError("Invalid session. Please log in again.");

  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: user.id, companyId } },
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } },
      company: { select: { id: true, name: true, currency: true, employeeCount: true } },
    },
  });
  if (!grantsAccess(membership)) throw new AuthError("You do not have access to that company.");

  return buildSessionResponse(user, membership);
}

export async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw new AuthError("Invalid or expired refresh token.");
  }

  if (!decoded.company_id) throw new AuthError("Invalid refresh token.");

  const user = await directoryPrisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) throw new AuthError("Invalid refresh token.");

  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: user.id, companyId: decoded.company_id } },
    include: { role: true },
  });
  if (!grantsAccess(membership)) throw new AuthError("Invalid refresh token.");

  const access = jwt.sign(
    { sub: user.id, company_id: membership.companyId, role: membership.role.name },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
  return { access };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await directoryPrisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError("User not found.");

  const valid = await argon2.verify(user.passwordHash, currentPassword);
  if (!valid) throw new AuthError("Current password is incorrect.");

  const passwordHash = await argon2.hash(newPassword);
  await directoryPrisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

// Issues a normal session for a membership that was just created (e.g. the
// Owner membership from workspace creation). Same response shape as login.
export async function sessionForMembership(userId, companyId) {
  const [user, membership] = await Promise.all([
    directoryPrisma.user.findUnique({ where: { id: userId } }),
    directoryPrisma.companyMembership.findUnique({
      where: { userId_companyId: { userId, companyId } },
      include: {
        role: { include: { rolePermissions: { include: { permission: true } } } },
        company: { select: { id: true, name: true, currency: true, employeeCount: true } },
      },
    }),
  ]);
  if (!user || !grantsAccess(membership)) throw new AuthError("Could not start a session for this workspace.");
  return buildSessionResponse(user, membership);
}

// Self-service signup (PRD section 5). Always resolves the same way to the
// caller, whatever the email's state, so the form can't be used to discover
// who has a Truvara account; only the inbox owner learns, by email.
//   - new email: create the user with no password, email a verification link
//     that lets them choose one (see sendSignupVerificationEmail for why the
//     password isn't taken here)
//   - email with an active account: email them that an account exists
//   - email with no password yet (pending signup or invited, not activated):
//     issue a fresh link; the old one stops working
export async function signup({ fullName, email, acceptedTerms }) {
  if (!selfSignupEnabled()) throw new AuthError("Self-service signup isn't open yet.", "SIGNUP_CLOSED");
  if (acceptedTerms !== true) throw new AuthError("You need to accept the Terms of Use and Privacy Notice.");

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await directoryPrisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

  if (existing?.passwordHash) {
    await sendAccountExistsEmail({ to: existing.email, fullName: existing.fullName });
    return;
  }

  const { rawToken, tokenHash, expiresAt } = generateActivationToken();

  if (existing) {
    await directoryPrisma.user.update({
      where: { id: existing.id },
      data: { activationTokenHash: tokenHash, activationTokenExpiresAt: expiresAt, termsAcceptedAt: new Date() },
    });
    await sendSignupVerificationEmail({ to: existing.email, fullName: existing.fullName, rawToken });
    return;
  }

  await directoryPrisma.user.create({
    data: {
      email: normalizedEmail,
      fullName: fullName.trim(),
      passwordHash: null,
      activationTokenHash: tokenHash,
      activationTokenExpiresAt: expiresAt,
      termsAcceptedAt: new Date(),
    },
  });
  await sendSignupVerificationEmail({ to: normalizedEmail, fullName: fullName.trim(), rawToken });
}

// "Didn't get the email?" -- for anyone whose account has no password yet
// (signed up, or invited by an Owner). Same silent-on-unknown rule as signup.
export async function resendActivation(email) {
  const user = await directoryPrisma.user.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    include: { memberships: { select: { id: true }, take: 1 } },
  });
  if (!user || user.passwordHash) return;

  // Invited and never set a password: the invitation link is how they set
  // one, so resend that (an activation link would leave them signed in to
  // nothing, since the invite would still be unaccepted).
  if (await resendPendingInvitationsFor(user.id)) return;

  const { rawToken, tokenHash, expiresAt } = generateActivationToken();
  await directoryPrisma.user.update({
    where: { id: user.id },
    data: { activationTokenHash: tokenHash, activationTokenExpiresAt: expiresAt },
  });

  // Invited people get the invitation wording; self-signups the signup one.
  if (user.memberships.length) {
    await sendActivationEmail({ to: user.email, fullName: user.fullName, rawToken });
  } else {
    await sendSignupVerificationEmail({ to: user.email, fullName: user.fullName, rawToken });
  }
}

// Forgot password. Silent on unknown emails, like signup. An account that
// never set a password gets its activation/verification link instead.
export async function requestPasswordReset(email) {
  const user = await directoryPrisma.user.findFirst({ where: { email: { equals: email.trim(), mode: "insensitive" } } });
  if (!user) return;
  if (!user.passwordHash) return resendActivation(user.email);

  const { rawToken, tokenHash, expiresAt } = generateActivationToken();
  await directoryPrisma.user.update({
    where: { id: user.id },
    data: { activationTokenHash: tokenHash, activationTokenExpiresAt: expiresAt },
  });
  await sendPasswordResetEmail({ to: user.email, fullName: user.fullName, rawToken });
}
