import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

// MVP: one active company membership per user. The schema allows more
// (CompanyMembership is many-to-many) for when multi-company access is needed;
// login just picks the user's primary company for now.
async function loadMembership(userId, companyId) {
  return prisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { role: true },
  });
}

function signTokens(user, membership) {
  const payload = {
    sub: user.id,
    company_id: membership.companyId,
    role: membership.role.name,
  };
  const access = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refresh = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { access, refresh };
}

export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new AuthError("Invalid email or password.");

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new AuthError("Invalid email or password.");

  if (!user.primaryCompanyId) throw new AuthError("This user is not attached to a company.");

  const membership = await loadMembership(user.id, user.primaryCompanyId);
  if (!membership) throw new AuthError("This user has no active membership in their company.");

  const tokens = signTokens(user, membership);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      company_id: membership.companyId,
      role: membership.role.name,
    },
  };
}

export async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  } catch {
    throw new AuthError("Invalid or expired refresh token.");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive || !user.primaryCompanyId) throw new AuthError("Invalid refresh token.");

  const membership = await loadMembership(user.id, user.primaryCompanyId);
  if (!membership) throw new AuthError("Invalid refresh token.");

  const tokens = signTokens(user, membership);
  return { access: tokens.access };
}
