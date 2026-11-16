// components/Scholarship/ScholarshipCoursePicker.tsx
//
// Two-step picker for the scholarship: choose a PATHWAY first, then a course
// from that pathway. Used by the dashboard onboarding modal and by the
// scholarship page ("Change course"). Text only — no icons.
'use client';

import { useEffect, useState } from 'react';
import { API_URL, PATHWAYS, PATHWAY_ORDER, type PathwayKey } from '@/components/catalog/pathways';

const BRAND = '#4A3AFF';

type LiteCourse = { id: number; course_id: string; title: string; duration?: string | null; level?: string | null };

const cache: Partial<Record<PathwayKey, LiteCourse[]>> = {};

export const PATHWAY_LABEL: Record<PathwayKey, string> = {
  deeptech: 'DeepTech',
  accelerator: 'Career Accelerators',
  flex: 'Foundation / Flex',
  free: 'Free courses',
};

export default function ScholarshipCoursePicker({
  initialPathway,
  selectedCourseId,
  onPick,
  busyCourseId,
}: {
  initialPathway?: PathwayKey | null;
  selectedCourseId?: string | null;
  /** Called when a course is chosen. */
  onPick: (courseId: string, pathway: PathwayKey, title: string) => void;
  /** Shows "Opening…" on this course while the parent navigates. */
  busyCourseId?: string | null;
}) {
  const [pathway, setPathway] = useState<PathwayKey | null>(initialPathway ?? null);
  const [courses, setCourses] = useState<LiteCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pathway) return;
    let cancelled = false;
    const cached = cache[pathway];
    if (cached) { setCourses(cached); return; }
    setLoading(true);
    setError(null);
    fetch(`${API_URL}${PATHWAYS[pathway].endpoint}`, { headers: { Accept: 'application/json' } })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((data) => {
        const list: LiteCourse[] = (Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
          .filter((c: any) => c && c.course_id && c.title)
          .map((c: any) => ({ id: c.id, course_id: String(c.course_id), title: String(c.title), duration: c.duration ?? null, level: c.level ?? null }));
        cache[pathway] = list;
        if (!cancelled) setCourses(list);
      })
      .catch(() => { if (!cancelled) setError('Could not load the courses. Please check your connection and try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pathway]);

  return (
    <div className="scp">
      <style>{`
        .scp-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.6rem; }
        .scp-paths { display: grid; gap: 0.5rem; grid-template-columns: 1fr; margin-bottom: 1.25rem; }
        @media (min-width: 560px) { .scp-paths { grid-template-columns: repeat(3, 1fr); } }
        .scp-path { text-align: left; padding: 0.85rem 0.95rem; min-height: 48px; border-radius: 1rem 0.4rem 1rem 0.4rem; border: 1.5px solid var(--border-subtle); background: var(--surface-alt); color: var(--text-primary); cursor: pointer; transition: border-color .2s, background .2s; }
        .scp-path:hover { border-color: ${BRAND}88; }
        .scp-path.on { border-color: ${BRAND}; background: ${BRAND}14; box-shadow: 0 0 0 1px ${BRAND} inset; }
        .scp-path b { display: block; font-size: 0.92rem; }
        .scp-path span { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem; line-height: 1.35; }
        .scp-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 18rem; overflow-y: auto; padding-right: 0.15rem; }
        .scp-course { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; width: 100%; text-align: left; padding: 0.8rem 0.95rem; min-height: 52px; border-radius: 1rem 0.4rem 1rem 0.4rem; border: 1px solid var(--border-subtle); background: var(--surface-alt); color: var(--text-primary); cursor: pointer; transition: border-color .2s, background .2s; }
        .scp-course:hover { border-color: ${BRAND}88; }
        .scp-course.on { border-color: ${BRAND}; background: ${BRAND}12; }
        .scp-course:disabled { opacity: .6; cursor: wait; }
        .scp-course .t { font-size: 0.9rem; font-weight: 600; line-height: 1.3; }
        .scp-course .m { display: block; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.15rem; font-weight: 500; }
        .scp-course .go { font-size: 0.78rem; font-weight: 700; color: ${BRAND}; white-space: nowrap; }
        .scp-empty { font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1.25rem 0; }
      `}</style>

      <p className="scp-label">Step 1 — Choose a pathway</p>
      <div className="scp-paths" role="radiogroup" aria-label="Pathway">
        {PATHWAY_ORDER.slice().reverse().map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={pathway === k}
            className={`scp-path ${pathway === k ? 'on' : ''}`}
            onClick={() => setPathway(k)}
          >
            <b>{PATHWAY_LABEL[k]}</b>
            <span>{PATHWAYS[k].tagline}</span>
          </button>
        ))}
      </div>

      {pathway && (
        <>
          <p className="scp-label">Step 2 — Choose a {PATHWAY_LABEL[pathway]} course</p>
          <div className="scp-list" role="radiogroup" aria-label="Course">
            {loading ? (
              <p className="scp-empty">Loading courses…</p>
            ) : error ? (
              <p className="scp-empty">{error}</p>
            ) : courses.length === 0 ? (
              <p className="scp-empty">No courses in this pathway yet.</p>
            ) : (
              courses.map((c) => {
                const on = selectedCourseId === c.course_id;
                const busy = busyCourseId === c.course_id;
                const meta = [c.duration, c.level].filter(Boolean).join(' · ');
                return (
                  <button
                    key={c.course_id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`scp-course ${on ? 'on' : ''}`}
                    disabled={!!busyCourseId}
                    onClick={() => onPick(c.course_id, pathway, c.title)}
                  >
                    <span className="min-w-0">
                      <span className="t">{c.title}</span>
                      {meta && <span className="m">{meta}</span>}
                    </span>
                    <span className="go">{busy ? 'Opening…' : on ? 'Selected' : 'Select'}</span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
