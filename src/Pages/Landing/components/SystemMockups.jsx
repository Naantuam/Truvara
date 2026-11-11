import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Building2,
  ChevronDown,
  Layers,
  FileCheck2,
  AlertCircle,
  Database,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import {
  ApproverCharacter,
  OperatorCharacter,
  FinanceCharacter,
  LegalAdvisorCharacter,
} from "./AnimatedCharacters";

// 1. Governance Module System Example
export function GovernanceMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Decorative backdrop glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/20 to-gold-500/20 rounded-3xl blur-xl opacity-75" />

      {/* Main Glass Card */}
      <div className="relative bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-2xl shadow-brand-950/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Enterprise Workspace • Governance
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-gold-300 border border-brand-200/50 dark:border-gold-400/20">
            Resolution #BR-2024-04
          </span>
        </div>

        {/* Resolution Title & Amount */}
        <div className="mt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                Ikeja Operational Facility & Equipment Lease
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Capital expenditure review & multi-year tenancy authorization
              </p>
            </div>
            <span className="text-right flex-shrink-0">
              <span className="text-xs text-gray-400 block">Value</span>
              <span className="text-sm font-bold text-brand-700 dark:text-gold-400 font-mono">
                ₦18,500,000
              </span>
            </span>
          </div>
        </div>

        {/* Maker-Checker Workflow Timeline */}
        <div className="mt-4 p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-[10px]">
                IO
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Initiating Officer <span className="font-normal text-gray-500 text-[10px]">(Maker)</span></p>
                <p className="text-[10px] text-gray-400">Recorded resolution & documentation • 09:15 WAT</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
            </span>
          </div>

          <div className="border-l-2 border-dashed border-gray-200 dark:border-white/10 ml-3 h-3 my-0.5" />

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-100 dark:bg-gold-900/60 text-gold-800 dark:text-gold-300 flex items-center justify-center font-bold text-[10px]">
                BA
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Board Approver <span className="font-normal text-gray-500 text-[10px]">(Checker)</span></p>
                <p className="text-[10px] text-gray-400">Independent review & board approval • 10:42 WAT</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Approved
            </span>
          </div>
        </div>

        {/* Immutable Audit Footnote */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-mono">
          <span className="flex items-center gap-1 truncate">
            <Lock className="w-3 h-3 text-gold-500" />
            SHA256: 8f4c3a91...e91b2
          </span>
          <span className="text-emerald-600 dark:text-gold-400 font-sans font-medium">
            Self-approval blocked
          </span>
        </div>
      </div>

      {/* Floating Animated Approver Badge */}
      <div className="hidden sm:block absolute -bottom-6 -right-6 z-20">
        <ApproverCharacter className="w-24 h-24" />
      </div>
    </div>
  );
}

// 2. Operations Module System Example
export function OperationsMockup() {
  const tasks = [
    {
      title: "CAC Annual Returns Filing (2024)",
      owner: "Legal & Corporate Secretarial",
      tag: "Statutory",
      due: "Due in 3 days",
      status: "In Progress",
      statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      title: "FIRS VAT & WHT Remittance (October)",
      owner: "Finance & Accounts Team",
      tag: "Tax",
      due: "Completed today",
      status: "Done",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      title: "Renew Lagos State Business Premises Permit",
      owner: "Operations Lead",
      tag: "Licensing",
      due: "Completed",
      status: "Done",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-2 bg-gradient-to-r from-gold-500/20 to-brand-500/20 rounded-3xl blur-xl opacity-75" />

      <div className="relative bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-2xl shadow-brand-950/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Operational Actions & Milestones
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Q4 Execution Roadmap
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-brand-700 dark:text-gold-400">
              85% On Track
            </span>
            <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
              <div className="w-5/6 h-full bg-brand-600 dark:bg-gold-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="mt-3 space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.title}
              className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3 text-xs hover:border-gold-400/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-gray-200/70 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                    {task.tag}
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {task.title}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400">
                  {task.owner} • <span className="text-gray-500 dark:text-gray-400">{task.due}</span>
                </p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${task.statusColor}`}
              >
                {task.status === "Done" ? "✓ " : ""}{task.status}
              </span>
            </div>
          ))}
        </div>

        {/* Sub-note */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span>Decisions automatically bind to accountable owners</span>
          <span className="text-brand-600 dark:text-gold-300 font-medium">3 actions tracked</span>
        </div>
      </div>

      <div className="hidden sm:block absolute -bottom-6 -left-6 z-20">
        <OperatorCharacter className="w-24 h-24" />
      </div>
    </div>
  );
}

// 3. Finance Module System Example
export function FinanceMockup() {
  const transactions = [
    {
      description: "Industrial Facility Power & Energy Supply",
      category: "Operations",
      amount: "₦4,200,000.00",
      status: "Approved",
      badge: "Maker & Checker Verified",
    },
    {
      description: "FIRS Withholding Tax Remittance",
      category: "Statutory Tax",
      amount: "₦750,000.00",
      status: "Approved",
      badge: "Verified Entry",
    },
    {
      description: "Dedicated Enterprise Network & Connectivity",
      category: "Utilities",
      amount: "₦380,000.00",
      status: "Pending",
      badge: "Awaiting Checker Approval",
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-2 bg-gradient-to-r from-brand-600/20 to-gold-400/20 rounded-3xl blur-xl opacity-75" />

      <div className="relative bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-2xl shadow-brand-950/20">
        {/* Header with Balance */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Corporate Ledger
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Operating Entity (NGN)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">30-Day Disbursed</span>
            <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
              ₦16,420,000
            </span>
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="mt-3 space-y-2.5">
          {transactions.map((tx) => (
            <div
              key={tx.description}
              className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {tx.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400">{tx.category}</span>
                  <span className="text-[10px] font-mono text-gray-300 dark:text-gray-600">•</span>
                  <span
                    className={`text-[10px] font-medium ${
                      tx.status === "Approved"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {tx.badge}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold font-mono text-gray-900 dark:text-white block">
                  {tx.amount}
                </span>
                <span
                  className={`inline-block text-[10px] font-medium px-2 py-0.2 rounded-full mt-0.5 ${
                    tx.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Maker-Checker Safeguard Banner */}
        <div className="mt-3 p-2.5 rounded-lg bg-gold-50/70 dark:bg-gold-500/10 border border-gold-200/60 dark:border-gold-400/20 flex items-center gap-2 text-[11px] text-gold-900 dark:text-gold-200">
          <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400 flex-shrink-0" />
          <span>Zero unapproved expenses. Every payment requires maker-checker authorization.</span>
        </div>
      </div>

      <div className="hidden sm:block absolute -bottom-6 -right-6 z-20">
        <FinanceCharacter className="w-24 h-24" />
      </div>
    </div>
  );
}

// 4. Dashboard Module System Example
export function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/20 via-gold-400/20 to-brand-700/20 rounded-3xl blur-xl opacity-75" />

      <div className="relative bg-white/80 dark:bg-brand-950/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-2xl shadow-brand-950/20">
        {/* Company Switcher Pill */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10">
            <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-gold-400" />
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              Primary Enterprise Entity
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Isolated Tenant
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-[10px] text-gray-400 block">Board Decisions</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">14 Passed</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              100% documented
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-[10px] text-gray-400 block">Pending Review</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">1 Action</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              Awaiting checker sign-off
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-[10px] text-gray-400 block">30-Day Cashflow</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
              ₦34.2M
            </span>
            <span className="text-[10px] text-brand-600 dark:text-gold-400 block mt-0.5">
              Balanced ledger
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <span className="text-[10px] text-gray-400 block">Statutory Readiness</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">96%</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              CAC & Tax current
            </span>
          </div>
        </div>

        {/* Real-time Activity Ticker */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span className="truncate">
            <strong className="text-gray-700 dark:text-gray-300">Latest:</strong> Resolution #BR-2024-04 approved by Board Signatory
          </span>
          <span className="text-gray-400 font-mono flex-shrink-0">Just now</span>
        </div>
      </div>
    </div>
  );
}

// 5. Professional Support Module System Example (Section 7)
export function ProfessionalSupportWidget() {
  const professionals = [
    {
      name: "Senior Partner — Corporate Law",
      role: "Corporate Commercial & CAC Specialist",
      credentials: "12+ yrs experience • Bar Certified",
      focus: "Board Resolutions, Share Restructuring, CAC Filings",
      status: "Available for Referral",
    },
    {
      name: "Lead Partner — Tax & Audit Advisory",
      role: "Chartered Tax Practitioner",
      credentials: "Fellow (ICAN, CITN) • Audit Specialist",
      focus: "FIRS Tax Audit, WHT Reconciliation, Pioneer Status",
      status: "Available for Referral",
    },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="absolute -inset-2 bg-gradient-to-r from-gold-500/25 to-brand-500/25 rounded-3xl blur-xl opacity-80" />

      <div className="relative bg-white/90 dark:bg-brand-950/90 backdrop-blur-xl border border-gold-200/70 dark:border-gold-400/30 rounded-2xl p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gold-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 dark:text-gold-300">
              Vetted Professional Advisory Network
            </h4>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Strict Consent Model
          </span>
        </div>

        {/* Directory Cards */}
        <div className="mt-3.5 space-y-3">
          {professionals.map((pro) => (
            <div
              key={pro.name}
              className="p-3.5 rounded-xl bg-gold-50/50 dark:bg-white/5 border border-gold-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                    {pro.name}
                  </h5>
                  <span className="text-[10px] font-semibold text-brand-700 dark:text-gold-300 bg-brand-50 dark:bg-brand-900/60 px-1.5 py-0.2 rounded">
                    Vetted ✓
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                  {pro.role} • <span className="text-gray-500 text-[11px]">{pro.credentials}</span>
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Scope: {pro.focus}
                </p>
              </div>

              <button
                type="button"
                className="self-start sm:self-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-brand-950 transition-colors shadow-sm flex items-center gap-1 flex-shrink-0"
              >
                Request Intro <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Confidentiality Commitment Banner */}
        <div className="mt-3.5 pt-3 border-t border-gold-100 dark:border-white/10 flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-300">
          <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Zero Automatic Disclosure:</strong> Truvara never shares your documents or business financials without your explicit one-time authorization.
          </span>
        </div>
      </div>

      {/* Floating Animated Legal Advisor Character */}
      <div className="hidden sm:block absolute -top-8 -right-6 z-20">
        <LegalAdvisorCharacter className="w-24 h-24" />
      </div>
    </div>
  );
}
