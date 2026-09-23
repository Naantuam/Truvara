import BrandMark from "../../Reusable/BrandMark";

// Desktop-only left panel; on mobile the brand panel is hidden entirely and
// Logo.jsx's mobile fallback takes over inside the card instead.
export default function AuthBrandPanel() {
  return (
    <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-black flex-col items-center justify-center relative overflow-hidden px-12">
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        <BrandMark variant="dark" className="h-40 w-auto" />
        <p className="mt-6 text-sm text-gray-300 leading-relaxed">
          Welcome back. Structured decisions, clear accountability, and full visibility — everywhere your business grows.
        </p>
      </div>
    </div>
  );
}
