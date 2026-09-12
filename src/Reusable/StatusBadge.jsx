const STATUS_STYLES = {
  Approved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "Pending Approval": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Pending: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  Active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Open: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "In Progress": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  "Pending Order": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Ordered: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "In Transit": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Delivered: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
      {status}
    </span>
  );
}
