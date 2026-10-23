// pages/admin/tv.tsx
//
// Admin → Learnexity TV webinar (tv.learnexity.org): webinar settings
// (date, prices, joining/recording links, open/closed), the list of
// registrations with payment + consultation tracking, CSV export, and
// bulk emails for the joining link and the recording.
import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi, handleAdminApiError } from '@/lib/adminApi';
import { formatMoney } from '@/lib/format';
import {
  Loader2, Save, Download, Send, Video, Search, ExternalLink, Trash2, ChevronDown, Users, Crown, Clock, CalendarCheck,
} from 'lucide-react';

type Tier = 'free' | 'premium';
type Payment = 'none' | 'pending' | 'paid' | 'failed';
type Consult = 'not_applicable' | 'to_schedule' | 'scheduled' | 'done';

interface TvSettings {
  title: string;
  event_at: string | null;
  event_time_label: string | null;
  price_usd: number;
  price_ngn: number | null;
  join_link: string | null;
  recording_link: string | null;
  whatsapp_number: string | null;
  registration_open: boolean;
  premium_open: boolean;
  premium_capacity: number | null;
  premium_seats_left: number | null;
  page_url: string;
}

interface TvRegistration {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  tier: Tier;
  learn_about: string | null;
  career_concern: string | null;
  heard_from: string | null;
  consultation_focus: 'career' | 'monetization' | null;
  payment_status: Payment;
  amount: number | null;
  currency: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  paid_at: string | null;
  consultation_status: Consult;
  consultation_at: string | null;
  admin_notes: string | null;
  join_link_sent_at: string | null;
  recording_sent_at: string | null;
  created_at: string;
}

interface Stats {
  total: number; free: number; premium_paid: number; payment_pending: number; to_schedule: number;
  revenue_usd: number; revenue_ngn: number; join_link_unsent: number;
}

const INPUT = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/15 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white';
const LABEL = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1';
const CARD = 'bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl';

const PAY_BADGE: Record<Payment, string> = {
  none: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
  pending: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};
const CONSULT_LABEL: Record<Consult, string> = {
  not_applicable: '—', to_schedule: 'To schedule', scheduled: 'Scheduled', done: 'Done',
};
const HEARD: Record<string, string> = {
  linkedin: 'LinkedIn', twitter: 'Twitter / X', email: 'Email', friend: 'Friend / Colleague',
  whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook', other: 'Other',
};

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—');
const money = (amount: number | null, currency: string | null) =>
  amount == null ? '—' : formatMoney(amount, currency === 'NGN' ? 'NGN' : 'USD');

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsPanel({ onSaved }: { onSaved: () => void }) {
  const [s, setS] = useState<TvSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    adminApi.get<{ settings: TvSettings }>('/api/admin/tv/settings').then((r) => setS(r.settings)).catch((e) => setMsg({ ok: false, text: handleAdminApiError(e) }));
  }, []);

  if (!s) return <div className={`${CARD} p-6 flex justify-center`}><Loader2 className="animate-spin text-gray-400" /></div>;

  const set = <K extends keyof TvSettings>(k: K, v: TvSettings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    try {
      setSaving(true); setMsg(null);
      const r = await adminApi.put<{ settings: TvSettings }>('/api/admin/tv/settings', {
        title: s.title,
        event_at: s.event_at || null,
        event_time_label: s.event_time_label || null,
        price_usd: Number(s.price_usd) || 0,
        price_ngn: s.price_ngn ? Number(s.price_ngn) : null,
        join_link: s.join_link || null,
        recording_link: s.recording_link || null,
        whatsapp_number: s.whatsapp_number || null,
        registration_open: s.registration_open,
        premium_open: s.premium_open,
        premium_capacity: s.premium_capacity ? Number(s.premium_capacity) : null,
      });
      setS(r.settings);
      setMsg({ ok: true, text: 'Settings saved — the webinar page updates straight away.' });
      onSaved();
    } catch (e) {
      setMsg({ ok: false, text: handleAdminApiError(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${CARD} p-6 space-y-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Webinar settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Shown on the webinar page and in every email.</p>
        </div>
        <a href={s.page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#4A3AFF] hover:underline">
          Open webinar page <ExternalLink size={14} />
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={LABEL}>Webinar title</label>
          <input className={INPUT} value={s.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Date &amp; time (your local time)</label>
          <input type="datetime-local" className={INPUT} value={toLocalInput(s.event_at)}
            onChange={(e) => set('event_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </div>
        <div>
          <label className={LABEL}>Date label shown to people (optional)</label>
          <input className={INPUT} value={s.event_time_label ?? ''} onChange={(e) => set('event_time_label', e.target.value)} placeholder="Saturday, Nov 8 · 12pm ET / 6pm WAT" />
        </div>
        <div>
          <label className={LABEL}>Premium price (USD, Stripe)</label>
          <input type="number" min={0} step="0.01" className={INPUT} value={s.price_usd} onChange={(e) => set('price_usd', Number(e.target.value))} />
        </div>
        <div>
          <label className={LABEL}>Premium price for Nigeria (NGN, Paystack — optional)</label>
          <input type="number" min={0} step="1" className={INPUT} value={s.price_ngn ?? ''} onChange={(e) => set('price_ngn', e.target.value === '' ? null : Number(e.target.value))} placeholder="Leave empty: everyone pays in USD" />
        </div>
        <div className="md:col-span-2">
          <label className={LABEL}>Joining link (Zoom / Meet / YouTube Live)</label>
          <input className={INPUT} value={s.join_link ?? ''} onChange={(e) => set('join_link', e.target.value)} placeholder="https://…" />
        </div>
        <div className="md:col-span-2">
          <label className={LABEL}>Recording link (Premium only)</label>
          <input className={INPUT} value={s.recording_link ?? ''} onChange={(e) => set('recording_link', e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className={LABEL}>WhatsApp number</label>
          <input className={INPUT} value={s.whatsapp_number ?? ''} onChange={(e) => set('whatsapp_number', e.target.value)} placeholder="12762528415" />
        </div>
        <div>
          <label className={LABEL}>Premium seats (optional)</label>
          <input type="number" min={1} className={INPUT} value={s.premium_capacity ?? ''} onChange={(e) => set('premium_capacity', e.target.value === '' ? null : Number(e.target.value))} placeholder="Unlimited" />
          {s.premium_seats_left != null && <p className="text-xs text-gray-500 mt-1">{s.premium_seats_left} left</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input type="checkbox" checked={s.registration_open} onChange={(e) => set('registration_open', e.target.checked)} className="accent-[#4A3AFF]" />
          Registration open
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input type="checkbox" checked={s.premium_open} onChange={(e) => set('premium_open', e.target.checked)} className="accent-[#4A3AFF]" />
          Premium pass on sale
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A3AFF] text-white text-sm font-semibold disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save settings
        </button>
        {msg && <span className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
      </div>
    </div>
  );
}

// ─── One registration row (expandable) ───────────────────────────────────────
function RegistrationRow({ r, onChanged }: { r: TvRegistration; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Consult>(r.consultation_status);
  const [when, setWhen] = useState(toLocalInput(r.consultation_at));
  const [notes, setNotes] = useState(r.admin_notes ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async (extra: Record<string, unknown> = {}) => {
    try {
      setBusy(true); setMsg(null);
      await adminApi.put(`/api/admin/tv/registrations/${r.id}`, {
        consultation_status: status,
        consultation_at: when ? new Date(when).toISOString() : null,
        admin_notes: notes || null,
        ...extra,
      });
      setMsg('Saved');
      onChanged();
    } catch (e) {
      setMsg(handleAdminApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete ${r.full_name}'s registration? This cannot be undone.`)) return;
    try { await adminApi.delete(`/api/admin/tv/registrations/${r.id}`); onChanged(); } catch (e) { alert(handleAdminApiError(e)); }
  };

  return (
    <>
      <tr className="border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <td className="py-3 px-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.full_name}</p>
          <p className="text-xs text-gray-500">{r.email}</p>
        </td>
        <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{r.phone || '—'}</td>
        <td className="py-3 px-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${r.tier === 'premium' ? 'bg-[#4A3AFF]/10 text-[#4A3AFF]' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}`}>
            {r.tier === 'premium' ? 'Premium' : 'Free'}
          </span>
        </td>
        <td className="py-3 px-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${PAY_BADGE[r.payment_status]}`}>{r.payment_status === 'none' ? 'No payment' : r.payment_status}</span>
          {r.payment_status === 'paid' && <p className="text-xs text-gray-500 mt-0.5">{money(r.amount, r.currency)} · {r.payment_method}</p>}
        </td>
        <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-300">{CONSULT_LABEL[r.consultation_status]}</td>
        <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
        <td className="py-3 px-3 text-right"><ChevronDown size={16} className={`inline text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} /></td>
      </tr>
      {open && (
        <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/60 dark:bg-white/[0.02]">
          <td colSpan={7} className="p-4">
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {r.learn_about && <p><span className="text-gray-500">Wants to learn:</span> {r.learn_about}</p>}
                {r.career_concern && <p><span className="text-gray-500">Career concern:</span> {r.career_concern}</p>}
                {r.heard_from && <p><span className="text-gray-500">Heard from:</span> {HEARD[r.heard_from] ?? r.heard_from}</p>}
                {r.consultation_focus && <p><span className="text-gray-500">Consultation focus:</span> {r.consultation_focus === 'monetization' ? 'Monetization & Business Strategy' : 'Career Strategy & Mapping'}</p>}
                {r.transaction_id && <p className="break-all"><span className="text-gray-500">Payment reference:</span> {r.transaction_id}</p>}
                {r.paid_at && <p><span className="text-gray-500">Paid at:</span> {fmtDate(r.paid_at)}</p>}
                <p><span className="text-gray-500">Joining link sent:</span> {fmtDate(r.join_link_sent_at)}</p>
                {r.tier === 'premium' && <p><span className="text-gray-500">Recording sent:</span> {fmtDate(r.recording_sent_at)}</p>}
              </div>
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Consultation</label>
                    <select className={INPUT} value={status} onChange={(e) => setStatus(e.target.value as Consult)}>
                      <option value="not_applicable">Not applicable</option>
                      <option value="to_schedule">To schedule</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Consultation date</label>
                    <input type="datetime-local" className={INPUT} value={when} onChange={(e) => setWhen(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Notes (admin only)</label>
                  <textarea rows={3} className={INPUT} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button disabled={busy} onClick={() => save()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4A3AFF] text-white text-sm font-semibold disabled:opacity-60">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                  </button>
                  {!(r.tier === 'premium' && r.payment_status === 'paid') && (
                    <button disabled={busy} onClick={() => { if (confirm('Mark this person as paid for the Premium pass (e.g. bank transfer)? They will get the Premium confirmation email.')) save({ mark_paid: true }); }}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 text-sm text-gray-700 dark:text-gray-200">
                      Mark as paid (manual)
                    </button>
                  )}
                  <button onClick={remove} className="ml-auto inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                {msg && <p className="text-xs text-gray-500">{msg}</p>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminTvPage() {
  const [rows, setRows] = useState<TvRegistration[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ tier: '', payment: '', consultation: '', search: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState<null | 'join' | 'recording'>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [audience, setAudience] = useState<'all' | 'free' | 'premium'>('all');
  const [onlyUnsent, setOnlyUnsent] = useState(true);

  const params = useCallback(() => {
    const p: Record<string, string | number> = { page };
    Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v; });
    return p;
  }, [filters, page]);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const r = await adminApi.get<{ registrations: TvRegistration[]; stats: Stats; pagination: typeof pagination }>('/api/admin/tv/registrations', { params: params() });
      setRows(r.registrations); setStats(r.stats); setPagination(r.pagination);
    } catch (e) {
      setError(handleAdminApiError(e));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const blob = await adminApi.get<Blob>('/api/admin/tv/registrations/export', { params: { ...params(), page: undefined }, responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `learnexity-tv-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setNotice({ ok: false, text: handleAdminApiError(e) });
    }
  };

  const sendJoin = async () => {
    const who = audience === 'all' ? 'everyone registered' : audience === 'free' ? 'free registrants' : 'paid Premium members';
    if (!confirm(`Email the joining link to ${who}${onlyUnsent ? ' who have not received it yet' : ''}?`)) return;
    try {
      setSending('join'); setNotice(null);
      const r = await adminApi.post<{ message: string }>('/api/admin/tv/send-join-link', { audience, only_unsent: onlyUnsent });
      setNotice({ ok: true, text: r.message }); load();
    } catch (e) {
      setNotice({ ok: false, text: handleAdminApiError(e) });
    } finally { setSending(null); }
  };

  const sendRecording = async () => {
    if (!confirm(`Email the recording link to paid Premium members${onlyUnsent ? ' who have not received it yet' : ''}?`)) return;
    try {
      setSending('recording'); setNotice(null);
      const r = await adminApi.post<{ message: string }>('/api/admin/tv/send-recording', { only_unsent: onlyUnsent });
      setNotice({ ok: true, text: r.message }); load();
    } catch (e) {
      setNotice({ ok: false, text: handleAdminApiError(e) });
    } finally { setSending(null); }
  };

  const setFilter = (k: keyof typeof filters, v: string) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };

  return (
    <AdminRouteGuard requiredPermission="tv">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Learnexity TV Webinar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registrations, payments and consultations for tv.learnexity.org.</p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: Users, label: 'Registrations', value: stats.total },
                { icon: Users, label: 'Free', value: stats.free },
                { icon: Crown, label: 'Premium (paid)', value: stats.premium_paid },
                { icon: CalendarCheck, label: 'Consultations to schedule', value: stats.to_schedule },
                { icon: Clock, label: 'Payments pending', value: stats.payment_pending },
              ].map((c) => (
                <div key={c.label} className={`${CARD} p-4`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><c.icon size={13} /> {c.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
                </div>
              ))}
              <div className={`${CARD} p-4 col-span-2 lg:col-span-5 flex flex-wrap gap-6 text-sm text-gray-700 dark:text-gray-200`}>
                <span>Revenue: <strong>{formatMoney(stats.revenue_usd, 'USD')}</strong></span>
                {stats.revenue_ngn > 0 && <span><strong>{formatMoney(stats.revenue_ngn, 'NGN')}</strong></span>}
                <span className="text-gray-500">{stats.join_link_unsent} have not received the joining link yet</span>
              </div>
            </div>
          )}

          <SettingsPanel onSaved={load} />

          {/* Bulk emails */}
          <div className={`${CARD} p-6 space-y-3`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send emails</h2>
            <div className="flex flex-wrap items-center gap-3">
              <select className={`${INPUT.replace('w-full', '')} w-auto`} value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)}>
                <option value="all">Everyone (free + paid Premium)</option>
                <option value="free">Free registrants only</option>
                <option value="premium">Paid Premium only</option>
              </select>
              <button onClick={sendJoin} disabled={!!sending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A3AFF] text-white text-sm font-semibold disabled:opacity-60">
                {sending === 'join' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send joining link
              </button>
              <button onClick={sendRecording} disabled={!!sending} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/15 text-sm font-semibold text-gray-800 dark:text-gray-100 disabled:opacity-60">
                {sending === 'recording' ? <Loader2 size={15} className="animate-spin" /> : <Video size={15} />} Send recording to Premium
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" checked={onlyUnsent} onChange={(e) => setOnlyUnsent(e.target.checked)} className="accent-[#4A3AFF]" />
                Only people who haven&apos;t received it yet
              </label>
            </div>
            <p className="text-xs text-gray-500">The links come from the settings above. Email wording can be edited in Website CMS → Emails → Learnexity TV.</p>
            {notice && <p className={`text-sm ${notice.ok ? 'text-emerald-600' : 'text-red-600'}`}>{notice.text}</p>}
          </div>

          {/* Registrations */}
          <div className={`${CARD} overflow-hidden`}>
            <div className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center border-b border-gray-100 dark:border-white/10">
              <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); setFilter('search', search.trim()); }}>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone, then press Enter" className={`${INPUT} pl-8`} />
              </form>
              <select className={`${INPUT} lg:w-36`} value={filters.tier} onChange={(e) => setFilter('tier', e.target.value)}>
                <option value="">All tiers</option><option value="free">Free</option><option value="premium">Premium</option>
              </select>
              <select className={`${INPUT} lg:w-40`} value={filters.payment} onChange={(e) => setFilter('payment', e.target.value)}>
                <option value="">All payments</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="none">No payment</option>
              </select>
              <select className={`${INPUT} lg:w-44`} value={filters.consultation} onChange={(e) => setFilter('consultation', e.target.value)}>
                <option value="">All consultations</option><option value="to_schedule">To schedule</option><option value="scheduled">Scheduled</option><option value="done">Done</option>
              </select>
              <button onClick={exportCsv} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/15 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                <Download size={15} /> Export CSV
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : error ? (
              <p className="p-6 text-sm text-red-600">{error}</p>
            ) : rows.length === 0 ? (
              <p className="p-10 text-center text-sm text-gray-500">No registrations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      {['Name', 'Phone', 'Tier', 'Payment', 'Consultation', 'Registered', ''].map((h) => (
                        <th key={h} className="py-2.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => <RegistrationRow key={r.id} r={r} onChanged={load} />)}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-3 p-4">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/15 disabled:opacity-40">Previous</button>
                <span className="text-sm text-gray-500">Page {pagination.current_page} of {pagination.last_page} · {pagination.total} people</span>
                <button disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/15 disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
