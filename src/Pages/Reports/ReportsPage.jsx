import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import api from "../../api";

// Precious's spec for Reports (work-scope §9) is an export tool, not an
// analytics dashboard -- PDF/CSV of the real underlying data for a selected
// period. The old chart-based version here was speculative scaffolding from
// before that spec existed; see bms_system_open_concerns memory.
export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = async (format) => {
    setDownloading(format);
    setError(null);
    try {
      const params = { format };
      if (from) params.from = new Date(from).toISOString();
      if (to) params.to = new Date(to).toISOString();

      const res = await api.get("/reports/export/", { params, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `truvara-report.${format === "pdf" ? "pdf" : "csv"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export report:", err);
      setError("Failed to export report. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Export your business data — decisions, actions, finances, and recent activity</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 max-w-xl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Export Report</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Includes company info, Governance, Operations, Finance, and recent activity. Leave dates blank to include all-time data.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleExport("csv")}
            disabled={downloading !== null}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> {downloading === "csv" ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={downloading !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {downloading === "pdf" ? <Download className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
            {downloading === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
