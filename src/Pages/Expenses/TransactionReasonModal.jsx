import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import ConfirmDialog from "../../Reusable/ConfirmDialog";

// Shared by reject and void -- both are retractions of a transaction that
// must carry a reason and a deliberate second confirmation step, same
// pattern as RejectReasonModal for Decisions.
export default function TransactionReasonModal({ open, title, confirmLabel, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setReason("");
    setConfirming(false);
    setError(null);
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reason);
      setReason("");
      setConfirming(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save.");
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open && !confirming} onClose={handleClose} className="relative z-[55]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please provide a reason. The transaction stays in the record permanently, marked with this reason.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-4">
              <textarea
                required
                autoFocus
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason"
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />

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
                  className="flex-1 bg-red-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-red-700 transition-colors"
                >
                  {confirmLabel}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      <ConfirmDialog
        open={open && confirming}
        title={`Confirm: ${title}`}
        message="This cannot be undone."
        confirmLabel={`Yes, ${confirmLabel.toLowerCase()}`}
        submitting={submitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
