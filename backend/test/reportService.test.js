import { describe, it, expect } from "vitest";
import { renderCsv, renderPdf } from "../src/services/reportService.js";

function sampleReport() {
  return {
    company: { name: "Ta-vora International Limited" },
    generatedAt: new Date("2026-10-01T00:00:00.000Z"),
    range: { from: null, to: null },
    governance: {
      decisions: [
        { title: "Open a new branch", status: "APPROVED", creator: "Jimoh Precious Mohammed", approver: "Jimoh Precious Mohammed", createdAt: new Date("2026-09-01T00:00:00.000Z"), expectedAmount: 1500000 },
      ],
    },
    operations: {
      tasks: [
        { title: "Obtain quotations", status: "COMPLETED", assignee: "Martins Brengshak", dueDate: null, isOverdue: false, completedAt: new Date("2026-09-05T00:00:00.000Z") },
      ],
      pendingCount: 0,
      completedCount: 1,
      overdueCount: 0,
    },
    finance: {
      transactions: [
        { type: "EXPENSE", amount: 100000, category: "Rent", narration: "Office rent, quoted \"cheap\"", recordedBy: "Martins Brengshak", occurredAt: new Date("2026-09-10T00:00:00.000Z") },
      ],
      summary: { totalIncome: 0, totalExpense: 100000, net: -100000, count: 1, byCategory: [] },
    },
    activity: [
      { actor: "Jimoh Precious Mohammed", action: "approved a decision", createdAt: new Date("2026-09-01T00:00:00.000Z") },
    ],
  };
}

describe("renderCsv", () => {
  it("includes the company name and every section", () => {
    const csv = renderCsv(sampleReport());
    expect(csv).toContain("Ta-vora International Limited");
    expect(csv).toContain("GOVERNANCE - DECISIONS");
    expect(csv).toContain("OPERATIONS - ACTIONS");
    expect(csv).toContain("FINANCE - TRANSACTIONS");
    expect(csv).toContain("RECENT ACTIVITY");
    expect(csv).toContain("Open a new branch");
    expect(csv).toContain("Obtain quotations");
  });

  it("escapes fields containing quotes and commas so the CSV stays valid", () => {
    const csv = renderCsv(sampleReport());
    // The narration contains an embedded quote and would otherwise break the
    // row if not escaped per RFC 4180 (wrap in quotes, double internal quotes).
    expect(csv).toContain('"Office rent, quoted ""cheap"""');
  });
});

describe("renderPdf", () => {
  it("produces a non-empty PDF buffer", async () => {
    const buffer = await renderPdf(sampleReport());
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    // PDF files start with the "%PDF-" magic bytes.
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
