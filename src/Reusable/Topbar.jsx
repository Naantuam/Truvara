import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Bell, Loader2 } from "lucide-react";
import useCachedResource from "../useCachedResource";
import { DASHBOARD_ACTIVITY_CACHE_KEY, fetchRecentActivity, getRelativeTime } from "../dashboardHelpers";
import { getPageHeader } from "../pageHeaders";

export default function TopBar({ sidebarOpen = true, setSidebarOpen = () => { }, user = null, loadingAuth = true }) {
  const location = useLocation();
  const header = getPageHeader(location.pathname);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data: activity, loading: loadingActivity } = useCachedResource(DASHBOARD_ACTIVITY_CACHE_KEY, fetchRecentActivity);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabel = user?.role || "Unknown Role";

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40 gap-4">
      {/* Left section (Bars button + page title, desktop only -- mobile keeps
          its own centered header block above the page content, see Layout.jsx) */}
      <div className="flex items-center gap-4 min-w-0">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-shrink-0 rounded-md bg-transparent text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        {header && (
          <div className="hidden md:block min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">{header.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{header.subtitle}</p>
          </div>
        )}
      </div>

      {/* Right section (Notifications & User Info) */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-gold-400 transition-colors p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Notifications"
          >
            <Bell className="h-6 w-6" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 flex flex-col max-h-[80vh] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Notifications</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-gray-800 min-h-[100px] max-h-[300px]">
                {loadingActivity ? (
                  <div className="flex justify-center items-center h-full text-brand-600 py-6">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : !activity || activity.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8 mb-8">No recent activity.</div>
                ) : (
                  <ul className="space-y-1">
                    {activity.slice(0, 10).map((item) => (
                      <li key={item.id} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                        <p className="text-sm text-gray-800 dark:text-gray-100">
                          <span className="font-semibold">{item.actor}</span> {item.action}
                          {item.target ? ` "${item.target}"` : ""}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{getRelativeTime(item.createdAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Account summary -- profile editing and logout both live in
            Settings now, no separate user-icon affordance needed here. */}
        <div className="flex flex-col items-end pl-4 border-l border-gray-100 dark:border-gray-700">
          {loadingAuth ? (
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          ) : (
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">{user?.full_name || user?.email || "User"}</span>
          )}
          {loadingAuth ? (
            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-bold text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-950 px-2 py-0.5 rounded-full mt-1">
              {roleLabel}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
