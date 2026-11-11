import argon2 from "argon2";
import { directoryPrisma } from "../db/directoryPrisma.js";
import { getVerifiedTenantClient } from "../db/tenantPrisma.js";
import { scopeToCompany } from "../db/companyScopedClient.js";
import { decryptSecret } from "../utils/secretBox.js";
import { recordAuditEvent } from "../utils/audit.js";
import { generateActivationToken, hashToken, sendInvitationEmail, INVITE_TTL_DAYS } from "./activation.js";
import { sessionForMembership } from "./authService.js";

// Team invitations. Adding someone to a company creates a PENDING
// membership that grants no access (membershipAccess.js) until that person
// accepts from the emailed link. Before this, an Owner could put anyone with
// a Truvara account into their company silently -- and learn, from the
// response, that the email had an account and the name it was registered
// under. Now:
//   - the invitee decides; nothing is shared with a company they didn't join
//   - the Owner gets the same response whether or not the email has an
//     account, and sees only the name they typed until the invite is accepted

export class InvitationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "InvitationError";
    this.status = status;
  }
}

const INVALID_LINK = "This invitation link is invalid, has expired, or has already been used.";
const INVITE_TTL_HOURS = INVITE_TTL_DAYS * 24;

// Pure: what a membership found by invite token means right now.
export function invitationState(membership, now = new Date()) {
  if (!membership || !membership.invitePending) return "invalid";
  if (!membership.inviteExpiresAt || membership.inviteExpiresAt < now) return "expired";
  return "valid";
}

// Pure: how a membership appears in the Owner's member list. A pending
// invite shows the name the Owner typed, never the invitee's account name.
export function presentMember(m) {
  return {
    id: m.user.id,
    fullName: m.invitePending ? m.invitedName || m.user.email : m.user.fullName,
    email: m.user.email,
    role: m.role.name,
    isActive: m.isActive,
    status: m.invitePending ? "invited" : m.isActive ? "active" : "inactive",
    ...(m.invitePending ? { invitedAt: m.invitedAt, inviteExpiresAt: m.inviteExpiresAt } : {}),
  };
}

function newInviteToken() {
  const { rawToken, tokenHash, expiresAt } = generateActivationToken(INVITE_TTL_HOURS);
  return { rawToken, inviteFields: { inviteTokenHash: tokenHash, inviteExpiresAt: expiresAt } };
}

async function emailInvite(membership, rawToken) {
  const [inviter, company] = await Promise.all([
    membership.invitedById
      ? directoryPrisma.user.findUnique({ where: { id: membership.invitedById }, select: { fullName: true } })
      : null,
    directoryPrisma.company.findUnique({ where: { id: membership.companyId }, select: { name: true } }),
  ]);
  await sendInvitationEmail({
    to: membership.user.email,
    inviteeName: membership.invitedName || membership.user.fullName,
    inviterName: inviter?.fullName || "Your team",
    companyName: company?.name || "a company",
    roleName: membership.role.name,
    rawToken,
  });
}

// Accept/decline happen outside any company session, so the audit entry is
// written through the company's own tenant connection here. Best effort: the
// directory change is what grants or removes access and has already
// committed; a briefly unreachable tenant database must not undo it.
async function auditForCompany(companyId, event) {
  try {
    const company = await directoryPrisma.company.findUnique({
      where: { id: companyId },
      select: { tenantDatabaseUrl: true },
    });
    const db = scopeToCompany(await getVerifiedTenantClient(decryptSecret(company.tenantDatabaseUrl)), companyId);
    await recordAuditEvent(db, { companyId, ...event });
  } catch (err) {
    console.error(`Audit entry ${event.action} for company ${companyId} not written: ${err.message}`);
  }
}

// ── Owner side (admin:users:manage) ────────────────────────────────────────
export async function inviteMember(tenantDb, companyId, actor, { email, fullName, roleName }) {
  const role = await directoryPrisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new InvitationError("Unknown role.");

  const normalizedEmail = email.trim().toLowerCase();
  const typedName = fullName.trim();
  let user = await directoryPrisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

  if (user) {
    const existing = await directoryPrisma.companyMembership.findUnique({
      where: { userId_companyId: { userId: user.id, companyId } },
    });
    if (existing?.invitePending) {
      throw new InvitationError("This person already has a pending invitation. Use Resend invite instead.", 409);
    }
    if (existing) throw new InvitationError("This person is already a member of this company.", 409);
  } else {
    // No password and no activation token: the account is completed only by
    // accepting this invitation, which proves they control the inbox.
    user = await directoryPrisma.user.create({
      data: { email: normalizedEmail, fullName: typedName, passwordHash: null },
    });
  }

  const { rawToken, inviteFields } = newInviteToken();
  const membership = await directoryPrisma.companyMembership.create({
    data: {
      userId: user.id,
      companyId,
      roleId: role.id,
      scopeType: "COMPANY",
      invitePending: true,
      invitedById: actor.userId,
      invitedName: typedName,
      invitedAt: new Date(),
      ...inviteFields,
    },
    include: { user: true, role: true },
  });

  await recordAuditEvent(tenantDb, {
    companyId,
    actorId: actor.userId,
    action: "member.invited",
    entityType: "User",
    entityId: user.id,
    changes: { fullName: typedName, email: normalizedEmail, role: role.name },
  });
  await emailInvite(membership, rawToken);

  return presentMember(membership);
}

async function findPendingMembership(companyId, userId) {
  const membership = await directoryPrisma.companyMembership.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { user: true, role: true },
  });
  if (!membership?.invitePending) throw new InvitationError("There's no pending invitation for this person.", 404);
  return membership;
}

// New link, new expiry; the previous link stops working.
export async function resendInvitation(companyId, userId) {
  const membership = await findPendingMembership(companyId, userId);
  const { rawToken, inviteFields } = newInviteToken();
  const updated = await directoryPrisma.companyMembership.update({
    where: { id: membership.id },
    data: inviteFields,
    include: { user: true, role: true },
  });
  await emailInvite(updated, rawToken);
  return presentMember(updated);
}

export async function revokeInvitation(tenantDb, companyId, actor, userId) {
  const membership = await findPendingMembership(companyId, userId);
  await directoryPrisma.companyMembership.delete({ where: { id: membership.id } });
  await recordAuditEvent(tenantDb, {
    companyId,
    actorId: actor.userId,
    action: "member.invite_revoked",
    entityType: "User",
    entityId: userId,
    changes: { fullName: membership.invitedName, email: membership.user.email },
  });
  return { id: userId, revoked: true };
}

// ── Invitee side (public, token-holder only) ───────────────────────────────
async function findByToken(rawToken) {
  return directoryPrisma.companyMembership.findUnique({
    where: { inviteTokenHash: hashToken(rawToken) },
    include: { user: true, role: true, company: { select: { name: true } } },
  });
}

async function requireValid(rawToken) {
  const membership = await findByToken(rawToken);
  if (invitationState(membership) !== "valid") throw new InvitationError(INVALID_LINK, 404);
  return membership;
}

// What the invite page shows. Only the person holding the emailed link can
// call this, so naming their own email is fine.
export async function previewInvitation(rawToken) {
  const membership = await requireValid(rawToken);
  const inviter = membership.invitedById
    ? await directoryPrisma.user.findUnique({ where: { id: membership.invitedById }, select: { fullName: true } })
    : null;
  return {
    companyName: membership.company.name,
    roleName: membership.role.name,
    inviterName: inviter?.fullName || null,
    email: membership.user.email,
    fullName: membership.user.fullName,
    // A new person sets their password while accepting; an existing user
    // accepts, then signs in with the password they already have.
    needsPassword: !membership.user.passwordHash,
  };
}

// Consumes the token atomically (the updateMany only matches while still
// pending with this token), so a link can't be accepted twice.
export async function acceptInvitation(rawToken, password) {
  const membership = await requireValid(rawToken);
  const needsPassword = !membership.user.passwordHash;
  if (needsPassword && (!password || password.length < 8)) {
    throw new InvitationError("Choose a password of at least 8 characters.");
  }
  const passwordHash = needsPassword ? await argon2.hash(password) : null;

  await directoryPrisma.$transaction(async (tx) => {
    const { count } = await tx.companyMembership.updateMany({
      where: { id: membership.id, invitePending: true, inviteTokenHash: membership.inviteTokenHash },
      data: { invitePending: false, inviteTokenHash: null, inviteExpiresAt: null },
    });
    if (count !== 1) throw new InvitationError(INVALID_LINK, 404);

    const userData = {
      ...(passwordHash ? { passwordHash, activationTokenHash: null, activationTokenExpiresAt: null } : {}),
      ...(!membership.user.primaryCompanyId ? { primaryCompanyId: membership.companyId } : {}),
    };
    if (Object.keys(userData).length) await tx.user.update({ where: { id: membership.userId }, data: userData });
  });

  await auditForCompany(membership.companyId, {
    actorId: membership.userId,
    action: "member.joined",
    entityType: "User",
    entityId: membership.userId,
    changes: { role: membership.role.name },
  });

  // Someone who just chose their password has proven inbox control and set
  // their credential in one step, like activation: sign them straight in.
  // An existing account is NOT signed in from an emailed link alone -- they
  // sign in with their own password, and the new company is now in their list.
  if (needsPassword) return sessionForMembership(membership.userId, membership.companyId);
  return { accepted: true, company_name: membership.company.name };
}

export async function declineInvitation(rawToken) {
  const membership = await requireValid(rawToken);
  const { count } = await directoryPrisma.companyMembership.deleteMany({
    where: { id: membership.id, invitePending: true, inviteTokenHash: membership.inviteTokenHash },
  });
  if (count !== 1) throw new InvitationError(INVALID_LINK, 404);

  await auditForCompany(membership.companyId, {
    actorId: membership.userId,
    action: "member.invite_declined",
    entityType: "User",
    entityId: membership.userId,
    changes: { fullName: membership.invitedName, email: membership.user.email },
  });
  return { declined: true };
}

// For "didn't get the email?" from someone with no password yet who was
// invited: a fresh link for each pending invitation.
export async function resendPendingInvitationsFor(userId) {
  const pending = await directoryPrisma.companyMembership.findMany({
    where: { userId, invitePending: true },
    include: { user: true, role: true },
  });
  for (const membership of pending) {
    const { rawToken, inviteFields } = newInviteToken();
    const updated = await directoryPrisma.companyMembership.update({
      where: { id: membership.id },
      data: inviteFields,
      include: { user: true, role: true },
    });
    await emailInvite(updated, rawToken);
  }
  return pending.length;
}
