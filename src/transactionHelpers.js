import api from "./api";
import { toDateInputValue } from "./dateHelpers";

export const TRANSACTIONS_CACHE_KEY = "transactions";
export const fetchTransactions = () =>
  api.get("/transactions/").then((res) => (Array.isArray(res.data) ? res.data : res.data?.results || []));

export const TRANSACTIONS_SUMMARY_CACHE_KEY = "transactions-summary";
export const fetchTransactionsSummary = () => api.get("/transactions/summary/").then((res) => res.data);

// Tab-separated so a copied row pastes straight into real spreadsheet cells
// (the same format Excel/Sheets use internally for copy/paste) instead of
// one run-on string -- matches the actual workflow this is for: pulling a
// transaction back out to compare against or re-enter into a bank sheet.
export function transactionToClipboardText(t) {
  const signedAmount = (t.type === "EXPENSE" ? -1 : 1) * Number(t.amount || 0);
  return [toDateInputValue(t.occurredAt), t.category || "", t.narration || "", t.counterparty || "", t.type === "INCOME" ? "Credit" : "Debit", signedAmount].join("\t");
}

// Inverse of the above -- lets the page-level "Paste Transaction" button
// turn a clipboard copy of a row (whether it came from here, or from a
// spreadsheet column arranged the same way) back into a pre-filled draft.
// Returns null when the clipboard clearly isn't one of these rows, so the
// caller can tell the user to copy a transaction first instead of opening a
// garbled draft.
export function parseClipboardTransactionText(text) {
  if (!text) return null;
  const parts = text.trim().split("\t");
  if (parts.length < 6) return null;
  const [dateStr, category, narration, counterparty, typeLabel, amountStr] = parts;
  const occurredAt = new Date(dateStr);
  const amount = Math.abs(Number(amountStr));
  if (Number.isNaN(occurredAt.getTime()) || Number.isNaN(amount)) return null;
  return {
    occurredAt: dateStr,
    narration,
    counterparty,
    category,
    type: typeLabel.trim().toLowerCase() === "credit" ? "INCOME" : "EXPENSE",
    amount,
  };
}
