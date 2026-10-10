import { useState, useEffect } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { formatMoney } from "../../currencyHelpers";
import { formatDateOnly, toDateInputValue } from "../../dateHelpers";

const inputClass =
  "w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

const blankDraft = { occurredAt: new Date().toISOString().slice(0, 10), narration: "", counterparty: "", category: "", type: "EXPENSE", amount: "" };

// One row, three modes: a normal read-only row, that same row turned into
// inline inputs to edit it, or a standalone "new row" at the top of the
// table to add one. All three share the same input layout so adding and
// editing feel identical -- the point of this component (2026-10-06,
// replacing the old Add/Edit modals): a table of many bank-statement-style
// rows is much faster to work through inline than one overlay per row.
export default function TransactionRow({ transaction, isNew, categories, currency, canEdit, editing, saving, onStartEdit, onCancelEdit, onSave, onSelect }) {
  const [draft, setDraft] = useState(() => (transaction ? toDraft(transaction) : blankDraft));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editing || isNew) {
      setDraft(transaction ? toDraft(transaction) : blankDraft);
      setError(null);
    }
  }, [editing, isNew, transaction]);

  function toDraft(t) {
    return {
      occurredAt: toDateInputValue(t.occurredAt),
      narration: t.narration || "",
      counterparty: t.counterparty || "",
      category: t.category || "",
      type: t.type,
      amount: t.amount ?? "",
    };
  }

  const handleChange = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const handleSave = async () => {
    setError(null);
    try {
      await onSave({
        occurredAt: draft.occurredAt ? new Date(draft.occurredAt).toISOString() : undefined,
        narration: draft.narration || undefined,
        counterparty: draft.counterparty || undefined,
        category: draft.category || undefined,
        type: draft.type,
        amount: draft.amount === "" ? undefined : Number(draft.amount),
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save.");
    }
  };

  if (editing || isNew) {
    return (
      <tr className={isNew ? "bg-gold-50/40 dark:bg-gold-950/20" : "bg-brand-50/40 dark:bg-brand-950/20"}>
        <td className="py-2 pr-4">
          <input type="date" value={draft.occurredAt} onChange={handleChange("occurredAt")} className={inputClass} />
        </td>
        <td className="py-2 pr-4">
          <input type="text" list="transaction-categories" placeholder="Category" value={draft.category} onChange={handleChange("category")} className={inputClass} />
        </td>
        <td className="py-2 pr-4">
          <input type="text" placeholder="Description" value={draft.narration} onChange={handleChange("narration")} className={inputClass} />
        </td>
        <td className="py-2 pr-4">
          <input
            type="text"
            placeholder={draft.type === "INCOME" ? "Source" : "Vendor/Payee"}
            value={draft.counterparty}
            onChange={handleChange("counterparty")}
            className={inputClass}
          />
        </td>
        <td className="py-2 pr-4">
          <select value={draft.type} onChange={handleChange("type")} className={inputClass}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </td>
        <td className="py-2 pr-4 text-xs text-gray-400 dark:text-gray-500">{isNew ? "New" : "Pending"}</td>
        <td className="py-2 pr-4">
          <input type="number" min="0" step="0.01" placeholder="0.00" value={draft.amount} onChange={handleChange("amount")} className={inputClass} />
        </td>
        <td className="py-2 pr-4" />
        <td className="py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              title="Save"
              className="p-1 rounded text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button onClick={onCancelEdit} disabled={saving} title="Cancel" className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-[160px]">{error}</p>}
        </td>
      </tr>
    );
  }

  const t = transaction;
  return (
    <tr onClick={onSelect} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 group">
      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{formatDateOnly(t.occurredAt)}</td>
      <td className="py-3 pr-4">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {t.category || "Uncategorized"}
        </span>
      </td>
      <td className="py-3 pr-4">
        <p className="text-gray-900 dark:text-gray-100">{t.narration || "—"}</p>
        {t.task && <p className="text-xs text-gold-600 dark:text-gold-400">Action: {t.task.title}</p>}
        {t.decision && !t.task && <p className="text-xs text-gray-400 dark:text-gray-500">Decision: {t.decision.title}</p>}
      </td>
      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{t.counterparty || "—"}</td>
      <td className="py-3 pr-4">
        <span className={`text-xs font-medium ${t.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
          {t.type === "INCOME" ? "Income" : "Expense"}
        </span>
      </td>
      <td className="py-3 pr-4">
        {t.status === "PENDING_APPROVAL" ? (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-700 dark:text-gold-400">Pending</span>
        ) : (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">Approved</span>
        )}
      </td>
      <td className={`py-3 pr-4 font-medium ${t.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
        {t.type === "INCOME" ? "+" : "-"}{formatMoney(t.amount, t.currency || currency)}
      </td>
      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{t.recordedBy?.fullName || "—"}</td>
      <td className="py-3">
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
            title="Edit"
            className="p-1 rounded text-gray-300 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-600 dark:hover:text-gold-400 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}
