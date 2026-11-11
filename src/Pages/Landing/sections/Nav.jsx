import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SunMoonToggle from "../../../Reusable/SunMoonToggle";
import { HORIZONTAL_LOGO_LIGHT, HORIZONTAL_LOGO_DARK } from "../constants";

// Fully transparent (no bg/border) so it blends straight into whatever
// section is scrolled underneath it, light or dark. Still sticky, and still
// shrinks a little once scrolled past the hero. `theme`/`toggleTheme` are
// passed down from LandingPage rather than called here via useTheme() again
// -- useTheme holds plain local state with no shared context behind it, so a
// second independent instance here would drift out of sync with the footer.
export default function Nav({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="relative w-full sticky top-0 z-40">
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-end justify-between transition-all duration-300 ${scrolled ? "pt-3 pb-2" : "pt-7 pb-3"}`}>
        <img
          src={theme === "dark" ? HORIZONTAL_LOGO_DARK : HORIZONTAL_LOGO_LIGHT}
          alt="Truvara"
          className={`w-auto transition-all duration-300 ${scrolled ? "h-9" : "h-11 sm:h-12"}`}
        />
        <div className="flex items-center gap-3">
          <SunMoonToggle theme={theme} onToggle={toggleTheme} />
          <Link
            to="/login"
            className="text-sm font-medium text-brand-700 dark:text-white bg-white/60 dark:bg-white/10 backdrop-blur border border-white/70 dark:border-white/25 hover:bg-white/90 dark:hover:bg-white/20 transition-colors px-4 py-2 rounded-lg"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="group flex items-center gap-1.5 text-sm font-semibold bg-brand-600 dark:bg-brand-400 text-white px-4 py-2 rounded-lg ring-1 ring-gold-400/60 dark:ring-gold-300/90 shadow-md shadow-brand-900/20 hover:bg-brand-500 dark:hover:bg-brand-300 hover:ring-gold-300 hover:-translate-y-0.5 transition-all"
          >
            Create a Business Account
            <ArrowRight className="w-4 h-4 text-gold-300 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
