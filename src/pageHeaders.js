// Single source of truth for each page's title/subtitle -- shown in the
// Topbar on desktop, and in a compact centered block above the page content
// on mobile (see Layout.jsx). Add a new page's route here and both automatically
// pick it up; individual pages no longer render their own heading.
export const PAGE_HEADERS = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your business operations" },
  "/decisions": { title: "Decisions", subtitle: "Track and manage company decisions" },
  "/approvals": { title: "Approvals", subtitle: "Review and approve pending decision requests" },
  "/responsibilities": { title: "Responsibilities", subtitle: "See who is responsible for what across the team" },
  "/actions": { title: "Actions", subtitle: "Track approved decisions through to completion" },
  "/expenses": { title: "Expenses", subtitle: "Track income and expenses, including those linked to actions" },
  "/reports": { title: "Reports", subtitle: "Export your business data — decisions, actions, finances, and recent activity" },
  "/settings": { title: "Settings", subtitle: "Manage your account and company" },
  "/security": { title: "Security", subtitle: "Manage your password and login security" },
};

export function getPageHeader(pathname) {
  return PAGE_HEADERS[pathname] || null;
}
