// components/catalog/PathwaySection.tsx
//
// One pathway block on the courses pages: icon + heading, a card with the
// audience line, course tiles (icon + name, as in the design file) and
// the "Outcome" box. Course pictures appear only on each course's page.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Gift, Layers, Cpu, Rocket, type LucideIcon } from "lucide-react";
import type { Course } from "@/lib/api";
import { API_URL, BRAND, PATHWAYS, courseHref, type PathwayKey } from "./pathways";
import { CourseIcon } from "./CourseIcon";
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

const PURPLE = "#9333ea";
const EMERALD = "#059669";
const DT_BG = "#0f172a";

export const PATHWAY_STYLE: Record<PathwayKey, { icon: LucideIcon; accent: string }> = {
  flex: { icon: Layers, accent: BRAND },
  accelerator: { icon: Rocket, accent: PURPLE },
  deeptech: { icon: Cpu, accent: BRAND },
  free: { icon: Gift, accent: EMERALD },
};

// ── Pieces ────────────────────────────────────────────────────────────

function FreeTag({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="ml-auto pl-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
      style={dark ? { background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.35)" } : { background: `${EMERALD}1f`, color: EMERALD, border: `1px solid ${EMERALD}40` }}
    >
      Free
    </span>
  );
}

/** Course tile, as in the design file: icon + course name. */
function CourseTile({ course, pathway, accent }: { course: Course; pathway: PathwayKey; accent: string }) {
  return (
    <Link
      href={courseHref(course, pathway)}
      className="lx-tile group p-4 flex items-center lx-inset hover:-translate-y-0.5"
      style={{ ["--lx-accent" as any]: accent }}
    >
      <CourseIcon title={course.title} size={18} className="mr-3 flex-shrink-0 group-hover:scale-110 transition" />
      <span className="font-medium text-[var(--text-primary)]">{course.title}</span>
      {course.is_free && pathway !== "free" && <FreeTag />}
    </Link>
  );
}

/** DeepTech tile on the dark card. */
function DeepTechTile({ course, pathway }: { course: Course; pathway: PathwayKey }) {
  return (
    <Link href={courseHref(course, pathway)} className="lx-dt-card group p-6 block" style={{ borderRadius: RADIUS_SM }}>
      <CourseIcon title={course.title} size={26} className="mb-3 block text-indigo-300 group-hover:scale-110 transition" />
      <div className="flex items-start gap-2">
        <h4 className="font-semibold text-lg text-white leading-snug">{course.title}</h4>
        {course.is_free && <FreeTag dark />}
      </div>
    </Link>
  );
}

/** Accelerator's highlighted course. */
function FeaturedCard({ course, pathway }: { course: Course; pathway: PathwayKey }) {
  return (
    <Link
      href={courseHref(course, pathway)}
      className="group block text-white p-6 relative overflow-hidden border transition duration-300 hover:-translate-y-1"
      style={{ borderRadius: RADIUS, background: "linear-gradient(135deg, #2e1065 0%, #3b1a8a 100%)", borderColor: "#4c1d95", boxShadow: "0 20px 50px rgba(46,16,101,0.35)" }}
    >
      <div className="absolute top-0 right-0 text-xs font-bold px-3 py-1" style={{ background: "#8b5cf6", borderBottomLeftRadius: "0.75rem" }}>
        POPULAR
      </div>
      <CourseIcon title={course.title} size={30} className="text-violet-300 mb-4 block" />
      <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-200 transition pr-16">{course.title}</h3>
      {course.description && <p className="text-slate-300 text-sm mb-4 line-clamp-2">{course.description}</p>}
      <span className="inline-flex items-center text-violet-200 text-sm font-semibold group-hover:translate-x-1 transition-transform">
        View Program <ArrowRight size={15} className="ml-2" />
      </span>
    </Link>
  );
}

function TileSkeleton({ dark = false }: { dark?: boolean }) {
  const block = dark ? "bg-slate-700" : "bg-[var(--border-strong)]";
  return (
    <div
      className={`p-4 animate-pulse flex items-center border ${dark ? "bg-slate-800 border-slate-700" : "bg-[var(--surface-alt)] border-[var(--border-subtle)]"}`}
      style={{ borderRadius: RADIUS_SM }}
    >
      <div className={`w-5 h-5 rounded mr-3 ${block}`} />
      <div className={`h-4 rounded-full w-2/3 ${block}`} />
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
  return <p className={`text-center py-8 text-lg ${dark ? "text-slate-400" : "text-[var(--text-muted)]"}`}>{emptyText}</p>;
}

function Outcome({ pathway, accent, dark = false }: { pathway: PathwayKey; accent: string; dark?: boolean }) {
  const p = PATHWAYS[pathway];
  if (dark) {
    return (
      <div className="p-5 border border-slate-700 relative z-10 text-slate-200" style={{ borderRadius: RADIUS_SM, background: "rgba(30,41,59,0.6)" }}>
        <strong className="text-white">Outcome:</strong> {p.outcome}
        {p.outcomeNote && <span className="font-semibold ml-2" style={{ color: "#a5b4fc" }}>{p.outcomeNote}</span>}
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
        className={dark ? "inline-flex items-center gap-2 px-6 py-3 font-semibold text-white border border-slate-600 hover:border-indigo-400 hover:gap-3 transition-all" : "lx-btn-outline px-6 py-3"}
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
  // ── DeepTech: dark flagship card ────────────────────────────────────
  if (pathway === "deeptech") {
    const grid = "grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-8";
    return (
      <div id={pathway} className={`scroll-mt-28 ${className}`}>
        <PathwayHeader pathway={pathway} flagship />
        <div className="text-white p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800" style={{ borderRadius: RADIUS, background: DT_BG }}>
          <div className="absolute top-0 right-0 w-72 h-72 blur-[90px] rounded-full pointer-events-none" style={{ background: `${BRAND}40` }} />
          <p className="text-lg text-slate-300 mb-8 max-w-3xl relative z-10">{p.audience}</p>

          {loading ? (
            <div className={grid}>{[1, 2, 3].map((i) => <TileSkeleton key={i} dark />)}</div>
          ) : error || empty ? (
            <div className="relative z-10 mb-8"><StateMessage error={error} onRetry={onRetry} emptyText={emptyText} dark /></div>
          ) : (
            <div className={grid}>
              {shown.map((course) => <DeepTechTile key={course.id} course={course} pathway={pathway} />)}
            </div>
          )}

          <Outcome pathway={pathway} accent={accent} dark />
          {viewAllHref && <ViewAll href={viewAllHref} label={viewAllLabel} dark />}
        </div>
      </div>
    );
  }

  // ── Accelerator: tiles + highlighted "Popular" course ───────────────
  if (pathway === "accelerator") {
    const featured = shown.find((c) => /automation|agent/i.test(c.title)) ?? shown[0];
    const rest = shown.filter((c) => c !== featured);
    return (
      <div id={pathway} className={`scroll-mt-28 ${className}`}>
        <PathwayHeader pathway={pathway} />
        <div className="lx-card p-6 md:p-8">
          <p className="text-lg text-[var(--text-secondary)] mb-8">{p.audience}</p>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">{[1, 2, 3].map((i) => <TileSkeleton key={i} />)}</div>
              <div className="animate-pulse min-h-[180px]" style={{ borderRadius: RADIUS, background: `${PURPLE}22` }} />
            </div>
          ) : error || empty ? (
            <StateMessage error={error} onRetry={onRetry} emptyText={emptyText} />
          ) : (
            <div className={`grid grid-cols-1 ${rest.length ? "lg:grid-cols-2" : ""} gap-6 items-start`}>
              {rest.length > 0 && (
                <div className="space-y-4">
                  {rest.map((course) => <CourseTile key={course.id} course={course} pathway={pathway} accent={accent} />)}
                </div>
              )}
              {featured && <FeaturedCard course={featured} pathway={pathway} />}
            </div>
          )}

          <Outcome pathway={pathway} accent={accent} />
          {viewAllHref && <ViewAll href={viewAllHref} label={viewAllLabel} />}
        </div>
      </div>
    );
  }

  // ── Foundation / Flex and Free: tiles grid ──────────────────────────
  const grid = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
  return (
    <div id={pathway} className={`scroll-mt-28 ${className}`}>
      <PathwayHeader pathway={pathway} />
      <div className="lx-card p-6 md:p-8">
        <p className="text-lg text-[var(--text-secondary)] mb-8">{p.audience}</p>

        {loading ? (
          <div className={grid}>{[1, 2, 3, 4, 5, 6].map((i) => <TileSkeleton key={i} />)}</div>
        ) : error || empty ? (
          <StateMessage error={error} onRetry={onRetry} emptyText={emptyText} />
        ) : (
          <div className={grid}>
            {shown.map((course) => <CourseTile key={course.id} course={course} pathway={pathway} accent={accent} />)}
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
      .lx-dt-card {
        background: #1e293b;
        border: 1px solid #334155;
        transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
      }
      .lx-tile { transition: border-color 0.25s, background 0.25s, transform 0.25s, box-shadow 0.25s; }
      .lx-tile svg { color: var(--lx-accent); }
      .lx-tile:hover { border-color: var(--lx-accent); box-shadow: 0 8px 24px var(--lx-glow, rgba(74,58,255,0.15)); }
      .lx-dt-card:hover {
        border-color: ${BRAND};
        box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${BRAND}40;
        transform: translateY(-4px);
      }
    `}</style>
  );
}
