import { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import AddExpenseModal from "./AddExpenseModal";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.get("/expenses/")
      .then((res) => setExpenses(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch expenses:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses;
    return expenses.filter(
      (e) => e.title?.toLowerCase().includes(term) || e.category?.toLowerCase().includes(term)
    );
  }, [expenses, search]);

  const handleCreated = async (payload) => {
    const res = await api.post("/expenses/", payload);
    setExpenses((prev) => [res.data, ...prev]);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">Track and manage company spending</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading expenses...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No expenses found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-2 pr-4">Expense</th>
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 text-gray-900">{e.title}</td>
                  <td className="py-3 pr-4 text-gray-600">{e.category}</td>
                  <td className="py-3 pr-4 text-gray-600">{e.date}</td>
                  <td className="py-3 pr-4 text-gray-900 font-medium">
                    ${Number(e.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
