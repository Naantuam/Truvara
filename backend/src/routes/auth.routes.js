import { Router } from "express";
import { z } from "zod";
import { login, refresh, AuthError } from "../services/authService.js";
import { authenticate } from "../middleware/authenticate.js";

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

router.get("/me", authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    company_id: req.user.companyId,
    role: req.user.role,
    permissions: Array.from(req.user.permissions),
  });
});

export default router;
