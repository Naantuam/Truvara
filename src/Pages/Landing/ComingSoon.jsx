import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import BrandMark from "../../Reusable/BrandMark";

// Shared placeholder for pages the landing page links to that don't have
// real content yet -- /signup (full account-creation flow is later work,
// pending the separate document-security conversation) and the footer's
// /privacy, /terms, /support (real legal copy needs actual review, not
// something to draft confidently here). Keeps every link on the landing
// page working instead of 404ing while each one is still being built out.
export default function ComingSoon({ title, message }) {
  return (
    <div className="w-full min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 text-center" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <BrandMark variant="light" className="h-8 w-auto mb-10" />
      <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-5">
        <Clock className="w-6 h-6 text-gold-600" />
      </div>
      <h1 className="text-2xl font-bold text-black mb-2">{title}</h1>
      <p className="text-black max-w-md leading-relaxed mb-8">{message}</p>
      <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
        ← Back to Truvara
      </Link>
    </div>
  );
}
