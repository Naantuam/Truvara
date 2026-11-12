import { Loader2 } from "lucide-react";

// Gold on white surfaces (the onboarding card). On the gold auth pages a
// gold button would disappear, so .auth-on-gold (App.css) turns it black.
// TrailingIcon (optional) sits after the label and nudges right on hover.
export default function AuthButton({ label, children, isLoading, disabled, TrailingIcon, ...props }) {
  return (
    <button
      className={`auth-button group w-full h-12 bg-gold-500 hover:bg-gold-600 text-black text-lg font-bold font-sans flex items-center justify-center rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          {label || children}
        </>
      ) : (
        <>
          {label || children}
          {TrailingIcon && (
            <TrailingIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          )}
        </>
      )}
    </button>
  );
}
