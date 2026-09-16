// components/Header.tsx
import Link from "next/link";

const ORANGE = "#e7a13c";
const CREAM = "#fbfaf6";
const NAVY = "#05192e";

/**
 * Transparent header meant to sit on top of the hero photo — not fixed/sticky,
 * it scrolls away with the hero like in the reference design. Rendered inside
 * <Hero /> rather than persisted site-wide, since this app only has one page.
 */
export default function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
      <Link href="/" className="flex items-center gap-1.5 flex-shrink-0" aria-label="Learnexity Advisory home">
        <span className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: CREAM }}>
          Learnexity
        </span>
        <span className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: ORANGE }}>
          Advisory
        </span>
      </Link>

      <nav aria-label="Primary navigation" className="flex items-center gap-5 sm:gap-8">
        <a
          href="#advisory"
          className="hidden sm:inline text-sm transition-colors"
          style={{ color: `${CREAM}d9` }}
        >
          Services
        </a>
        <a
          href="#assessment"
          className="inline-flex rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: CREAM, color: NAVY }}
        >
          Contact Us
        </a>
      </nav>
    </header>
  );
}
