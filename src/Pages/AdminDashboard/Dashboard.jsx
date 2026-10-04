import DashboardStats from "./DashboardStats";
import RecentDecisions from "./RecentDecisions";
import PendingApprovals from "./PendingApprovals";
import TeamActivity from "./TeamActivity";

export default function Dashboard() {
  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDecisions />
        <PendingApprovals />
      </div>

      <TeamActivity />
    </div>
  );
}
