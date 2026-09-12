import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DollarSign, TrendingUp, Package, TrendingDown, Upload, Plus, Paperclip } from "lucide-react";
import api from "../../api";
import AddExpenseModal from "./AddExpenseModal";

const TABS = ["All", "Manual", "From Actions"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/expenses/").catch(() => ({ data: [] })),
      api.get("/expenses/summary/").catch(() => ({ data: null })),
    ])
      .then(([expensesRes, summaryRes]) => {
        setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : expensesRes.data?.results || []);
        setSummary(summaryRes.data);
      })
      .catch((err) => console.error("Failed to fetch expenses:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(expenses.map((e) => e.category).filter(Boolean))],
    [expenses]
  );

  const filtered = useMemo(() => {
    let list = expenses;
    if (tab === "Manual") list = list.filter((e) => e.source === "Manual");
    if (tab === "From Actions") list = list.filter((e) => e.source === "Action");
    if (category !== "All") list = list.filter((e) => e.category === category);
    return list;
  }, [expenses, tab, category]);

  const total = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleCreated = async (payload) => {
    const res = await api.post("/expenses/", payload);
    setExpenses((prev) => [res.data, ...prev]);
  };

  const handleUploadReceipt = () => {
    alert("Receipt scanning isn't available yet — add the expense details manually.");
    setModalOpen(true);
  };

  const cards = [
    { label: "Total Expenses", sub: "All time", value: summary?.total, icon: DollarSign, color: "text-gold-600 dark:text-gold-400", bg: "bg-gold-50 dark:bg-gold-950" },
    { label: "This Month", sub: summary?.this_month_label, value: summary?.this_month, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
    { label: "From Actions", sub: `${summary?.from_actions_count ?? 0} items`, value: summary?.from_actions, icon: Package, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-950" },
    { label: "Manual", sub: `${summary?.manual_count ?? 0} items`, value: summary?.manual, icon: TrendingDown, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
  ];

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track all expenses, including those from approved actions</p>
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
            <Plus className="w-4 h-4" /> Add Expense
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
              {loading ? "—" : `$${Number(card.value || 0).toLocaleString()}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Expenses</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} entries · ${total.toLocaleString()} total</p>
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
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading expenses...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No expenses found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2 pr-4">Added By</th>
                <th className="pb-2">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{e.date}</td>
                  <td className="py-3 pr-4">
                    <p className="text-gray-900 dark:text-gray-100">{e.description}</p>
                    {e.linked_action && (
                      <Link to="/actions" className="text-xs text-gold-600 dark:text-gold-400 hover:underline">
                        Action: {e.linked_action}
                      </Link>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                    {e.source === "Action" ? <span className="text-gold-600 dark:text-gold-400">Action</span> : "Manual"}
                  </td>
                  <td className="py-3 pr-4 text-gray-900 dark:text-gray-100 font-medium">${Number(e.amount || 0).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{e.added_by}</td>
                  <td className="py-3">
                    {e.receipt_attached ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                        <Paperclip className="w-3 h-3" /> Attached
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-gray-100">
                <td className="pt-3" colSpan={4}>Total</td>
                <td className="pt-3">${total.toLocaleString()}</td>
                <td className="pt-3" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
