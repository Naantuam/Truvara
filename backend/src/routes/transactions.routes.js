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

router.get("/", requirePermission("finance:transaction:view"), async (req, res, next) => {
  try {
    const transactions = await listTransactions(req.user.tenantDb, req.user.companyId, {
      decisionId: req.query.decisionId,
      taskId: req.query.taskId,
      type: req.query.type,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requirePermission("finance:transaction:view"), async (req, res, next) => {
  try {
    const transaction = await getTransaction(req.user.tenantDb, req.user.companyId, req.params.id);
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

export default router;
