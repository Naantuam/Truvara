import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { User, Loader2 } from "lucide-react";
import DepartmentAvatar from "./DepartmentAvatar";
import ResponsibilityDetailsModal from "./ResponsibilityDetailsModal";
import { TASKS_CACHE_KEY, fetchTasks } from "../../taskHelpers";
import useCachedResource from "../../useCachedResource";

// Responsibilities and Actions are two views of the same task data (confirmed
// with Precious 2026-09-21 -- see bms_system_open_concerns memory): this page
// groups tasks by assignee to answer "who is responsible for what," Actions
// shows the flat execution/status view of the same tasks. Same cache key as
// Actions -- navigating between them never re-fetches within a session.
export default function ResponsibilitiesPage() {
  const { data: tasks, loading } = useCachedResource(TASKS_CACHE_KEY, fetchTasks);
  const [detailsFor, setDetailsFor] = useState(null);

  const people = useMemo(() => {
    const byPerson = new Map();
    for (const t of tasks || []) {
      const key = t.assignee?.id || "unassigned";
      if (!byPerson.has(key)) {
        byPerson.set(key, {
          id: key,
          name: t.assignee?.fullName || "Unassigned",
          role: t.assignee ? t.assignee.email : "No assignee set",
          tasks: [],
        });
      }
      byPerson.get(key).tasks.push(t);
    }
    return Array.from(byPerson.values()).map((p) => ({
      ...p,
      activeCount: p.tasks.filter((t) => t.status !== "COMPLETED").length,
      completedCount: p.tasks.filter((t) => t.status === "COMPLETED").length,
    }));
  }, [tasks]);

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Responsibilities</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">See who is responsible for what across the team</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading responsibilities...
        </div>
      ) : people.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No tasks assigned yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {people.map((p, index) => (
              <div key={p.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col">
                <div className="flex items-center gap-3">
                  <DepartmentAvatar name={p.name} index={index} />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{p.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Active Tasks</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{p.activeCount}</p>
                  </div>
                  <User className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={() => setDetailsFor(p)}
                    className="text-sm font-medium text-brand-600 dark:text-gold-400 hover:text-brand-700 dark:hover:text-gold-300"
                  >
                    View Details
                  </button>
                  {p.id !== "unassigned" && (
                    <Link
                      to={`/actions?assignee=${encodeURIComponent(p.id)}`}
                      className="text-sm font-medium text-brand-600 dark:text-gold-400 hover:text-brand-700 dark:hover:text-gold-300"
                    >
                      View Actions
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Workload Summary</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 pr-4">Person</th>
                  <th className="pb-2 pr-4">Active Tasks</th>
                  <th className="pb-2">Completed</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p, index) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <DepartmentAvatar name={p.name} index={index} size="sm" />
                        <span className="text-gray-900 dark:text-gray-100">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{p.activeCount}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{p.completedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ResponsibilityDetailsModal person={detailsFor} index={people.findIndex((p) => p.id === detailsFor?.id)} onClose={() => setDetailsFor(null)} />
    </div>
  );
}
