import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { User, Building2, Users, Loader2 } from "lucide-react";
import api from "../../api";
import SettingsRow from "./SettingsRow";
import MemberRow from "./MemberRow";
import AddMemberModal from "./AddMemberModal";

export default function SettingsPage() {
  const { user } = useOutletContext() || {};
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const canManageCompany = user?.permissions?.includes("admin:settings:manage");
  const canManageUsers = user?.permissions?.includes("admin:users:manage");

  const fetchMembers = () => {
    setLoadingMembers(true);
    api.get("/company/members/")
      .then((res) => setMembers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to fetch team members:", err))
      .finally(() => setLoadingMembers(false));
  };

  useEffect(fetchMembers, []);

  const handleProfileSave = async (fullName) => {
    const res = await api.patch("/settings/profile/", { fullName });
    const updated = { ...user, full_name: res.data.fullName };
    try {
      localStorage.setItem("user", JSON.stringify(updated));
    } catch {
      // ignore storage failure (e.g. private browsing)
    }
    window.location.reload();
  };

  const handleCompanySave = async (name) => {
    await api.patch("/settings/company/", { name });
    window.location.reload();
  };

  const handleAddMember = async (payload) => {
    const res = await api.post("/company/members/", payload);
    fetchMembers();
    return res.data;
  };

  const handleUpdateMember = async (userId, payload) => {
    await api.patch(`/company/members/${userId}/`, payload);
    fetchMembers();
  };

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 dark:bg-gray-950 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and company</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile</h2>
        </div>
        <SettingsRow label="Full Name" value={user?.full_name} onSave={handleProfileSave} />
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-100">Email</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        <SettingsRow label="Password" value="••••••••" linkTo="/security" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Company</h2>
        </div>
        {canManageCompany ? (
          <SettingsRow label="Company Name" value={user?.company_name} onSave={handleCompanySave} />
        ) : (
          <div className="flex items-center justify-between py-3">
            <p className="text-sm text-gray-900 dark:text-gray-100">Company Name</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.company_name}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Team Members</h2>
          </div>
          {canManageUsers && (
            <button
              onClick={() => setAddOpen(true)}
              className="bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-brand-700 transition-colors"
            >
              Add Member
            </button>
          )}
        </div>

        {loadingMembers ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading team...
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No team members found.</p>
        ) : canManageUsers ? (
          <div>
            {members.map((m) => (
              <MemberRow key={m.id} member={m} onUpdate={handleUpdateMember} isSelf={m.id === user?.id} />
            ))}
          </div>
        ) : (
          <div>
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{m.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.email}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {canManageUsers && (
        <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAddMember} />
      )}
    </div>
  );
}
