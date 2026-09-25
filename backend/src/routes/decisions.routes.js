import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  DecisionError,
  listDecisions,
  getDecision,
  createDecision,
  updateDecision,
  submitDecision,
  approveDecision,
  rejectDecision,
} from "../services/decisionService.js";

const router = Router();
router.use(authenticate);

function handleDecisionError(err, res, next) {
  if (err instanceof DecisionError) return res.status(err.status).json({ detail: err.message });
  next(err);
}

const decisionInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  proposedAction: z.string().optional(),
  stakeholders: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  priority: z.string().optional(),
  expectedAmount: z.number().nonnegative().optional(),
});

const decisionUpdateSchema = decisionInputSchema.partial();

router.get("/", requirePermission("governance:decision:view"), async (req, res, next) => {
  try {
    const decisions = await listDecisions(req.user.tenantDb, req.user.companyId);
    res.json(decisions);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requirePermission("governance:decision:view"), async (req, res, next) => {
  try {
    const decision = await getDecision(req.user.tenantDb, req.user.companyId, req.params.id);
    res.json(decision);
  } catch (err) {
    handleDecisionError(err, res, next);
  }
});

router.post("/", requirePermission("governance:decision:create"), async (req, res, next) => {
  const parsed = decisionInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid decision payload." });

  try {
    const decision = await createDecision(req.user.tenantDb, req.user, parsed.data);
    res.status(201).json(decision);
  } catch (err) {
    handleDecisionError(err, res, next);
  }
});

router.patch("/:id", requirePermission("governance:decision:edit"), async (req, res, next) => {
  const parsed = decisionUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid decision payload." });

  try {
    const decision = await updateDecision(req.user.tenantDb, req.user, req.params.id, parsed.data);
    res.json(decision);
  } catch (err) {
    handleDecisionError(err, res, next);
  }
});

router.post("/:id/submit", requirePermission("governance:decision:submit"), async (req, res, next) => {
  try {
    const decision = await submitDecision(req.user.tenantDb, req.user, req.params.id);
    res.json(decision);
  } catch (err) {
    handleDecisionError(err, res, next);
  }
});

router.post("/:id/approve", requirePermission("governance:decision:approve"), async (req, res, next) => {
  try {
    const decision = await approveDecision(req.user.tenantDb, req.user, req.params.id);
    res.json(decision);
  } catch (err) {
    handleDecisionError(err, res, next);
  }
});

const rejectSchema = z.object({ reason: z.string().min(1) });

router.post("/:id/reject", requirePermission("governance:decision:approve"), async (req, res, next) => {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "A rejection reason is required." });

  try {
    const decision = await rejectDecision(req.user.tenantDb, req.user, req.params.id, parsed.data.reason);
    res.json(decision);
  } catch (err) {
    handleDecisionError(err, res, next);
  }
});

export default router;
