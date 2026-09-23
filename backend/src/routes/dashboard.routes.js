import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { getRecentActivity } from "../services/dashboardService.js";

const router = Router();
router.use(authenticate);

router.get("/activity", requirePermission("dashboard:view"), async (req, res, next) => {
  try {
    const activity = await getRecentActivity(req.user.companyId);
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

export default router;
