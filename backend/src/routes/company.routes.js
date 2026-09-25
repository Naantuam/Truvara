import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { listCompanyMembers } from "../services/companyService.js";
import { addMember, updateMember, SettingsError } from "../services/settingsService.js";

const router = Router();
router.use(authenticate);

function handleSettingsError(err, res, next) {
  if (err instanceof SettingsError) return res.status(err.status).json({ detail: err.message });
  next(err);
}

router.get("/members", async (req, res, next) => {
  try {
    const members = await listCompanyMembers(req.user.companyId);
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
router.post("/members", requirePermission("admin:users:manage"), async (req, res, next) => {
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "email, fullName, and a valid roleName are required." });

  try {
    const member = await addMember(req.user.companyId, parsed.data);
    res.status(201).json(member);
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

export default router;
