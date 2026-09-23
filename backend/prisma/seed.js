import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Namespaced so Governance/Operations/Finance/Dashboard share one permission
// vocabulary (work-scope: "User -> Role -> Permissions -> Module Access ->
// Specific Action"). This list is deliberately the MVP minimum from §9
// (view / create / edit / approve / record financial / manage users) --
// Precious said the exact matrix "will be tweaked... before implementation
// of complex permission logic," so keep this data-driven, not hardcoded.
const PERMISSIONS = [
  ["governance:decision:view", "View decisions"],
  ["governance:decision:create", "Create decisions"],
  ["governance:decision:edit", "Edit decisions"],
  ["governance:decision:submit", "Submit a decision for approval"],
  ["governance:decision:approve", "Approve or reject decisions"],
  ["operations:task:view", "View actions/tasks"],
  ["operations:task:create", "Create actions/tasks"],
  ["operations:task:edit", "Edit actions/tasks"],
  ["operations:task:assign", "Assign responsibility for actions/tasks"],
  ["finance:transaction:view", "View financial activity"],
  ["finance:transaction:create", "Record income/expenses"],
  ["finance:transaction:edit", "Edit financial records"],
  ["dashboard:view", "View management dashboard"],
  ["admin:users:manage", "Manage users and company membership"],
  ["admin:settings:manage", "Manage business/company settings"],
];

// Owner/Manager/Team Member per Precious's WhatsApp spec. Owner keeps both
// create and approve on decisions -- the maker-checker exception agreed for
// a single-founder company -- everyone else is blocked from approving their
// own decision at the route/service layer, not here.
const ROLE_PERMISSIONS = {
  Owner: PERMISSIONS.map(([code]) => code),
  Manager: [
    "governance:decision:view",
    "governance:decision:create",
    "governance:decision:edit",
    "governance:decision:submit",
    "operations:task:view",
    "operations:task:create",
    "operations:task:edit",
    "operations:task:assign",
    "finance:transaction:view",
    "finance:transaction:create",
    "dashboard:view",
  ],
  "Team Member": [
    "governance:decision:view",
    "operations:task:view",
    "operations:task:edit",
    "finance:transaction:view",
    "dashboard:view",
  ],
};

async function main() {
  const permissionRows = {};
  for (const [code, description] of PERMISSIONS) {
    permissionRows[code] = await prisma.permission.upsert({
      where: { code },
      update: { description },
      create: { code, description },
    });
  }

  const roleRows = {};
  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    roleRows[roleName] = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, isSystem: true },
    });
  }

  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    for (const code of codes) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roleRows[roleName].id, permissionId: permissionRows[code].id } },
        update: {},
        create: { roleId: roleRows[roleName].id, permissionId: permissionRows[code].id },
      });
    }
  }

  // Dev-only seed data. There is no signup flow yet (open concern) -- this is
  // how a company + one user per role exists at all for local testing.
  // One user per role (not just Owner) so RBAC differences are actually
  // observable -- Owner alone can't demonstrate that access is restricted.
  const DEV_PASSWORD = "ChangeMe123!";
  const DEV_USERS = [
    { email: "owner@truvara.dev", fullName: "Dev Owner", role: "Owner" },
    { email: "manager@truvara.dev", fullName: "Dev Manager", role: "Manager" },
    { email: "member@truvara.dev", fullName: "Dev Team Member", role: "Team Member" },
  ];

  let company = await prisma.company.findFirst({ where: { name: "Truvara Dev Co" } });
  if (!company) {
    company = await prisma.company.create({ data: { name: "Truvara Dev Co" } });
  }

  for (const { email, fullName, role } of DEV_USERS) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    const passwordHash = await argon2.hash(DEV_PASSWORD);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, primaryCompanyId: company.id },
    });
    await prisma.companyMembership.create({
      data: { userId: user.id, companyId: company.id, roleId: roleRows[role].id, scopeType: "COMPANY" },
    });
    console.log(`Seeded ${role} login: ${email} / ${DEV_PASSWORD}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
