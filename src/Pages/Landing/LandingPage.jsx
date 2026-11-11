import useTheme from "../../Reusable/useTheme";
import AmbientBackdrop from "./components/AmbientBackdrop";
import Nav from "./sections/Nav";
import Hero from "./sections/Hero";
import WhatTruvaraDoes from "./sections/WhatTruvaraDoes";
import WhoItServes from "./sections/WhoItServes";
import HowItWorks from "./sections/HowItWorks";
import BusinessReadiness from "./sections/BusinessReadiness";
import ProfessionalSupport from "./sections/ProfessionalSupport";
import TrustSecurity from "./sections/TrustSecurity";
import FAQ from "./sections/FAQ";
import ClosingCTA from "./sections/ClosingCTA";
import Footer from "./sections/Footer";

// Public, unauthenticated marketing page -- per the Landing Page guide
// (Section 4): copy, section order and FAQ answers are deliberately taken
// almost verbatim from that document, including its guardrail language
// (Section 2: never imply Truvara is a regulator/law firm/accounting firm,
// never promise automatic compliance). No screenshots of real product data
// here on purpose (4.3: "use only approved screenshots without live
// customer data") -- hand-built UI mockups (components/SystemMockups.jsx,
// components/HeroProductPreview.jsx) and bespoke SVG illustrations
// (components/AnimatedCharacters.jsx) stand in for actual product
// screenshots, rather than AI-generated images.
//
// Visual direction (Emily, 2026-10-27): glassmorphism in both light and
// dark -- frosted panels over a green gradient, with drifting leaves and
// cloud shapes animating behind the glass, same theme toggle as the rest
// of the app (useTheme/SunMoonToggle, Tailwind's class-based dark mode).
//
// Each section lives in its own file under ./sections (Emily, 2026-10-29:
// "break the code into sections"). Shared pieces (Section/Eyebrow/GlassCard,
// useRevealOnScroll, the logo asset paths) live in ./components and
// ./constants.js so every section imports from the same place instead of
// duplicating them.
//
// `theme`/`toggleTheme` are read once here via useTheme (plain local state,
// no shared context behind it) and passed down to Nav and Footer -- calling
// useTheme() independently in each would let them drift out of sync with
// each other.
export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="w-full min-h-screen relative bg-white dark:bg-gradient-to-b dark:from-brand-600 dark:via-brand-700 dark:to-brand-900 text-black dark:text-white transition-colors duration-300"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      <style>{`
        @keyframes drift-cloud {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.85; }
          50% { transform: translate(2.5rem, 1.5rem) scale(1.1); opacity: 1; }
        }
        .animate-drift-cloud { animation-name: drift-cloud; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }

        @keyframes drift-leaf {
          0% { transform: translateY(0) rotate(var(--leaf-rotate, 0deg)); }
          50% { transform: translateY(-1.5rem) rotate(calc(var(--leaf-rotate, 0deg) * -1)); }
          100% { transform: translateY(0) rotate(var(--leaf-rotate, 0deg)); }
        }
        .animate-drift-leaf { animation-name: drift-leaf; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }

        /* Scroll-reveal: each section's content starts slightly lower and
           transparent, then eases into place the first time it enters the
           viewport (see useRevealOnScroll in components/LandingPrimitives.jsx)
           -- this is the "motion when scrolling" itself, not the ambient
           background loop, which runs regardless of scroll position. */
        .reveal { opacity: 0; transform: translateY(2.5rem); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .animate-drift-cloud, .animate-drift-leaf { animation: none; }
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      <AmbientBackdrop />

      <Nav theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <WhatTruvaraDoes />
      <WhoItServes />
      <HowItWorks />
      <BusinessReadiness />
      <ProfessionalSupport />
      <TrustSecurity />
      <FAQ />
      <ClosingCTA />
      <Footer theme={theme} />
    </div>
  );
}
