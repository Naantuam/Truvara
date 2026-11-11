import { LayoutGrid, FileText, ListChecks, DollarSign } from "lucide-react";
import { Section, Eyebrow } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";
import {
  GovernanceMockup,
  OperationsMockup,
  FinanceMockup,
  DashboardMockup,
} from "../components/SystemMockups";

const MODULE_MOCKUPS = {
  Governance: GovernanceMockup,
  Operations: OperationsMockup,
  Finance: FinanceMockup,
  Dashboard: DashboardMockup,
};

const MODULES = [
  { name: "Governance", desc: "No decision moves forward without a clear, independent approval never from the person who made it.", icon: FileText },
  { name: "Operations", desc: "Every responsibility has a named owner, so nothing quietly falls through after a decision is made.", icon: ListChecks },
  { name: "Finance", desc: "Every transaction is checked before it counts recorded, reviewed, and never self-approved.", icon: DollarSign },
  { name: "Dashboard", desc: "Everything happening across your business, in one real-time view.", icon: LayoutGrid },
];

// Alternating full-width rows with real system UI mockups and animated
// characters. Just the gold eyebrow tag, no standalone heading sentence
// listing the four module names (Emily, 2026-10-29: "do without this
// heading") -- a short, simple header instead, since each module's own pill
// badge below already labels it individually.
export default function WhatTruvaraDoes() {
  return (
    <>
      <Section className="pb-4 sm:pb-6 overflow-hidden">
        <div className="relative">
          <GoldVinePattern
            flip
            className="hidden lg:block absolute -right-4 -top-6 w-40 h-auto text-gold-500/40 dark:text-gold-300/25 pointer-events-none"
          />
          <Eyebrow>What Truvara does</Eyebrow>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-black dark:text-white text-balance">
            One connected system, not four separate tools.
          </h2>
        </div>
      </Section>
      {MODULES.map((m, i) => {
        const MockupComponent = MODULE_MOCKUPS[m.name];
        return (
          <Section key={m.name} className="py-8 sm:py-14">
            <div className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}>
              <div className="w-full lg:w-7/12 flex items-center justify-center">
                {MockupComponent ? (
                  <MockupComponent />
                ) : (
                  <div className="relative flex-shrink-0 w-full flex items-center justify-center py-6">
                    <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-brand-100/80 dark:bg-brand-500/20 blur-3xl" aria-hidden="true" />
                    <m.icon className="relative w-16 h-16 sm:w-20 sm:h-20 text-brand-600 dark:text-gold-300" strokeWidth={1.25} />
                  </div>
                )}
              </div>
              <div className="w-full lg:w-5/12 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-white/15 text-brand-800 dark:text-gold-300 text-xs font-bold mb-3 border border-brand-200/70 dark:border-white/20">
                  <m.icon className="w-3.5 h-3.5" />
                  <span>{m.name} Module</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white mb-3 tracking-tight">{m.name}</h3>
                <p className="text-base sm:text-lg font-medium text-black dark:text-white leading-relaxed">{m.desc}</p>
              </div>
            </div>
          </Section>
        );
      })}
    </>
  );
}
