import { useState, useEffect } from "react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";

export default function RecentDecisions() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/decisions/recent/")
      .then((res) => setDecisions(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch recent decisions:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Decisions</h2>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading decisions...</p>
      ) : decisions.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No decisions logged yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
              <th className="pb-2 pr-4">Decision</th>
              <th className="pb-2 pr-4">Owner</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision) => (
              <tr key={decision.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                <td className="py-3 pr-4 text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{decision.title}</td>
                <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{decision.owner}</td>
                <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{decision.date}</td>
                <td className="py-3">
                  <StatusBadge status={decision.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
