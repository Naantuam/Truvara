import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { FEEDBACK_AREAS, createFeedback, listFeedback, setFeedbackStatus } from "../services/feedbackService.js";

const router = Router();
router.use(authenticate);

// No requirePermission gate on purpose -- "report problems" is open to
// every signed-in person regardless of role, same as the roadmap doc's own
// Workstream 3 (anyone can and should log an issue).
router.get("/areas", (req, res) => {
  res.json(FEEDBACK_AREAS);
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await listFeedback());
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  area: z.enum(FEEDBACK_AREAS),
  classification: z.enum(["BUG", "UX_ISSUE", "MISSING_CAPABILITY", "FUTURE_IDEA"]),
  description: z.string().trim().min(1).max(2000),
});

router.post("/", async (req, res, next) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid feedback submission." });

  try {
    const entry = await createFeedback(req.user.id, req.user.companyId, parsed.data);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

const statusSchema = z.object({ status: z.enum(["OPEN", "RESOLVED"]) });

router.patch("/:id/status", async (req, res, next) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid status." });

  try {
    const entry = await setFeedbackStatus(req.params.id, parsed.data.status);
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;
