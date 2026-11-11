import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../utils/rateLimit.js";
import {
  previewInvitation,
  acceptInvitation,
  declineInvitation,
  InvitationError,
} from "../services/invitationService.js";

// Public: the emailed token is the credential. Rate-limited per IP like
// login, so the token space can't be probed.
const router = Router();
const inviteLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const tokenSchema = z.object({ token: z.string().min(20).max(200) });

function handle(err, res, next) {
  if (err instanceof InvitationError) return res.status(err.status).json({ detail: err.message });
  next(err);
}

// POST rather than GET so the token never lands in server/proxy access logs.
router.post("/preview", inviteLimit, async (req, res, next) => {
  const parsed = tokenSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid invitation link." });
  try {
    res.json(await previewInvitation(parsed.data.token));
  } catch (err) {
    handle(err, res, next);
  }
});

const acceptSchema = tokenSchema.extend({ password: z.string().max(200).optional() });

router.post("/accept", inviteLimit, async (req, res, next) => {
  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid invitation link." });
  try {
    res.json(await acceptInvitation(parsed.data.token, parsed.data.password));
  } catch (err) {
    handle(err, res, next);
  }
});

router.post("/decline", inviteLimit, async (req, res, next) => {
  const parsed = tokenSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid invitation link." });
  try {
    res.json(await declineInvitation(parsed.data.token));
  } catch (err) {
    handle(err, res, next);
  }
});

export default router;
