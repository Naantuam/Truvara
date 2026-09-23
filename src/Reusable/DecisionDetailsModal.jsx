import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import StatusBadge from "./StatusBadge";
import { decisionStatusLabel } from "../decisionHelpers";

export default function DecisionDetailsModal({ decision, onClose }) {
  return (
    <Dialog open={Boolean(decision)} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          {decision && (
            <>
              <div className="flex items-start justify-between">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{decision.title}</DialogTitle>
                <StatusBadge status={decisionStatusLabel(decision.status)} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Submitted by {decision.creator?.fullName || "Unknown"} · {new Date(decision.createdAt).toLocaleDateString()}
              </p>

              {decision.status === "APPROVED" && decision.approver && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">Approved by {decision.approver.fullName}</p>
              )}
              {decision.status === "REJECTED" && decision.rejectionReason && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">Reason: {decision.rejectionReason}</p>
              )}

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Justification</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{decision.description}</p>

              {decision.proposedAction && (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Proposed Action</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{decision.proposedAction}</p>
                </>
              )}

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Estimated Cost</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ${Number(decision.expectedAmount || 0).toLocaleString()}
              </p>

              <button
                onClick={onClose}
                className="mt-6 w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
