// components/catalog/CatalogHero.tsx
//
// Header for the courses pages (the site's courses hero image behind a
// centred title) and the pathway cards ("Find Your Next Step") used on
// /courses and at the bottom of each pathway page.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND, PATHWAYS, type PathwayKey } from "./pathways";
import { PATHWAY_STYLE } from "./PathwaySection";
import { RADIUS, RADIUS_SM } from "./CatalogTheme";

export function CatalogHero({
  title,
  subtitle,
  badge,
  image = "/images/coures.jpg",
  imageAlt = "Courses hero",
}: {
  title: string;
  subtitle: string;
  badge?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative overflow-hidden text-white">
      <Image src={image} alt={imageAlt} fill priority className="object-cover object-center" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(6,14,31,0.55) 0%, rgba(6,14,31,0.7) 55%, rgba(6,14,31,0.93) 100%)" }}
      />
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-10 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
        {badge && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-xs font-bold uppercase tracking-[0.08em] backdrop-blur-sm"
            style={{ borderRadius: "999px", background: `${BRAND}26`, border: `1px solid ${BRAND}66`, color: "#c7c2ff" }}
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: BRAND }} />
            {badge}
          </div>
        )}
        <h1
          className="font-bold leading-tight mx-auto"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", maxWidth: "820px", textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
        >
          {title}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
}

const ALL: PathwayKey[] = ["flex", "accelerator", "deeptech", "free"];

/** Big clickable pathway cards. Pass `counts` to show how many courses each has. */
export function PathwayCards({
  exclude,
  counts,
  heading = true,
}: {
  exclude?: PathwayKey;
  counts?: Partial<Record<PathwayKey, number | null>>;
  heading?: boolean;
}) {
  const keys = ALL.filter((k) => k !== exclude);
  return (
    <section>
      {heading && (
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="lx-label mb-2">Our Pathways</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">Find Your Next Step</h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">Different starting points. One direction: greater capability.</p>
        </div>
      )}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${keys.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6`}>
        {keys.map((k) => {
          const p = PATHWAYS[k];
          const { icon: Icon, accent } = PATHWAY_STYLE[k];
          const dark = k === "deeptech";
          const count = counts?.[k];
          return (
            <Link
              key={k}
              href={p.href}
              className={`group p-7 flex flex-col h-full ${dark ? "lx-dt-card text-white" : "lx-card lx-hover"}`}
              style={dark ? { borderRadius: RADIUS } : undefined}
            >
              <div
                className="w-12 h-12 flex items-center justify-center mb-6"
                style={{ borderRadius: RADIUS_SM, ...(dark ? { background: "#334155", color: "#fff" } : { background: `${accent}1a`, color: accent }) }}
              >
                <Icon size={22} />
              </div>
              {dark && <p className="lx-label mb-1" style={{ color: "#a5b4fc" }}>Flagship</p>}
              <h3 className={`text-2xl font-semibold mb-2 ${dark ? "text-white" : "text-[var(--text-primary)]"}`}>{p.title}</h3>
              <p className={`mb-6 flex-1 ${dark ? "text-slate-400" : "text-[var(--text-secondary)]"}`}>{p.tagline}</p>
              <div className="flex items-center justify-between gap-3">
                <span
                  className="font-semibold inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform"
                  style={{ color: dark ? "#a5b4fc" : accent }}
                >
                  Explore Pathway <ArrowRight size={16} />
                </span>
                {typeof count === "number" && count > 0 && (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={dark ? { background: "#334155", color: "#e2e8f0" } : { background: `${accent}14`, color: accent }}
                  >
                    {count} {count === 1 ? "course" : "courses"}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Links to the other pathways, at the bottom of a pathway page. */
export function OtherPathways({ current }: { current: PathwayKey }) {
  return (
    <div className="mt-24">
      <PathwayCards exclude={current} />
    </div>
  );
}
