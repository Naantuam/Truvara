import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  TransactionError,
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  approveTransaction,
  rejectTransaction,
  voidTransaction,
  getSummary,
} from "../services/transactionService.js";

const router = Router();
router.use(authenticate);

function handleTransactionError(err, res, next) {
  if (err instanceof TransactionError) return res.status(err.status).json({ detail: err.message });
  next(err);
}

const transactionCreateSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  narration: z.string().optional(),
  counterparty: z.string().optional(),
  category: z.string().optional(),
  occurredAt: z.string().datetime().transform((v) => new Date(v)),
  decisionId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
});

const transactionUpdateSchema = z.object({
  narration: z.string().optional(),
  counterparty: z.string().optional(),
  category: z.string().optional(),
  amount: z.number().positive().optional(),
  occurredAt: z.string().datetime().transform((v) => new Date(v)).optional(),
});

// Must come before "/:id" or "summary" would be parsed as an id.
router.get("/summary", requirePermission("finance:transaction:view"), async (req, res, next) => {
  try {
    const summary = await getSummary(req.user.tenantDb, req.user.companyId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// `includeVoided=true`/`includeRejected=true` are silently ignored for
// anyone without finance:transaction:approve, rather than rejected --
// someone without access to this shouldn't even learn the flags exist.
router.get("/", requirePermission("finance:transaction:view"), async (req, res, next) => {
  try {
    const canSeeHidden = req.user.permissions.has("finance:transaction:approve");
    const transactions = await listTransactions(req.user.tenantDb, req.user.companyId, {
      decisionId: req.query.decisionId,
      taskId: req.query.taskId,
      type: req.query.type,
      includeVoided: canSeeHidden && req.query.includeVoided === "true",
      includeRejected: canSeeHidden && req.query.includeRejected === "true",
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requirePermission("finance:transaction:view"), async (req, res, next) => {
  try {
    const canSeeHidden = req.user.permissions.has("finance:transaction:approve");
    const transaction = await getTransaction(req.user.tenantDb, req.user.companyId, req.params.id, {
      includeVoided: canSeeHidden,
      includeRejected: canSeeHidden,
    });
    res.json(transaction);
  } catch (err) {
    handleTransactionError(err, res, next);
  }
});

router.post("/", requirePermission("finance:transaction:create"), async (req, res, next) => {
  const parsed = transactionCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid transaction payload." });

  try {
    const transaction = await createTransaction(req.user.tenantDb, req.user, parsed.data);
    res.status(201).json(transaction);
  } catch (err) {
    handleTransactionError(err, res, next);
  }
});

router.patch("/:id", requirePermission("finance:transaction:edit"), async (req, res, next) => {
  const parsed = transactionUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid transaction payload." });

  try {
    const transaction = await updateTransaction(req.user.tenantDb, req.user, req.params.id, parsed.data);
    res.json(transaction);
  } catch (err) {
    handleTransactionError(err, res, next);
  }
});

router.post("/:id/approve", requirePermission("finance:transaction:approve"), async (req, res, next) => {
  try {
    const transaction = await approveTransaction(req.user.tenantDb, req.user, req.params.id);
    res.json(transaction);
  } catch (err) {
    handleTransactionError(err, res, next);
  }
});

const reasonSchema = z.object({ reason: z.string().min(1, "A reason is required.") });

router.post("/:id/reject", requirePermission("finance:transaction:approve"), async (req, res, next) => {
  const parsed = reasonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: parsed.error.issues[0]?.message || "Invalid payload." });

  try {
    const transaction = await rejectTransaction(req.user.tenantDb, req.user, req.params.id, parsed.data.reason);
    res.json(transaction);
  } catch (err) {
    handleTransactionError(err, res, next);
  }
});

router.post("/:id/void", requirePermission("finance:transaction:approve"), async (req, res, next) => {
  const parsed = reasonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: parsed.error.issues[0]?.message || "Invalid payload." });

  try {
    const transaction = await voidTransaction(req.user.tenantDb, req.user, req.params.id, parsed.data.reason);
    res.json(transaction);
  } catch (err) {
    handleTransactionError(err, res, next);
  }
});

export default router;
