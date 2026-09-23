import api from "./api";

export const DASHBOARD_ACTIVITY_CACHE_KEY = "dashboard-activity";
export const fetchRecentActivity = () => api.get("/dashboard/activity/").then((res) => (Array.isArray(res.data) ? res.data : []));

// Work-scope §5.5: "the dashboard should not be manually populated with
// information that already exists elsewhere in the system." So these stats
// are computed here, client-side, from the exact same cached decisions/tasks/
// transactions data the Decisions/Actions/Expenses pages already fetch --
// no separate backend summary endpoint exists or is needed for this.
export function computeDashboardStats(decisions, tasks, transactions) {
  const openDecisions = (decisions || []).filter((d) => !["REJECTED", "COMPLETED"].includes(d.status)).length;
  const pendingApprovals = (decisions || []).filter((d) => d.status === "PENDING_APPROVAL").length;

  const activeTasks = (tasks || []).filter((t) => t.status !== "COMPLETED");
  const openActions = activeTasks.length;
  const activeResponsibilities = new Set(activeTasks.map((t) => t.assignee?.id).filter(Boolean)).size;

  const now = new Date();
  const monthlyExpenses = (transactions || [])
    .filter((t) => {
      if (t.type !== "EXPENSE") return false;
      const d = new Date(t.occurredAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return {
    open_decisions: openDecisions,
    pending_approvals: pendingApprovals,
    active_responsibilities: activeResponsibilities,
    open_actions: openActions,
    monthly_expenses: monthlyExpenses,
  };
}
