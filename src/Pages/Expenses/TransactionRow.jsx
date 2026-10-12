import { useState, useEffect } from "react";
import { Pencil, Copy, ClipboardCopy, Check, X, Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatMoney } from "../../currencyHelpers";
import { formatDateOnly, toDateInputValue } from "../../dateHelpers";

const inputClass =
  "w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500";

const blankDraft = { occurredAt: new Date().toISOString().slice(0, 10), narration: "", counterparty: "", category: "", type: "EXPENSE", amount: "" };

// Tab-separated so a copied row pastes straight into real spreadsheet cells
// (the same format Excel/Sheets use internally for copy/paste) instead of
// one run-on string -- matches the actual workflow this is for: pulling a
// transaction back out to compare against or re-enter into a bank sheet.
function transactionToClipboardText(t) {
  const signedAmount = (t.type === "EXPENSE" ? -1 : 1) * Number(t.amount || 0);
  return [toDateInputValue(t.occurredAt), t.category || "", t.narration || "", t.counterparty || "", t.type === "INCOME" ? "Credit" : "Debit", signedAmount].join("\t");
}

// Small clipboard-copy affordance shared by both the per-cell copy icons and
// the row-level "copy whole transaction" action -- flashes a checkmark
// briefly in place of the icon as the only feedback (no toast system in
// this app, and a convenience action like this doesn't warrant adding one).
function CopyIconButton({ active, onClick, label, size = "w-3.5 h-3.5" }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      className="flex-shrink-0 rounded text-gray-300 hover:text-brand-600 dark:text-gray-600 dark:hover:text-gold-400 opacity-0 group-hover/cell:opacity-100 transition-opacity"
    >
      {active ? <Check className={`${size} text-green-500`} /> : <ClipboardCopy className={size} />}
    </button>
  );
}

// One row, three modes: a normal read-only row, that same row turned into
// inline inputs to edit it, or a standalone "new row" at the top of the
// table to add one. All three share the same input layout so adding and
// editing feel identical -- the point of this component (2026-10-06,
// replacing the old Add/Edit modals): a table of many bank-statement-style
// rows is much faster to work through inline than one overlay per row.
//
// sourceTransaction: set only when this new row was opened via "Replicate"
// on an existing row -- an explicit, per-click action (not a default
// applied to every new row) that pre-fills the whole draft from that
// transaction so a near-duplicate entry just needs a tweak and a save.
export default function TransactionRow({ transaction, isNew, categories, currency, canEdit, canReplicate, editing, saving, onStartEdit, onCancelEdit, onSave, onSelect, onReplicate, sourceTransaction }) {
  const [draft, setDraft] = useState(() => {
    const source = transaction || sourceTransaction;
    return source ? toDraft(source) : blankDraft;
  });
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    } catch {
      // Clipboard API can be denied/unavailable (permissions, non-secure
      // context) -- fail silently rather than surface a scary error for
      // what's just a convenience shortcut.
    }
  };

  useEffect(() => {
    if (editing || isNew) {
      const source = transaction || sourceTransaction;
      setDraft(source ? toDraft(source) : blankDraft);
      setError(null);
    }
  }, [editing, isNew, transaction, sourceTransaction]);

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

  // advance=true (Enter key, isNew rows only) tells the parent to reopen a
  // fresh blank row immediately instead of closing back to the read-only
  // table -- the spreadsheet-like "save and keep typing" loop for entering
  // several transactions back to back.
  const handleSave = async (advance = false) => {
    setError(null);
    try {
      await onSave(
        {
          occurredAt: draft.occurredAt ? new Date(draft.occurredAt).toISOString() : undefined,
          narration: draft.narration || undefined,
          counterparty: draft.counterparty || undefined,
          category: draft.category || undefined,
          type: draft.type,
          amount: draft.amount === "" ? undefined : Number(draft.amount),
        },
        { advance }
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    handleSave(isNew);
  };

  if (editing || isNew) {
    return (
      <tr className={isNew ? "bg-gold-50/40 dark:bg-gold-950/20" : "bg-brand-50/40 dark:bg-brand-950/20"}>
        <td className="py-2 pl-3 pr-4 sm:pl-0">
          <input type="date" value={draft.occurredAt} onChange={handleChange("occurredAt")} onKeyDown={handleKeyDown} className={inputClass} />
        </td>
        <td className="py-2 pr-4">
          <input type="text" list="transaction-categories" placeholder="Category" value={draft.category} onChange={handleChange("category")} onKeyDown={handleKeyDown} className={inputClass} />
        </td>
        <td className="py-2 pr-4">
          <input type="text" placeholder="Description" value={draft.narration} onChange={handleChange("narration")} onKeyDown={handleKeyDown} className={inputClass} />
        </td>
        <td className="py-2 pr-4">
          <input
            type="text"
            list="transaction-counterparties"
            placeholder={draft.type === "INCOME" ? "Source" : "Vendor/Payee"}
            value={draft.counterparty}
            onChange={handleChange("counterparty")}
            onKeyDown={handleKeyDown}
            className={inputClass}
          />
        </td>
        <td className="py-2 pr-4">
          <select value={draft.type} onChange={handleChange("type")} onKeyDown={handleKeyDown} className={inputClass}>
            <option value="EXPENSE">Debit</option>
            <option value="INCOME">Credit</option>
          </select>
        </td>
        <td className="py-2 pr-4 text-xs text-gray-400 dark:text-gray-500">{isNew ? "New" : "Pending"}</td>
        <td className="py-2 pr-4">
          <input type="number" min="0" step="0.01" placeholder="0.00" value={draft.amount} onChange={handleChange("amount")} onKeyDown={handleKeyDown} className={inputClass} />
        </td>
        <td className="py-2 pr-4" />
        <td className="py-2 pr-3 sm:pr-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSave(false)}
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
  const isIncome = t.type === "INCOME";
  return (
    <tr
      onClick={onSelect}
      className={`border-b border-l-2 sm:border-l-0 border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 group ${
        isIncome ? "border-l-green-400 dark:border-l-green-600" : "border-l-orange-400 dark:border-l-orange-600"
      }`}
    >
      <td className="py-2 pl-3 pr-2 sm:pl-0 sm:py-3 sm:pr-4 text-gray-600 dark:text-gray-400 truncate">{formatDateOnly(t.occurredAt)}</td>
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 overflow-hidden">
        <span className="block max-w-full truncate text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {t.category || "Uncategorized"}
        </span>
      </td>
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 group/cell">
        <div className="flex items-start gap-1">
          <p className="text-gray-900 dark:text-gray-100 break-words">{t.narration || "—"}</p>
          {t.narration && <CopyIconButton active={copiedKey === "narration"} onClick={() => copyText(t.narration, "narration")} label="Copy description" />}
        </div>
        {t.task && <p className="text-[10px] sm:text-xs text-gold-600 dark:text-gold-400 truncate">Action: {t.task.title}</p>}
        {t.decision && !t.task && <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 truncate">Decision: {t.decision.title}</p>}
      </td>
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 overflow-hidden group/cell">
        <div className="flex items-center gap-1">
          <span className="truncate text-gray-600 dark:text-gray-400">{t.counterparty || "—"}</span>
          {t.counterparty && <CopyIconButton active={copiedKey === "counterparty"} onClick={() => copyText(t.counterparty, "counterparty")} label="Copy vendor/source" />}
        </div>
      </td>
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 overflow-hidden">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
            isIncome ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {isIncome ? <ArrowUpCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <ArrowDownCircle className="w-3.5 h-3.5 flex-shrink-0" />}
          <span className="hidden sm:inline">{isIncome ? "Credit" : "Debit"}</span>
        </span>
      </td>
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 overflow-hidden">
        {t.status === "PENDING_APPROVAL" ? (
          <span className="block w-fit max-w-full truncate text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-700 dark:text-gold-400">Pending</span>
        ) : (
          <span className="block w-fit max-w-full truncate text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">Approved</span>
        )}
      </td>
      <td className={`py-2 pr-2 sm:py-3 sm:pr-4 font-medium overflow-hidden group/cell ${isIncome ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
        <div className="flex items-center gap-1">
          <span className="truncate">{isIncome ? "+" : "-"}{formatMoney(t.amount, t.currency || currency)}</span>
          <CopyIconButton active={copiedKey === "amount"} onClick={() => copyText(`${isIncome ? "" : "-"}${t.amount}`, "amount")} label="Copy amount" />
        </div>
      </td>
      <td className="py-2 pr-2 sm:py-3 sm:pr-4 text-gray-600 dark:text-gray-400 truncate">{t.recordedBy?.fullName || "—"}</td>
      <td className="py-2 pr-3 sm:py-3 sm:pr-0">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              title="Edit"
              className="p-1 rounded text-gray-300 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-600 dark:hover:text-gold-400 dark:hover:bg-gray-800"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyText(transactionToClipboardText(t), "row");
            }}
            title="Copy transaction"
            className="p-1 rounded text-gray-300 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-600 dark:hover:text-gold-400 dark:hover:bg-gray-800"
          >
            {copiedKey === "row" ? <Check className="w-4 h-4 text-green-500" /> : <ClipboardCopy className="w-4 h-4" />}
          </button>
          {canReplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReplicate();
              }}
              title="Replicate"
              className="p-1 rounded text-gray-300 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-600 dark:hover:text-gold-400 dark:hover:bg-gray-800"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
