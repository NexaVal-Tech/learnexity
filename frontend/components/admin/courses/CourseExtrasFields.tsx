// components/admin/courses/CourseExtrasFields.tsx
//
// Shared by the Create and Edit course modals:
//   - InstructorsFields: the course's own instructors (photo, name, role,
//     optional website + social links)
//   - ComparePricesFields: optional slashed "was" price per track, USD + NGN
import React, { useRef } from "react";
import { Plus, Trash2, Upload, UserRound, ArrowUp, ArrowDown } from "lucide-react";
import MoneyInput from "@/components/ui/MoneyInput";
import type { ComparePrices, CourseInstructor } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const INPUT =
  "w-full px-3 py-2.5 text-sm text-gray-800 dark:text-white border border-gray-200 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 focus:ring-2 focus:ring-[#0F172A] dark:focus:ring-white/30 focus:border-transparent";
const LABEL = "block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5";

export function storageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("blob:")) return path;
  if (path.startsWith("/storage/")) return `${API_URL}${path}`;
  return `${API_URL}/storage/${path.replace(/^\/?(storage\/)?/, "")}`;
}

// ─── Instructors ──────────────────────────────────────────────────────────

export interface InstructorDraft {
  name: string;
  role: string;
  website: string;
  socials: { platform: string; url: string }[];
  /** Existing stored photo (path or URL). */
  photo: string | null;
  photoFile: File | null;
  photoPreview: string | null;
}

export const emptyInstructor = (): InstructorDraft => ({
  name: "", role: "", website: "", socials: [], photo: null, photoFile: null, photoPreview: null,
});

export function instructorsFromCourse(list?: CourseInstructor[] | null): InstructorDraft[] {
  return (list ?? []).map((i) => ({
    name: i.name ?? "",
    role: i.role ?? "",
    website: i.website ?? "",
    socials: (i.socials ?? []).map((s) => ({ platform: s.platform, url: s.url })),
    photo: i.photo ?? null,
    photoFile: null,
    photoPreview: null,
  }));
}

export function instructorsToFormData(list: InstructorDraft[]): FormData {
  const fd = new FormData();
  list
    .filter((i) => i.name.trim())
    .forEach((i, idx) => {
      fd.append(`instructors[${idx}][name]`, i.name.trim());
      fd.append(`instructors[${idx}][role]`, i.role.trim());
      if (i.website.trim()) fd.append(`instructors[${idx}][website]`, i.website.trim());
      if (i.photoFile) fd.append(`instructor_photos[${idx}]`, i.photoFile);
      else if (i.photo) fd.append(`instructors[${idx}][photo_url]`, i.photo);
      i.socials
        .filter((s) => s.url.trim())
        .forEach((s, j) => {
          fd.append(`instructors[${idx}][socials][${j}][platform]`, s.platform);
          fd.append(`instructors[${idx}][socials][${j}][url]`, s.url.trim());
        });
    });
  // An empty list must still reach the server so removing everyone works.
  if (!list.some((i) => i.name.trim())) fd.append("instructors", "");
  return fd;
}

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "github", label: "GitHub" },
];

function PhotoPicker({ draft, onChange }: { draft: InstructorDraft; onChange: (d: InstructorDraft) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const src = draft.photoPreview || storageUrl(draft.photo);
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center bg-gray-50 dark:bg-white/5 hover:border-[#0F172A] dark:hover:border-white/50"
        aria-label="Upload photo"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <UserRound className="text-gray-400" size={28} />
        )}
      </button>
      <button type="button" onClick={() => ref.current?.click()} className="text-xs text-gray-600 dark:text-gray-300 inline-flex items-center gap-1">
        <Upload size={12} /> {src ? "Change" : "Photo"}
      </button>
      {src && (
        <button type="button" onClick={() => onChange({ ...draft, photo: null, photoFile: null, photoPreview: null })} className="text-[11px] text-red-500">
          Remove
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (file) onChange({ ...draft, photoFile: file, photoPreview: URL.createObjectURL(file) });
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function InstructorsFields({ value, onChange }: { value: InstructorDraft[]; onChange: (v: InstructorDraft[]) => void }) {
  const update = (i: number, d: InstructorDraft) => onChange(value.map((x, j) => (j === i ? d : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Shown on the course page under &ldquo;Your Instructors&rdquo;. Website and social links are optional.
      </p>
      {value.map((d, i) => (
        <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.03]">
          <div className="flex gap-4">
            <PhotoPicker draft={d} onChange={(nd) => update(i, nd)} />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Name</label>
                <input className={INPUT} value={d.name} onChange={(e) => update(i, { ...d, name: e.target.value })} placeholder="Ada Obi" />
              </div>
              <div>
                <label className={LABEL}>Role</label>
                <input className={INPUT} value={d.role} onChange={(e) => update(i, { ...d, role: e.target.value })} placeholder="Senior ML Engineer, Google" />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL}>Website (optional)</label>
                <input className={INPUT} value={d.website} onChange={(e) => update(i, { ...d, website: e.target.value })} placeholder="https://…" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className={LABEL}>Social links (optional)</label>
                {d.socials.map((s, j) => (
                  <div key={j} className="flex gap-2">
                    <select
                      className={`${INPUT} w-40 flex-shrink-0`}
                      value={s.platform}
                      onChange={(e) => update(i, { ...d, socials: d.socials.map((x, k) => (k === j ? { ...x, platform: e.target.value } : x)) })}
                    >
                      {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <input
                      className={INPUT}
                      value={s.url}
                      placeholder="https://…"
                      onChange={(e) => update(i, { ...d, socials: d.socials.map((x, k) => (k === j ? { ...x, url: e.target.value } : x)) })}
                    />
                    <button type="button" onClick={() => update(i, { ...d, socials: d.socials.filter((_, k) => k !== j) })} className="p-2 text-red-500" aria-label="Remove link">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {d.socials.length < 6 && (
                  <button
                    type="button"
                    onClick={() => update(i, { ...d, socials: [...d.socials, { platform: "linkedin", url: "" }] })}
                    className="text-xs font-medium text-gray-700 dark:text-gray-300 inline-flex items-center gap-1"
                  >
                    <Plus size={13} /> Add social link
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move up"><ArrowUp size={15} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move down"><ArrowDown size={15} /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="p-1.5 text-red-500" aria-label="Remove instructor"><Trash2 size={15} /></button>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, emptyInstructor()])}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-white/20 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-[#0F172A] dark:hover:border-white/50"
      >
        <Plus size={15} /> Add instructor
      </button>
    </div>
  );
}

// ─── Slashed prices ───────────────────────────────────────────────────────

export type ComparePricesDraft = Record<"self_paced" | "group_mentorship" | "one_on_one" | "intermediate", { usd: string; ngn: string }>;

const TRACKS: { key: keyof ComparePricesDraft; label: string; offer: string }[] = [
  { key: "group_mentorship", label: "Live Classes (Group)", offer: "offers_group_mentorship" },
  { key: "one_on_one", label: "One-on-One", offer: "offers_one_on_one" },
  { key: "intermediate", label: "Career Accelerator", offer: "offers_intermediate" },
  { key: "self_paced", label: "Self-Paced", offer: "offers_self_paced" },
];

export const emptyComparePrices = (): ComparePricesDraft => ({
  self_paced: { usd: "", ngn: "" },
  group_mentorship: { usd: "", ngn: "" },
  one_on_one: { usd: "", ngn: "" },
  intermediate: { usd: "", ngn: "" },
});

export function comparePricesFromCourse(cp?: ComparePrices | null): ComparePricesDraft {
  const d = emptyComparePrices();
  (Object.keys(d) as (keyof ComparePricesDraft)[]).forEach((k) => {
    d[k] = { usd: cp?.[k]?.usd != null ? String(cp[k]!.usd) : "", ngn: cp?.[k]?.ngn != null ? String(cp[k]!.ngn) : "" };
  });
  return d;
}

export function comparePricesToPayload(d: ComparePricesDraft): ComparePrices {
  const out: ComparePrices = {};
  (Object.keys(d) as (keyof ComparePricesDraft)[]).forEach((k) => {
    const usd = parseFloat(d[k].usd);
    const ngn = parseFloat(d[k].ngn);
    if (usd > 0 || ngn > 0) out[k] = { usd: usd > 0 ? usd : null, ngn: ngn > 0 ? ngn : null };
  });
  return out;
}

export function ComparePricesFields({
  value,
  onChange,
  offers,
}: {
  value: ComparePricesDraft;
  onChange: (v: ComparePricesDraft) => void;
  /** Course track flags, e.g. { offers_self_paced: true } — tracks not offered are hidden. */
  offers?: Record<string, any>;
}) {
  const tracks = TRACKS.filter((t) => !offers || offers[t.offer]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Optional. A slashed price is shown crossed out next to the real price (e.g. <span className="line-through">₦500,000</span> ₦350,000). Leave empty to show only the real price.
      </p>
      {tracks.length === 0 && <p className="text-sm text-gray-500">Turn on a learning track under Pricing first.</p>}
      {tracks.map((t) => (
        <div key={t.key} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr_1fr] gap-3 items-end">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 sm:pb-2.5">{t.label}</p>
          <div>
            <label className={LABEL}>Was (₦)</label>
            <MoneyInput prefix="₦" className={INPUT} value={value[t.key].ngn} onValueChange={(v) => onChange({ ...value, [t.key]: { ...value[t.key], ngn: v } })} placeholder="500,000" />
          </div>
          <div>
            <label className={LABEL}>Was ($)</label>
            <MoneyInput prefix="$" className={INPUT} value={value[t.key].usd} onValueChange={(v) => onChange({ ...value, [t.key]: { ...value[t.key], usd: v } })} placeholder="999" />
          </div>
        </div>
      ))}
    </div>
  );
}
