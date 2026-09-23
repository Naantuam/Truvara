import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Scale, Upload, Plus, Loader2 } from "lucide-react";
import api from "../../api";
import AddExpenseModal from "./AddExpenseModal";
import { TRANSACTIONS_CACHE_KEY, fetchTransactions, TRANSACTIONS_SUMMARY_CACHE_KEY, fetchTransactionsSummary } from "../../transactionHelpers";
import useCachedResource from "../../useCachedResource";

const TABS = ["All", "Manual", "From Actions"];

export default function ExpensesPage() {
  const { data: transactions, setData: setTransactions, loading } = useCachedResource(TRANSACTIONS_CACHE_KEY, fetchTransactions);
  const { data: summary, refresh: refreshSummary } = useCachedResource(TRANSACTIONS_SUMMARY_CACHE_KEY, fetchTransactionsSummary);
  const [tab, setTab] = useState("All");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const categories = useMemo(
    () => ["All", ...new Set((transactions || []).map((t) => t.category).filter(Boolean))],
    [transactions]
  );

  const filtered = useMemo(() => {
    let l = transactions || [];
    if (tab === "Manual") l = l.filter((t) => !t.taskId);
    if (tab === "From Actions") l = l.filter((t) => t.taskId);
    if (category !== "All") l = l.filter((t) => t.category === category);
    return l;
  }, [transactions, tab, category]);

  const total = filtered.reduce((sum, t) => sum + Number(t.amount || 0) * (t.type === "EXPENSE" ? -1 : 1), 0);

  const handleCreated = async (payload) => {
    const res = await api.post("/transactions/", payload);
    setTransactions((prev) => [res.data, ...(prev || [])]);
    // Summary is a server-computed aggregate, not something we can merge
    // client-side -- reload it now that a new transaction exists.
    refreshSummary();
  };

  const handleUploadReceipt = () => {
    alert("Receipt scanning isn't available yet — add the transaction details manually.");
    setModalOpen(true);
  };

  const cards = [
    { label: "Total Income", value: summary?.totalIncome, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Total Expenses", value: summary?.totalExpense, icon: TrendingDown, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Net", value: summary?.net, icon: Scale, color: "text-gold-600 dark:text-gold-400", bg: "bg-gold-50 dark:bg-gold-950" },
    { label: "Transactions Recorded", value: summary?.count, isCount: true, icon: DollarSign, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-950" },
  ];

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track income and expenses, including those linked to actions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUploadReceipt}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload Receipt
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gold-500 text-gray-900 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gold-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bg} mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {!summary ? "—" : card.isCount ? card.value ?? 0 : `$${Number(card.value || 0).toLocaleString()}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} entries · net ${total.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    tab === t
                      ? "bg-gold-500 text-gray-900"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No transactions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{new Date(t.occurredAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <p className="text-gray-900 dark:text-gray-100">{t.narration || "—"}</p>
                    {t.task && (
                      <p className="text-xs text-gold-600 dark:text-gold-400">Action: {t.task.title}</p>
                    )}
                    {t.decision && !t.task && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Decision: {t.decision.title}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {t.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${t.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                      {t.type === "INCOME" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className={`py-3 pr-4 font-medium ${t.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
                    {t.type === "INCOME" ? "+" : "-"}${Number(t.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{t.recordedBy?.fullName || "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-gray-100">
                <td className="pt-3" colSpan={4}>Net</td>
                <td className="pt-3" colSpan={2}>${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
