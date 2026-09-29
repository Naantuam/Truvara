import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { formatMoney, getCurrencySymbol } from "../../currencyHelpers";
import { formatDateOnly, toDateInputValue } from "../../dateHelpers";

export default function TransactionDetailsModal({ transaction, user, currency, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!transaction) return null;

  const canEdit = user?.permissions?.includes("finance:transaction:edit");
  const t = transaction;

  const startEdit = () => {
    setForm({
      narration: t.narration || "",
      counterparty: t.counterparty || "",
      category: t.category || "",
      amount: t.amount ?? "",
      occurredAt: toDateInputValue(t.occurredAt),
    });
    setError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(null);
    setError(null);
  };

  const handleClose = () => {
    setEditing(false);
    setForm(null);
    setError(null);
    onClose();
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onUpdated(t.id, {
        narration: form.narration || undefined,
        counterparty: form.counterparty || undefined,
        category: form.category || undefined,
        amount: form.amount === "" ? undefined : Number(form.amount),
        occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : undefined,
      });
      setEditing(false);
      setForm(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(transaction)} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          {editing ? (
            <>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Transaction</DialogTitle>

              <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <input
                    type="text"
                    value={form.narration}
                    onChange={handleChange("narration")}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount ({getCurrencySymbol(t.currency || currency)})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={handleChange("amount")}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                      type="date"
                      value={form.occurredAt}
                      onChange={handleChange("occurredAt")}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={handleChange("category")}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t.type === "INCOME" ? "Source" : "Vendor/Payee"}
                    </label>
                    <input
                      type="text"
                      value={form.counterparty}
                      onChange={handleChange("counterparty")}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gold-500 text-gray-900 text-sm font-medium rounded-lg py-2 hover:bg-gold-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.narration || "Transaction"}</DialogTitle>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                    t.type === "INCOME"
                      ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                      : "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                  }`}
                >
                  {t.type === "INCOME" ? "Income" : "Expense"}
                </span>
              </div>

              <p className={`text-2xl font-bold mt-3 ${t.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
                {t.type === "INCOME" ? "+" : "-"}
                {formatMoney(t.amount, t.currency || currency)}
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatDateOnly(t.occurredAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <span className="text-gray-900 dark:text-gray-100">{t.category || "Uncategorized"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t.type === "INCOME" ? "Source" : "Vendor/Payee"}</span>
                  <span className="text-gray-900 dark:text-gray-100">{t.counterparty || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Recorded By</span>
                  <span className="text-gray-900 dark:text-gray-100">{t.recordedBy?.fullName || "—"}</span>
                </div>
                {t.decision && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Linked Decision</span>
                    <span className="text-gray-900 dark:text-gray-100">{t.decision.title}</span>
                  </div>
                )}
                {t.task && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Linked Action</span>
                    <span className="text-gray-900 dark:text-gray-100">{t.task.title}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                {canEdit && (
                  <button
                    onClick={startEdit}
                    className="flex-1 bg-brand-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-brand-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
