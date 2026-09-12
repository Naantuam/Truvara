import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, User } from "lucide-react";
import api from "../../api";
import DepartmentAvatar from "./DepartmentAvatar";
import AddResponsibilityModal from "./AddResponsibilityModal";
import ResponsibilityDetailsModal from "./ResponsibilityDetailsModal";

export default function ResponsibilitiesPage() {
  const [responsibilities, setResponsibilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsIndex, setDetailsIndex] = useState(null);

  useEffect(() => {
    api.get("/responsibilities/")
      .then((res) => setResponsibilities(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch responsibilities:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = async (payload) => {
    const res = await api.post("/responsibilities/", payload);
    setResponsibilities((prev) => [...prev, res.data]);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Responsibilities</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track ownership and accountability across departments</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Responsibility
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading responsibilities...</p>
      ) : responsibilities.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No responsibilities found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {responsibilities.map((r, index) => (
              <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
                <div className="flex items-center gap-3">
                  <DepartmentAvatar name={r.owner} index={index} />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{r.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{r.owner}</p>
                  </div>
                </div>

                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-3">{r.role_title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 flex-1">{r.description}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Active Actions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{r.active_actions}</p>
                  </div>
                  <User className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={() => setDetailsIndex(index)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View Details
                  </button>
                  <Link
                    to={`/actions?department=${encodeURIComponent(r.name)}`}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View Actions
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Responsibility Matrix</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-2 pr-4">Department</th>
                  <th className="pb-2 pr-4">Owner</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2 pr-4">Active Actions</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {responsibilities.map((r, index) => (
                  <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <DepartmentAvatar name={r.owner} index={index} size="sm" />
                        <span className="text-gray-900 dark:text-gray-100">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{r.owner}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{r.role_title}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{r.active_actions} actions</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AddResponsibilityModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
      <ResponsibilityDetailsModal
        responsibility={detailsIndex !== null ? responsibilities[detailsIndex] : null}
        index={detailsIndex}
        onClose={() => setDetailsIndex(null)}
      />
    </div>
  );
}
