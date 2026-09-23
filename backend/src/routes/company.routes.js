import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { listCompanyMembers } from "../services/companyService.js";

const router = Router();
router.use(authenticate);

router.get("/members", async (req, res, next) => {
  try {
    const members = await listCompanyMembers(req.user.companyId);
    res.json(members);
  } catch (err) {
    next(err);
  }
});

export default router;
