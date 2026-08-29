const STATUS_STYLES = {
  Approved: "bg-green-100 text-green-700",
  "Pending Approval": "bg-orange-100 text-orange-700",
  Draft: "bg-gray-100 text-gray-600",
  Rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
