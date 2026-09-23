import api from "./api";

// Shared by DecisionsPage and ApprovalsPage -- both list the exact same
// resource, just filtered differently, so they use the same cache key
// ("decisions") and this same fetcher via useCachedResource.
export const DECISIONS_CACHE_KEY = "decisions";
export const fetchDecisions = () =>
  api.get("/decisions/").then((res) => (Array.isArray(res.data) ? res.data : res.data?.results || []));

// Maps the backend's DecisionStatus enum (backend/prisma/schema.prisma) to the
// Title Case labels StatusBadge.jsx already has styles for.
const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXECUTING: "Executing",
  COMPLETED: "Completed",
};

export function decisionStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function canSubmitDecision(decision, user) {
  if (!decision || !user) return false;
  return decision.status === "DRAFT" && (decision.creatorId === user.id || user.role === "Owner");
}
