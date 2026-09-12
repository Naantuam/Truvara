import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../api";
import useTheme from "../../Reusable/useTheme";

const STATUS_COLORS = {
  Approved: "#10b981",
  "Pending Approval": "#f97316",
  Draft: "#9ca3af",
  Rejected: "#ef4444",
};

const STATS = [
  { key: "total_decisions", label: "Total Decisions", goodDirection: "up", suffix: "" },
  { key: "approval_rate", label: "Approval Rate", goodDirection: "up", suffix: "%" },
  { key: "avg_response_time", label: "Avg. Response Time", goodDirection: "down", suffix: " days" },
];

export default function ReportsPage() {
  const { theme } = useTheme();
  const gridStroke = theme === "dark" ? "#374151" : "#f0f0f0";
  const tickFill = theme === "dark" ? "#9ca3af" : "#9ca3af";
  const [range, setRange] = useState("6m");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/reports/summary/", { params: { range } })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch report summary:", err))
      .finally(() => setLoading(false));
  }, [range]);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/reports/export/", { params: { range }, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "business-report.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export report:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analytics and insights for your business</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button
            onClick={handleExport}
            disabled={downloading}
            className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading report data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Expenses by Month</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.expenses_by_month || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickFill }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickFill }} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#c39c55" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Decisions by Status</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.decisions_by_status || []}
                      dataKey="value"
                      nameKey="status"
                      innerRadius={0}
                      outerRadius={90}
                      label={({ status, value }) => `${status}: ${value}%`}
                    >
                      {(data?.decisions_by_status || []).map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#9ca3af"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Actions Completed</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.actions_completed || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickFill }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickFill }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Approval Trends</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.approval_trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickFill }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tickFill }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((stat) => {
              const entry = data?.stats?.[stat.key];
              const delta = entry?.delta ?? 0;
              const isGood = stat.goodDirection === "up" ? delta >= 0 : delta <= 0;
              return (
                <div key={stat.key} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {entry?.value ?? "—"}{stat.suffix}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${isGood ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {delta >= 0 ? "+" : ""}{delta}{stat.suffix} from last period
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
