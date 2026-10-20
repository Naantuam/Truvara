import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { getRecentActivity, getPendingCounts, markNotificationsRead } from "../services/dashboardService.js";

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

// No single requirePermission gate -- each count is independently gated
// inside getPendingCounts by the same permission its own module requires,
// since someone might have one of the two but not the other.
router.get("/pending-counts", async (req, res, next) => {
  try {
    const counts = await getPendingCounts(req.user.tenantDb, req.user.companyId, req.user.permissions);
    res.json(counts);
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
