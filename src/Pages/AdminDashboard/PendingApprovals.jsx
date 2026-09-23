import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import useCachedResource from "../../useCachedResource";
import { DECISIONS_CACHE_KEY, fetchDecisions } from "../../decisionHelpers";

// Read-only preview -- actually approving/rejecting (with its confirm-before-
// reject step) lives on the Approvals page, not duplicated here.
export default function PendingApprovals() {
  const { data: decisions, loading } = useCachedResource(DECISIONS_CACHE_KEY, fetchDecisions);
  const pending = (decisions || []).filter((d) => d.status === "PENDING_APPROVAL");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pending Approvals</h2>
        {pending.length > 0 && (
          <Link to="/approvals" className="text-sm font-medium text-brand-600 dark:text-gold-400 hover:underline flex items-center gap-1">
            Review all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading approvals...
        </div>
      ) : pending.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No pending approvals.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to="/approvals"
              className="block border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                By {item.creator?.fullName || "Unknown"} · {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
