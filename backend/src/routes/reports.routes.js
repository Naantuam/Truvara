import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { compileReport, renderCsv, renderPdf } from "../services/reportService.js";

const router = Router();
router.use(authenticate);

const querySchema = z.object({
  format: z.enum(["csv", "pdf"]).default("csv"),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Reports export real business data as-is -- viewing it requires the same
// breadth of visibility as the dashboard (work-scope §5.5/§9 treat them as
// one visibility layer), so it's gated the same way.
router.get("/export", requirePermission("dashboard:view"), async (req, res, next) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ detail: "Invalid report parameters." });

  try {
    const report = await compileReport(req.user.tenantDb, req.user.companyId, {
      from: parsed.data.from ? new Date(parsed.data.from) : undefined,
      to: parsed.data.to ? new Date(parsed.data.to) : undefined,
    });

    const filenameSafe = report.company.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    if (parsed.data.format === "pdf") {
      const buffer = await renderPdf(report);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameSafe}-report.pdf"`);
      res.send(buffer);
    } else {
      const csv = renderCsv(report);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filenameSafe}-report.csv"`);
      res.send(csv);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
