import { Link } from "react-router-dom";

export default function StatCard({ icon: Icon, iconColor, iconBg, value, label, href }) {
  const content = (
    <div className="flex flex-col gap-4 w-full h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link to={href} className="block hover:shadow-md transition-shadow rounded-xl">
      {content}
    </Link>
  );
}
