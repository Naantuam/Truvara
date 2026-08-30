import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { STAGES } from "./stages";

export default function UpdateProgressModal({ action, onClose, onUpdated }) {
  const [stage, setStage] = useState(action?.stage || STAGES[0]);
  const [actualCost, setActualCost] = useState(action?.actual_cost ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onUpdated(action.id, { stage, actual_cost: actualCost || null, notes });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update progress.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(action)} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-xl p-6">
          {action && (
            <>
              <DialogTitle className="text-lg font-bold text-gray-900">{action.title}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Est. Cost: ${Number(action.estimated_cost || 0).toLocaleString()}</p>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Actual Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Progress"}
                  </button>
                </div>
              </form>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
