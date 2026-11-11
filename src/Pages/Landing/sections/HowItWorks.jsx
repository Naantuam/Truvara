import { Section, Eyebrow } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";

const HOW_IT_WORKS = [
  { step: "1", title: "Create your workspace", desc: "Set up your company's own private space in Truvara." },
  { step: "2", title: "Describe your business", desc: "Location, industry, structure, team size and stage." },
  { step: "3", title: "Organise records and obligations", desc: "See what you have, what's missing, and what's worth a professional look." },
  { step: "4", title: "Manage business activity", desc: "Decisions, actions, finances and visibility, all in one place." },
];

// A connecting wave/timeline (Spendesk's "90 days" reference) instead of
// four flat boxed cards. The SVG path is a decorative approximation of the
// step offsets below it, not a precise plot -- it's meant to read as "a path
// through the steps", not a chart.
export default function HowItWorks() {
  return (
    <Section className="overflow-hidden">
      <div className="relative">
        <GoldVinePattern
          className="hidden lg:block absolute -left-6 -top-10 w-36 h-auto text-gold-500/40 dark:text-gold-300/25 pointer-events-none"
        />
        <Eyebrow>How it works</Eyebrow>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-black dark:text-white mb-12 text-balance">
          From sign-up to a working system, in four steps.
        </h2>
      </div>
      <div className="relative">
        <svg
          className="hidden lg:block absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-32 text-brand-300/60 dark:text-gold-400/30"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0,95 C150,95 150,15 300,15 C450,15 450,95 600,95 C750,95 750,5 900,5 C1050,5 1050,55 1200,55"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
        </svg>
        <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <div
              key={s.step}
              className={`flex flex-col items-start lg:items-center text-left lg:text-center ${["lg:mt-14", "lg:mt-0", "lg:mt-14", "lg:mt-3"][i] || ""
                }`}
            >
              <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-gold-600 dark:bg-gold-400 text-white dark:text-brand-950 text-xs font-black mb-3 shadow-md">
                Step {s.step}
              </span>
              <h3 className="font-extrabold text-black dark:text-white mb-1.5 text-base sm:text-lg">{s.title}</h3>
              <p className="text-sm font-semibold text-black dark:text-white leading-relaxed max-w-[16rem]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
