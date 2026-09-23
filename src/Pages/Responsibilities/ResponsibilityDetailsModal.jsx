import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import DepartmentAvatar from "./DepartmentAvatar";
import StatusBadge from "../../Reusable/StatusBadge";
import { taskStatusLabel } from "../../taskHelpers";

// Despite the filename (kept to minimize churn), this now shows one
// person's workload -- confirmed with Precious (2026-09-21): Responsibilities
// and Actions are two views of the same task data (who's responsible for
// what vs. execution/status), not a separate "responsibility" entity with
// its own department-ownership concept.
export default function ResponsibilityDetailsModal({ person, index, onClose }) {
  return (
    <Dialog open={Boolean(person)} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          {person && (
            <>
              <div className="flex items-center gap-3">
                <DepartmentAvatar name={person.name} index={index} />
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{person.name}</DialogTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{person.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active Tasks</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{person.activeCount}</span>
              </div>

              <div className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
                {person.tasks.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No tasks assigned.</p>
                ) : (
                  person.tasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{t.title}</span>
                      <StatusBadge status={taskStatusLabel(t.status)} />
                    </div>
                  ))
                )}
              </div>

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
