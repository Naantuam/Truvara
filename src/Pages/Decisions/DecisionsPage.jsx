import { useState, useEffect, useMemo } from "react";
import { Search, Plus, ChevronRight } from "lucide-react";
import api from "../../api";
import StatusBadge from "../../Reusable/StatusBadge";
import DecisionDetailsModal from "../../Reusable/DecisionDetailsModal";
import AddDecisionModal from "./AddDecisionModal";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsFor, setDetailsFor] = useState(null);

  useEffect(() => {
    api.get("/decisions/")
      .then((res) => setDecisions(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch decisions:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return decisions;
    return decisions.filter(
      (d) => d.title?.toLowerCase().includes(term) || d.owner?.toLowerCase().includes(term)
    );
  }, [decisions, search]);

  const handleCreated = async (payload) => {
    const res = await api.post("/decisions/", payload);
    setDecisions((prev) => [res.data, ...prev]);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Decisions</h1>
          <p className="text-sm text-gray-500">Track and manage company decisions</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
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
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {loading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading decisions...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No decisions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-2 pr-4">Decision</th>
                <th className="pb-2 pr-4">Submitted By</th>
                <th className="pb-2 pr-4">Est. Cost</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((decision) => (
                <tr
                  key={decision.id}
                  onClick={() => setDetailsFor(decision)}
                  className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50"
                >
                  <td className="py-3 pr-4">
                    <p className="text-gray-900">{decision.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[280px]">{decision.description}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{decision.owner}</td>
                  <td className="py-3 pr-4 text-gray-600">${Number(decision.estimated_cost || 0).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-gray-600">{decision.date}</td>
                  <td className="py-3">
                    <StatusBadge status={decision.status} />
                  </td>
                  <td className="py-3 text-gray-300"><ChevronRight className="w-4 h-4" /></td>
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
