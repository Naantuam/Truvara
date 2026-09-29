import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StatCard from "./StatCard";
import useCachedResource from "../../useCachedResource";
import { TRANSACTIONS_CACHE_KEY, fetchTransactions } from "../../transactionHelpers";
import { computeExpenseProgression } from "../../dashboardHelpers";
import { formatMoney } from "../../currencyHelpers";

const PERIODS = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

// Replaces the old open-decisions/pending-approvals/etc. count cards (2026-09-29
// product decision) -- Recent Decisions and Pending Approvals below already
// cover that ground as real lists, so this section is finance-focused instead:
// income/expense progression over a selectable period.
export default function DashboardStats() {
  const { user } = useOutletContext() || {};
  const currency = user?.company_currency || "NGN";
  const [period, setPeriod] = useState("month");

  const { data: transactions, loading } = useCachedResource(TRANSACTIONS_CACHE_KEY, fetchTransactions);
  const { series, totalIncome, totalExpense } = computeExpenseProgression(transactions, period);
  const periodLabel = PERIODS.find((p) => p.key === period)?.label;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Finance Overview</h2>
        <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p.key
                  ? "bg-gold-500 text-gray-900"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <StatCard
          icon={TrendingDown}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-50 dark:bg-orange-950"
          value={loading ? "—" : formatMoney(totalExpense, currency)}
          label={`Total Expenses · ${periodLabel}`}
          href="/expenses"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-green-600 dark:text-green-400"
          iconBg="bg-green-50 dark:bg-green-950"
          value={loading ? "—" : formatMoney(totalIncome, currency)}
          label={`Total Income · ${periodLabel}`}
          href="/expenses"
        />
      </div>

      <div className="h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatMoney(v, currency)} width={70} />
              <Tooltip formatter={(value) => formatMoney(value, currency)} />
              <Legend />
              <Line type="monotone" dataKey="expense" name="Expenses" stroke="#ea580c" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
