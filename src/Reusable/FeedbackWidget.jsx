import { useState, useRef, useEffect } from "react";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import useCachedResource from "../useCachedResource";
import { FEEDBACK_AREAS, CLASSIFICATION_LABELS, FEEDBACK_CACHE_KEY, fetchFeedback, submitFeedback, setFeedbackStatus } from "../feedbackHelpers";
import { getRelativeTime } from "../dashboardHelpers";

const CLASSIFICATION_STYLES = {
  BUG: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  UX_ISSUE: "bg-gold-50 text-gold-700 dark:bg-gold-950 dark:text-gold-400",
  MISSING_CAPABILITY: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  FUTURE_IDEA: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
};

const blankDraft = { area: FEEDBACK_AREAS[0], classification: "BUG", description: "" };

// Topbar icon beside the notification bell -- reports a problem with
// Truvara itself (not a company's business data), classified the way the
// roadmap doc's Workstream 3 calls for. The area the feedback is about is
// picked from the real site map (Sidebar's own nav labels), and which
// company it came from is never asked -- the backend takes that from the
// authenticated session, since the user is already on that company's
// workspace when they report something.
export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(blankDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { data: entries, setData: setEntries, loading } = useCachedResource(FEEDBACK_CACHE_KEY, fetchFeedback);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draft.description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const entry = await submitFeedback(draft);
      setEntries((prev) => [entry, ...(prev || [])]);
      setDraft(blankDraft);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't log that -- try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (entry) => {
    const nextStatus = entry.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    const updated = await setFeedbackStatus(entry.id, nextStatus);
    setEntries((prev) => (prev || []).map((e) => (e.id === entry.id ? updated : e)));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-gold-400 transition-colors p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
        title="Report feedback"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 flex flex-col max-h-[80vh] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Report Feedback</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2">
            <div className="flex gap-2">
              <select
                value={draft.area}
                onChange={handleChange("area")}
                className="flex-1 min-w-0 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {FEEDBACK_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={draft.classification}
                onChange={handleChange("classification")}
                className="flex-1 min-w-0 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {Object.entries(CLASSIFICATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={draft.description}
              onChange={handleChange("description")}
              placeholder="What happened, what you expected..."
              rows={2}
              required
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 bg-gold-500 text-gray-900 text-xs font-medium rounded-lg py-1.5 hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Log it
            </button>
          </form>

          <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-gray-800 min-h-[100px] max-h-[260px]">
            {loading ? (
              <div className="flex justify-center items-center h-full text-brand-600 py-6">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !entries || entries.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8 mb-8">No feedback logged yet.</div>
            ) : (
              <ul className="space-y-1">
                {entries.map((item) => (
                  <li key={item.id} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CLASSIFICATION_STYLES[item.classification]}`}>
                        {CLASSIFICATION_LABELS[item.classification]}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {item.area}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-100">{item.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {item.reporter} · {item.company} · {getRelativeTime(item.createdAt)}
                      </p>
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          item.status === "RESOLVED"
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                        }`}
                      >
                        {item.status === "RESOLVED" ? "Resolved" : "Open"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
