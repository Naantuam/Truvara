import { Loader2 } from "lucide-react";
import StatusBadge from "../../Reusable/StatusBadge";
import useCachedResource from "../../useCachedResource";
import { DECISIONS_CACHE_KEY, fetchDecisions, decisionStatusLabel } from "../../decisionHelpers";

export default function RecentDecisions() {
  const { data: decisions, loading } = useCachedResource(DECISIONS_CACHE_KEY, fetchDecisions);
  // Already ordered newest-first by the backend -- just take the top few.
  const recent = (decisions || []).slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Recent Decisions</h2>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading decisions...
        </div>
      ) : recent.length === 0 ? (
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
            {recent.map((decision) => (
              <tr key={decision.id} className="border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                <td className="py-3 pr-4 text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{decision.title}</td>
                <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{decision.creator?.fullName || "—"}</td>
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
  );
}
