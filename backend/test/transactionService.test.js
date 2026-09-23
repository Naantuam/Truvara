import { describe, it, expect } from "vitest";
import { computeSummary } from "../src/services/transactionService.js";

describe("computeSummary", () => {
  it("totals income and expenses separately and computes net", () => {
    const transactions = [
      { type: "INCOME", amount: 500000, category: "Sales" },
      { type: "EXPENSE", amount: 120000, category: "Rent" },
      { type: "EXPENSE", amount: 30000, category: "Software" },
    ];
    const summary = computeSummary(transactions);
    expect(summary.totalIncome).toBe(500000);
    expect(summary.totalExpense).toBe(150000);
    expect(summary.net).toBe(350000);
    expect(summary.count).toBe(3);
  });

  it("groups by category, uncategorized falls into its own bucket", () => {
    const transactions = [
      { type: "EXPENSE", amount: 100, category: "Rent" },
      { type: "EXPENSE", amount: 50, category: null },
    ];
    const summary = computeSummary(transactions);
    const categories = Object.fromEntries(summary.byCategory.map((c) => [c.category, c.amount]));
    expect(categories["Rent"]).toBe(-100);
    expect(categories["Uncategorized"]).toBe(-50);
  });

  it("returns zeroed summary for no transactions", () => {
    const summary = computeSummary([]);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(0);
    expect(summary.net).toBe(0);
    expect(summary.count).toBe(0);
  });
});
