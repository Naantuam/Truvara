import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ChevronRight, User, DollarSign } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import DecisionDetailsModal from "../../Reusable/DecisionDetailsModal";
import RejectReasonModal from "./RejectReasonModal";

export default function ApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsFor, setDetailsFor] = useState(null);
  const [rejecting, setRejecting] = useState(null);

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

  const approve = async (id) => {
    try {
      const res = await api.post(`/decisions/${id}/approve/`);
      setPending((prev) => prev.filter((item) => item.id !== id));
      setHistory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error(`Failed to approve decision ${id}:`, err);
    }
  };

  const reject = async (id, rejection_reason) => {
    const res = await api.post(`/decisions/${id}/reject/`, { rejection_reason });
    setPending((prev) => prev.filter((item) => item.id !== id));
    setHistory((prev) => [res.data, ...prev]);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve pending decision requests</p>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pending Review</h2>
        {!loading && (
          <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {pending.length}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading approvals...</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No pending approvals.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pending.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-gray-900 dark:text-gray-100">{item.title}</p>
                <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                  Pending
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{item.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-3">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" /> By {item.owner}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" /> Est. <span className="font-semibold text-gray-900 dark:text-gray-100">${Number(item.estimated_cost || 0).toLocaleString()}</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Justification</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => approve(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => setRejecting(item)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => setDetailsFor(item)}
                  className="w-9 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Decision History</h2>

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No resolved decisions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 pr-4">Decision</th>
                <th className="pb-2 pr-4">Submitted By</th>
                <th className="pb-2 pr-4">Est. Cost</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((decision) => (
                <tr key={decision.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-gray-900 dark:text-gray-100">{decision.title}</p>
                    {decision.status === "Approved" && decision.resolved_by && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Approved by {decision.resolved_by}</p>
                    )}
                    {decision.status === "Rejected" && decision.rejection_reason && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate max-w-[280px]">
                        Reason: {decision.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{decision.owner}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">${Number(decision.estimated_cost || 0).toLocaleString()}</td>
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

      <DecisionDetailsModal decision={detailsFor} onClose={() => setDetailsFor(null)} />
      <RejectReasonModal decision={rejecting} onClose={() => setRejecting(null)} onRejected={reject} />
    </div>
  );
}
