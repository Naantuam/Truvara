import { useState } from "react";

const ROLES = ["Owner", "Manager", "Team Member"];

export default function MemberRow({ member, onUpdate, isSelf }) {
  const [saving, setSaving] = useState(false);

  const handleRoleChange = async (e) => {
    setSaving(true);
    try {
      await onUpdate(member.id, { roleName: e.target.value });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setSaving(true);
    try {
      await onUpdate(member.id, { isActive: !member.isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-3">
      <div className="min-w-0">
        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
          {member.fullName} {isSelf && <span className="text-xs text-gray-400 dark:text-gray-500">(you)</span>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <select
          value={member.role}
          onChange={handleRoleChange}
          disabled={saving || isSelf}
          title={isSelf ? "You can't change your own role" : undefined}
          className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
        >
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={handleToggleActive}
          disabled={saving || isSelf}
          title={isSelf ? "You can't deactivate yourself" : undefined}
          className={`text-xs font-medium px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
            member.isActive
              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-400"
          }`}
        >
          {member.isActive ? "Active" : "Inactive"}
        </button>
      </div>
    </div>
  );
}
