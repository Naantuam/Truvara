import { useState, useEffect } from "react";
import { User, Building2, Bell, Shield, CreditCard, Users } from "lucide-react";
import api from "../../api";
import SettingsRow from "./SettingsRow";
import SettingsToggle from "./SettingsToggle";
import InviteMemberModal from "./InviteMemberModal";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    api.get("/settings/")
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Failed to fetch settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const patchSection = async (section, payload) => {
    const res = await api.patch(`/settings/${section}/`, payload);
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], ...res.data } }));
  };

  const handleInvite = async (payload) => {
    await api.post("/settings/team/invite/", payload);
    setSettings((prev) => ({
      ...prev,
      team: { ...prev.team, active_count: (prev.team?.active_count || 0) + 1 },
    }));
  };

  if (loading) {
    return (
      <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6">
        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">Loading settings...</p>
      </div>
    );
  }

  const profile = settings?.profile || {};
  const company = settings?.company || {};
  const notifications = settings?.notifications || {};
  const security = settings?.security || {};
  const billing = settings?.billing || {};
  const team = settings?.team || {};

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and application preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile</h2>
        </div>
        <SettingsRow label="Full Name" value={profile.full_name} onSave={(v) => patchSection("profile", { full_name: v })} />
        <SettingsRow label="Email" value={profile.email} type="email" onSave={(v) => patchSection("profile", { email: v })} />
        <SettingsRow label="Role" value={profile.role} onSave={(v) => patchSection("profile", { role: v })} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Company</h2>
        </div>
        <SettingsRow label="Company Name" value={company.name} onSave={(v) => patchSection("company", { name: v })} />
        <SettingsRow label="Industry" value={company.industry} onSave={(v) => patchSection("company", { industry: v })} />
        <SettingsRow label="Company Size" value={company.size} onSave={(v) => patchSection("company", { size: v })} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
        </div>
        <SettingsToggle
          label="Email Notifications"
          checked={Boolean(notifications.email_notifications)}
          onChange={(v) => patchSection("notifications", { email_notifications: v })}
        />
        <SettingsToggle
          label="Decision Alerts"
          checked={Boolean(notifications.decision_alerts)}
          onChange={(v) => patchSection("notifications", { decision_alerts: v })}
        />
        <SettingsToggle
          label="Approval Reminders"
          checked={Boolean(notifications.approval_reminders)}
          onChange={(v) => patchSection("notifications", { approval_reminders: v })}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security</h2>
        </div>
        <SettingsToggle
          label="Two-Factor Authentication"
          checked={Boolean(security.two_factor_enabled)}
          onChange={(v) => patchSection("security", { two_factor_enabled: v })}
        />
        <SettingsRow
          label="Session Timeout"
          value={security.session_timeout_minutes ? `${security.session_timeout_minutes} minutes` : ""}
          onSave={(v) => patchSection("security", { session_timeout_minutes: parseInt(v, 10) || 0 })}
        />
        <SettingsRow label="Password Last Changed" value={security.password_last_changed} linkTo="/security" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Billing</h2>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-100">Current Plan</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{billing.plan_name} - ${billing.price}/month</p>
          </div>
          <button
            onClick={() => alert("Plan upgrades aren't available yet.")}
            className="bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 pt-3">Next billing date: {billing.next_billing_date}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Team Members</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">{team.active_count ?? 0} active team members</p>
          <button
            onClick={() => setInviteOpen(true)}
            className="bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Invite Members
          </button>
        </div>
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={handleInvite} />
    </div>
  );
}
