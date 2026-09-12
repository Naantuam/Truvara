const LOGOS = {
  light: "/assets/truvara-logo-vertical-light.png",
  dark: "/assets/truvara-logo-vertical-dark.png",
};

export default function BrandMark({ variant = "light", className = "" }) {
  return (
    <img
      src={LOGOS[variant]}
      alt="Truvara — Structured Solutions for Growth"
      className={className}
    />
  );
}
