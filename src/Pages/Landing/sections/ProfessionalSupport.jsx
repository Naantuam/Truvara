import { Section, Eyebrow, GlassCard } from "../components/LandingPrimitives";
import { ProfessionalSupportWidget } from "../components/SystemMockups";
import GoldVinePattern from "../components/GoldVinePattern";

export default function ProfessionalSupport() {
  return (
    <Section>
      <GlassCard className="relative overflow-hidden bg-gold-50/60 dark:bg-gold-500/15 border-gold-200/70 dark:border-gold-400/50 p-6 sm:p-10">
        <GoldVinePattern
          flip
          className="hidden lg:block absolute -right-10 -bottom-10 w-52 h-auto text-gold-500/40 dark:text-gold-300/30 pointer-events-none"
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <Eyebrow>Professional support</Eyebrow>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black dark:text-white mb-4 text-balance">
              When you need an expert, Truvara can help you find one.
            </h2>
            <p className="text-sm sm:text-base font-semibold text-black dark:text-white leading-relaxed">
              Where relevant, you can request a referral to a vetted legal, accounting, tax, HR or sector-specific
              professional subject to availability, and only with your explicit consent to share information.
              Truvara never shares your documents without your permission.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ProfessionalSupportWidget />
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}
