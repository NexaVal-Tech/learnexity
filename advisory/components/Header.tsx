// components/Header.tsx
import Link from "next/link";

const BRAND = "#4A3AFF";

export default function Header() {
  return (
    <header
      className="fixed top-0 w-full z-50 bg-white border-b"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 h-[62px]">
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Learnexity Advisory home">
          <img src="/images/Logo.png" alt="Learnexity" width={136} height={38} className="object-contain" />
          <span
            className="text-[13px] font-bold uppercase tracking-wide pl-2.5 border-l"
            style={{ color: BRAND, borderColor: "var(--border-subtle)" }}
          >
            Advisory
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://learnexity.org"
            className="hidden sm:inline text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Learnexity.org →
          </a>
          <a
            href="#assessment"
            className="text-[13px] px-4 py-2.5 rounded-xl font-semibold text-white transition-all"
            style={{ background: BRAND }}
          >
            Book a Free Assessment
          </a>
        </div>
      </div>
    </header>
  );
}
