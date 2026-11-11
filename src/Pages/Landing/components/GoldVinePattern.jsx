// A flowing curved gold line with a few small leaf shapes branching off it --
// an actual line pattern (Emily, 2026-10-30: "patterns of curved lines"),
// not a dot-grid texture or a plain circle outline. Color comes from the
// wrapping element's text color (currentColor), so each placement controls
// its own gold shade/opacity via className. `flip` mirrors it horizontally
// for reuse on either side of a section.
export default function GoldVinePattern({ className = "", flip = false }) {
  return (
    <svg
      viewBox="0 0 220 460"
      fill="none"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M30 20 C 90 60, 50 130, 110 170 C 170 210, 130 290, 180 330 C 210 352, 195 410, 160 445"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <g transform="translate(90,60) rotate(-20)">
        <path d="M0 0 C 10 -14, 28 -14, 30 0 C 28 14, 10 14, 0 0 Z" fill="currentColor" />
        <line x1="0" y1="0" x2="30" y2="0" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
      </g>
      <g transform="translate(150,200) rotate(35)">
        <path d="M0 0 C 9 -12, 24 -12, 26 0 C 24 12, 9 12, 0 0 Z" fill="currentColor" />
        <line x1="0" y1="0" x2="26" y2="0" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
      </g>
      <g transform="translate(170,330) rotate(-30)">
        <path d="M0 0 C 8 -11, 22 -11, 24 0 C 22 11, 8 11, 0 0 Z" fill="currentColor" />
        <line x1="0" y1="0" x2="24" y2="0" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
      </g>
    </svg>
  );
}
