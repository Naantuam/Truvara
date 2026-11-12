import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Section } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";

export default function ClosingCTA() {
  return (
    <Section className="text-center overflow-hidden">
      <div className="relative">
        <GoldVinePattern
          className="hidden lg:block absolute left-1/2 -translate-x-[220px] top-1/2 -translate-y-1/2 w-40 h-auto text-gold-500/35 dark:text-gold-300/25 pointer-events-none"
        />
        <GoldVinePattern
          flip
          className="hidden lg:block absolute left-1/2 translate-x-[180px] top-1/2 -translate-y-1/2 w-40 h-auto text-gold-500/35 dark:text-gold-300/25 pointer-events-none"
        />
        <h2 className="relative text-2xl sm:text-4xl font-extrabold text-black dark:text-white mb-5 text-balance max-w-3xl mx-auto leading-tight">
          Truvara shouldn't only help a business run. It should help a business get ready to run well.
        </h2>
        <Link
          to="/register"
          className="relative group inline-flex items-center gap-2 mt-2 text-lg sm:text-xl font-bold text-brand-600 dark:text-gold-300 underline decoration-2 underline-offset-4 decoration-gold-400/80 hover:decoration-gold-400 transition-colors"
        >
          Create a Business Account
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Section>
  );
}
