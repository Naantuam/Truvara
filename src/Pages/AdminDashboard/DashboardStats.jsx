import { AlertCircle, CheckSquare, Users, TrendingUp, DollarSign } from "lucide-react";
import StatCard from "./StatCard";
import useCachedResource from "../../useCachedResource";
import { DECISIONS_CACHE_KEY, fetchDecisions } from "../../decisionHelpers";
import { TASKS_CACHE_KEY, fetchTasks } from "../../taskHelpers";
import { TRANSACTIONS_CACHE_KEY, fetchTransactions } from "../../transactionHelpers";
import { computeDashboardStats } from "../../dashboardHelpers";

const CARDS = [
  { key: "open_decisions", label: "Open Decisions", icon: AlertCircle, iconColor: "text-brand-600 dark:text-brand-400", iconBg: "bg-brand-50 dark:bg-brand-950", href: "/decisions" },
  { key: "pending_approvals", label: "Pending Approvals", icon: CheckSquare, iconColor: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-50 dark:bg-orange-950", href: "/approvals" },
  { key: "active_responsibilities", label: "Active Responsibilities", icon: Users, iconColor: "text-gold-600 dark:text-gold-400", iconBg: "bg-gold-50 dark:bg-gold-950", href: "/responsibilities" },
  { key: "open_actions", label: "Open Actions", icon: TrendingUp, iconColor: "text-green-600 dark:text-green-400", iconBg: "bg-green-50 dark:bg-green-950", href: "/actions" },
  { key: "monthly_expenses", label: "Monthly Expenses", icon: DollarSign, iconColor: "text-gold-600 dark:text-gold-400", iconBg: "bg-gold-50 dark:bg-gold-950", isCurrency: true, href: "/expenses" },
];

export default function DashboardStats() {
  const { data: decisions, loading: loadingDecisions } = useCachedResource(DECISIONS_CACHE_KEY, fetchDecisions);
  const { data: tasks, loading: loadingTasks } = useCachedResource(TASKS_CACHE_KEY, fetchTasks);
  const { data: transactions, loading: loadingTransactions } = useCachedResource(TRANSACTIONS_CACHE_KEY, fetchTransactions);

  const loading = loadingDecisions || loadingTasks || loadingTransactions;
  const summary = computeDashboardStats(decisions, tasks, transactions);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {CARDS.map((card) => {
        const raw = summary[card.key] ?? 0;
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
