import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";

// Code-split the particle background: @tsparticles/* is a sizeable engine
// that isn't needed for first paint/interactivity, and has no SSR value
// (it's purely decorative canvas animation). Loading it via next/dynamic
// with ssr:false keeps it out of the main bundle so pages become
// interactive sooner on slow connections — it streams in right after.
const ParticleBg = dynamic(() => import("@/components/particles/ParticleBg"), {
  ssr: false,
});

/**
 * True once the page has fully loaded and the browser is idle. The
 * decorative particle background (and its ~60 KB engine) waits for this,
 * so on a slow connection it never competes with the page's own content,
 * scripts and API calls. Skipped entirely for reduced-motion users.
 */
function useAfterLoadIdle() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => !cancelled && setReady(true), { timeout: 4000 });
      else timer = setTimeout(() => !cancelled && setReady(true), 1500);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
      if (timer) clearTimeout(timer);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
    };
  }, []);
  return ready;
}

interface AppLayoutProps {
  children: React.ReactNode;
  /** Optional fixed element rendered above the navbar (e.g. the homepage
   * scholarship countdown banner). Its rendered height is measured and
   * used to push the navbar + page content down by exactly that amount,
   * so pages that don't pass one see zero layout change. */
  topBanner?: (props: { onHeightChange: (height: number) => void }) => React.ReactNode;
}

export default function AppLayout({ children, topBanner }: AppLayoutProps) {
  const [bannerHeight, setBannerHeight] = useState(0);
  const handleBannerHeightChange = useCallback((height: number) => setBannerHeight(height), []);
  const showParticles = useAfterLoadIdle();

  return (
    <div className="bg-white dark:bg-black">
      {topBanner?.({ onHeightChange: handleBannerHeightChange })}

      {/* Header/Navbar */}
      <header className="fixed w-full z-50" style={{ top: bannerHeight }}>
        <Navbar topOffsetPx={bannerHeight} />
      </header>

      {/* Main content */}
      <main className="relative" style={{ paddingTop: bannerHeight || undefined }}>
        {showParticles && <ParticleBg />}
        <div className="z-10">
          {children}
        </div>
      </main>

      {/* Footer */}

    </div>
  );
}