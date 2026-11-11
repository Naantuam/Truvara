import { Section } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";

// Each of these is a real, verified mechanism already built into Truvara
// (not marketing copy) -- maker-checker approval, server-side permission
// enforcement, an immutable audit trail and per-company tenant isolation
// are all things reviewed directly in the codebase, not claims invented for
// this page. Plain text, no icon/box per item (Emily, 2026-10-29: "remove
// this boxes and arrange the text") -- the Bujeti reference wasn't meant to
// be copied directly, just the idea of plain text stacked on its own.
const TRUST_POINTS = [
  {
    title: "No one approves their own entry",
    desc: "Whoever records a decision or a transaction can't be the one who approves it enforced by the system, not a house rule.",
  },
  {
    title: "Nothing is hidden, only restricted",
    desc: "Permissions are checked on the server for every action, not just hidden buttons in the interface. What a role can't do, it genuinely can't do.",
  },
  {
    title: "A full history of every change",
    desc: "Every decision, approval, edit and transaction is logged with who did it and when nothing is silently overwritten.",
  },
  {
    title: "Your company's data stays yours",
    desc: "Each business's records live in their own isolated space. Managing more than one company never mixes their data together.",
  },
];

// Real photo (Emily's own, a silhouetted sunset -- not AI-generated), used as
// a full-width hero band roughly half the viewport tall (Emily, 2026-10-30:
// "the heading takes about half the full screen view", matching the Bujeti
// reference's proportions) with the trust points sitting below it, outside
// the image entirely (the reference's second screenshot: "items are under
// the heading with the globe image above").
//
// This isn't dropped in as a plain photo with a dark scrim -- it's blended
// with a brand-green gradient overlay (Emily: "blend the image into the
// background with an overlay") so the warm sunset tones read as part of
// Truvara's own palette rather than a generic stock photo.
//
// Split by theme rather than chasing one color that works for both
// (Emily, 2026-10-30: "on dark mode use the original design, on light mode
// make this adjustment... background as white"):
// - Dark mode: the original treatment -- solid brand-900 panel, a heavier
//   brand-900 multiply tint on the photo.
// - Light mode: a white panel instead of dark green, with a lighter/whitish
//   tint on the photo so it doesn't fight a white background, and the trust
//   point text goes back to dark-on-white (white-on-white would be invisible).
export default function TrustSecurity() {
  return (
    <div className="relative bg-white dark:bg-brand-900">
      <div className="relative w-full min-h-[50vh] sm:min-h-[60vh] flex items-end overflow-hidden">
        <img
          src="/assets/trust-hero-sunset.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay dark:bg-brand-900/55 dark:mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 dark:from-brand-900 dark:via-brand-900/15 to-transparent" />

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-300 mb-3">Built to earn your trust</p>
          <h2 className="text-4xl sm:text-6xl font-bold text-brand-900 dark:text-white max-w-2xl text-balance">
            Not just promises things the system actually enforces.
          </h2>
        </div>
      </div>

      {/* Two columns, two rows with a divider between them -- the exact
          arrangement from the Bujeti stats reference (big bold line, smaller
          muted line underneath, a rule above the first row and between the
          two rows), not a single four-across row. */}
      <Section className="pt-0 pb-12 sm:pb-16 overflow-hidden">
        <div className="relative border-t border-gray-200 dark:border-white/10">
          <GoldVinePattern
            className="hidden lg:block absolute -right-6 top-6 w-36 h-auto text-gold-500/35 dark:text-gold-300/25 pointer-events-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 py-10 sm:py-12 border-b border-gray-200 dark:border-white/10">
            {TRUST_POINTS.slice(0, 2).map((t) => (
              <div key={t.title}>
                <h3 className="font-extrabold text-black dark:text-white mb-2 text-xl sm:text-2xl text-balance">{t.title}</h3>
                <p className="text-base font-semibold text-black dark:text-white/70 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 py-10 sm:py-12">
            {TRUST_POINTS.slice(2, 4).map((t) => (
              <div key={t.title}>
                <h3 className="font-extrabold text-black dark:text-white mb-2 text-xl sm:text-2xl text-balance">{t.title}</h3>
                <p className="text-base font-semibold text-black dark:text-white/70 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
