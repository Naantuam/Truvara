import api from "./api";

// Shared by ActionsPage and ResponsibilitiesPage -- both list the exact same
// resource, just grouped differently, so they use the same cache key
// ("tasks") and this same fetcher via useCachedResource.
export const TASKS_CACHE_KEY = "tasks";
export const fetchTasks = () =>
  api.get("/tasks/").then((res) => (Array.isArray(res.data) ? res.data : res.data?.results || []));

const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export function taskStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

// Mirrors backend/src/services/taskService.js canEditTask -- a Team Member
// (view+edit but no operations:task:assign) can only touch their own task.
// This only controls whether the UI *offers* the controls; the backend is
// the real enforcement point either way.
export function canEditTaskClient(task, user) {
  if (!task || !user) return false;
  if (user.permissions?.includes("operations:task:assign")) return true;
  return task.assignee?.id === user.id;
}
