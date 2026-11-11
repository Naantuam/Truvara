import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { AuthError, TOKEN_PURPOSE, verifyIdentityToken } from "../services/authService.js";
import {
  createWorkspace,
  getProfile,
  saveProfileStep,
  completeProfile,
  OnboardingError,
  COUNTRIES,
} from "../services/onboardingService.js";
import { rateLimit } from "../utils/rateLimit.js";
import jwt from "jsonwebtoken";

const router = Router();

function handle(err, res, next) {
  if (err instanceof OnboardingError) return res.status(err.status).json({ detail: err.message });
  if (err instanceof AuthError) return res.status(401).json({ detail: err.message });
  next(err);
}

// Workspace creation accepts either an onboarding token (a verified person
// with no company yet) or a normal session (an existing user adding another
// business). Either way only the user id is taken from the verified token;
// nothing about identity comes from the request body.
function identityFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AuthError("Authentication required.");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    throw new AuthError("Invalid or expired session. Please sign in again.");
  }
  if (decoded.company_id) return decoded.sub;
  return verifyIdentityToken(token, TOKEN_PURPOSE.ONBOARDING);
}

const workspaceSchema = z.object({
  companyName: z.string().trim().min(2, "Enter your business name.").max(120),
  country: z.enum(Object.keys(COUNTRIES), { errorMap: () => ({ message: "Choose where the business is based." }) }),
});

router.post("/workspace", rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), async (req, res, next) => {
  try {
    const userId = identityFromRequest(req);
    const parsed = workspaceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ detail: parsed.error.issues[0]?.message });
    const session = await createWorkspace(userId, parsed.data);
    res.status(201).json(session);
  } catch (err) {
    handle(err, res, next);
  }
});

// The business profile holds registration, tax and workforce details, so it
// is limited to whoever manages company settings (Owner today). Which other
// roles may view/edit it is an open product decision (PRD section 18).
router.use("/profile", authenticate, requirePermission("admin:settings:manage"));

router.get("/profile", async (req, res, next) => {
  try {
    res.json(await getProfile(req.user.tenantDb, req.user.companyId));
  } catch (err) {
    handle(err, res, next);
  }
});

router.patch("/profile/:step", async (req, res, next) => {
  try {
    const { answers, complete } = req.body || {};
    res.json(await saveProfileStep(req.user.tenantDb, req.user, req.params.step, answers, complete === true));
  } catch (err) {
    handle(err, res, next);
  }
});

router.post("/profile/complete", async (req, res, next) => {
  try {
    res.json(await completeProfile(req.user.tenantDb, req.user));
  } catch (err) {
    handle(err, res, next);
  }
});

export default router;
