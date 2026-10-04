import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import StatusBadge from "./StatusBadge";
import { decisionStatusLabel } from "../decisionHelpers";
import { formatMoney, getCurrencySymbol } from "../currencyHelpers";
import useCachedResource from "../useCachedResource";
import { COMPANY_MEMBERS_CACHE_KEY, fetchCompanyMembers } from "../companyHelpers";

export default function DecisionDetailsModal({ decision, user, onClose, onUpdated, onSetCoAuthor, currency = "NGN" }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { data: members } = useCachedResource(COMPANY_MEMBERS_CACHE_KEY, fetchCompanyMembers);

  if (!decision) return null;
  const d = decision;

  // Only the creator (or Owner) can touch this decision at all -- same rule
  // the backend enforces. Content fields are draft-only; the co-author field
  // is allowed regardless of status (see setDecisionCoAuthor on the backend).
  const isOwnerOrCreator = user && (d.creatorId === user.id || user.role === "Owner");
  const canEditContent = isOwnerOrCreator && user?.permissions?.includes("governance:decision:edit") && d.status === "DRAFT";
  const canSetCoAuthor = isOwnerOrCreator && user?.permissions?.includes("governance:decision:edit");

  const startEdit = () => {
    setForm({
      title: d.title || "",
      description: d.description || "",
      proposedAction: d.proposedAction || "",
      expectedAmount: d.expectedAmount ?? "",
      coAuthorId: d.coAuthorId || "",
    });
    setError(null);
    setEditing(true);
  };

  const handleClose = () => {
    setEditing(false);
    setForm(null);
    setError(null);
    onClose();
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (canEditContent) {
        await onUpdated(d.id, {
          title: form.title,
          description: form.description || undefined,
          proposedAction: form.proposedAction || undefined,
          expectedAmount: form.expectedAmount === "" ? undefined : Number(form.expectedAmount),
        });
      }
      if (canSetCoAuthor && (form.coAuthorId || "") !== (d.coAuthorId || "")) {
        await onSetCoAuthor(d.id, form.coAuthorId || null);
      }
      setEditing(false);
      setForm(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(decision)} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          {editing ? (
            <>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Decision</DialogTitle>

              <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
                {canEditContent && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={handleChange("title")}
                        className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Justification</label>
                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={handleChange("description")}
                        className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proposed Action</label>
                      <textarea
                        rows={2}
                        value={form.proposedAction}
                        onChange={handleChange("proposedAction")}
                        className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estimated Cost ({getCurrencySymbol(currency)})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.expectedAmount}
                        onChange={handleChange("expectedAmount")}
                        className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </>
                )}

                {canSetCoAuthor && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Co-Author <span className="text-gray-400 font-normal">(real-world credit, e.g. when entering this on someone else's behalf)</span>
                    </label>
                    <select
                      value={form.coAuthorId}
                      onChange={handleChange("coAuthorId")}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">None</option>
                      {(members || []).map((m) => (
                        <option key={m.id} value={m.id}>{m.fullName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setForm(null); setError(null); }}
                    className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-brand-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{d.title}</DialogTitle>
                <StatusBadge status={decisionStatusLabel(d.status)} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Submitted by {d.creator?.fullName || "Unknown"} · {new Date(d.createdAt).toLocaleDateString()}
              </p>
              {d.coAuthor && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Co-author: {d.coAuthor.fullName}</p>
              )}
              {d.modifiedBy && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Last edited by {d.modifiedBy.fullName} · {new Date(d.updatedAt).toLocaleString()}
                </p>
              )}

              {d.status === "APPROVED" && d.approver && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">Approved by {d.approver.fullName}</p>
              )}
              {d.status === "REJECTED" && d.rejectionReason && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">Reason: {d.rejectionReason}</p>
              )}

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Justification</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{d.description}</p>

              {d.proposedAction && (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Proposed Action</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{d.proposedAction}</p>
                </>
              )}

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Estimated Cost</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formatMoney(d.expectedAmount, currency)}</p>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleClose}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                {(canEditContent || canSetCoAuthor) && (
                  <button
                    onClick={startEdit}
                    className="flex-1 bg-brand-600 text-white text-sm font-medium rounded-lg py-2 hover:bg-brand-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
