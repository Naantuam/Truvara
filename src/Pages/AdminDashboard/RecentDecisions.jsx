import { useState, useEffect } from "react";
import api from "../../api";

const STATUS_STYLES = {
  Approved: "bg-green-100 text-green-700",
  "Pending Approval": "bg-orange-100 text-orange-700",
  Draft: "bg-gray-100 text-gray-600",
  Rejected: "bg-red-100 text-red-700",
};

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
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Decisions</h2>

      {loading ? (
        <p className="text-sm text-gray-400 py-6 text-center">Loading decisions...</p>
      ) : decisions.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No decisions logged yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-400 uppercase border-b border-gray-100">
              <th className="pb-2 pr-4">Decision</th>
              <th className="pb-2 pr-4">Owner</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision) => (
              <tr key={decision.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-4 text-gray-900 truncate max-w-[200px]">{decision.title}</td>
                <td className="py-3 pr-4 text-gray-600">{decision.owner}</td>
                <td className="py-3 pr-4 text-gray-600">{decision.date}</td>
                <td className="py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[decision.status] || "bg-gray-100 text-gray-600"}`}>
                    {decision.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
