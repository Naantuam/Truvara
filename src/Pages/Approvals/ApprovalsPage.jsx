import { useState, useEffect } from "react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import DecisionDetailsModal from "./DecisionDetailsModal";

export default function ApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsFor, setDetailsFor] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/decisions/pending/").catch(() => ({ data: [] })),
      api.get("/decisions/history/").catch(() => ({ data: [] })),
    ])
      .then(([pendingRes, historyRes]) => {
        setPending(Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data?.results || []);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : historyRes.data?.results || []);
      })
      .catch((err) => console.error("Failed to fetch approvals:", err))
      .finally(() => setLoading(false));
  }, []);

  const resolve = async (id, action) => {
    try {
      const res = await api.post(`/decisions/${id}/${action}/`);
      setPending((prev) => prev.filter((item) => item.id !== id));
      setHistory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error(`Failed to ${action} decision ${id}:`, err);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-500">Review and approve pending decision requests</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Review Queue</h2>

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading approvals...</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No pending approvals.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm font-semibold text-gray-700">
                    ${Number(item.estimated_cost || 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  By {item.owner} · {item.date}
                </p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => resolve(item.id, "approve")}
                    className="flex-1 bg-blue-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-blue-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => resolve(item.id, "reject")}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setDetailsFor(item)}
                    className="px-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Approval History</h2>

        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No resolved decisions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-2 pr-4">Decision</th>
                <th className="pb-2 pr-4">Submitter</th>
                <th className="pb-2 pr-4">Resolved By</th>
                <th className="pb-2 pr-4">Resolved Date</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((decision) => (
                <tr key={decision.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 text-gray-900">{decision.title}</td>
                  <td className="py-3 pr-4 text-gray-600">{decision.owner}</td>
                  <td className="py-3 pr-4 text-gray-600">{decision.resolved_by}</td>
                  <td className="py-3 pr-4 text-gray-600">{decision.resolved_date}</td>
                  <td className="py-3">
                    <StatusBadge status={decision.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DecisionDetailsModal decision={detailsFor} onClose={() => setDetailsFor(null)} />
    </div>
  );
}
