"use client";

// Scroll-reveal helpers, built on IntersectionObserver + CSS transitions
// instead of framer-motion (which added ~40 KB of JavaScript to every
// page). Same props and look as before.
//
// Content is visible in the server-rendered HTML and only hides once the
// page's JavaScript is running and the element is still below the fold —
// so on a slow connection the text never sits invisible waiting for JS.
import { useEffect, useRef, useState, type ReactNode } from "react";

type AnimationProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
};

type Phase = "static" | "hidden" | "shown";

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * once = reveal the first time the element scrolls into view.
 * Otherwise it hides again when scrolled away (like FadeUpOnScroll did).
 */
function useReveal(amount: number, once: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion() || typeof IntersectionObserver === "undefined") return;

    // Already on screen at first paint → leave it as is (no flash).
    const r = el.getBoundingClientRect();
    const onScreen = r.top < window.innerHeight && r.bottom > 0;
    if (onScreen && once) return;
    // Tall blocks (whole sections, the footer) never hide — a big blank
    // area while scrolling looks like the page broke.
    if (r.height > window.innerHeight * 0.8) return;
    if (!onScreen) setPhase("hidden");

    // A section taller than the screen could never reach e.g. 30% visible,
    // so cap the threshold to what can actually fit.
    const fit = r.height > 0 ? (window.innerHeight * 0.6) / r.height : amount;
    const threshold = Math.max(0.01, Math.min(amount, fit));

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold * 0.99) {
          setPhase("shown");
          if (once) io.disconnect();
        } else if (!once) {
          setPhase("hidden");
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, once]);

  return { ref, phase };
}

function styleFor(phase: Phase, duration: number, delay: number): React.CSSProperties | undefined {
  if (phase === "static") return undefined;
  return {
    opacity: phase === "shown" ? 1 : 0,
    transform: phase === "shown" ? "none" : "translateY(50px)",
    transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
    willChange: phase === "hidden" ? "opacity, transform" : undefined,
  };
}

export const ScrollFadeIn = ({ children, delay = 0, duration = 0.3 }: AnimationProps) => {
  const { ref, phase } = useReveal(0.2, true);
  return (
    <div ref={ref} style={styleFor(phase, duration, delay)}>
      {children}
    </div>
  );
};

export const FadeInCard = ({ children }: { children: ReactNode }) => {
  const { ref, phase } = useReveal(0.2, true);
  return (
    <div ref={ref} style={styleFor(phase, 0.6, 0)}>
      {children}
    </div>
  );
};

export const FadeUpOnScroll = ({ children }: { children: ReactNode }) => {
  // Reveal once and stay visible. It used to fade OUT again whenever less
  // than 30% of a section was on screen — so while scrolling, whole
  // homepage sections (courses, pathways, testimonials…) vanished and
  // re-appeared, which looked like the page was reloading.
  const { ref, phase } = useReveal(0.15, true);
  return (
    <div ref={ref} style={styleFor(phase, 0.5, 0)} className="fade-up-item">
      {children}
    </div>
  );
};

export const ZoomAnimation = ({ children }: { children: ReactNode }) => {
  return (
    <div className="transition-transform duration-200 hover:scale-[1.2] active:scale-[0.8]">
      {children}
    </div>
  );
};
