import api from "./api";

export const DASHBOARD_ACTIVITY_CACHE_KEY = "dashboard-activity";
export const fetchRecentActivity = () => api.get("/dashboard/activity/").then((res) => (Array.isArray(res.data) ? res.data : []));

// Shared by TeamActivity and the Topbar notifications dropdown, which show
// the same underlying activity feed in two places.
export function getRelativeTime(dateString) {
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}

function utcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

// Transaction dates are stored as UTC-midnight (see dateHelpers.js) -- bucket
// keys are built the same way so a transaction always lands in the bucket
// matching the calendar date it was actually entered as, regardless of the
// viewer's own timezone.
export function computeExpenseProgression(transactions, period = "month", now = new Date()) {
  // Only posted, non-voided transactions are real -- pending/rejected/voided
  // entries shouldn't move the totals or the chart.
  const list = (transactions || []).filter((t) => t.status === "APPROVED" && !t.isVoided);
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const buckets = [];
  if (period === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayUtc.getTime() - i * 86400000);
      buckets.push({ key: utcDateKey(d), label: d.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" }) });
    }
  } else if (period === "year") {
    const year = todayUtc.getUTCFullYear();
    for (let m = 0; m < 12; m++) {
      const d = new Date(Date.UTC(year, m, 1));
      buckets.push({ key: `${year}-${String(m + 1).padStart(2, "0")}`, label: d.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" }) });
    }
  } else {
    const year = todayUtc.getUTCFullYear();
    const month = todayUtc.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day++) {
      buckets.push({ key: utcDateKey(new Date(Date.UTC(year, month, day))), label: String(day) });
    }
  }

  const bucketMap = new Map(buckets.map((b) => [b.key, { ...b, income: 0, expense: 0 }]));
  const keyFor = (iso) => {
    const d = new Date(iso);
    return period === "year" ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}` : utcDateKey(d);
  };

  for (const t of list) {
    const bucket = bucketMap.get(keyFor(t.occurredAt));
    if (!bucket) continue; // outside the selected period
    if (t.type === "INCOME") bucket.income += Number(t.amount || 0);
    else bucket.expense += Number(t.amount || 0);
  }

  const series = buckets.map((b) => bucketMap.get(b.key));
  const totals = series.reduce(
    (acc, b) => ({ totalIncome: acc.totalIncome + b.income, totalExpense: acc.totalExpense + b.expense }),
    { totalIncome: 0, totalExpense: 0 }
  );

  return { series, ...totals };
}

// Shifts an anchor date by one period unit -- always normalized to the 1st
// for month/year (never mutates a day-of-month directly) so e.g. Jan 31 ->
// next month can't overflow into March.
export function shiftPeriodAnchor(anchor, period, direction) {
  if (period === "week") return new Date(anchor.getTime() + direction * 7 * 86400000);
  if (period === "year") return new Date(anchor.getFullYear() + direction, 0, 1);
  return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
}

export function formatPeriodLabel(period, anchor) {
  if (period === "year") return String(anchor.getFullYear());
  if (period === "month") return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const todayUtc = new Date(Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate()));
  const start = new Date(todayUtc.getTime() - 6 * 86400000);
  const fmt = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(start)} – ${fmt(todayUtc)}`;
}
