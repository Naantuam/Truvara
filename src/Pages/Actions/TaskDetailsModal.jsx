import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Loader2 } from "lucide-react";
import StatusBadge from "../../Reusable/StatusBadge";
import { taskStatusLabel, canEditTaskClient } from "../../taskHelpers";

export default function TaskDetailsModal({ task, user, onClose, onStatusChanged }) {
  const [outcome, setOutcome] = useState("");
  const [pendingStatus, setPendingStatus] = useState(null);
  const [error, setError] = useState(null);

  if (!task) return null;

  const canEdit = canEditTaskClient(task, user);
  const isTerminal = task.status === "COMPLETED";
  const submitting = pendingStatus !== null;

  const changeStatus = async (status, extra) => {
    setPendingStatus(status);
    setError(null);
    try {
      await onStatusChanged(task.id, status, extra);
      setOutcome("");
      if (status === "COMPLETED") onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update task.");
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <Dialog open={Boolean(task)} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{task.title}</DialogTitle>
            <StatusBadge status={taskStatusLabel(task.status)} />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Assigned to {task.assignee?.fullName || "Unassigned"}
            {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
          </p>
          {task.isOverdue && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">Overdue</p>
          )}

          {task.decision && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Linked decision: <span className="font-medium text-gray-700 dark:text-gray-300">{task.decision.title}</span>
            </p>
          )}

          {task.description && (
            <>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Description</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
            </>
          )}

          {task.status === "COMPLETED" && task.outcome && (
            <>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Outcome</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.outcome}</p>
            </>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>}

          {canEdit && !isTerminal && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              <div className="flex gap-2">
                {task.status !== "IN_PROGRESS" && (
                  <button
                    disabled={submitting}
                    onClick={() => changeStatus("IN_PROGRESS")}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {pendingStatus === "IN_PROGRESS" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {pendingStatus === "IN_PROGRESS" ? "Starting..." : "Start"}
                  </button>
                )}
                {task.status !== "PENDING" && (
                  <button
                    disabled={submitting}
                    onClick={() => changeStatus("PENDING")}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {pendingStatus === "PENDING" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {pendingStatus === "PENDING" ? "Moving..." : "Move to Pending"}
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Outcome <span className="text-gray-400 font-normal">(optional, on completion)</span></label>
                <textarea
                  rows={2}
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What was the result?"
                  className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                disabled={submitting}
                onClick={() => changeStatus("COMPLETED", outcome || undefined)}
                className="w-full bg-brand-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Mark Completed"}
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
