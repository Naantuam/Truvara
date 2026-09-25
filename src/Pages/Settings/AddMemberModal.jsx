import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { MailCheck } from "lucide-react";

const ROLES = ["Owner", "Manager", "Team Member"];

// New members get an activation email with a link to set their own
// password -- nothing sensitive passes through this admin, or this screen.
export default function AddMemberModal({ open, onClose, onAdded }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleName, setRoleName] = useState("Team Member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const reset = () => {
    setEmail("");
    setFullName("");
    setRoleName("Team Member");
    setError(null);
    setCreated(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const member = await onAdded({ email, fullName, roleName });
      setCreated(member);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          {created ? (
            <>
              <div className="flex flex-col items-center text-center gap-2 py-2">
                <MailCheck className="w-10 h-10 text-green-600" />
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {created.activationSent ? "Activation email sent" : "Member added"}
                </DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {created.activationSent
                    ? `${created.fullName} will receive an email at ${created.email} with a link to set their password and activate their account.`
                    : `${created.fullName} already has an account and has been added to this company.`}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="mt-6 w-full bg-brand-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-brand-700 transition-colors"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Team Member</DialogTitle>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-brand-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
