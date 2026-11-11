import { useEffect, useRef, useState } from "react";

// Fires once, the first time the element scrolls into view -- not a
// repeating scroll-position listener, so it costs nothing after the
// initial reveal. `prefers-reduced-motion` is handled in CSS (see the
// `.reveal` rule in LandingPage.jsx's <style> block), not here, so this
// hook stays the same regardless of that setting.
export default function useRevealOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
