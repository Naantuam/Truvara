import { useState } from "react";
import { FileText, CheckSquare, ListChecks, DollarSign, Download } from "lucide-react";
import api from "../../api";

const REPORTS = [
  { key: "decisions", label: "Decisions Report", description: "All logged decisions with status and resolution history.", icon: FileText },
  { key: "approvals", label: "Approvals Report", description: "Approval turnaround times and outcomes.", icon: CheckSquare },
  { key: "actions", label: "Actions Report", description: "Operational tasks by status and assignee.", icon: ListChecks },
  { key: "expenses", label: "Expenses Report", description: "Company spending by category and date.", icon: DollarSign },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async (report) => {
    setDownloading(report.key);
    setError(null);
    try {
      const res = await api.get(`/reports/${report.key}/export/`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.key}-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to download ${report.key} report:`, err);
      setError(`Couldn't generate the ${report.label.toLowerCase()}.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Generate and export business reports</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map((report) => (
          <div key={report.key} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <report.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{report.label}</p>
              <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              <button
                onClick={() => handleDownload(report)}
                disabled={downloading === report.key}
                className="flex items-center gap-2 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {downloading === report.key ? "Generating..." : "Download CSV"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
