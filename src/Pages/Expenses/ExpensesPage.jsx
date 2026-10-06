import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { TrendingUp, TrendingDown, Scale, Upload, Plus, Loader2 } from "lucide-react";
import api from "../../api";
import TransactionRow from "./TransactionRow";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { TRANSACTIONS_CACHE_KEY, fetchTransactions, TRANSACTIONS_SUMMARY_CACHE_KEY, fetchTransactionsSummary } from "../../transactionHelpers";
import useCachedResource from "../../useCachedResource";
import { formatMoney, getCurrencyIcon } from "../../currencyHelpers";

const TABS = ["All", "Manual", "From Actions"];

export default function ExpensesPage() {
  const { user } = useOutletContext() || {};
  const currency = user?.company_currency || "NGN";
  const { data: transactions, setData: setTransactions, loading } = useCachedResource(TRANSACTIONS_CACHE_KEY, fetchTransactions);
  const { data: summary, refresh: refreshSummary } = useCachedResource(TRANSACTIONS_SUMMARY_CACHE_KEY, fetchTransactionsSummary);
  const [tab, setTab] = useState("All");
  const [category, setCategory] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingRow, setSavingRow] = useState(false);

  // Separate permissions on purpose: Manager/Team Member can create
  // transactions but not edit existing ones (Owner-only), per the seed
  // matrix -- gating "Add" on the edit permission would hide it from people
  // who are actually allowed to add transactions.
  const canCreateRows = user?.permissions?.includes("finance:transaction:create");
  const canEditRows = user?.permissions?.includes("finance:transaction:edit");

  const categories = useMemo(
    () => [...new Set((transactions || []).map((t) => t.category).filter(Boolean))],
    [transactions]
  );

  const filtered = useMemo(() => {
    let l = transactions || [];
    if (tab === "Manual") l = l.filter((t) => !t.taskId);
    if (tab === "From Actions") l = l.filter((t) => t.taskId);
    if (category !== "All") l = l.filter((t) => t.category === category);
    return l;
  }, [transactions, tab, category]);

  // Only posted entries are real money moved -- matches what the
  // server-computed summary cards above already count. Voided and rejected
  // transactions never reach the frontend at all (the API excludes them by
  // default, see transactionService.js listTransactions) -- they're never
  // deleted, just not shown, per Precious's request.
  const total = filtered
    .filter((t) => t.status === "APPROVED")
    .reduce((sum, t) => sum + Number(t.amount || 0) * (t.type === "EXPENSE" ? -1 : 1), 0);

  const handleCreateRow = async (payload) => {
    setSavingRow(true);
    try {
      const res = await api.post("/transactions/", payload);
      setTransactions((prev) => [res.data, ...(prev || [])]);
      refreshSummary();
      setAddingNew(false);
    } finally {
      setSavingRow(false);
    }
  };

  const handleEditRow = async (id, payload) => {
    setSavingRow(true);
    try {
      const res = await api.patch(`/transactions/${id}/`, payload);
      setTransactions((prev) => (prev || []).map((t) => (t.id === id ? res.data : t)));
      refreshSummary();
      setEditingId(null);
    } finally {
      setSavingRow(false);
    }
  };

  const handleApprove = async (id) => {
    const res = await api.post(`/transactions/${id}/approve/`);
    setTransactions((prev) => (prev || []).map((t) => (t.id === id ? res.data : t)));
    setSelectedTransaction(res.data);
    refreshSummary();
  };

  // Rejected and voided transactions are both excluded from this list by the
  // API by default (not deleted, just hidden) -- drop them locally too
  // instead of updating in place, and close the modal since what it was
  // showing just disappeared.
  const removeFromList = (id) => {
    setTransactions((prev) => (prev || []).filter((t) => t.id !== id));
    setSelectedTransaction(null);
    refreshSummary();
  };

  const handleReject = async (id, reason) => {
    await api.post(`/transactions/${id}/reject/`, { reason });
    removeFromList(id);
  };

  const handleVoid = async (id, reason) => {
    await api.post(`/transactions/${id}/void/`, { reason });
    removeFromList(id);
  };

  const handleUploadReceipt = () => {
    alert("Receipt scanning isn't available yet — add the transaction details manually.");
    setAddingNew(true);
  };

  const CurrencyIcon = getCurrencyIcon(currency);
  const cards = [
    { label: "Total Income", value: summary?.totalIncome, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Total Expenses", value: summary?.totalExpense, icon: TrendingDown, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Net", value: summary?.net, icon: Scale, color: "text-gold-600 dark:text-gold-400", bg: "bg-gold-50 dark:bg-gold-950" },
    { label: "Transactions Recorded", value: summary?.count, isCount: true, icon: CurrencyIcon, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-950" },
  ];

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          {canCreateRows && (
            <button
              onClick={handleUploadReceipt}
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Receipt
            </button>
          )}
          {canCreateRows && (
            <button
              onClick={() => { setEditingId(null); setAddingNew(true); }}
              className="flex items-center gap-2 bg-gold-500 text-gray-900 text-sm font-medium rounded-lg px-4 py-2 hover:bg-gold-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bg} mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {!summary ? "—" : card.isCount ? card.value ?? 0 : formatMoney(card.value, currency)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} entries · net {formatMoney(total, currency)}</p>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex-shrink-0">
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
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 max-w-full"
            >
              <option value="All">All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shared autocomplete source for the inline category input -- real
            data (bank statements, etc.) tends to have messy/inconsistent
            category names, so suggesting what's already in use helps keep
            new entries consistent without forcing a fixed enum. */}
        <datalist id="transaction-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4">Vendor/Source</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Recorded By</th>
                  <th className="pb-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {addingNew && (
                  <TransactionRow
                    isNew
                    categories={categories}
                    currency={currency}
                    saving={savingRow}
                    onSave={handleCreateRow}
                    onCancelEdit={() => setAddingNew(false)}
                  />
                )}
                {filtered.length === 0 && !addingNew ? (
                  <tr>
                    <td colSpan={9} className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      categories={categories}
                      currency={currency}
                      canEdit={canEditRows && t.status === "PENDING_APPROVAL"}
                      editing={editingId === t.id}
                      saving={savingRow && editingId === t.id}
                      onStartEdit={() => { setAddingNew(false); setEditingId(t.id); }}
                      onCancelEdit={() => setEditingId(null)}
                      onSave={(payload) => handleEditRow(t.id, payload)}
                      onSelect={() => setSelectedTransaction(t)}
                    />
                  ))
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-gray-100">
                    <td className="pt-3" colSpan={6}>Net (approved only)</td>
                    <td className="pt-3" colSpan={3}>{formatMoney(total, currency)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        user={user}
        currency={currency}
        onClose={() => setSelectedTransaction(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onVoid={handleVoid}
      />
    </div>
  );
}
