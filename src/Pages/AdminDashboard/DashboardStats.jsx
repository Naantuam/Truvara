import { useState, useEffect } from "react";
import { AlertCircle, CheckSquare, Users, TrendingUp, DollarSign } from "lucide-react";
import api from "../../api";
import StatCard from "./StatCard";

const CARDS = [
  { key: "open_decisions", label: "Open Decisions", icon: AlertCircle, iconColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-50 dark:bg-blue-950", href: "/decisions" },
  { key: "pending_approvals", label: "Pending Approvals", icon: CheckSquare, iconColor: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-50 dark:bg-orange-950", href: "/approvals" },
  { key: "active_responsibilities", label: "Active Responsibilities", icon: Users, iconColor: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-50 dark:bg-purple-950", href: "/responsibilities" },
  { key: "open_actions", label: "Open Actions", icon: TrendingUp, iconColor: "text-green-600 dark:text-green-400", iconBg: "bg-green-50 dark:bg-green-950", href: "/actions" },
  { key: "monthly_expenses", label: "Monthly Expenses", icon: DollarSign, iconColor: "text-red-600 dark:text-red-400", iconBg: "bg-red-50 dark:bg-red-950", isCurrency: true, href: "/expenses" },
];

export default function DashboardStats() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary/")
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Failed to fetch dashboard summary:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {CARDS.map((card) => {
        const raw = summary?.[card.key] ?? 0;
        const value = loading ? "—" : card.isCurrency ? `$${Number(raw).toLocaleString()}` : raw;
        return (
          <StatCard
            key={card.key}
            icon={card.icon}
            iconColor={card.iconColor}
            iconBg={card.iconBg}
            value={value}
            label={card.label}
            href={card.href}
          />
        );
      })}
    </div>
  );
}
