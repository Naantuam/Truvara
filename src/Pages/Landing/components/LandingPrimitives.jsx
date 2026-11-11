import { motion } from "framer-motion";
import useRevealOnScroll from "../hooks/useRevealOnScroll";

// Aliased to a plain identifier -- this project's eslint config has no
// JSX-aware plugin, so `<motion.div>` (a JSXMemberExpression) doesn't
// register as a use of `motion` and trips no-unused-vars. Shared here so
// every section imports the same alias instead of redefining it.
export const MotionDiv = motion.div;

// Shared section wrapper -- fixed horizontal padding/max-width and the
// scroll-reveal fade-in every landing page section uses.
export function Section({ children, className = "", id }) {
  const [ref, visible] = useRevealOnScroll();
  return (
    <section id={id} className={`relative w-full px-4 sm:px-6 py-16 sm:py-20 ${className}`}>
      <div ref={ref} className={`reveal max-w-6xl mx-auto ${visible ? "reveal-visible" : ""}`}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400 mb-3">{children}</p>;
}

export function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white/55 dark:bg-white/10 backdrop-blur-md border border-white/70 dark:border-white/15 rounded-2xl shadow-lg shadow-brand-900/5 dark:shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}
