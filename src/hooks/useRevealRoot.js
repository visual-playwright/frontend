import { useEffect, useRef } from "react";

// Reveal-on-scroll sekali saja via IntersectionObserver.
// Komunikasi: hierarki (konten masuk berurutan). Hormati reduced-motion via CSS.
export default function useRevealRoot(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const els = root.querySelectorAll(".reveal:not(.reveal-visible)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
