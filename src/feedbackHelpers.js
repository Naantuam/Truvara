import api from "./api";

// Same site-map labels as Sidebar.jsx's NAV_GROUPS -- kept as a plain
// constant here too (the backend validates independently; see
// backend/src/services/feedbackService.js FEEDBACK_AREAS) so the dropdown
// doesn't need a network round trip just to render.
export const FEEDBACK_AREAS = [
  "Dashboard",
  "Decisions",
  "Approvals",
  "Responsibilities",
  "Actions",
  "Transactions",
  "Reports",
  "Settings",
  "General",
];

export const CLASSIFICATION_LABELS = {
  BUG: "Bug",
  UX_ISSUE: "UX Issue",
  MISSING_CAPABILITY: "Missing Capability",
  FUTURE_IDEA: "Future Idea",
};

export const FEEDBACK_CACHE_KEY = "product-feedback";
export const fetchFeedback = () => api.get("/feedback/").then((res) => (Array.isArray(res.data) ? res.data : []));

export const submitFeedback = (payload) => api.post("/feedback/", payload).then((res) => res.data);

export const setFeedbackStatus = (id, status) => api.patch(`/feedback/${id}/status/`, { status }).then((res) => res.data);
