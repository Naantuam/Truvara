import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import ConfirmDialog from "../../Reusable/ConfirmDialog";
import TransactionReasonModal from "./TransactionReasonModal";
import { formatMoney } from "../../currencyHelpers";
import { formatDateOnly } from "../../dateHelpers";

// Pure view + approve/reject/void -- editing a pending transaction's content
// now happens inline in the Expenses table itself (not here), since a table
// full of bank-statement-style rows is much faster to work through inline
// than one overlay per row.
export default function TransactionDetailsModal({ transaction, user, currency, onClose, onApprove, onReject, onVoid }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [reasonAction, setReasonAction] = useState(null); // "reject" | "void" | null

  if (!transaction) return null;

  const t = transaction;
  // Maker-checker, mirrored client-side only to hide buttons that would 403
  // anyway -- the server (canApproveTransaction) is the real enforcement.
  const canApprove =
    user?.permissions?.includes("finance:transaction:approve") &&
    (user?.role === "Owner" || t.recordedById !== user?.id);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleApprove = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onApprove(t.id);
      setApproving(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to approve.");
      setApproving(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(transaction)} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{t.narration || "Transaction"}</DialogTitle>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  t.type === "INCOME"
                    ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                    : "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                }`}
              >
                {t.type === "INCOME" ? "Income" : "Expense"}
              </span>
              {t.isVoided ? (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Voided</span>
              ) : t.status === "PENDING_APPROVAL" ? (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gold-50 dark:bg-gold-950 text-gold-700 dark:text-gold-400">Pending Approval</span>
              ) : t.status === "REJECTED" ? (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400">Rejected</span>
              ) : (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">Approved</span>
              )}
            </div>
          </div>

          {t.status === "REJECTED" && t.rejectionReason && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">Rejected: {t.rejectionReason}</p>
          )}
          {t.isVoided && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Voided by {t.voidedBy?.fullName || "—"} · {new Date(t.voidedAt).toLocaleString()} — {t.voidReason}
            </p>
          )}

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
            {t.modifiedBy && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Edited By</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {t.modifiedBy.fullName} · {new Date(t.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
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

          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}

          <div className="flex flex-col gap-2 mt-6">
            {t.status === "PENDING_APPROVAL" && canApprove && (
              <div className="flex gap-2">
                <button
                  onClick={() => setApproving(true)}
                  className="flex-1 bg-green-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setReasonAction("reject")}
                  className="flex-1 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg py-2 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
            {t.status === "APPROVED" && !t.isVoided && canApprove && (
              <button
                onClick={() => setReasonAction("void")}
                className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Void Transaction
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>

      <ConfirmDialog
        open={approving}
        destructive={false}
        title="Approve this transaction?"
        message="Once approved, it counts toward totals and can only be retracted by voiding it, never edited or deleted."
        confirmLabel="Yes, approve it"
        submitting={submitting}
        onConfirm={handleApprove}
        onCancel={() => setApproving(false)}
      />

      <TransactionReasonModal
        open={reasonAction === "reject"}
        title="Reject Transaction"
        confirmLabel="Reject"
        onClose={() => setReasonAction(null)}
        onConfirm={(reason) => onReject(t.id, reason)}
      />

      <TransactionReasonModal
        open={reasonAction === "void"}
        title="Void Transaction"
        confirmLabel="Void"
        onClose={() => setReasonAction(null)}
        onConfirm={(reason) => onVoid(t.id, reason)}
      />
    </Dialog>
  );
}
