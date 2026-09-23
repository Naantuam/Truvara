import { useState, useMemo } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Plus, X, Loader2 } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import { taskStatusLabel, TASKS_CACHE_KEY, fetchTasks } from "../../taskHelpers";
import useCachedResource from "../../useCachedResource";
import AddActionModal from "./AddActionModal";
import TaskDetailsModal from "./TaskDetailsModal";

export default function ActionsPage() {
  const { user } = useOutletContext() || {};
  const { data: tasks, setData: setTasks, loading } = useCachedResource(TASKS_CACHE_KEY, fetchTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const assigneeFilter = searchParams.get("assignee");

  const filtered = useMemo(() => {
    const list = tasks || [];
    if (!assigneeFilter) return list;
    return list.filter((t) => t.assignee?.id === assigneeFilter);
  }, [tasks, assigneeFilter]);

  const active = filtered.filter((t) => t.status !== "COMPLETED");
  const completed = filtered.filter((t) => t.status === "COMPLETED");
  const assigneeName = assigneeFilter ? (tasks || []).find((t) => t.assignee?.id === assigneeFilter)?.assignee?.fullName : null;

  const handleCreated = async (payload) => {
    const res = await api.post("/tasks/", payload);
    setTasks((prev) => [res.data, ...(prev || [])]);
  };

  const handleStatusChanged = async (id, status, outcome) => {
    const res = await api.post(`/tasks/${id}/status/`, { status, outcome });
    setTasks((prev) => (prev || []).map((t) => (t.id === id ? res.data : t)));
    setActiveTask(res.data);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Actions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track approved decisions through to completion</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Action
        </button>
      </div>

      {assigneeFilter && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          Filtered by assignee: <span className="font-medium text-gray-900 dark:text-gray-100">{assigneeName || "…"}</span>
          <button onClick={() => setSearchParams({})} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading actions...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No actions found.</p>
      ) : (
        <>
          {active.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Active ({active.length})</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Assigned To</th>
                    <th className="pb-2 pr-4">Priority</th>
                    <th className="pb-2 pr-4">Due</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setActiveTask(t)}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="py-3 pr-4">
                        <p className="text-gray-900 dark:text-gray-100">{t.title}</p>
                        {t.decision && <p className="text-xs text-gray-400 dark:text-gray-500">From: {t.decision.title}</p>}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{t.assignee?.fullName || "Unassigned"}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{t.priority || "—"}</td>
                      <td className={`py-3 pr-4 ${t.isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}{t.isOverdue && " (Overdue)"}
                      </td>
                      <td className="py-3"><StatusBadge status={taskStatusLabel(t.status)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {completed.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Completed ({completed.length})</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Assigned To</th>
                    <th className="pb-2">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setActiveTask(t)}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="py-3 pr-4 text-gray-900 dark:text-gray-100">{t.title}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{t.assignee?.fullName || "Unassigned"}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 truncate max-w-[280px]">{t.outcome || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AddActionModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      <TaskDetailsModal task={activeTask} user={user} onClose={() => setActiveTask(null)} onStatusChanged={handleStatusChanged} />
    </div>
  );
}
