import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Section } from "../components/LandingPrimitives";
import HeroProductPreview from "../components/HeroProductPreview";
import GoldVinePattern from "../components/GoldVinePattern";

// The rotating word at the end of the hero headline -- "integrity"/etc.
// stand in for Truvara's single-source-of-truth principle (the "if it's not
// in Truvara, it didn't happen" philosophy from the roadmap doc): nothing is
// silently altered, every record is traceable.
const HERO_ROTATING_WORDS = ["clarity", "accountability", "confidence"];
const HERO_HEADLINE_PREFIX = "Run your business with greater";
const HERO_HEADLINE_FULL = `${HERO_HEADLINE_PREFIX} ${HERO_ROTATING_WORDS.join(", ")}.`;

// Types out one word at a time, then deletes it and moves to the next word
// in the list, looping forever -- not a one-shot sentence typewriter. Screen
// readers get a full, stable sentence via aria-label on the heading (see
// HERO_HEADLINE_FULL); this hook only drives the decorative animated word.
// Respects prefers-reduced-motion by holding on the first word, unanimated.
function useTypewriterCycle(words, options = {}) {
  const { typeSpeed = 120, deleteSpeed = 65, pauseAfterType = 2400, pauseAfterDelete = 600, startDelay = 900 } = options;
  const [output, setOutput] = useState(words[0] || "");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || words.length === 0) {
      setOutput(words[0] || "");
      return;
    }

    const timeouts = [];
    const schedule = (fn, delay) => {
      const id = setTimeout(fn, delay);
      timeouts.push(id);
    };
    let wordIndex = 0;

    const typeWord = () => {
      const word = words[wordIndex];
      let i = 0;
      const step = () => {
        i += 1;
        setOutput(word.slice(0, i));
        if (i < word.length) schedule(step, typeSpeed);
        else schedule(deleteWord, pauseAfterType);
      };
      step();
    };

    const deleteWord = () => {
      const word = words[wordIndex];
      let i = word.length;
      const step = () => {
        i -= 1;
        setOutput(word.slice(0, i));
        if (i > 0) schedule(step, deleteSpeed);
        else {
          wordIndex = (wordIndex + 1) % words.length;
          schedule(typeWord, pauseAfterDelete);
        }
      };
      step();
    };

    // The hero sits inside a fade-in-on-scroll wrapper (see Section/.reveal)
    // that's invisible for its first ~0.7s -- starting immediately on mount
    // meant the first cycle mostly finished before anyone could see it.
    schedule(typeWord, startDelay);

    return () => timeouts.forEach(clearTimeout);
  }, [words, typeSpeed, deleteSpeed, pauseAfterType, pauseAfterDelete, startDelay]);

  return output;
}

export default function Hero() {
  const rotatingWord = useTypewriterCycle(HERO_ROTATING_WORDS);

  return (
    <Section className="pt-16 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      <div className="relative max-w-3xl mx-auto text-center">
        <GoldVinePattern
          className="hidden lg:block absolute right-[calc(100%+1rem)] top-1/2 -translate-y-1/2 w-36 h-auto text-gold-500/40 dark:text-gold-300/25 pointer-events-none"
        />
        <GoldVinePattern
          flip
          className="hidden lg:block absolute left-[calc(100%+1rem)] top-1/2 -translate-y-1/2 w-36 h-auto text-gold-500/40 dark:text-gold-300/25 pointer-events-none"
        />
        <h1
          className="text-4xl sm:text-6xl font-black tracking-tight text-black dark:text-white leading-tight text-balance"
          aria-label={HERO_HEADLINE_FULL}
        >
          <span aria-hidden="true">
            {HERO_HEADLINE_PREFIX}{" "}
            <span className="text-gold-600 dark:text-gold-300 inline-block min-w-[1ch]">
              {rotatingWord}
              <span className="inline-block w-[3px] sm:w-[4px] h-[0.85em] bg-gold-600 dark:bg-gold-300 align-middle ml-1 animate-pulse" />
            </span>
          </span>
        </h1>
        <p className="mt-5 text-lg sm:text-xl font-semibold text-black dark:text-white leading-relaxed max-w-2xl mx-auto">
          Nothing happens in your business without a clear, accountable record.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/signup"
            className="bg-brand-600 dark:bg-brand-400 text-white font-semibold px-6 py-3 rounded-xl ring-1 ring-gold-400/60 dark:ring-gold-300/90 shadow-lg shadow-brand-900/25 hover:bg-brand-500 dark:hover:bg-brand-300 hover:ring-gold-300 hover:-translate-y-0.5 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Post-login workspace desktop & mobile layout preview */}
      <HeroProductPreview />
    </Section>
  );
}
