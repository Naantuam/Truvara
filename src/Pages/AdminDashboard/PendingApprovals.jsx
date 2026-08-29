import { useState, useEffect } from "react";
import api from "../../api";

export default function PendingApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/approvals/pending/")
      .then((res) => setApprovals(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch pending approvals:", err))
      .finally(() => setLoading(false));
  }, []);

  const resolve = async (id, action) => {
    try {
      await api.post(`/approvals/${id}/${action}/`);
      setApprovals((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(`Failed to ${action} approval ${id}:`, err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Approvals</h2>

      {loading ? (
        <p className="text-sm text-gray-400 py-6 text-center">Loading approvals...</p>
      ) : approvals.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No pending approvals.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-4">
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                By {item.requested_by} · {item.date}
              </p>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
