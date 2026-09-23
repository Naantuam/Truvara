# Truvara: Business Management System (BMS)

**Truvara** is a modern Enterprise Resource Planning (ERP) and Business Management System (BMS) platform built for operational governance, decision tracking, workflow approvals, execution monitoring, and financial transparency.

Truvara enforces an end-to-end data lineage chain that connects strategic decisions to concrete actions and financial spending:

$$\text{Decision Proposal} \xrightarrow{\quad\text{Review \& Approval}\quad} \text{Approved Decision} \xrightarrow{\quad\text{5-Stage Action Pipeline}\quad} \text{Completed Action} \xrightarrow{\quad\text{Financial Expense}\quad}$$

---

## 🎯 Core Features & Modules

### 📊 1. Executive Dashboard
* **KPI Metrics**: Real-time overview of Total Decisions, Pending Approvals, Active Actions, and Total Expenses.
* **Pending Approvals Queue**: Fast-action inbox for items awaiting management sign-off.
* **Recent Decisions**: Feed of recently logged organizational decisions.
* **Team Activity Log**: Audit trail tracking user interactions and workflow changes across the platform.

### 📝 2. Decisions Governance
* **Proposal Logging**: Register strategic proposals with budget estimates, impact levels, and department tags.
* **Status Tracking**: Filter and search decisions by status (`Draft`, `Pending`, `Approved`, `Rejected`).
* **Decision Lineage**: Direct linkage between decisions and downstream execution tasks.

### ✅ 3. Approvals Workflow
* **Governance Inbox**: Dedicated review panel for department leads and administrators.
* **Audit Compliant Rejections**: Mandatory rejection reason recording for full audit transparency.
* **Instant Sign-offs**: One-click approvals that automatically trigger action pipeline creation.

### ⚙️ 4. Actions Pipeline
* **5-Stage Execution Tracker**: Visual progress tracking across key execution stages:
  1. *Initiated*
  2. *Review*
  3. *In Progress*
  4. *Final Review*
  5. *Completed*
* **Cost Variance Monitoring**: Real-time tracking of estimated budget vs. actual cost with over-budget alerts.

### 💸 5. Expenses Ledger
* **Categorized Spending**: Detailed ledger supporting both manual expense entries and action-generated expenditures.
* **Receipt Management**: Attachment support for receipt images and invoice documents.
* **Cost Allocation**: Automatic linkage back to originating actions and decisions.

### 🏢 6. Responsibilities & Department Directory
* **Organizational Structure**: Department directory mapping team heads, member allocations, and functional duties.
* **Responsibility Cards**: Detailed view of team responsibilities and department assignments.

### 📈 7. Reports & Analytics
* **Interactive Visualizations**: Charts powered by Recharts for budget utilization, spending trends, department comparisons, and cost variance analysis.
* **Exportable Data**: Cross-module report insights for administrative decision-making.

### ⚙️ 8. Workspace & Team Management
* **Team Invitations**: Role-based invitation flow for onboarding team members.
* **System Settings**: Notification preferences, company profile configuration, and security toggles.

### 🔐 9. Authentication & Security
* **Multi-Factor Authentication (MFA)**: Built-in 2-factor OTP verification.
* **Account Recovery & Activation**: Token-based password reset and account activation flows.
* **Role-Based Access Control (RBAC)**: Route protection and granular module permissions.
* **Dark / Light Mode**: Unified theme engine with instant mode toggling.

---

## 💻 Tech Stack

* **Core UI**: [React 19](https://react.dev/) & [Vite 6](https://vitejs.dev/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Icons & Assets**: [Lucide React](https://lucide.dev/)
* **Data Visualization**: [Recharts](https://recharts.org/)
* **State & HTTP**: Axios, Framer Motion, Headless UI

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:Naantuam/Truvara.git
   cd Truvara
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

Private & Proprietary — Truvara System.
