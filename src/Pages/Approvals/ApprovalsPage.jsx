import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, ChevronRight, User, DollarSign, Loader2 } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import DecisionDetailsModal from "../../Reusable/DecisionDetailsModal";
import RejectReasonModal from "./RejectReasonModal";
import { decisionStatusLabel, DECISIONS_CACHE_KEY, fetchDecisions } from "../../decisionHelpers";
import useCachedResource from "../../useCachedResource";

export default function ApprovalsPage() {
  const { data: decisions, setData: setDecisions, loading } = useCachedResource(DECISIONS_CACHE_KEY, fetchDecisions);
  const [detailsFor, setDetailsFor] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // There's one source of truth (GET /decisions/) -- Governance doesn't need
  // separate "pending"/"history" endpoints, just a status split client-side.
  const pending = useMemo(() => (decisions || []).filter((d) => d.status === "PENDING_APPROVAL"), [decisions]);
  const history = useMemo(
    () => (decisions || []).filter((d) => ["APPROVED", "REJECTED"].includes(d.status)),
    [decisions]
  );

  const approve = async (id) => {
    setActionError(null);
    setApprovingId(id);
    try {
      const res = await api.post(`/decisions/${id}/approve/`);
      setDecisions((prev) => (prev || []).map((d) => (d.id === id ? res.data : d)));
    } catch (err) {
      console.error(`Failed to approve decision ${id}:`, err);
      setActionError(err.response?.data?.detail || "Failed to approve decision.");
    } finally {
      setApprovingId(null);
    }
  };

  const reject = async (id, reason) => {
    const res = await api.post(`/decisions/${id}/reject/`, { reason });
    setDecisions((prev) => (prev || []).map((d) => (d.id === id ? res.data : d)));
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve pending decision requests</p>
      </div>

      {actionError && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pending Review</h2>
        {!loading && (
          <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {pending.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading approvals...
        </div>
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
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" /> By {item.creator?.fullName || "Unknown"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" /> Est. <span className="font-semibold text-gray-900 dark:text-gray-100">${Number(item.expectedAmount || 0).toLocaleString()}</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Justification</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => approve(item.id)}
                  disabled={approvingId === item.id}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {approvingId === item.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => setRejecting(item)}
                  disabled={approvingId === item.id}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
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

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Decision History</h2>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading history...
          </div>
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
                <tr
                  key={decision.id}
                  onClick={() => setDetailsFor(decision)}
                  className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <td className="py-3 pr-4">
                    <p className="text-gray-900 dark:text-gray-100">{decision.title}</p>
                    {decision.status === "APPROVED" && decision.approver && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Approved by {decision.approver.fullName}</p>
                    )}
                    {decision.status === "REJECTED" && decision.rejectionReason && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 truncate max-w-[280px]">
                        Reason: {decision.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{decision.creator?.fullName || "—"}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">${Number(decision.expectedAmount || 0).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{new Date(decision.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <StatusBadge status={decisionStatusLabel(decision.status)} />
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
