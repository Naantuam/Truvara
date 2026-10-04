import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { getRecentActivity, markNotificationsRead } from "../services/dashboardService.js";

const router = Router();
router.use(authenticate);

router.get("/activity", requirePermission("dashboard:view"), async (req, res, next) => {
  try {
    const activity = await getRecentActivity(req.user.tenantDb, req.user.companyId);
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// No extra permission beyond being authenticated -- marking your own
// notifications read isn't an admin action, it's a personal preference.
router.post("/notifications/read", async (req, res, next) => {
  try {
    const notificationsReadAt = await markNotificationsRead(req.user.id, req.user.companyId);
    res.json({ notifications_read_at: notificationsReadAt });
  } catch (err) {
    next(err);
  }
});

export default router;
