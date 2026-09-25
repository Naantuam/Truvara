import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { updateProfile, updateCompany, SettingsError } from "../services/settingsService.js";

const router = Router();
router.use(authenticate);

function handleSettingsError(err, res, next) {
  if (err instanceof SettingsError) return res.status(err.status).json({ detail: err.message });
  next(err);
}

const profileSchema = z.object({ fullName: z.string().min(1) });

// Self-service -- any authenticated user can edit their own profile, no
// special permission needed.
router.patch("/profile", async (req, res, next) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "fullName is required." });

  try {
    const user = await updateProfile(req.user.id, parsed.data);
    res.json(user);
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

const companySchema = z.object({ name: z.string().min(1) });

router.patch("/company", requirePermission("admin:settings:manage"), async (req, res, next) => {
  const parsed = companySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "name is required." });

  try {
    const company = await updateCompany(req.user.companyId, parsed.data);
    res.json(company);
  } catch (err) {
    handleSettingsError(err, res, next);
  }
});

export default router;
