import { useState } from "react";
import { Link } from "react-router-dom";

export default function SettingsRow({ label, value, onSave, type = "text", linkTo, options }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const displayValue = options
    ? options.find((o) => (typeof o === "object" ? o.value === value : o === value))?.label || value
    : value;

  if (linkTo) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{displayValue}</p>
        </div>
        <Link to={linkTo} className="text-sm font-medium text-brand-600 dark:text-gold-400 hover:text-brand-700 dark:hover:text-gold-300">
          Edit
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    await onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">{label}</p>
          {options ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {options.map((opt) => {
                const val = typeof opt === "object" ? opt.value : opt;
                const lbl = typeof opt === "object" ? opt.label : opt;
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleSave} className="text-sm font-medium text-brand-600 dark:text-gold-400 hover:text-brand-700 dark:hover:text-gold-300">
            Save
          </button>
          <button
            onClick={() => { setDraft(value); setEditing(false); }}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{displayValue}</p>
      </div>
      <button onClick={() => setEditing(true)} className="text-sm font-medium text-brand-600 dark:text-gold-400 hover:text-brand-700 dark:hover:text-gold-300">
        Edit
      </button>
    </div>
  );
}
