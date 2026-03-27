import Navbar from "@/components/navbar/Navbar";
import ParticleBg from "@/components/particles/ParticleBg"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-black">
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