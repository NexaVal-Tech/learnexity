// components/catalog/PathwaySection.tsx
//
// One pathway block on the courses pages: icon + heading, a card with the
// audience line, course cards (picture, name, description, length/level)
// and the "Outcome" box. Brand purple only.
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Gift, Layers, Cpu, Rocket, type LucideIcon } from "lucide-react";
import type { Course } from "@/lib/api";
import { API_URL, BRAND, PATHWAYS, courseHref, type PathwayKey } from "./pathways";
import { CmsImage } from "@/components/cms/ui";
import { imageUrl } from "./pathways";
import { RADIUS, RADIUS_SM } from "./CatalogTheme";

// ── Data ──────────────────────────────────────────────────────────────

export function usePathwayCourses(key: PathwayKey) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${PATHWAYS[key].endpoint}`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load courses. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { courses, loading, error, reload: load };
}

// ── Look per pathway ──────────────────────────────────────────────────

const DT_BG = "#0d0b1f"; // deep brand-purple black

export const PATHWAY_STYLE: Record<PathwayKey, { icon: LucideIcon; accent: string }> = {
  flex: { icon: Layers, accent: BRAND },
  accelerator: { icon: Rocket, accent: BRAND },
  deeptech: { icon: Cpu, accent: BRAND },
  free: { icon: Gift, accent: BRAND },
};

// ── Pieces ────────────────────────────────────────────────────────────

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md text-white shadow" style={{ background: BRAND }}>
      {children}
    </span>
  );
}

function metaLine(course: Course): string {
  return [course.duration, course.level].filter((v) => v && String(v).trim()).map((v) => String(v)).join(" · ");
}

/** Course card: picture, name, short description, length/level, "View course". */
function CourseCard({ course, pathway, dark = false, popular = false }: { course: Course; pathway: PathwayKey; dark?: boolean; popular?: boolean }) {
  const img = course.hero_image ? imageUrl(course.hero_image, "") : "";
  const meta = metaLine(course);
  return (
    <Link
      href={courseHref(course, pathway)}
      className={`group flex flex-col overflow-hidden border transition duration-300 hover:-translate-y-1 ${dark ? "lx-course-card-dark" : "lx-course-card"}`}
      style={{ borderRadius: RADIUS_SM }}
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #1a1446 100%)` }}>
        {img ? (
          <CmsImage
            src={img}
            alt={course.title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 92vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white/90 font-semibold text-lg leading-snug">
            {course.title}
          </div>
        )}
        {(popular || (course.is_free && pathway !== "free")) && (
          <div className="absolute top-3 left-3 flex gap-2">
            {popular && <Badge>Popular</Badge>}
            {course.is_free && pathway !== "free" && <Badge>Free</Badge>}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className={`text-lg font-semibold leading-snug line-clamp-2 ${dark ? "text-white" : "text-[var(--text-primary)]"}`}>{course.title}</h3>
        {course.description && (
          <p className={`mt-2 text-sm leading-relaxed line-clamp-3 ${dark ? "text-white/70" : "text-[var(--text-secondary)]"}`}>{course.description}</p>
        )}
        <div className={`mt-auto pt-4 flex items-center justify-between gap-3 border-t ${dark ? "border-white/10" : "border-[var(--border-subtle)]"}`} style={{ marginTop: "auto" }}>
          <span className={`text-xs capitalize ${dark ? "text-white/60" : "text-[var(--text-muted)]"}`}>{meta || (pathway === "free" || course.is_free ? "Free course" : "")}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all" style={{ color: dark ? "#c9c3ff" : BRAND }}>
            View course <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton({ dark = false }: { dark?: boolean }) {
  const block = dark ? "bg-white/10" : "bg-[var(--border-strong)]";
  return (
    <div className={`overflow-hidden border animate-pulse ${dark ? "border-white/10" : "border-[var(--border-subtle)] bg-[var(--surface-alt)]"}`} style={{ borderRadius: RADIUS_SM }}>
      <div className={`aspect-[16/10] ${block}`} />
      <div className="p-5 space-y-3">
        <div className={`h-4 rounded-full w-3/4 ${block}`} />
        <div className={`h-3 rounded-full w-full ${block}`} />
        <div className={`h-3 rounded-full w-2/3 ${block}`} />
      </div>
    </div>
  );
}

function StateMessage({ error, onRetry, emptyText, dark = false }: { error: string | null; onRetry: () => void; emptyText: string; dark?: boolean }) {
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={onRetry} className="lx-btn px-6 py-2.5 text-sm">Try again</button>
      </div>
    );
  }
  return <p className={`text-center py-8 text-lg ${dark ? "text-white/60" : "text-[var(--text-muted)]"}`}>{emptyText}</p>;
}

function Outcome({ pathway, accent, dark = false }: { pathway: PathwayKey; accent: string; dark?: boolean }) {
  const p = PATHWAYS[pathway];
  if (dark) {
    return (
      <div className="p-5 border border-white/10 relative z-10 text-white/85" style={{ borderRadius: RADIUS_SM, background: "rgba(255,255,255,0.05)" }}>
        <strong className="text-white">Outcome:</strong> {p.outcome}
        {p.outcomeNote && <span className="font-semibold ml-2" style={{ color: "#c9c3ff" }}>{p.outcomeNote}</span>}
      </div>
    );
  }
  return (
    <div
      className="mt-8 p-5 border text-[var(--text-secondary)]"
      style={{ borderRadius: RADIUS_SM, background: `${accent}0f`, borderColor: `${accent}2e` }}
    >
      <strong style={{ color: accent }}>Outcome:</strong> {p.outcome}
      {p.outcomeNote && <em className="ml-1">{p.outcomeNote}</em>}
    </div>
  );
}

function PathwayHeader({ pathway, flagship = false }: { pathway: PathwayKey; flagship?: boolean }) {
  const p = PATHWAYS[pathway];
  const { icon: Icon, accent } = PATHWAY_STYLE[pathway];
  return (
    <div className="flex items-center mb-8">
      <div
        className="w-14 h-14 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm"
        style={{ borderRadius: RADIUS_SM, ...(pathway === "deeptech" ? { background: DT_BG, color: "#fff" } : { background: `${accent}1a`, color: accent }) }}
      >
        <Icon size={24} />
      </div>
      <div>
        {flagship && <p className="lx-label mb-1">Flagship Pathway</p>}
        <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">{p.title}</h2>
        <p className="text-lg text-[var(--text-secondary)] mt-1">{p.tagline}</p>
      </div>
    </div>
  );
}

function ViewAll({ href, label, dark = false }: { href: string; label: string; dark?: boolean }) {
  return (
    <div className="mt-6 flex justify-center sm:justify-end relative z-10">
      <Link
        href={href}
        className={dark ? "inline-flex items-center gap-2 px-6 py-3 font-semibold text-white border border-white/30 hover:border-[#8b80ff] hover:gap-3 transition-all" : "lx-btn-outline px-6 py-3"}
        style={dark ? { borderRadius: RADIUS } : undefined}
      >
        {label} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

// ── Pathway block ─────────────────────────────────────────────────────

interface PathwaySectionProps {
  pathway: PathwayKey;
  courses: Course[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Link to the pathway's own page (overview page only). */
  viewAllHref?: string;
  /** Show only the first N courses (overview page); omit for all. */
  limit?: number;
  className?: string;
}

export default function PathwaySection({
  pathway, courses, loading, error, onRetry, viewAllHref, limit, className = "",
}: PathwaySectionProps) {
  const p = PATHWAYS[pathway];
  const { accent } = PATHWAY_STYLE[pathway];
  const shown = limit ? courses.slice(0, limit) : courses;
  const empty = !loading && !error && shown.length === 0;
  const emptyText = pathway === "free" ? "No free courses available yet." : "New courses in this pathway are coming soon.";
  const viewAllLabel = courses.length > shown.length ? `View all ${courses.length} courses` : `Explore ${p.title}`;
  const grid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6";

  // ── DeepTech: dark flagship card ────────────────────────────────────
  if (pathway === "deeptech") {
    return (
      <div id={pathway} className={`scroll-mt-28 ${className}`}>
        <PathwayHeader pathway={pathway} flagship />
        <div className="text-white p-6 md:p-8 shadow-xl relative overflow-hidden border border-white/10" style={{ borderRadius: RADIUS, background: DT_BG }}>
          <div className="absolute top-0 right-0 w-72 h-72 blur-[90px] rounded-full pointer-events-none" style={{ background: `${BRAND}40` }} />
          <p className="text-lg text-white/75 mb-8 max-w-3xl relative z-10">{p.audience}</p>

          <div className="relative z-10 mb-8">
            {loading ? (
              <div className={grid}>{[1, 2, 3].map((i) => <CardSkeleton key={i} dark />)}</div>
            ) : error || empty ? (
              <StateMessage error={error} onRetry={onRetry} emptyText={emptyText} dark />
            ) : (
              <div className={grid}>
                {shown.map((course) => <CourseCard key={course.id} course={course} pathway={pathway} dark />)}
              </div>
            )}
          </div>

          <Outcome pathway={pathway} accent={accent} dark />
          {viewAllHref && <ViewAll href={viewAllHref} label={viewAllLabel} dark />}
        </div>
      </div>
    );
  }

  // ── Flex, Career Accelerator and Free: course cards grid ───────────
  const popularId = pathway === "accelerator"
    ? (shown.find((c) => /automation|agent/i.test(c.title)) ?? shown[0])?.id
    : undefined;
  return (
    <div id={pathway} className={`scroll-mt-28 ${className}`}>
      <PathwayHeader pathway={pathway} />
      <div className="lx-card p-6 md:p-8">
        <p className="text-lg text-[var(--text-secondary)] mb-8">{p.audience}</p>

        {loading ? (
          <div className={grid}>{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : error || empty ? (
          <StateMessage error={error} onRetry={onRetry} emptyText={emptyText} />
        ) : (
          <div className={grid}>
            {shown.map((course) => (
              <CourseCard key={course.id} course={course} pathway={pathway} popular={course.id === popularId} />
            ))}
          </div>
        )}

        <Outcome pathway={pathway} accent={accent} />
        {viewAllHref && <ViewAll href={viewAllHref} label={viewAllLabel} />}
      </div>
    </div>
  );
}

/** Styles for the dark DeepTech course cards. */
export function PathwayStyles() {
  return (
    <style>{`
      .lx-course-card {
        background: var(--surface-elevated, var(--surface));
        border-color: var(--border-subtle);
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
      }
      .lx-course-card:hover {
        border-color: ${BRAND}66;
        box-shadow: 0 18px 40px rgba(74,58,255,0.14);
      }
      .lx-course-card-dark {
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
      }
      .lx-course-card-dark:hover {
        border-color: ${BRAND};
        box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${BRAND}40;
      }
    `}</style>
  );
}
