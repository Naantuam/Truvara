import { Router } from "express";
import { z } from "zod";
import { login, selectCompany, refresh, changePassword, activateAccount, AuthError } from "../services/authService.js";
import { authenticate } from "../middleware/authenticate.js";
import { directoryPrisma } from "../db/directoryPrisma.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Email and password are required." });

  try {
    const result = await login(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(401).json({ detail: err.message, ...(err.code ? { code: err.code } : {}) });
    }
    next(err);
  }
});

const activateSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

router.post("/activate", async (req, res, next) => {
  const parsed = activateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ detail: parsed.error.issues[0]?.message || "Invalid payload." });
  }

  try {
    const result = await activateAccount(parsed.data.token, parsed.data.password);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) return res.status(400).json({ detail: err.message });
    next(err);
  }
});

const selectCompanySchema = z.object({
  pre_auth_token: z.string().min(1),
  company_id: z.string().uuid(),
});

router.post("/select-company", async (req, res, next) => {
  const parsed = selectCompanySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "pre_auth_token and company_id are required." });

  try {
    const result = await selectCompany(parsed.data.pre_auth_token, parsed.data.company_id);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ detail: err.message });
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  const token = req.body?.refresh;
  if (!token) return res.status(400).json({ detail: "Refresh token is required." });

  try {
    const result = await refresh(token);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) return res.status(401).json({ detail: err.message });
    next(err);
  }
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8, "New password must be at least 8 characters."),
});

router.post("/change-password", authenticate, async (req, res, next) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ detail: parsed.error.issues[0]?.message || "Invalid payload." });
  }

  try {
    await changePassword(req.user.id, parsed.data.current_password, parsed.data.new_password);
    res.json({ detail: "Password updated." });
  } catch (err) {
    if (err instanceof AuthError) return res.status(400).json({ detail: err.message });
    next(err);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const company = await directoryPrisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { name: true },
    });
    res.json({
      id: req.user.id,
      company_id: req.user.companyId,
      company_name: company?.name || null,
      role: req.user.role,
      permissions: Array.from(req.user.permissions),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
