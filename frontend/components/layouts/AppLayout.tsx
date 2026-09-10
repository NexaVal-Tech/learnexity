import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import Navbar from "@/components/navbar/Navbar";

// Code-split the particle background: @tsparticles/* is a sizeable engine
// that isn't needed for first paint/interactivity, and has no SSR value
// (it's purely decorative canvas animation). Loading it via next/dynamic
// with ssr:false keeps it out of the main bundle so pages become
// interactive sooner on slow connections — it streams in right after.
const ParticleBg = dynamic(() => import("@/components/particles/ParticleBg"), {
  ssr: false,
});

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

  return (
    <div className="bg-white dark:bg-black">
      {topBanner?.({ onHeightChange: handleBannerHeightChange })}

      {/* Header/Navbar */}
      <header className="fixed w-full z-50" style={{ top: bannerHeight }}>
        <Navbar topOffsetPx={bannerHeight} />
      </header>

      {/* Main content */}
      <main className="relative" style={{ paddingTop: bannerHeight || undefined }}>
        <ParticleBg />
        <div className="z-10">
          {children}
        </div>
      </main>

      {/* Footer */}

    </div>
  );
}