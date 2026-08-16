import dynamic from "next/dynamic";
import Navbar from "@/components/navbar/Navbar";

// Code-split the particle background: @tsparticles/* is a sizeable engine
// that isn't needed for first paint/interactivity, and has no SSR value
// (it's purely decorative canvas animation). Loading it via next/dynamic
// with ssr:false keeps it out of the main bundle so pages become
// interactive sooner on slow connections — it streams in right after.
const ParticleBg = dynamic(() => import("@/components/particles/ParticleBg"), {
  ssr: false,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-black">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full z-50">
        <Navbar />
      </header>

      {/* Main content */}
      <main className="relative">
        <ParticleBg />
        <div className="z-10">
          {children}
        </div>
      </main>

      {/* Footer */}

    </div>
  );
}