import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import useCachedResource from "../../useCachedResource";
import { DECISIONS_CACHE_KEY, fetchDecisions } from "../../decisionHelpers";
import { TASKS_CACHE_KEY, fetchTasks } from "../../taskHelpers";

export default function AddExpenseModal({ open, onClose, onCreated, initial = {} }) {
  const [type, setType] = useState(initial.type || "EXPENSE");
  const [narration, setNarration] = useState(initial.narration || "");
  const [amount, setAmount] = useState(initial.amount || "");
  const [occurredAt, setOccurredAt] = useState(initial.occurredAt || "");
  const [category, setCategory] = useState(initial.category || "");
  const [counterparty, setCounterparty] = useState(initial.counterparty || "");
  const [decisionId, setDecisionId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { data: decisions } = useCachedResource(DECISIONS_CACHE_KEY, fetchDecisions);
  const { data: tasks } = useCachedResource(TASKS_CACHE_KEY, fetchTasks);

  const reset = () => {
    setType("EXPENSE");
    setNarration("");
    setAmount("");
    setOccurredAt("");
    setCategory("");
    setCounterparty("");
    setDecisionId("");
    setTaskId("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onCreated({
        type,
        narration: narration || undefined,
        amount: Number(amount),
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : undefined,
        category: category || undefined,
        counterparty: counterparty || undefined,
        decisionId: decisionId || undefined,
        taskId: taskId || undefined,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Transaction</DialogTitle>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              {["EXPENSE", "INCOME"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-gold-500 text-gray-900"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {t === "EXPENSE" ? "Expense" : "Income"}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input
                type="text"
                required
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  required
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Rent, Software"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{type === "INCOME" ? "Source" : "Vendor/Payee"} <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Decision <span className="text-gray-400 font-normal">(optional)</span></label>
              <select
                value={decisionId}
                onChange={(e) => setDecisionId(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">None</option>
                {(decisions || []).map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Action <span className="text-gray-400 font-normal">(optional)</span></label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                <option value="">None</option>
                {(tasks || []).map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gold-500 text-gray-900 text-sm font-medium rounded-lg py-2 hover:bg-gold-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
