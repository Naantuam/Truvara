export default function SettingsToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <p className="text-sm text-gray-900 dark:text-gray-100">{label}</p>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
