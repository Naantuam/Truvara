import { Sun, Moon } from "lucide-react";

export default function SunMoonToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative w-14 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300 ${
        isDark ? "bg-slate-700" : "bg-amber-100"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-slate-700" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}
