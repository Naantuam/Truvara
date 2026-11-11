import { Router } from "express";
import { z } from "zod";
import {
  login,
  selectCompany,
  refresh,
  changePassword,
  activateAccount,
  signup,
  resendActivation,
  requestPasswordReset,
  selfSignupEnabled,
  AuthError,
} from "../services/authService.js";
import { rateLimit } from "../utils/rateLimit.js";
import { authenticate } from "../middleware/authenticate.js";
import { directoryPrisma } from "../db/directoryPrisma.js";

const router = Router();

// Public endpoints get per-IP limits: enough for a person retrying, not for
// a script guessing passwords or spamming signup emails.
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const emailLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const SIGNUP_RECEIVED =
  "If that email can be used, we've sent a link to it. Check your inbox (and spam folder) to continue.";

// Lets the signup page show "not open yet" before anyone fills in the form.
router.get("/signup-status", (req, res) => res.json({ open: selfSignupEnabled() }));

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "You need to accept the Terms of Use and Privacy Notice." }) }),
});

router.post("/signup", emailLimit, async (req, res, next) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: parsed.error.issues[0]?.message || "Invalid details." });

  try {
    await signup(parsed.data);
    res.status(202).json({ detail: SIGNUP_RECEIVED });
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === "SIGNUP_CLOSED" ? 403 : 400;
      return res.status(status).json({ detail: err.message, ...(err.code ? { code: err.code } : {}) });
    }
    next(err);
  }
});

router.post("/password-reset-request", emailLimit, async (req, res, next) => {
  const parsed = z.object({ email: z.string().trim().email() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Enter a valid email address." });
  try {
    await requestPasswordReset(parsed.data.email);
    res.status(202).json({ detail: "If an account uses that email, we've sent it a link to reset the password." });
  } catch (err) {
    next(err);
  }
});

router.post("/resend-activation", emailLimit, async (req, res, next) => {
  const parsed = z.object({ email: z.string().trim().email() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Enter a valid email address." });
  try {
    await resendActivation(parsed.data.email);
    res.status(202).json({ detail: SIGNUP_RECEIVED });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", loginLimit, async (req, res, next) => {
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

router.post("/activate", loginLimit, async (req, res, next) => {
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
    const canManageCompany = req.user.permissions.has("admin:settings:manage");
    const [company, membership] = await Promise.all([
      directoryPrisma.company.findUnique({
        where: { id: req.user.companyId },
        select: { name: true, currency: true, ...(canManageCompany ? { employeeCount: true } : {}) },
      }),
      directoryPrisma.companyMembership.findUnique({
        where: { userId_companyId: { userId: req.user.id, companyId: req.user.companyId } },
        select: { notificationsReadAt: true },
      }),
    ]);
    res.json({
      id: req.user.id,
      company_id: req.user.companyId,
      company_name: company?.name || null,
      company_currency: company?.currency || "NGN",
      // Not sent at all to anyone without this permission -- see authService.js
      // buildSessionResponse for the same rule applied at login.
      ...(canManageCompany ? { company_employee_count: company?.employeeCount ?? null } : {}),
      role: req.user.role,
      permissions: Array.from(req.user.permissions),
      notifications_read_at: membership?.notificationsReadAt || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
