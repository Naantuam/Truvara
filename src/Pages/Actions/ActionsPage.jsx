import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import ProgressDots from "./ProgressDots";
import { STAGES } from "./stages";
import UpdateProgressModal from "./UpdateProgressModal";

const FILTERS = ["All", ...STAGES];

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [activeAction, setActiveAction] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const department = searchParams.get("department");

  useEffect(() => {
    api.get("/actions/")
      .then((res) => setActions(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch actions:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = actions;
    if (department) list = list.filter((a) => a.department === department);
    if (filter !== "All") list = list.filter((a) => a.stage === filter);
    return list;
  }, [actions, filter, department]);

  const inProgress = filtered.filter((a) => a.stage !== "Completed");
  const completed = filtered.filter((a) => a.stage === "Completed");

  const handleUpdated = async (id, payload) => {
    const res = await api.put(`/actions/${id}/progress/`, payload);
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...res.data } : a)));
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Actions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track approved decisions through to completion</p>
      </div>

      {department && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          Filtered by department: <span className="font-medium text-gray-900 dark:text-gray-100">{department}</span>
          <button onClick={() => setSearchParams({})} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading actions...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No actions found.</p>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">In Progress ({inProgress.length})</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 pr-4">Action</th>
                    <th className="pb-2 pr-4">Progress</th>
                    <th className="pb-2 pr-4">Est. Cost</th>
                    <th className="pb-2 pr-4">Ordered</th>
                    <th className="pb-2 pr-4">Expected</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inProgress.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setActiveAction(a)}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="py-3 pr-4">
                        <p className="text-gray-900 dark:text-gray-100">{a.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">By {a.owner} · {a.ordered_date}</p>
                      </td>
                      <td className="py-3 pr-4"><ProgressDots stage={a.stage} /></td>
                      <td className="py-3 pr-4 text-gray-900 dark:text-gray-100">${Number(a.estimated_cost || 0).toLocaleString()}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{a.ordered_date}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{a.expected_date}</td>
                      <td className="py-3"><StatusBadge status={a.stage} /></td>
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
                    <th className="pb-2 pr-4">Est. Cost</th>
                    <th className="pb-2 pr-4">Actual Cost</th>
                    <th className="pb-2 pr-4">Variance</th>
                    <th className="pb-2">Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((a) => {
                    const variance = Number(a.actual_cost || 0) - Number(a.estimated_cost || 0);
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setActiveAction(a)}
                        className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      >
                        <td className="py-3 pr-4">
                          <p className="text-gray-900 dark:text-gray-100">{a.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{a.ordered_date}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">${Number(a.estimated_cost || 0).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">${Number(a.actual_cost || 0).toLocaleString()}</td>
                        <td className={`py-3 pr-4 font-medium ${variance <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {variance >= 0 ? "+" : ""}${variance.toLocaleString()}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{a.approved_by}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <UpdateProgressModal action={activeAction} onClose={() => setActiveAction(null)} onUpdated={handleUpdated} />
    </div>
  );
}
