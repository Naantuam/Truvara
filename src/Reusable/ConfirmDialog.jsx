import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";

// Reusable "are you sure?" step for anything destructive or hard to reverse
// (reject, and any future delete). Kept separate from the action's own modal
// so confirming is always a distinct, deliberate second click.
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  submitting = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={onCancel} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 rounded-full p-2 ${destructive ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</DialogTitle>
              {message && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>}
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className={`flex-1 text-white text-sm font-medium rounded-lg py-2 transition-colors disabled:opacity-50 ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"}`}
            >
              {submitting ? "Working..." : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
