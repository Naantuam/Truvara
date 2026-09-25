import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  TaskError,
  listTasks,
  getTask,
  createTask,
  updateTask,
  assignTask,
  updateTaskStatus,
} from "../services/taskService.js";

const router = Router();
router.use(authenticate);

function handleTaskError(err, res, next) {
  if (err instanceof TaskError) return res.status(err.status).json({ detail: err.message });
  next(err);
}

const dateOrNull = z
  .string()
  .datetime()
  .nullable()
  .optional()
  .transform((v) => (v ? new Date(v) : v));

const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  decisionId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.string().optional(),
  dueDate: dateOrNull,
});

const taskUpdateSchema = taskCreateSchema.partial().omit({ decisionId: true, assigneeId: true });

router.get("/", requirePermission("operations:task:view"), async (req, res, next) => {
  try {
    const tasks = await listTasks(req.user.tenantDb, req.user.companyId, { decisionId: req.query.decisionId });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requirePermission("operations:task:view"), async (req, res, next) => {
  try {
    const task = await getTask(req.user.tenantDb, req.user.companyId, req.params.id);
    res.json(task);
  } catch (err) {
    handleTaskError(err, res, next);
  }
});

router.post("/", requirePermission("operations:task:create"), async (req, res, next) => {
  const parsed = taskCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid task payload." });

  try {
    const task = await createTask(req.user.tenantDb, req.user, parsed.data);
    res.status(201).json(task);
  } catch (err) {
    handleTaskError(err, res, next);
  }
});

router.patch("/:id", requirePermission("operations:task:edit"), async (req, res, next) => {
  const parsed = taskUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid task payload." });

  try {
    const task = await updateTask(req.user.tenantDb, req.user, req.params.id, parsed.data);
    res.json(task);
  } catch (err) {
    handleTaskError(err, res, next);
  }
});

const assignSchema = z.object({ assigneeId: z.string().uuid() });

router.post("/:id/assign", requirePermission("operations:task:assign"), async (req, res, next) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "A valid assigneeId is required." });

  try {
    const task = await assignTask(req.user.tenantDb, req.user, req.params.id, parsed.data.assigneeId);
    res.json(task);
  } catch (err) {
    handleTaskError(err, res, next);
  }
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  outcome: z.string().optional(),
});

router.post("/:id/status", requirePermission("operations:task:edit"), async (req, res, next) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ detail: "A valid status is required." });

  try {
    const task = await updateTaskStatus(req.user.tenantDb, req.user, req.params.id, parsed.data.status, parsed.data.outcome);
    res.json(task);
  } catch (err) {
    handleTaskError(err, res, next);
  }
});

export default router;
