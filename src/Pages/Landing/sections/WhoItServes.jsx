import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";
import {
  FounderScene,
  GrowthScene,
  EnterpriseScene,
  MultiEntityScene,
} from "../components/AudienceScenes";

const AUDIENCES = [
  {
    stage: "Stage 01 • Early Stage & Pre-Seed",
    label: "Founders",
    scene: FounderScene,
    desc: "Starting out and need decisions, finances, and operational milestones organised from day one not retrofitted when investors or auditors ask.",
    highlights: [
      "Clean day-one inception ledger",
      "Documented founder resolutions",
      "CAC & investor audit readiness",
    ],
    gradient: "from-brand-800 to-brand-950",
    photo: "/assets/audiences/founders.jpg",
  },
  {
    stage: "Stage 02 • 10 to 50 Team Members",
    label: "Small & growing businesses",
    scene: GrowthScene,
    desc: "Outgrown chaotic spreadsheets and lost WhatsApp threads, but not ready for slow, bureaucratic, foreign enterprise software.",
    highlights: [
      "Replaces scattered WhatsApp approvals",
      "Clear ownership on every workflow",
      "Automatic statutory filing deadlines",
    ],
    gradient: "from-brand-700 to-brand-900",
    photo: "/assets/audiences/growing-business.jpg",
  },
  {
    stage: "Stage 03 • Mature Corporate Operations",
    label: "Established companies",
    scene: EnterpriseScene,
    desc: "Already running well, but looking for an immutable record of who decided what, who approved it, and when.",
    highlights: [
      "Mandatory Maker-Checker signatories",
      "Cryptographic SHA-256 audit trails",
      "Full board governance compliance",
    ],
    gradient: "from-emerald-950 to-brand-950",
    photo: "/assets/audiences/established.jpg",
  },
  {
    stage: "Stage 04 • Multi-Entity Conglomerates",
    label: "Multi-business owners",
    scene: MultiEntityScene,
    desc: "Running more than one company, needing each company's ledgers, governance, and teams kept strictly isolated.",
    highlights: [
      "100% database tenant isolation",
      "Zero cross-company data leakage",
      "Unified group view for principals",
    ],
    gradient: "from-brand-900 to-black",
    photo: "/assets/audiences/multi-business.jpg",
  },
];

const COUNT = AUDIENCES.length;

// A real horizontal swiper driven by normal page scrolling: this section is
// tall (COUNT x 100vh), with a full-screen view pinned (sticky) inside it.
// As you scroll down through that tall range, the row of full-screen slides
// drags left in lockstep with scroll position -- scroll down, item 2 slides
// in from the right; scroll back up, it reverses.
export default function WhoItServes() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef(null);
  const lastActive = useRef(0);

  useEffect(() => {
    const updateTarget = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      targetProgress.current = (scrolled / scrollable) * (COUNT - 1);
    };

    const loop = () => {
      // Smooth interpolation for silky, responsive horizontal scroll
      const diff = targetProgress.current - currentProgress.current;
      if (Math.abs(diff) > 0.0002) {
        currentProgress.current += diff * 0.14;
        if (trackRef.current) {
          const percent = (currentProgress.current / (COUNT - 1)) * (100 - 100 / COUNT);
          trackRef.current.style.transform = `translate3d(-${percent}%, 0, 0)`;
        }
        const rounded = Math.round(currentProgress.current);
        if (rounded !== lastActive.current) {
          lastActive.current = rounded;
          setActiveIndex(rounded);
        }
      }
      rafId.current = requestAnimationFrame(loop);
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget, { passive: true });
    updateTarget();
    currentProgress.current = targetProgress.current;
    if (trackRef.current) {
      const percent = (currentProgress.current / (COUNT - 1)) * (100 - 100 / COUNT);
      trackRef.current.style.transform = `translate3d(-${percent}%, 0, 0)`;
    }
    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const goTo = (index) => {
    const el = wrapperRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    const targetY = el.offsetTop + (scrollable * index) / (COUNT - 1);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <div ref={wrapperRef} className="relative" style={{ height: `${COUNT * 85}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white dark:bg-brand-950">
        {/* Sits above the photo but below the heading/counter row -- opacity
            kept higher here than other placements since it has to read
            against a photo, not a plain background. */}
        <GoldVinePattern
          flip
          className="hidden lg:block absolute right-6 top-20 z-10 w-32 h-auto text-gold-400/70 pointer-events-none"
        />
        {/* Heading overlay */}
        <div className="absolute top-0 inset-x-0 z-20 px-4 sm:px-6 pt-5 sm:pt-8 pointer-events-none">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <Eyebrow>Who it serves</Eyebrow>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-900 dark:text-white tracking-tight">
                Built for businesses at every stage.
              </h2>
            </div>
            {/* Slide counter indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-brand-900/60 backdrop-blur-md border border-gray-200 dark:border-white/15 text-xs font-mono text-brand-700 dark:text-emerald-200">
              <span className="font-bold text-gold-600 dark:text-gold-400">0{activeIndex + 1}</span>
              <span className="text-gray-400 dark:text-white/40">/</span>
              <span>0{COUNT}</span>
            </div>
          </div>
        </div>

        {/* The sliding row -- hardware accelerated translate3d driven by RAF loop */}
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{
            width: `${COUNT * 100}%`,
          }}
        >
          {AUDIENCES.map((a) => {
            const SceneComponent = a.scene;
            return (
              <div
                key={a.label}
                className="relative h-full flex-shrink-0 flex items-center"
                style={{ width: `${100 / COUNT}%` }}
              >
                {/* Clearer background photo with authentic office depth */}
                <div className="absolute inset-0 overflow-hidden bg-white dark:bg-brand-950">
                  {a.photo && (
                    <img
                      src={a.photo}
                      alt={a.label}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 dark:opacity-60 scale-105 filter brightness-100 dark:brightness-90 contrast-110"
                    />
                  )}
                </div>

                {/* Soft directional scrim: readable text on left, open and clear photo on right.
                    Light mode washes toward white instead of the dark brand tint, since the
                    text below switches to dark-on-light there too. */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/30 dark:from-brand-950/95 dark:via-brand-950/70 dark:to-brand-950/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/50 dark:from-brand-950/90 dark:via-transparent dark:to-brand-950/60" />

                {/* Ambient glow accent that subtly merges character with background */}
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

                {/* Slide content container: tighter, balanced 2-column layout */}
                <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                    {/* Left: Stage information, narrative, and capability pills */}
                    <div className="lg:col-span-6 text-left order-2 lg:order-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-800/90 border border-gold-500/40 text-gold-300 text-xs font-bold tracking-wide uppercase mb-3 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                        {a.stage}
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-900 dark:text-white mb-2.5 tracking-tight leading-tight">
                        {a.label}
                      </h3>

                      <p className="text-sm sm:text-base font-semibold text-black dark:text-white leading-relaxed mb-4 max-w-lg">
                        {a.desc}
                      </p>

                      {/* Benefit pills */}
                      <div className="space-y-1.5 max-w-md">
                        {a.highlights.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-black dark:text-white bg-white/60 dark:bg-brand-950/50 backdrop-blur-sm border border-gray-300 dark:border-white/15 rounded-lg px-2.5 py-1.5 tracking-tight leading-snug shadow-sm"
                          >
                            <div className="w-4 h-4 rounded-full bg-gold-500/25 text-gold-600 dark:text-gold-300 flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                              ✓
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: The animated vector scene crafted to seamlessly merge with the background */}
                    <div className="lg:col-span-6 order-1 lg:order-2 flex items-center justify-center">
                      <div className="w-full max-w-md bg-white/50 dark:bg-brand-950/40 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 p-2 sm:p-4 shadow-xl shadow-black/10 dark:shadow-black/40 relative group hover:border-gold-500/30 transition-all duration-300">
                        {/* Animated Character Scene - tighter and proportional */}
                        <div className="w-full aspect-[4/3] max-h-[290px] flex items-center justify-center">
                          <SceneComponent className="w-full h-full" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-5 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center pointer-events-auto">
          <div className="flex items-center gap-2.5">
            {AUDIENCES.map((a, i) => (
              <button
                key={a.label}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${a.label}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-8 bg-gold-500 shadow-sm shadow-gold-500/50"
                    : "w-2 bg-brand-900/30 hover:bg-brand-900/60 dark:bg-white/30 dark:hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
