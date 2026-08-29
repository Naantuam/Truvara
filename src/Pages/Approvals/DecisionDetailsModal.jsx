import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import StatusBadge from "../../Reusable/StatusBadge";

export default function DecisionDetailsModal({ decision, onClose }) {
  return (
    <Dialog open={Boolean(decision)} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-xl p-6">
          {decision && (
            <>
              <div className="flex items-start justify-between">
                <DialogTitle className="text-lg font-bold text-gray-900">{decision.title}</DialogTitle>
                <StatusBadge status={decision.status} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Submitted by {decision.owner} · {decision.date}
              </p>
              <p className="text-sm font-medium text-gray-700 mt-4">Justification</p>
              <p className="text-sm text-gray-600 mt-1">{decision.description}</p>
              <p className="text-sm font-medium text-gray-700 mt-4">Estimated Cost</p>
              <p className="text-sm text-gray-600 mt-1">
                ${Number(decision.estimated_cost || 0).toLocaleString()}
              </p>

              <button
                onClick={onClose}
                className="mt-6 w-full border border-gray-300 text-gray-700 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 transition-colors"
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
