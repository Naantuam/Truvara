import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Section, Eyebrow } from "../components/LandingPrimitives";
import GoldVinePattern from "../components/GoldVinePattern";

const FAQS = [
  {
    q: "Is Truvara a regulator?",
    a: "No. Truvara is not a government portal, regulator, law firm, accounting firm or tax authority. It helps you organise information and flags things that may be worth professional review -- the actual filings, registrations and determinations remain with qualified professionals and the relevant authorities.",
  },
  {
    q: "Does it register my business automatically?",
    a: "No. Truvara does not file anything on your behalf. It helps you track your registration status and documents, and can connect you with vetted professionals if you need help registering.",
  },
  {
    q: "Can I invite staff?",
    a: "Yes. Once your workspace is set up, you can invite team members and control exactly what each person can see and do.",
  },
  {
    q: "Can I add documents later?",
    a: "Yes. Onboarding can be completed in stages -- add what you have now and come back for the rest whenever it's ready.",
  },
  {
    q: "Can I manage multiple businesses?",
    a: "Yes. One account can belong to several companies, and each company's records stay fully separate from the others.",
  },
];

// Two-column layout with a plain click-to-expand accordion on the right
// (Spendesk reference) -- intro + CTA on the left, no boxed cards on the
// right, just questions separated by divider lines that expand in place.
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <Section id="faq">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5 relative">
          <GoldVinePattern
            className="hidden lg:block absolute -left-10 -top-4 w-56 h-auto text-gold-500/60 dark:text-gold-300/35 pointer-events-none"
          />
          <div className="relative">
            <Eyebrow>Frequently asked questions</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-4 text-balance">
              Good questions to ask before you start.
            </h2>
            <p className="text-base font-semibold text-black dark:text-white/70 leading-relaxed mb-6 max-w-sm">
              It can be hard to know what to ask before trusting a new system with your business. We're happy to
              answer anything this list doesn't cover.
            </p>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 bg-brand-600 dark:bg-brand-400 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-brand-900/20 hover:bg-brand-500 dark:hover:bg-brand-300 transition-colors"
            >
              Get more answers
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="border-t border-gray-200 dark:border-white/10">
            {FAQS.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={f.q} className="border-b border-gray-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-bold text-black dark:text-white text-base sm:text-lg">{f.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-gold-600 dark:text-gold-300" : "text-black dark:text-white"}`}
                    />
                  </button>
                  <div
                    className="grid overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0">
                      <p className="text-sm font-semibold text-black dark:text-white/70 leading-relaxed pb-5 pr-8">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
