import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Plus, ChevronRight, Send, Loader2 } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import DecisionDetailsModal from "../../Reusable/DecisionDetailsModal";
import AddDecisionModal from "./AddDecisionModal";
import { decisionStatusLabel, canSubmitDecision, DECISIONS_CACHE_KEY, fetchDecisions } from "../../decisionHelpers";
import useCachedResource from "../../useCachedResource";

export default function DecisionsPage() {
  const { user } = useOutletContext() || {};
  const { data: decisions, setData: setDecisions, loading } = useCachedResource(DECISIONS_CACHE_KEY, fetchDecisions);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsFor, setDetailsFor] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const filtered = useMemo(() => {
    const list = decisions || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (d) => d.title?.toLowerCase().includes(term) || d.creator?.fullName?.toLowerCase().includes(term)
    );
  }, [decisions, search]);

  const handleCreated = async (payload) => {
    const res = await api.post("/decisions/", payload);
    setDecisions((prev) => [res.data, ...(prev || [])]);
  };

  const handleSubmit = async (id) => {
    setSubmittingId(id);
    try {
      const res = await api.post(`/decisions/${id}/submit/`);
      setDecisions((prev) => (prev || []).map((d) => (d.id === id ? res.data : d)));
    } catch (err) {
      console.error(`Failed to submit decision ${id}:`, err);
      alert(err.response?.data?.detail || "Failed to submit decision.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Decisions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage company decisions</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Decision
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search decisions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading decisions...
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No decisions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 pr-4">Decision</th>
                <th className="pb-2 pr-4">Submitted By</th>
                <th className="pb-2 pr-4">Est. Cost</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((decision) => (
                <tr
                  key={decision.id}
                  className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <td className="py-3 pr-4 cursor-pointer" onClick={() => setDetailsFor(decision)}>
                    <p className="text-gray-900 dark:text-gray-100">{decision.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[280px]">{decision.description}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{decision.creator?.fullName || "—"}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">${Number(decision.expectedAmount || 0).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{new Date(decision.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <StatusBadge status={decisionStatusLabel(decision.status)} />
                  </td>
                  <td className="py-3 text-gray-300 dark:text-gray-600">
                    <div className="flex items-center gap-2 justify-end">
                      {canSubmitDecision(decision, user) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubmit(decision.id);
                          }}
                          disabled={submittingId === decision.id}
                          title="Submit for approval"
                          className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-gold-400 hover:underline disabled:opacity-50"
                        >
                          {submittingId === decision.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Submit
                            </>
                          )}
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 cursor-pointer" onClick={() => setDetailsFor(decision)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddDecisionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
      <DecisionDetailsModal decision={detailsFor} onClose={() => setDetailsFor(null)} />
    </div>
  );
}
