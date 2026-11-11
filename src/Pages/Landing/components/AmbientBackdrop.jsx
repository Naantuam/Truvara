import { Leaf } from "lucide-react";

// Ambient decoration: "cloud" blobs and drifting leaf icons behind the
// glass. Made deliberately more visible than a typical subtle-decoration
// pass: white alone nearly disappears against a near-white light-mode
// background, so the clouds get a soft colored ring + higher opacity in
// light mode, and leaves use a saturated tint in both themes rather than a
// faint one. Leaves stay green in light mode (Emily, 2026-10-30: "the
// leaves should be left as green on lightmode") -- gold shows up elsewhere
// now via GoldVinePattern, not by recoloring these. Pure CSS animation, no
// library; durations/delays vary per element so the drift reads as organic
// rather than one synced loop.
export default function AmbientBackdrop() {
  const clouds = [
    { top: "-1rem", left: "4%", size: "6rem", duration: "26s", delay: "0s" },
    { top: "6rem", right: "10%", size: "5rem", duration: "32s", delay: "-6s" },
    { top: "24rem", left: "22%", size: "4rem", duration: "22s", delay: "-12s" },
    { top: "38rem", right: "30%", size: "7rem", duration: "30s", delay: "-4s" },
    { top: "62rem", right: "8%", size: "5rem", duration: "24s", delay: "-16s" },
    { top: "88rem", left: "6%", size: "6rem", duration: "28s", delay: "-9s" },
    { top: "92rem", right: "20%", size: "4rem", duration: "25s", delay: "-3s" },
    { top: "112rem", left: "15%", size: "5rem", duration: "27s", delay: "-14s" },
  ];
  const leaves = [
    { top: "6rem", left: "12%", rotate: "-15deg", size: 36, duration: "9s", delay: "0s" },
    { top: "20rem", right: "15%", rotate: "20deg", size: 30, duration: "11s", delay: "-3s" },
    { top: "44rem", left: "8%", rotate: "8deg", size: 34, duration: "10s", delay: "-6s" },
    { top: "56rem", right: "10%", rotate: "-25deg", size: 28, duration: "8s", delay: "-2s" },
    { top: "78rem", left: "25%", rotate: "15deg", size: 32, duration: "12s", delay: "-8s" },
    { top: "98rem", right: "20%", rotate: "-10deg", size: 30, duration: "9.5s", delay: "-5s" },
    { top: "118rem", left: "40%", rotate: "12deg", size: 26, duration: "10.5s", delay: "-7s" },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c, i) => (
        <div
          key={`cloud-${i}`}
          className="absolute rounded-full bg-white/80 dark:bg-white/80 ring-4 ring-white/40 dark:ring-0 blur-lg animate-drift-cloud"
          style={{ top: c.top, left: c.left, right: c.right, width: c.size, height: c.size, animationDuration: c.duration, animationDelay: c.delay }}
        />
      ))}
      {leaves.map((l, i) => (
        <Leaf
          key={`leaf-${i}`}
          className="absolute text-brand-500/70 dark:text-gold-300/80 animate-drift-leaf"
          style={{
            top: l.top,
            left: l.left,
            right: l.right,
            width: l.size,
            height: l.size,
            "--leaf-rotate": l.rotate,
            animationDuration: l.duration,
            animationDelay: l.delay,
          }}
        />
      ))}
    </div>
  );
}
