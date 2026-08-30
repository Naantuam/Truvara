import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import DepartmentAvatar from "./DepartmentAvatar";

export default function ResponsibilityDetailsModal({ responsibility, index, onClose }) {
  return (
    <Dialog open={Boolean(responsibility)} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-xl p-6">
          {responsibility && (
            <>
              <div className="flex items-center gap-3">
                <DepartmentAvatar name={responsibility.owner} index={index} />
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">{responsibility.name}</DialogTitle>
                  <p className="text-sm text-gray-500">{responsibility.owner}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-4">{responsibility.role_title}</p>
              <p className="text-sm text-gray-600 mt-1">{responsibility.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Active Actions</span>
                <span className="text-lg font-bold text-gray-900">{responsibility.active_actions}</span>
              </div>
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
