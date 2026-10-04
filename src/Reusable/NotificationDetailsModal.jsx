import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

// Keys like "from"/"to"/"reason" -> "From"/"To"/"Reason".
function labelCase(key) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
}

export default function NotificationDetailsModal({ notification, onClose }) {
  if (!notification) return null;
  const n = notification;
  const changeEntries = n.changes && typeof n.changes === "object" ? Object.entries(n.changes) : [];

  return (
    <Dialog open={Boolean(notification)} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
            <span className="font-semibold">{n.actor}</span> {n.action}
          </DialogTitle>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            {n.target && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Regarding</span>
                <span className="text-gray-900 dark:text-gray-100 text-right">{n.target}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Type</span>
              <span className="text-gray-900 dark:text-gray-100">{n.entityType}</span>
            </div>
            {changeEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{labelCase(key)}</span>
                <span className="text-gray-900 dark:text-gray-100 text-right break-words">{String(value ?? "—")}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
