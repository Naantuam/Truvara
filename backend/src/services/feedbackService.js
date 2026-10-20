import { directoryPrisma } from "../db/directoryPrisma.js";

// Platform-level, not tenant data -- feedback is about Truvara itself,
// collected across every company's real usage and read as one list by the
// product/dev team, so it lives in the directory database (see
// prisma/directory/schema.prisma) rather than any one company's tenant DB.

// Site map for the "which part of Truvara is this about" selector -- kept
// here (not read from the Sidebar's own nav config, which is frontend-only)
// so the backend can validate it independently of whatever the frontend
// happens to send. Mirrors Sidebar.jsx's NAV_GROUPS labels exactly, plus a
// catch-all for anything that doesn't fit one page.
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

export async function createFeedback(reporterId, companyId, { area, classification, description }) {
  return directoryPrisma.productFeedback.create({
    data: { reporterId, companyId, area, classification, description },
  });
}

async function attachNames(items) {
  const userIds = [...new Set(items.map((i) => i.reporterId))];
  const companyIds = [...new Set(items.map((i) => i.companyId))];
  const [users, companies] = await Promise.all([
    directoryPrisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, fullName: true } }),
    directoryPrisma.company.findMany({ where: { id: { in: companyIds } }, select: { id: true, name: true } }),
  ]);
  const userName = new Map(users.map((u) => [u.id, u.fullName]));
  const companyName = new Map(companies.map((c) => [c.id, c.name]));
  return items.map((i) => ({
    id: i.id,
    area: i.area,
    classification: i.classification,
    description: i.description,
    status: i.status,
    createdAt: i.createdAt,
    resolvedAt: i.resolvedAt,
    reporter: userName.get(i.reporterId) || "Someone",
    company: companyName.get(i.companyId) || "Unknown",
  }));
}

// Every signed-in user across every company sees the same list -- the
// whole point is a cross-company view the product team (and anyone else
// curious) can read, not a per-tenant record.
export async function listFeedback() {
  const items = await directoryPrisma.productFeedback.findMany({ orderBy: { createdAt: "desc" } });
  return attachNames(items);
}

export async function setFeedbackStatus(id, status) {
  return directoryPrisma.productFeedback.update({
    where: { id },
    data: { status, resolvedAt: status === "RESOLVED" ? new Date() : null },
  });
}
