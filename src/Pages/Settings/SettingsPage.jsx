import { useOutletContext, Link } from "react-router-dom";
import { UserCircle, ShieldCheck, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const { user, roles } = useOutletContext() || {};

  const userRoleId = typeof user?.role === "object" ? user?.role?.id : user?.role;
  const roleObject = roles?.find((r) => r.id === userRoleId);
  const roleLabel = (user?.superuser || user?.is_superuser)
    ? "Admin"
    : (roleObject ? (roleObject.label ?? roleObject.name) : (user?.role || "Unknown Role"));

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and security preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <UserCircle className="w-12 h-12 text-gray-300" />
          <div>
            <p className="font-medium text-gray-900">{user?.username || user?.email || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <Link
        to="/security"
        className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-blue-400 transition-colors"
      >
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-6 h-6 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Security</p>
            <p className="text-sm text-gray-500">Change your password and manage session security</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </Link>
    </div>
  );
}
