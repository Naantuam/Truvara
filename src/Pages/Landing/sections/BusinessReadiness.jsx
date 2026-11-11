import { useState, useEffect } from "react";
import { FileCheck2, Landmark, Users, FolderOpen, ShieldAlert, ArrowUpRight } from "lucide-react";
import { Section, Eyebrow, MotionDiv } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";
import {
  CacRegistrationScene,
  TaxProfileScene,
  WorkforceScene,
  DocumentsVaultScene,
  SectorObligationsScene,
} from "../components/ReadinessScenes";

// Widget values are illustrative examples, not real customer data (same
// guardrail as the rest of the page's mockups).
const READINESS_ITEMS = [
  {
    title: "Registration status",
    badge: "CAC Compliance",
    desc: "Know exactly where your business stands with CAC - what's filed, what's pending, and what's next.",
    icon: FileCheck2,
    scene: CacRegistrationScene,
    widget: { label: "CAC Registration", value: "Verified", valueColor: "text-emerald-300" },
    compactValue: "Verified",
  },
  {
    title: "Tax profile",
    badge: "FIRS & Statutory",
    desc: "See your TIN, VAT and filing status at a glance, instead of digging through old emails.",
    icon: Landmark,
    scene: TaxProfileScene,
    widget: { label: "TIN Status", value: "Active", valueColor: "text-emerald-300" },
    compactValue: "Active",
  },
  {
    title: "Workforce details",
    badge: "Headcount & Roles",
    desc: "Keep headcount and roles current as your team grows, so your records don't lag behind reality.",
    icon: Users,
    scene: WorkforceScene,
    widget: { label: "Employees", value: "12 Active", valueColor: "text-gold-300" },
    compactValue: "12 Staff",
  },
  {
    title: "Documents on file",
    badge: "Corporate Vault",
    desc: "Track what's uploaded and what's still missing, before someone asks for it urgently.",
    icon: FolderOpen,
    scene: DocumentsVaultScene,
    widget: { label: "Uploaded", value: "8 / 10", valueColor: "text-amber-300" },
    compactValue: "8 / 10",
  },
  {
    title: "Relevant sector obligations",
    badge: "Regulatory Review",
    desc: "Flags what your industry may require, for your own review -- never a substitute for professional advice.",
    icon: ShieldAlert,
    scene: SectorObligationsScene,
    widget: { label: "Flagged for review", value: "3 Items", valueColor: "text-amber-300" },
    compactValue: "3 Flags",
  },
];

const AUTO_SWITCH_INTERVAL = 5500; // 5.5 seconds per card

// A selectable bento grid: automatically cycles through readiness stages with
// an active progress loader bar on the upcoming card, while allowing instant manual selection.
export default function BusinessReadiness() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const active = READINESS_ITEMS[activeIndex];
  const ordered = [active, ...READINESS_ITEMS.filter((_, i) => i !== activeIndex)];
  const nextIndex = (activeIndex + 1) % READINESS_ITEMS.length;

  // Automatically cycle through cards every 5.5s unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % READINESS_ITEMS.length);
    }, AUTO_SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, [activeIndex, isPaused]);

  return (
    <Section className="overflow-hidden">
      <style>{`
        @keyframes card-loader-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      <div className="relative max-w-3xl mb-10">
        <GoldVinePattern
          flip
          className="hidden lg:block absolute -right-10 -top-8 w-40 h-auto text-gold-500/40 dark:text-gold-300/25 pointer-events-none"
        />
        <Eyebrow>Business readiness</Eyebrow>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white mb-4 text-balance">
          Know what you have, and what might need attention.
        </h2>
        <p className="text-sm sm:text-base font-medium text-black dark:text-white/90 leading-relaxed">
          Truvara helps you organise the things a growing business is often asked about without pretending to
          replace the professionals who make the actual determinations. Select any item for a closer look.
        </p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 grid-flow-row-dense auto-rows-[10.5rem] sm:auto-rows-[11.5rem] gap-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {ordered.map((item) => {
          const originalIndex = READINESS_ITEMS.indexOf(item);
          const isActive = originalIndex === activeIndex;
          const isNext = originalIndex === nextIndex;
          const SceneComponent = item.scene;

          return (
            <MotionDiv
              key={item.title}
              layout
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setActiveIndex(originalIndex)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveIndex(originalIndex)}
              className={`relative rounded-2xl p-4 sm:p-5 cursor-pointer overflow-hidden transition-all duration-300 ${
                isActive
                  ? "col-span-2 row-span-2 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white shadow-xl shadow-brand-700/25 border-2 border-brand-400 dark:border-gold-400/50"
                  : isNext
                  ? "col-span-1 row-span-1 bg-brand-50/90 hover:bg-brand-100 border-2 border-brand-400 dark:bg-brand-900/90 dark:border-gold-400/70 shadow-md ring-2 ring-gold-400/30 group"
                  : "col-span-1 row-span-1 bg-brand-50/70 hover:bg-brand-100/70 border-2 border-brand-200/90 dark:bg-brand-900/80 dark:border-white/15 dark:hover:bg-brand-800/80 dark:hover:border-gold-400/60 shadow-sm hover:shadow-md group"
              }`}
            >
              {/* Progress Loader Bar shown ONLY on the upcoming next unselected card */}
              {isNext && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-200/80 dark:bg-white/15 overflow-hidden z-20">
                  <div
                    key={activeIndex}
                    className="h-full bg-gradient-to-r from-brand-600 via-gold-400 to-brand-500 dark:from-gold-400 dark:via-emerald-300 dark:to-white origin-left"
                    style={{
                      animation: `card-loader-progress ${AUTO_SWITCH_INTERVAL}ms linear forwards`,
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  />
                </div>
              )}

              {isActive ? (
                /* EXPANDED 2x2 CARD VIEW */
                <div className="h-full relative flex flex-col justify-between">
                  <div className="h-full grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                    
                    {/* Left Column: Text, Badge, and Ledger Pill */}
                    <div className="sm:col-span-7 flex flex-col justify-between h-full py-0.5">
                      <div>
                        {/* Category Badge & Live Pulse / Auto-cycle status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-[11px] font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-gold-300 animate-pulse" />
                            {item.badge}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 border border-white/20 text-white/90 text-[10px] font-mono tracking-wider font-semibold">
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-300" : "bg-emerald-300 animate-pulse"}`} />
                            <span>{isPaused ? "PAUSED" : `0${originalIndex + 1} / 0${READINESS_ITEMS.length}`}</span>
                          </div>
                        </div>

                        {/* Clear, Thicker White Heading */}
                        <h3 className="text-lg sm:text-2xl font-black text-white leading-tight mb-2">
                          {item.title}
                        </h3>

                        {/* Clear, Thicker White Narrative Description */}
                        <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Status Ledger Widget Pill */}
                      <div className="mt-2.5 bg-black/25 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/25 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/90 uppercase tracking-wider font-bold">
                            {item.widget.label}
                          </span>
                          <span className="text-xs text-white font-semibold">
                            Recorded in ledger
                          </span>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1 rounded-md ml-3 text-white bg-white/20 border border-white/30">
                          {item.widget.value}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Animated character scene strictly confined to its column */}
                    <div className="sm:col-span-5 h-full flex items-center justify-center">
                      <div className="w-full h-full max-h-[160px] sm:max-h-[210px] flex items-center justify-center">
                        <SceneComponent className="w-full h-full" />
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* COMPACT 1x1 UNSELECTED CARD */
                <div className="h-full flex flex-col justify-between">
                  {/* Top row: Icon bubble + mini status badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                      isNext
                        ? "bg-brand-600 text-white dark:bg-gold-400 dark:text-brand-950 shadow-sm"
                        : "bg-brand-100 text-brand-800 dark:bg-white/15 dark:text-gold-300"
                    }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md border text-brand-800 bg-brand-100/90 border-brand-300 dark:text-white dark:bg-white/15 dark:border-white/20">
                      {item.compactValue}
                    </span>
                  </div>

                  {/* Title & Status / Up Next indicator */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {isNext ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-gold-700 dark:text-gold-300 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-600 dark:bg-gold-400 animate-ping" />
                        <span>Up Next</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-brand-700 dark:text-gold-300 mt-1">
                        <span>Select</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </MotionDiv>
          );
        })}
      </div>
    </Section>
  );
}

