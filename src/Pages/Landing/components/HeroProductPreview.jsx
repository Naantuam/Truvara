import React, { useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Squares2X2Icon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  FileText,
  CheckSquare,
  Users,
  ListChecks,
  DollarSign,
  Settings as SettingsIcon,
  Search,
  Bell,
  ShieldCheck,
  TrendingUp,
  Building2,
  Lock,
  ChevronDown,
  ArrowUpRight,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
} from "lucide-react";
import { MotionDiv } from "./LandingPrimitives";

export default function HeroProductPreview() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewMode, setViewMode] = useState("both"); // "both", "desktop", "mobile"
  const prefersReducedMotion = useReducedMotion();
  // Slow, deliberate crossfade when switching views rather than an instant
  // swap -- longer than the rest of the page's animations on purpose, since
  // this is the one thing a visitor is likely to actually click.
  const switchTransition = { duration: prefersReducedMotion ? 0 : 0.9, ease: [0.4, 0, 0.2, 1] };

  return (
    <div className="mt-12 sm:mt-16 w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* View Switcher Controls (Desktop / Mobile Preview) */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="inline-flex items-center p-1 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-md border border-gray-200/80 dark:border-white/10 shadow-sm text-xs font-medium">
          <button
            onClick={() => setViewMode("both")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "both"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Desktop + Mobile
          </button>
          <button
            onClick={() => setViewMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "desktop"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop View
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "mobile"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile App
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Ambient lighting halo behind mockup */}
        <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-gold-500/20 to-brand-600/20 rounded-3xl blur-2xl opacity-60 dark:opacity-40 pointer-events-none" />

        {/* DESKTOP LAYOUT MOCKUP -- AnimatePresence gives it a proper fade
            +scale exit/enter when the view switcher changes, instead of
            popping in/out instantly. */}
        <AnimatePresence mode="sync">
        {(viewMode === "both" || viewMode === "desktop") && (
          <MotionDiv
            key="desktop-mockup"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={switchTransition}
            className="relative rounded-2xl border border-gray-200/80 dark:border-white/15 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl shadow-brand-950/20 overflow-hidden">
            {/* Browser Chrome Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100/90 dark:bg-gray-800/90 border-b border-gray-200/70 dark:border-white/10 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-400/80 inline-block" />
              </div>

              {/* Window Title (No URL) */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-gold-400" />
                <span>Enterprise Management System</span>
              </div>

              {/* Environment badge */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 dark:text-gold-300 bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-gold-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Production Tenant
              </div>
            </div>

            {/* Inner App Shell (Sidebar + TopBar + Main Content) */}
            <div className="flex h-[480px] sm:h-[560px] text-left">
              {/* Sidebar */}
              <aside className="w-48 sm:w-56 bg-brand-900 text-white flex-shrink-0 flex flex-col justify-between p-3.5 border-r border-brand-800/60 hidden md:flex">
                <div>
                  {/* Brand Mark in Sidebar */}
                  <div className="flex items-center gap-2 px-2 py-2 mb-4 border-b border-brand-800/60">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
                      <span className="text-gold-300 font-bold text-sm">T</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm tracking-wide text-white">TRUVARA</h3>
                      <p className="text-[10px] text-gold-300 font-medium">Business Management</p>
                    </div>
                  </div>

                  {/* Nav Items */}
                  <nav className="space-y-1 text-xs">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === "dashboard"
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-gray-300 hover:bg-brand-800/60 hover:text-white"
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4 text-gold-300" />
                      <span>Dashboard</span>
                    </button>

                    <div className="pt-2 pb-1 px-2.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Governance
                    </div>
                    <button
                      onClick={() => setActiveTab("decisions")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        activeTab === "decisions"
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-gray-300 hover:bg-brand-800/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-gray-300" />
                        <span>Decisions</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-700 text-gold-300">14</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("approvals")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        activeTab === "approvals"
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-gray-300 hover:bg-brand-800/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className="w-4 h-4 text-gray-300" />
                        <span>Approvals</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-gray-950">1</span>
                    </button>

                    <div className="pt-2 pb-1 px-2.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Operations
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-300 hover:bg-brand-800/40 cursor-default">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Responsibilities</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-300 hover:bg-brand-800/40 cursor-default">
                      <ListChecks className="w-4 h-4 text-gray-400" />
                      <span>Actions</span>
                    </div>

                    <div className="pt-2 pb-1 px-2.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Finance
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-gray-300 hover:bg-brand-800/40 cursor-default">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-gold-400" />
                        <span>Transactions</span>
                      </div>
                      <span className="text-[10px] font-mono text-gold-300">₦</span>
                    </div>
                  </nav>
                </div>

                {/* Logged in User Profile */}
                <div className="pt-3 border-t border-brand-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold-500 text-brand-950 font-bold flex items-center justify-center text-xs">
                      MD
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">Managing Director</p>
                      <p className="text-[10px] text-gold-300">Company Administrator</p>
                    </div>
                  </div>
                  <SettingsIcon className="w-4 h-4 text-gray-400" />
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-gray-50/70 dark:bg-gray-950 overflow-hidden">
                {/* TopBar */}
                <header className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Multi-Company Selector Pill */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200/70 transition-colors">
                      <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-gold-400" />
                      <span className="truncate max-w-[130px] sm:max-w-[200px]">Enterprise Workspace</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative hidden sm:block">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        readOnly
                        placeholder="Search decisions, expenses..."
                        className="w-44 lg:w-56 pl-8 pr-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 border-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                      />
                    </div>
                    <button className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-500" />
                    </button>
                  </div>
                </header>

                {/* Dashboard Inner Body */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Operating Balance</span>
                      <span className="text-base sm:text-lg font-bold font-mono text-gray-900 dark:text-white">₦42,850,000</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                        <TrendingUp className="w-3 h-3" /> Balanced ledger
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Governance Decisions</span>
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">14 Passed</span>
                      <span className="text-[10px] text-brand-600 dark:text-gold-400 block mt-0.5">100% Traceable</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Pending Approvals</span>
                      <span className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">1 Item</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Awaiting Signatory</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-2xs">
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 block">Statutory Compliance</span>
                      <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">96%</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">CAC & Tax Ready</span>
                    </div>
                  </div>

                  {/* 2-Column Split: Active Decisions & Pending Approvals */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                    {/* Left Column: Recent Decisions (7 cols) */}
                    <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-gold-400" />
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">Recent Board Decisions</h4>
                        </div>
                        <span className="text-[10px] text-brand-600 dark:text-gold-300 font-medium">View all 14</span>
                      </div>

                      <div className="space-y-2">
                        {/* Decision Item 1 */}
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              #BR-2024-04: Ikeja Facility Lease Renewal
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              Maker: Author • Approved by Signatory
                            </p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Approved ✓
                          </span>
                        </div>

                        {/* Decision Item 2 */}
                        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              #BR-2024-03: Industrial Diesel Vendor Mandate
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              Maker: Initiator • Value: ₦4,200,000
                            </p>
                          </div>
                          <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Approved ✓
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Maker-Checker Approvals Box (5 cols) */}
                    <div className="lg:col-span-5 bg-gold-50/50 dark:bg-gold-500/10 rounded-xl border border-gold-200/70 dark:border-gold-400/20 p-3.5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gold-200/50 dark:border-gold-400/20">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Maker-Checker Guard</h4>
                          </div>
                          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">1 Pending</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-gold-200/60 dark:border-gold-400/20">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                Q3 Statutory Filing & Audit Sign-off
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                Submitted by Legal • ₦850,000
                              </p>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold flex-shrink-0">
                              Review
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gold-200/50 dark:border-gold-400/20 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-gold-600" />
                          Strict Maker ≠ Checker
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Tenant Isolated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
        </AnimatePresence>

        {/* DOCKED MOBILE APP LAYOUT FRAME -- a real phone aspect ratio
            (~9:19.5, like a modern iPhone) via aspect-ratio rather than a
            height that just happens to fit whatever content is inside it,
            plus the hardware details (side buttons, status bar, home
            indicator) that make it read as an actual device, not a rounded
            rectangle. */}
        <AnimatePresence mode="sync">
        {(viewMode === "both" || viewMode === "mobile") && (
          <MotionDiv
            key={viewMode === "both" ? "mobile-docked" : "mobile-standalone"}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={switchTransition}
            whileHover={viewMode === "both" ? { y: -8 } : undefined}
            className={
              viewMode === "both"
                ? "hidden sm:block absolute -bottom-10 -right-4 lg:-right-8 w-64 lg:w-72 z-30"
                : "relative max-w-[280px] mx-auto w-full z-30 my-6"
            }
          >
            {/* Phone Outer Shell */}
            <div className="relative aspect-[9/19.5] rounded-[42px] p-2.5 bg-gray-900 shadow-2xl shadow-brand-950/40 border-4 border-gray-800 ring-1 ring-white/20">
              {/* Side hardware: volume rocker (left), power button (right) */}
              <span className="absolute -left-[3px] top-20 w-[3px] h-6 bg-gray-700 rounded-l-sm" />
              <span className="absolute -left-[3px] top-28 w-[3px] h-10 bg-gray-700 rounded-l-sm" />
              <span className="absolute -right-[3px] top-24 w-[3px] h-14 bg-gray-700 rounded-r-sm" />

              {/* Mobile Screen */}
              <div className="relative h-full rounded-[32px] bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden text-left text-xs border border-gray-100 dark:border-gray-800 flex flex-col">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[10px] font-semibold text-gray-900 dark:text-white flex-shrink-0">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <svg viewBox="0 0 16 12" className="w-3.5 h-3 fill-current"><rect x="0" y="7" width="3" height="5" rx="0.5" /><rect x="4.5" y="4.5" width="3" height="7.5" rx="0.5" /><rect x="9" y="2" width="3" height="10" rx="0.5" /><rect x="13" y="0" width="3" height="12" rx="0.5" opacity="0.35" /></svg>
                    <svg viewBox="0 0 16 12" className="w-3.5 h-3 fill-current"><path d="M8 10.5l-6-6c3.3-3.3 8.7-3.3 12 0l-6 6zm0-3.5l-3-3c1.7-1.7 4.3-1.7 6 0l-3 3z" /></svg>
                    <span className="flex items-center gap-0.5">
                      <span className="w-4 h-2.5 rounded-[2px] border border-current relative">
                        <span className="absolute inset-0.5 bg-current rounded-[1px]" style={{ width: "70%" }} />
                      </span>
                    </span>
                  </div>
                </div>

                {/* Dynamic Island / Speaker notch */}
                <div className="absolute top-2 inset-x-0 flex justify-center z-40">
                  <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-gray-800 mr-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
                  </div>
                </div>

                {/* Scrollable app content */}
                <div className="flex-1 overflow-hidden px-3 pt-1 pb-2 flex flex-col">
                  {/* Mobile App Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white">
                        T
                      </div>
                      <span className="font-bold text-xs truncate max-w-[110px]">Enterprise Co.</span>
                    </div>
                    <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
                      NGN ₦
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 mb-2 flex-shrink-0">Good morning, Managing Director</p>

                  {/* Mobile Quick Balance Card */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm mb-2.5 flex-shrink-0">
                    <span className="text-[9px] text-white/70 block uppercase tracking-wider">Available Balance</span>
                    <span className="text-sm font-bold font-mono">₦42,850,000</span>
                    <div className="flex items-center justify-between text-[9px] text-gold-300 mt-1">
                      <span>14 Resolutions Active</span>
                      <span>96% Compliant</span>
                    </div>
                  </div>

                  {/* Quick actions row */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2.5 flex-shrink-0">
                    {[
                      { label: "Approve", icon: CheckSquare },
                      { label: "Decide", icon: FileText },
                      { label: "Pay", icon: DollarSign },
                      { label: "Team", icon: Users },
                    ].map((a) => (
                      <div key={a.label} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                          <a.icon className="w-3.5 h-3.5 text-brand-600 dark:text-gold-400" />
                        </div>
                        <span className="text-[8px] text-gray-500 dark:text-gray-400">{a.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Card Pending */}
                  <div className="p-2 rounded-lg bg-gold-50 dark:bg-white/5 border border-gold-200/60 dark:border-gold-400/20 mb-2.5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                        <span className="text-[10px] font-bold text-gray-900 dark:text-white">Requires Approval</span>
                      </div>
                      <span className="text-[8px] bg-amber-500 text-gray-950 px-1 rounded-full font-bold">1</span>
                    </div>
                    <p className="text-[9px] text-gray-600 dark:text-gray-300 mt-1 truncate">
                      Q3 Statutory Audit Sign-off
                    </p>
                    <button className="w-full mt-1.5 py-1 text-[9px] font-bold text-center rounded bg-brand-600 text-white hover:bg-brand-500 transition-colors">
                      Review & Authorize
                    </button>
                  </div>

                  {/* 7-day spend mini chart */}
                  <div className="mb-2.5 flex-shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">This Week's Spend</span>
                    <div className="flex items-end gap-1.5 h-10">
                      {[35, 55, 40, 70, 50, 90, 60].map((h, idx) => (
                        <div key={idx} className="flex-1 bg-brand-100 dark:bg-white/10 rounded-sm overflow-hidden flex items-end h-full">
                          <div
                            className={`w-full rounded-sm ${idx === 5 ? "bg-gold-500" : "bg-brand-500 dark:bg-brand-400"}`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="space-y-1.5 flex-shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Recent Activity</span>
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-between text-[10px]">
                      <div className="truncate mr-1">
                        <p className="font-semibold truncate">Diesel Supply (5,000L)</p>
                        <p className="text-[8px] text-gray-400">Energy Utility • Verified</p>
                      </div>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-[9px] flex-shrink-0">
                        -₦4.2M
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-between text-[10px]">
                      <div className="truncate mr-1">
                        <p className="font-semibold truncate">FIRS WHT Remittance</p>
                        <p className="text-[8px] text-gray-400">Statutory Tax • Verified</p>
                      </div>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-[9px] flex-shrink-0">
                        -₦750K
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Bottom Bar Navigation */}
                <div className="px-3 pt-2 pb-1.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around text-gray-400 flex-shrink-0">
                  <div className="flex flex-col items-center text-brand-600 dark:text-gold-400">
                    <Squares2X2Icon className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold mt-0.5">Home</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[8px] mt-0.5">Decisions</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-[8px] mt-0.5">Finance</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[8px] mt-0.5">Team</span>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-1.5 flex-shrink-0">
                  <span className="w-24 h-1 rounded-full bg-gray-900 dark:bg-white" />
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
