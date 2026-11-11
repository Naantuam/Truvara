import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { listCompanyMembers } from "../services/companyService.js";
import { updateMember, removeMember, SettingsError } from "../services/settingsService.js";
import { inviteMember, resendInvitation, revokeInvitation, InvitationError } from "../services/invitationService.js";

const router = Router();
router.use(authenticate);

function handleSettingsError(err, res, next) {
  if (err instanceof SettingsError || err instanceof InvitationError) {
    return res.status(err.status).json({ detail: err.message });
  }
  next(err);
}

router.get("/members", async (req, res, next) => {
  try {
    const includeInvited = req.query.include === "invited" && req.user.permissions.has("admin:users:manage");
    const members = await listCompanyMembers(req.user.companyId, { includeInvited });
    res.json(members);
  } catch (err) {
    next(err);
  }
});

const addMemberSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  roleName: z.enum(["Owner", "Manager", "Team Member"]),
});

// MEDIUM priority, work-scope §10: Team Members - add member, assign role.
// Sends an invitation; the person only joins once they accept it. The
// response is the same whether or not the email already has an account.
router.post("/members", requirePermission("admin:users:manage"), async (req, res, next) => {
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "email, fullName, and a valid roleName are required." });

  try {
    const member = await inviteMember(req.user.tenantDb, req.user.companyId, req.user, parsed.data);
    res.status(201).json(member);
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

router.post("/members/:userId/resend-invite", requirePermission("admin:users:manage"), async (req, res, next) => {
  try {
    res.json(await resendInvitation(req.user.companyId, req.params.userId));
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

// Withdraws a pending invitation. No reason needed (unlike removing a
// member): nobody lost access, since they never had any.
router.delete("/members/:userId/invite", requirePermission("admin:users:manage"), async (req, res, next) => {
  try {
    res.json(await revokeInvitation(req.user.tenantDb, req.user.companyId, req.user, req.params.userId));
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

const updateMemberSchema = z.object({
  fullName: z.string().min(1).optional(),
  roleName: z.enum(["Owner", "Manager", "Team Member"]).optional(),
  isActive: z.boolean().optional(),
});

// MEDIUM priority: edit member info, activate/deactivate.
router.patch("/members/:userId", requirePermission("admin:users:manage"), async (req, res, next) => {
  const parsed = updateMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid payload." });

  try {
    const member = await updateMember(req.user.companyId, req.params.userId, parsed.data);
    res.json(member);
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

const removeMemberSchema = z.object({ reason: z.string().min(1, "A reason is required.") });

// Owner-only: removes someone's access to this company. Requires a reason,
// logged to the company's own audit trail -- see removeMember() for why the
// underlying User account (and their history) is never touched.
router.delete("/members/:userId", requirePermission("admin:users:manage"), async (req, res, next) => {
  const parsed = removeMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: parsed.error.issues[0]?.message || "Invalid payload." });

  try {
    const result = await removeMember(req.user.tenantDb, req.user.companyId, req.user, req.params.userId, parsed.data.reason);
    res.json(result);
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

export default router;
