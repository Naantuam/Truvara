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
  // Set by clicking "Replicate" on an existing row -- opens the new-row form
  // pre-filled with that transaction's full details so a near-duplicate
  // entry (a repeat vendor charge, etc.) just needs a tweak and a save,
  // rather than retyping everything. Explicit per-row action, not a default
  // applied to every new row.
  const [replicateSource, setReplicateSource] = useState(null);
  // Bumped every time an Enter-to-advance save reopens a fresh blank row --
  // used as the row's React key so it remounts with genuinely blank state
  // instead of keeping whatever was just typed/replicated.
  const [newRowKey, setNewRowKey] = useState(0);

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

  const counterparties = useMemo(
    () => [...new Set((transactions || []).map((t) => t.counterparty).filter(Boolean))],
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

  const handleCreateRow = async (payload, { advance } = {}) => {
    setSavingRow(true);
    try {
      const res = await api.post("/transactions/", payload);
      setTransactions((prev) => [res.data, ...(prev || [])]);
      refreshSummary();
      setReplicateSource(null);
      if (advance) {
        // Stay in "adding" mode and remount the row (fresh key) instead of
        // closing -- the Enter-to-advance loop for back-to-back entries.
        setNewRowKey((k) => k + 1);
      } else {
        setAddingNew(false);
      }
    } finally {
      setSavingRow(false);
    }
  };

  const handleReplicate = (transaction) => {
    setEditingId(null);
    setReplicateSource(transaction);
    setAddingNew(true);
  };

  // A "Reverse" draft is just a Replicate whose type is flipped and whose
  // date defaults to the original's (reversals usually land the same day,
  // but that's only a starting guess -- she reconfirms it against the real
  // bank document before saving). No schema change/link to the original
  // transaction; the narration prefix is the only trace that it's a reversal.
  const handleReverse = (transaction) => {
    setEditingId(null);
    setReplicateSource({
      occurredAt: transaction.occurredAt,
      narration: `Reversal: ${transaction.category || transaction.narration || "Transaction"}`,
      counterparty: transaction.counterparty,
      category: transaction.category,
      type: transaction.type === "INCOME" ? "EXPENSE" : "INCOME",
      amount: transaction.amount,
    });
    setAddingNew(true);
    setSelectedTransaction(null);
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
    { label: "Total Credits", value: summary?.totalIncome, icon: TrendingUp, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Total Debits", value: summary?.totalExpense, icon: TrendingDown, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Net", value: summary?.net, icon: Scale, color: "text-gold-600 dark:text-gold-400", bg: "bg-gold-50 dark:bg-gold-950" },
    { label: "Transactions Recorded", value: summary?.count, isCount: true, icon: CurrencyIcon, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-950" },
  ];

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">
      {/* Plain flexbox, not grid -- a grid column is a hard-fixed width, so
          a number that grows past it either overflows or forces an awkward
          wrap that throws the row's alignment off. Two per row only below
          sm: (phone-width, confirmed clean); from sm: up there's room for
          all four in one row, spread with flex-1 so they fill the full
          width instead of sitting cramped in a leftover 50% slot. The
          boxed card look (background/border/shadow) stays lg:-only -- mid
          screens get the same flat spread, just four-wide instead of
          two-wide. Each stat's text is free to wrap onto a second line if
          it ever gets long -- that just makes its own box taller, it never
          disturbs its neighbors. items-start keeps every icon pinned to
          the top of its row regardless. */}
      <div className="flex flex-wrap sm:flex-nowrap items-start gap-x-4 gap-y-4 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-start gap-3 p-2 lg:p-5 w-[calc(50%-0.5rem)] sm:w-auto sm:flex-1 lg:bg-white lg:dark:bg-gray-900 lg:rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-800 lg:shadow-sm"
          >
            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.bg}`}>
              <card.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-base lg:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">
                {!summary ? "—" : card.isCount ? card.value ?? 0 : formatMoney(card.value, currency)}
              </p>
              <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 break-words">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-none sm:rounded-xl border-0 sm:border border-gray-200 dark:border-gray-800 shadow-sm -mx-3 sm:mx-0 py-3 sm:p-5">
        {/* Horizontal padding lives on these two header blocks, not on the
            card itself -- the table wrapper below stays padding-free so it
            can bleed flush to both screen edges on mobile and the
            horizontal scrollbar doesn't leave a dead strip of padding on
            either side. */}
        <div className="flex items-start justify-between gap-3 mb-4 px-3 sm:px-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Transactions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} entries · net {formatMoney(total, currency)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canCreateRows && (
              <button
                onClick={handleUploadReceipt}
                title="Upload Receipt"
                className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Upload Receipt</span>
              </button>
            )}
            {canCreateRows && (
              <button
                onClick={() => { setEditingId(null); setReplicateSource(null); setAddingNew(true); }}
                title="Add Transaction"
                className="flex items-center justify-center bg-gold-500 text-gray-900 rounded-lg p-2 hover:bg-gold-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 px-3 sm:px-0">
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
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 w-28 sm:w-40 truncate"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Shared autocomplete source for the inline category/vendor inputs --
            real data (bank statements, etc.) tends to have messy/inconsistent
            names, so suggesting what's already in use helps keep new entries
            consistent without forcing a fixed enum. */}
        <datalist id="transaction-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <datalist id="transaction-counterparties">
          {counterparties.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* table-fixed + colgroup pin each column to a percentage so one
                outlier row (e.g. a long category name) can't stretch its
                whole column and leave every shorter row looking gappy --
                the default auto layout sizes each column off the widest
                cell across all 400+ rows, not just the visible ones. */}
            <table className="w-full min-w-[720px] text-xs sm:text-sm table-fixed">
              <colgroup>
                <col className="w-[9%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[15%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead>
                <tr className="text-left text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 pl-3 pr-2 sm:pl-0 sm:pr-4">Date</th>
                  <th className="pb-2 pr-2 sm:pr-4">Category</th>
                  <th className="pb-2 pr-2 sm:pr-4">Description</th>
                  <th className="pb-2 pr-2 sm:pr-4">Vendor/Source</th>
                  <th className="pb-2 pr-2 sm:pr-4">Type</th>
                  <th className="pb-2 pr-2 sm:pr-4">Status</th>
                  <th className="pb-2 pr-2 sm:pr-4">Amount</th>
                  <th className="pb-2 pr-2 sm:pr-4 whitespace-nowrap">Recorded By</th>
                  <th className="pb-2 pr-3 sm:pr-0"></th>
                </tr>
              </thead>
              <tbody>
                {addingNew && (
                  <TransactionRow
                    key={newRowKey}
                    isNew
                    categories={categories}
                    currency={currency}
                    saving={savingRow}
                    onSave={handleCreateRow}
                    onCancelEdit={() => { setAddingNew(false); setReplicateSource(null); }}
                    sourceTransaction={replicateSource}
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
                      canReplicate={canCreateRows}
                      editing={editingId === t.id}
                      saving={savingRow && editingId === t.id}
                      onStartEdit={() => { setAddingNew(false); setEditingId(t.id); }}
                      onCancelEdit={() => setEditingId(null)}
                      onSave={(payload) => handleEditRow(t.id, payload)}
                      onSelect={() => setSelectedTransaction(t)}
                      onReplicate={() => handleReplicate(t)}
                    />
                  ))
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-gray-100">
                    <td className="pt-3 pl-3 sm:pl-0" colSpan={6}>Net (approved only)</td>
                    <td className="pt-3 pr-3 sm:pr-0" colSpan={3}>{formatMoney(total, currency)}</td>
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
        onReverse={handleReverse}
      />
    </div>
  );
}
