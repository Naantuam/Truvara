import PDFDocument from "pdfkit";
import { directoryPrisma } from "../db/directoryPrisma.js";
import { computeSummary } from "./transactionService.js";
import { describeAction } from "./dashboardService.js";

const ACTIVE_TASK_STATUSES = ["PENDING", "IN_PROGRESS"];

function dateRangeFilter(from, to) {
  if (!from && !to) return undefined;
  const filter = {};
  if (from) filter.gte = from;
  if (to) filter.lte = to;
  return filter;
}

// Work-scope §9: company info, Governance (decisions/status/approvals),
// Operations (responsibilities/actions with pending/completed/overdue),
// Finance (income/expenses/transaction listing/summaries), Activity (recent
// activity) -- generated from real system data, selectable by period. This
// is pure data assembly, kept separate from CSV/PDF rendering below so each
// output format stays simple.
export async function compileReport(db, companyId, { from, to } = {}) {
  const company = await directoryPrisma.company.findUnique({ where: { id: companyId }, select: { name: true } });

  const createdAtFilter = dateRangeFilter(from, to);
  const occurredAtFilter = dateRangeFilter(from, to);

  const [decisions, tasks, transactions, activityEvents] = await Promise.all([
    db.decision.findMany({
      where: { companyId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
      orderBy: { createdAt: "asc" },
    }),
    db.task.findMany({
      where: { companyId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
      orderBy: { createdAt: "asc" },
    }),
    db.transaction.findMany({
      where: { companyId, ...(occurredAtFilter ? { occurredAt: occurredAtFilter } : {}) },
      orderBy: { occurredAt: "asc" },
    }),
    db.auditEvent.findMany({
      where: { companyId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const userIds = [
    ...decisions.flatMap((d) => [d.creatorId, d.approverId]),
    ...tasks.map((t) => t.assigneeId),
    ...transactions.map((t) => t.recordedById),
    ...activityEvents.map((e) => e.actorId),
  ].filter(Boolean);
  const users = await directoryPrisma.user.findMany({
    where: { id: { in: [...new Set(userIds)] } },
    select: { id: true, fullName: true },
  });
  const nameOf = (id) => (id && users.find((u) => u.id === id)?.fullName) || null;

  const now = new Date();
  const isOverdue = (t) => Boolean(t.dueDate && ACTIVE_TASK_STATUSES.includes(t.status) && new Date(t.dueDate) < now);

  return {
    company: { name: company?.name || "Unknown Company" },
    generatedAt: now,
    range: { from: from ? from.toISOString() : null, to: to ? to.toISOString() : null },
    governance: {
      decisions: decisions.map((d) => ({
        title: d.title,
        status: d.status,
        creator: nameOf(d.creatorId),
        approver: nameOf(d.approverId),
        createdAt: d.createdAt,
        expectedAmount: d.expectedAmount,
      })),
    },
    operations: {
      tasks: tasks.map((t) => ({
        title: t.title,
        status: t.status,
        assignee: nameOf(t.assigneeId),
        dueDate: t.dueDate,
        isOverdue: isOverdue(t),
        completedAt: t.completedAt,
      })),
      pendingCount: tasks.filter((t) => t.status === "PENDING").length,
      completedCount: tasks.filter((t) => t.status === "COMPLETED").length,
      overdueCount: tasks.filter(isOverdue).length,
    },
    finance: {
      transactions: transactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        narration: t.narration,
        recordedBy: nameOf(t.recordedById),
        occurredAt: t.occurredAt,
      })),
      summary: computeSummary(transactions),
    },
    activity: activityEvents.map((e) => ({
      actor: nameOf(e.actorId) || "Someone",
      action: describeAction(e.action),
      createdAt: e.createdAt,
    })),
  };
}

function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(",") + "\r\n";
}

export function renderCsv(report) {
  let out = "";
  out += csvRow(["Truvara Report", report.company.name]);
  out += csvRow(["Generated", report.generatedAt.toISOString()]);
  out += csvRow(["Period", report.range.from || "all time", "to", report.range.to || "now"]);
  out += "\r\n";

  out += csvRow(["GOVERNANCE - DECISIONS"]);
  out += csvRow(["Title", "Status", "Creator", "Approver", "Created", "Expected Amount"]);
  for (const d of report.governance.decisions) {
    out += csvRow([d.title, d.status, d.creator, d.approver, d.createdAt.toISOString(), d.expectedAmount]);
  }
  out += "\r\n";

  out += csvRow(["OPERATIONS - ACTIONS"]);
  out += csvRow(["Pending", report.operations.pendingCount, "Completed", report.operations.completedCount, "Overdue", report.operations.overdueCount]);
  out += csvRow(["Title", "Status", "Assignee", "Due Date", "Overdue", "Completed At"]);
  for (const t of report.operations.tasks) {
    out += csvRow([t.title, t.status, t.assignee, t.dueDate?.toISOString() || "", t.isOverdue ? "Yes" : "No", t.completedAt?.toISOString() || ""]);
  }
  out += "\r\n";

  out += csvRow(["FINANCE - TRANSACTIONS"]);
  out += csvRow(["Total Income", report.finance.summary.totalIncome, "Total Expense", report.finance.summary.totalExpense, "Net", report.finance.summary.net]);
  out += csvRow(["Type", "Amount", "Category", "Narration", "Recorded By", "Occurred At"]);
  for (const t of report.finance.transactions) {
    out += csvRow([t.type, t.amount, t.category, t.narration, t.recordedBy, t.occurredAt.toISOString()]);
  }
  out += "\r\n";

  out += csvRow(["RECENT ACTIVITY"]);
  out += csvRow(["Actor", "Action", "When"]);
  for (const a of report.activity) {
    out += csvRow([a.actor, a.action, a.createdAt.toISOString()]);
  }

  return out;
}

export function renderPdf(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(`Truvara Report — ${report.company.name}`, { underline: true });
    doc.fontSize(9).fillColor("#666").text(`Generated ${report.generatedAt.toLocaleString()}`);
    doc.text(`Period: ${report.range.from || "all time"} to ${report.range.to || "now"}`);
    doc.fillColor("#000").moveDown();

    doc.fontSize(14).text("Governance — Decisions");
    doc.fontSize(10);
    if (report.governance.decisions.length === 0) doc.text("No decisions in this period.");
    for (const d of report.governance.decisions) {
      doc.text(`${d.title} — ${d.status} — created by ${d.creator || "Unknown"}${d.approver ? `, approved by ${d.approver}` : ""}`);
    }
    doc.moveDown();

    doc.fontSize(14).text("Operations — Actions");
    doc.fontSize(10).text(`Pending: ${report.operations.pendingCount}  Completed: ${report.operations.completedCount}  Overdue: ${report.operations.overdueCount}`);
    for (const t of report.operations.tasks) {
      doc.text(`${t.title} — ${t.status}${t.isOverdue ? " (OVERDUE)" : ""} — assigned to ${t.assignee || "Unassigned"}`);
    }
    doc.moveDown();

    doc.fontSize(14).text("Finance — Transactions");
    const s = report.finance.summary;
    doc.fontSize(10).text(`Total Income: ${s.totalIncome}  Total Expense: ${s.totalExpense}  Net: ${s.net}`);
    for (const t of report.finance.transactions) {
      doc.text(`${t.occurredAt.toLocaleDateString()} — ${t.type} — ${t.amount} — ${t.category || "Uncategorized"} — ${t.narration || ""}`);
    }
    doc.moveDown();

    doc.fontSize(14).text("Recent Activity");
    doc.fontSize(10);
    if (report.activity.length === 0) doc.text("No recent activity in this period.");
    for (const a of report.activity) {
      doc.text(`${a.actor} ${a.action} — ${a.createdAt.toLocaleString()}`);
    }

    doc.end();
  });
}
