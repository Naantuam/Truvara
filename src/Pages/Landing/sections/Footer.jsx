import { Link } from "react-router-dom";
import { Instagram, Linkedin, X as XIcon } from "lucide-react";
import useRevealOnScroll from "../hooks/useRevealOnScroll";
import { HORIZONTAL_LOGO_LIGHT, HORIZONTAL_LOGO_DARK } from "../constants";
import GoldVinePattern from "../components/GoldVinePattern";

// `theme` is passed down from LandingPage rather than called here via
// useTheme() again -- see Nav.jsx for why a second independent instance
// would drift out of sync.
export default function Footer({ theme }) {
  const [footerRef, footerVisible] = useRevealOnScroll();

  return (
    <footer className="relative overflow-hidden border-t border-white/50 dark:border-white/10 bg-white/60 dark:bg-brand-700/60 backdrop-blur-xl">
      <GoldVinePattern
        flip
        className="hidden lg:block absolute -right-8 -top-10 w-36 h-auto text-gold-500/35 dark:text-gold-300/20 pointer-events-none"
      />
      <div ref={footerRef} className={`relative reveal max-w-6xl mx-auto px-4 sm:px-6 py-10 ${footerVisible ? "reveal-visible" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          <img
            src={theme === "dark" ? HORIZONTAL_LOGO_DARK : HORIZONTAL_LOGO_LIGHT}
            alt="Truvara"
            className="h-10 w-auto opacity-90"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 text-sm">
            <div>
              <h4 className="font-bold text-black dark:text-white mb-3 text-sm">Company</h4>
              <nav className="flex flex-col gap-2 text-sm font-semibold text-black dark:text-white">
                <Link to="/about" className="hover:text-gold-600 dark:hover:text-gold-300 transition-colors">About Us</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-bold text-black dark:text-white mb-3 text-sm">Legal</h4>
              <nav className="flex flex-col gap-2 text-sm font-semibold text-black dark:text-white">
                <Link to="/privacy" className="hover:text-gold-600 dark:hover:text-gold-300 transition-colors">Privacy Notice</Link>
                <Link to="/terms" className="hover:text-gold-600 dark:hover:text-gold-300 transition-colors">Terms of Use</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-bold text-black dark:text-white mb-3 text-sm">Support</h4>
              <nav className="flex flex-col gap-2 text-sm font-semibold text-black dark:text-white">
                <Link to="/support" className="hover:text-gold-600 dark:hover:text-gold-300 transition-colors">Support / Contact</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-bold text-black dark:text-white mb-3 text-sm">Resources</h4>
              <nav className="flex flex-col gap-2 text-sm font-semibold text-black dark:text-white">
                <a href="#faq" className="hover:text-gold-600 dark:hover:text-gold-300 transition-colors">FAQ</a>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-xs font-medium text-black dark:text-white/90 leading-relaxed max-w-3xl">
            Truvara provides organisational and informational tools for business owners. It is not a government
            portal, law firm, accounting firm or tax authority, and does not make legal, tax or regulatory
            determinations on your behalf. Guidance shown in Truvara is a starting point and does not replace advice
            from a qualified professional or confirmation from the relevant regulator.
          </p>
          {/* Not yet connected to live accounts -- placeholders until the
              business is ready to deploy (Emily's call, 2026-10-28). */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <a href="#" aria-label="Truvara on Instagram" className="text-black dark:text-white hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Truvara on LinkedIn" className="text-black dark:text-white hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Truvara on X" className="text-black dark:text-white hover:text-gold-600 dark:hover:text-gold-300 transition-colors">
              <XIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
