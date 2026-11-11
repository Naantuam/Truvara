import BrandMark from "../../Reusable/BrandMark";

// Same visual language as the sign-in screens (AuthLayout): the gold
// gradient field and a white card -- but full width with a wider card,
// since the wizard needs room for its questions. Light-only, like the
// other auth screens.
export default function OnboardingShell({ children, wide = false }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 font-sans px-4 py-8 sm:py-12">
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-900/20 rounded-full blur-3xl" />

      <div className={`relative z-10 mx-auto w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex justify-center mb-6">
          <BrandMark variant="light" className="h-14 w-auto" />
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
