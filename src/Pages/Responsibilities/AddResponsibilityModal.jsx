import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function AddResponsibilityModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setName("");
    setRoleTitle("");
    setOwner("");
    setDescription("");
    setStatus("Active");
    setError(null);
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
      await onCreated({ name, role_title: roleTitle, owner, description, status });
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create responsibility.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Responsibility</DialogTitle>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department / Area</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner</label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner's Role Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Marketing Director"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>Active</option>
                <option>Inactive</option>
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
                {submitting ? "Saving..." : "Save Responsibility"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
