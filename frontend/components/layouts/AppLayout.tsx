import Navbar from "@/components/navbar/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full z-50">
        <Navbar />
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}

    </div>
  );
}