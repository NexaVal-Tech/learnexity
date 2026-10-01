// components/ui/CarouselArrows.tsx
//
// Shared pieces for the homepage's horizontal card rows (courses,
// testimonials): a hook that tracks whether the row can scroll left/right
// and moves it one card at a time, mouse click-drag scrolling (touch uses
// the browser's native swipe), and the outlined prev/next arrow buttons.
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function useCarousel<T extends HTMLElement = HTMLDivElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    update();
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Content (images, fonts) can change the width after first paint.
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, ...deps]);

  /** Scroll by one card (the first child's width + the gap). */
  const scrollByCard = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    // Cards may sit directly in the scroller or inside a single inner row.
    const track = (el.children.length === 1 ? el.firstElementChild : el) as HTMLElement | null;
    const first = (track?.firstElementChild as HTMLElement | null) ?? null;
    const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 16 : 16;
    const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  // ── Mouse click-drag (desktop). Touch is native swipe. ──────────────
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const dragHandlers = {
    onPointerDown: (e: React.PointerEvent<T>) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
      drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    },
    onPointerMove: (e: React.PointerEvent<T>) => {
      const d = drag.current;
      const el = ref.current;
      if (!d.active || !el) return;
      const dx = e.clientX - d.startX;
      if (!d.moved && Math.abs(dx) > 5) {
        d.moved = true;
        try { el.setPointerCapture(e.pointerId); } catch {}
        el.style.scrollSnapType = "none";
      }
      if (d.moved) el.scrollLeft = d.startLeft - dx;
    },
    onPointerUp: (e: React.PointerEvent<T>) => {
      const el = ref.current;
      if (!drag.current.active) return;
      drag.current.active = false;
      if (el) {
        el.style.scrollSnapType = "";
        try { el.releasePointerCapture(e.pointerId); } catch {}
      }
    },
    onPointerCancel: () => {
      drag.current.active = false;
      if (ref.current) ref.current.style.scrollSnapType = "";
    },
    /** Swallow the click that ends a drag so cards don't open. */
    onClickCapture: (e: React.MouseEvent<T>) => {
      if (drag.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        drag.current.moved = false;
      }
    },
  };

  return { ref, canPrev, canNext, scrollByCard, dragHandlers };
}

/** Outlined prev / next buttons (the active one gets a stronger border). */
export function CarouselArrows({
  canPrev,
  canNext,
  onPrev,
  onNext,
  label = "items",
  className = "",
}: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  label?: string;
  className?: string;
}) {
  const base =
    "w-12 h-12 flex items-center justify-center rounded-xl border bg-[var(--surface)] transition-all duration-200 " +
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:border-[var(--border-subtle)] disabled:text-[var(--text-muted)] " +
    "enabled:border-[var(--text-primary)] enabled:text-[var(--text-primary)] enabled:hover:border-[#4A3AFF] enabled:hover:text-[#4A3AFF] enabled:hover:bg-[#4A3AFF0d]";
  if (!canPrev && !canNext) return null;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" className={base} onClick={onPrev} disabled={!canPrev} aria-label={`Previous ${label}`}>
        <ArrowLeft size={20} />
      </button>
      <button type="button" className={base} onClick={onNext} disabled={!canNext} aria-label={`Next ${label}`}>
        <ArrowRight size={20} />
      </button>
    </div>
  );
}
