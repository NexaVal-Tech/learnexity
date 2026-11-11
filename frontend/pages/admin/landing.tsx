// pages/admin/landing.tsx
//
// Admin → Landing Page: edit every text, button, link and image on the
// marketing landing page (landing/index.html), show or hide sections, set
// the offer end date, pick instructors from Meet Our Team and add a Meta
// Pixel. The offer's registration fees are NOT edited here — they come
// live from Course Settings → Registration fee, so they match checkout.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi, handleAdminApiError } from '@/lib/adminApi';
import { formatMoney } from '@/lib/format';
import {
  Loader2, Save, ChevronDown, Plus, Trash2, ArrowUp, ArrowDown, Upload, ExternalLink, RotateCcw, Eye, EyeOff, Info,
} from 'lucide-react';

type Json = any;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const INPUT = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/15 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white';
const LABEL = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1';
const CARD = 'bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl';

const SECTIONS: { key: string; title: string; hint?: string }[] = [
  { key: 'ctas', title: 'Main buttons', hint: 'The buttons repeated through the page (hero, “Who should apply”, pathway, closing). The header button uses the one whose text mentions “eligibility”.' },
  { key: 'hero', title: 'Hero (top of the page)' },
  { key: 'intro', title: 'Intro paragraphs' },
  { key: 'gain', title: 'What you will gain' },
  { key: 'who', title: 'Who should apply?' },
  { key: 'how', title: 'How it works', hint: 'Steps are numbered automatically in the order shown.' },
  { key: 'offer', title: 'Black Friday offer', hint: 'Registration fees come from Course Settings → Registration fee (same as checkout). After the end date the page shows the “offer ended” text until you set a new date.' },
  { key: 'pathway', title: 'Find your pathway' },
  { key: 'discover', title: 'Discover more (webinars)' },
  { key: 'instructors', title: 'Meet your instructors', hint: 'Photos, names, roles and LinkedIn come from the Meet Our Team page.' },
  { key: 'closing', title: 'Closing banner & disclaimer' },
  { key: 'seo', title: 'Search & sharing (SEO)' },
];

const LABELS: Record<string, string> = {
  ctas: 'Buttons', eyebrow: 'Small label above the heading', heading: 'Heading', subheading: 'Text under the heading', text: 'Text',
  image: 'Image', show_ctas: 'Show the main buttons here', paragraphs: 'Paragraphs', items: 'Items', steps: 'Steps',
  title: 'Title', label: 'Button text', href: 'Link', style: 'Style', ends_at: 'Offer ends (your local time)',
  ends_label: 'Line under the table', ended_heading: 'Heading when the offer has ended', ended_text: 'Text when the offer has ended',
  col_program: 'Column: program', col_regular: 'Column: regular tuition', col_fee: 'Column: registration fee', row_button: 'Button in each row',
  rows: 'Programs', pathway: 'Pathway (sets the live fee)', regular_usd: 'Regular tuition (USD)', regular_ngn: 'Regular tuition (NGN, optional)',
  badge: 'Date badge', button: 'Button text', names: 'Instructors to show', link_label: 'Link text', link_href: 'Link',
  learn_more_label: '“Learn more” text', learn_more_href: '“Learn more” link', disclaimer: 'Disclaimer', description: 'Description',
};
const LONG = new Set(['text', 'subheading', 'disclaimer', 'ended_text', 'description']);
const PATHWAY_LABEL: Record<string, string> = { deeptech: 'DeepTech', accelerator: 'Career Accelerator', flex: 'Flex' };

function imgSrc(v: string): string {
  if (!v) return '';
  if (v.startsWith('assets/')) return ''; // bundled with the landing page — no preview here
  if (v.startsWith('/storage/')) return API_URL + v;
  return v;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const preview = imgSrc(value);
  const upload = async (file: File) => {
    setErr(null);
    if (file.size > 6 * 1024 * 1024) return setErr('Max 6 MB.');
    const fd = new FormData();
    fd.append('image', file);
    try {
      setBusy(true);
      const r = await adminApi.post<{ url: string }>('/api/admin/landing/image', fd);
      onChange(r.url);
    } catch (e) {
      setErr(handleAdminApiError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex gap-3 items-start">
      <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] text-gray-500 text-center p-1">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : value ? (
          <span>Default image<br />{value.replace('assets/', '')}</span>
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-200">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload new
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-sm text-red-600 px-2">Remove</button>
          )}
        </div>
        <input className={INPUT} value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste an https:// image link" />
        {err && <p className="text-xs text-red-600">{err}</p>}
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
      </div>
    </div>
  );
}

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Renders a field (or a nested object / list) based on its key and default shape. */
function Field({ k, value, def, onChange, team }: { k: string; value: Json; def: Json; onChange: (v: Json) => void; team: { name: string; role: string | null }[] }) {
  const label = LABELS[k] ?? k.replace(/_/g, ' ');

  if (k === 'show') return null; // handled in the section header
  if (k === 'show_ctas') {
    return (
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-[#4A3AFF]" /> {label}
      </label>
    );
  }
  if (k === 'image') return <div><label className={LABEL}>{label}</label><ImageField value={value ?? ''} onChange={onChange} /></div>;
  if (k === 'ends_at') {
    return (
      <div>
        <label className={LABEL}>{label}</label>
        <input type="datetime-local" className={INPUT} value={toLocalInput(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
        <p className="text-[11px] text-gray-500 mt-1">Leave empty for no countdown. A past date shows the “offer ended” text.</p>
      </div>
    );
  }
  if (k === 'style') {
    return (
      <div><label className={LABEL}>{label}</label>
        <select className={INPUT} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="primary">Brand (purple)</option><option value="outline">Outline</option><option value="ghost">Soft purple</option><option value="light">White</option>
        </select>
      </div>
    );
  }
  if (k === 'pathway') {
    return (
      <div><label className={LABEL}>{label}</label>
        <select className={INPUT} value={value} onChange={(e) => onChange(e.target.value)}>
          {Object.entries(PATHWAY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    );
  }
  if (k === 'regular_usd' || k === 'regular_ngn') {
    return (
      <div><label className={LABEL}>{label}</label>
        <input type="number" min={0} step="1" className={INPUT} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
      </div>
    );
  }
  if (k === 'names') {
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className={LABEL}>{label}</label>
        <p className="text-[11px] text-gray-500 mb-2">Tick the people to show, in this order. Leave everyone unticked to show all instructors automatically.</p>
        <div className="grid sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
          {team.map((m) => {
            const on = selected.includes(m.name);
            return (
              <label key={m.name} className={`flex items-start gap-2 text-sm p-2 rounded-lg border ${on ? 'border-[#4A3AFF] bg-[#4A3AFF]/5' : 'border-gray-200 dark:border-white/10'}`}>
                <input type="checkbox" className="mt-0.5 accent-[#4A3AFF]" checked={on}
                  onChange={(e) => onChange(e.target.checked ? [...selected, m.name] : selected.filter((n) => n !== m.name))} />
                <span className="min-w-0"><span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                  {m.role && <span className="block text-xs text-gray-500 truncate">{m.role}</span>}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // Nested object
  if (def && typeof def === 'object' && !Array.isArray(def)) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {Object.keys(def).filter((kk) => kk !== 'show').map((kk) => {
          const wide = LONG.has(kk) || ['image', 'href', 'heading', 'title', 'names', 'paragraphs', 'items', 'steps', 'rows'].includes(kk) || kk.endsWith('href');
          return (
            <div key={kk} className={wide ? 'sm:col-span-2' : ''}>
              <Field k={kk} value={value?.[kk]} def={def[kk]} team={team} onChange={(v) => onChange({ ...(value ?? {}), [kk]: v })} />
            </div>
          );
        })}
      </div>
    );
  }

  // List
  if (Array.isArray(def)) {
    const list: Json[] = Array.isArray(value) ? value : [];
    const template = def[0] ?? '';
    const isObj = template && typeof template === 'object';
    const move = (i: number, d: number) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      onChange(next);
    };
    return (
      <div>
        <label className={LABEL}>{label}</label>
        <div className="space-y-3">
          {list.map((item, i) => (
            <div key={i} className={`flex gap-2 items-start ${isObj ? 'p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]' : ''}`}>
              <div className="flex-1 min-w-0">
                {isObj ? (
                  <Field k={`${k}_item`} value={item} def={template} team={team} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} />
                ) : (
                  <textarea rows={3} className={INPUT} value={item ?? ''} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move up"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="p-1.5 text-gray-500 disabled:opacity-30" aria-label="Move down"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="p-1.5 text-red-500" aria-label="Remove"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onChange([...list, isObj ? JSON.parse(JSON.stringify(template)) : ''])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#4A3AFF]">
          <Plus size={14} /> Add
        </button>
      </div>
    );
  }

  // Plain text
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {LONG.has(k) ? (
        <textarea rows={3} className={INPUT} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={INPUT} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
          placeholder={k.endsWith('href') ? 'https://… or /path on learnexity.org' : ''} />
      )}
    </div>
  );
}

interface LoadResponse {
  content: Json;
  defaults: Json;
  meta_pixel_id: string | null;
  fees: Record<string, { usd: number; ngn: number }>;
  team: { name: string; role: string | null }[];
  page_url: string;
  updated_at: string | null;
}

export default function AdminLandingPage() {
  const [data, setData] = useState<LoadResponse | null>(null);
  const [content, setContent] = useState<Json>(null);
  const [pixel, setPixel] = useState('');
  const [open, setOpen] = useState<string | null>('hero');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    adminApi.get<LoadResponse>('/api/admin/landing')
      .then((r) => { setData(r); setContent(r.content); setPixel(r.meta_pixel_id ?? ''); })
      .catch((e) => setMsg({ ok: false, text: handleAdminApiError(e) }));
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (key: string, v: Json) => { setContent((c: Json) => ({ ...c, [key]: v })); setDirty(true); };

  const save = async () => {
    try {
      setSaving(true); setMsg(null);
      const r = await adminApi.put<{ content: Json; message: string }>('/api/admin/landing', { content, meta_pixel_id: pixel.trim() || null });
      setContent(r.content); setDirty(false);
      setMsg({ ok: true, text: 'Saved — the landing page shows the changes straight away.' });
    } catch (e) {
      setMsg({ ok: false, text: handleAdminApiError(e) });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm('Reset every section of the landing page to the original content? Your edits will be lost.')) return;
    try {
      const r = await adminApi.post<{ content: Json }>('/api/admin/landing/reset');
      setContent(r.content); setDirty(false);
      setMsg({ ok: true, text: 'Reset to the original content.' });
    } catch (e) {
      setMsg({ ok: false, text: handleAdminApiError(e) });
    }
  };

  const fees = data?.fees;
  const feeLine = useMemo(() => fees
    ? Object.entries(fees).map(([k, f]) => `${PATHWAY_LABEL[k] ?? k}: ${formatMoney(f.usd, 'USD')}${f.ngn ? ` / ${formatMoney(f.ngn, 'NGN')}` : ''}`).join(' · ')
    : '', [fees]);

  return (
    <AdminRouteGuard requiredPermission="landing">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6 pb-28 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Landing Page</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything on the marketing landing page — text, buttons, images, sections and the offer.</p>
            </div>
            <div className="flex gap-2">
              {data?.page_url && (
                <a href={data.page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-200">
                  Open page <ExternalLink size={14} />
                </a>
              )}
              <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-200">
                <RotateCcw size={14} /> Reset to original
              </button>
            </div>
          </div>

          {!content ? (
            <div className={`${CARD} p-10 flex justify-center`}>{msg ? <p className="text-sm text-red-600">{msg.text}</p> : <Loader2 className="animate-spin text-gray-400" />}</div>
          ) : (
            <>
              {feeLine && (
                <div className={`${CARD} p-4 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200`}>
                  <Info size={16} className="text-[#4A3AFF] mt-0.5 flex-shrink-0" />
                  <span><strong>Live registration fees used in the offer table:</strong> {feeLine}. Change them in Course Settings → Registration fee.</span>
                </div>
              )}

              {SECTIONS.map(({ key, title, hint }) => {
                const val = content[key];
                const def = data!.defaults[key];
                const hasShow = val && typeof val === 'object' && !Array.isArray(val) && 'show' in val;
                const isOpen = open === key;
                return (
                  <div key={key} className={CARD}>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <button type="button" onClick={() => setOpen(isOpen ? null : key)} className="flex-1 flex items-center gap-2 text-left">
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        <span className={`font-semibold ${hasShow && !val.show ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{title}</span>
                      </button>
                      {hasShow && (
                        <button type="button" onClick={() => update(key, { ...val, show: !val.show })}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${val.show ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'bg-gray-100 text-gray-500 dark:bg-white/10'}`}>
                          {val.show ? <Eye size={13} /> : <EyeOff size={13} />} {val.show ? 'Shown' : 'Hidden'}
                        </button>
                      )}
                    </div>
                    {isOpen && (
                      <div className="border-t border-gray-100 dark:border-white/10 p-4 space-y-3">
                        {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
                        <Field k={key} value={val} def={def} team={data!.team} onChange={(v) => update(key, v)} />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className={`${CARD} p-4 space-y-2`}>
                <p className="font-semibold text-gray-900 dark:text-white">Meta (Facebook) Pixel</p>
                <p className="text-xs text-gray-500">Optional. Paste the Pixel ID from Meta Events Manager (numbers only) to track visits from your ads.</p>
                <input className={`${INPUT} max-w-xs`} value={pixel} onChange={(e) => { setPixel(e.target.value.replace(/\D/g, '')); setDirty(true); }} placeholder="e.g. 123456789012345" inputMode="numeric" />
              </div>
            </>
          )}

          {/* Sticky save bar */}
          {content && (
            <div className="fixed bottom-0 inset-x-0 lg:left-64 z-30 bg-white/95 dark:bg-[#0f0f14]/95 backdrop-blur border-t border-gray-200 dark:border-white/10 px-6 py-3 flex flex-wrap items-center gap-3">
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4A3AFF] text-white text-sm font-semibold disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save landing page
              </button>
              {dirty && !msg && <span className="text-sm text-gray-500">Unsaved changes</span>}
              {msg && <span className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
