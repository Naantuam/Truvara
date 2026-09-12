import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function RejectReasonModal({ decision, onClose, onRejected }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onRejected(decision.id, reason);
      setReason("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reject decision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(decision)} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          {decision && (
            <>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Reject "{decision.title}"</DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please provide a reason. This will be shown in the Decision History.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <textarea
                    required
                    autoFocus
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
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
                    className="flex-1 bg-red-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Rejecting..." : "Reject Decision"}
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
