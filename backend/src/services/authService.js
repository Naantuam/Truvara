import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { directoryPrisma } from "../db/directoryPrisma.js";
import { hashToken } from "./activation.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
// Short-lived on purpose -- this token can only be used to pick a company
// from the list the password check already proved this user belongs to. It
// cannot access anything else (authenticate.js requires a company_id claim,
// which this token deliberately never carries).
const PRE_AUTH_TTL = "10m";

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
  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      company_id: membership.companyId,
      company_name: membership.company.name,
      role: membership.role.name,
    },
  };
}

// Shared by login() and activateAccount() -- once a user's identity is
// proven (password checked, or password just set via activation), the
// "which workspace(s) can they reach" resolution is identical either way.
async function resolveSessionForUser(user) {
  const memberships = await directoryPrisma.companyMembership.findMany({
    where: { userId: user.id },
    include: { role: true, company: { select: { id: true, name: true } } },
  });

  if (memberships.length === 0) {
    throw new AuthError("This user is not attached to any company.");
  }

  if (memberships.length === 1) {
    return buildSessionResponse(user, memberships[0]);
  }

  // Multiple companies (e.g. an Owner/Founder involved in more than one
  // business) -- prove identity now, defer picking a workspace to a second
  // step rather than guessing which one they meant.
  const preAuthToken = jwt.sign({ sub: user.id }, ACCESS_SECRET, { expiresIn: PRE_AUTH_TTL });
  return {
    companies_available: memberships.map((m) => ({ id: m.company.id, name: m.company.name })),
    pre_auth_token: preAuthToken,
  };
}

export async function login(email, password) {
  const user = await directoryPrisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new AuthError("Invalid email or password.");

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
  let decoded;
  try {
    decoded = jwt.verify(preAuthToken, ACCESS_SECRET);
  } catch {
    throw new AuthError("Invalid or expired session. Please log in again.");
  }
  if (decoded.company_id) {
    // This is a full access token, not a pre-auth token -- reject it here.
    throw new AuthError("Invalid session token.");
  }

  const user = await directoryPrisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) throw new AuthError("Invalid session. Please log in again.");

  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: user.id, companyId } },
    include: { role: true, company: { select: { id: true, name: true } } },
  });
  if (!membership) throw new AuthError("You do not have access to that company.");

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
  if (!user || !user.isActive) throw new AuthError("Invalid refresh token.");

  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: user.id, companyId: decoded.company_id } },
    include: { role: true },
  });
  if (!membership) throw new AuthError("Invalid refresh token.");

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
