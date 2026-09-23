import api from "./api";

export const TRANSACTIONS_CACHE_KEY = "transactions";
export const fetchTransactions = () =>
  api.get("/transactions/").then((res) => (Array.isArray(res.data) ? res.data : res.data?.results || []));

export const TRANSACTIONS_SUMMARY_CACHE_KEY = "transactions-summary";
export const fetchTransactionsSummary = () => api.get("/transactions/summary/").then((res) => res.data);
