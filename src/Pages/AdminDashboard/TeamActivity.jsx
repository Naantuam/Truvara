import { Loader2 } from "lucide-react";
import useCachedResource from "../../useCachedResource";
import { DASHBOARD_ACTIVITY_CACHE_KEY, fetchRecentActivity } from "../../dashboardHelpers";

const getRelativeTime = (dateString) => {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

export default function TeamActivity() {
  const { data: activity, loading } = useCachedResource(DASHBOARD_ACTIVITY_CACHE_KEY, fetchRecentActivity);
  const list = activity || [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Team Activity</h2>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading activity...
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No recent activity.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-brand-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{item.actor}</span> {item.action}
                  {item.target ? ` "${item.target}"` : ""}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{getRelativeTime(item.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
