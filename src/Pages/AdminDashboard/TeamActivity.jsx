import { useState, useEffect } from "react";
import api from "../../api";

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
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/activity/recent/")
      .then((res) => setActivity(Array.isArray(res.data) ? res.data : res.data?.results || []))
      .catch((err) => console.error("Failed to fetch team activity:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Team Activity</h2>

      {loading ? (
        <p className="text-sm text-gray-400 py-6 text-center">Loading activity...</p>
      ) : activity.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No recent activity.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {activity.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{item.actor}</span> {item.action}
                  {item.target ? ` "${item.target}"` : ""}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{getRelativeTime(item.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
