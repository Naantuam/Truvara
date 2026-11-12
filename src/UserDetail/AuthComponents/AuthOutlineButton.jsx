import { Link } from "react-router-dom";

const CLASSES =
  "group w-full h-12 flex items-center justify-center gap-2 rounded-lg border-2 border-black text-black text-base font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-60 disabled:pointer-events-none";

// The secondary action on the gold auth pages: outlined, fills black on
// hover. `icon` is a lucide element; it shows gold, turns light gold on
// hover, and nudges left when nudge="left" (for "back" actions).
export default function AuthOutlineButton({ to, icon, nudge, children, ...props }) {
  const content = (
    <>
      {icon && (
        <span
          className={`flex text-gold-800 transition-all group-hover:text-gold-300 ${
            nudge === "left" ? "group-hover:-translate-x-1" : ""
          }`}
        >
          {icon}
        </span>
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={CLASSES} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={CLASSES} {...props}>
      {content}
    </button>
  );
}
