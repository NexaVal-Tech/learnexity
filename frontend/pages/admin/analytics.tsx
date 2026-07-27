import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import {
  Activity, Users, TrendingUp, Search, Loader2, LogIn, BookOpen, CreditCard,
  Award, FileBadge, UserPlus, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface LogRow {
  id: number;
  event_type: string;
  actor_type: string;
  actor_id: number | null;
  actor_name: string | null;
  description: string;
  course_id: string | null;
  created_at: string;
}

interface Summary {
  total_events: number;
  last_24h: number;
  last_7d: number;
  by_type: { event_type: string; total: number }[];
  active_users: { actor_id: number; actor_name: string; total: number }[];
}

const EVENT_ICONS: Record<string, any> = {
  'user.login': LogIn,
  'user.registered': UserPlus,
  'enrollment.created': BookOpen,
  'payment.completed': CreditCard,
  'badge.unlocked': Award,
  'badge.manually_awarded': Award,
  'certificate.auto_issued': FileBadge,
  'certificate.manually_issued': FileBadge,
};

const eventLabel = (t: string) => t.split('.').join(' ').replace(/_/g, ' ');

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { fetchLogs(1); }, [search, eventType]);

  const fetchSummary = async () => {
    try { setSummary(await adminApi.get<Summary>('/api/admin/activity/summary')); } catch {}
  };

  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      if (eventType) params.set('event_type', eventType);
      const res = await adminApi.get<any>(`/api/admin/activity?${params.toString()}`);
      setLogs(res.data);
      setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total });
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="mt-2 text-gray-600">Platform activity across every user, in one feed.</p>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-500"><Activity size={14} /> Total events</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.total_events ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-500"><TrendingUp size={14} /> Last 24 hours</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.last_24h ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-500"><TrendingUp size={14} /> Last 7 days</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.last_7d ?? '—'}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-500"><Users size={14} /> Active users (30d)</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary?.active_users?.length ?? '—'}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* Event type breakdown */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Events by type</h3>
              {summary?.by_type?.length ? (
                <ul className="space-y-2">
                  {summary.by_type.slice(0, 8).map((t) => (
                    <li key={t.event_type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 capitalize">{eventLabel(t.event_type)}</span>
                      <span className="font-semibold text-gray-900">{t.total}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-gray-400">No data yet.</p>}
            </div>

            {/* Most active users */}
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Most active users (30 days)</h3>
              {summary?.active_users?.length ? (
                <ul className="divide-y divide-gray-100">
                  {summary.active_users.map((u) => (
                    <li key={u.actor_id} className="py-2 flex items-center justify-between text-sm">
                      <span className="text-gray-700">{u.actor_name || `User #${u.actor_id}`}</span>
                      <span className="text-xs text-gray-400">{u.total} events</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-gray-400">No data yet.</p>}
            </div>
          </div>

          {/* Activity feed */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-5 flex flex-wrap items-center gap-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mr-auto">Activity feed</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activity…" className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm w-56" />
              </div>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                <option value="">All event types</option>
                {(summary?.by_type || []).map((t) => (
                  <option key={t.event_type} value={t.event_type}>{eventLabel(t.event_type)}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={22} /></div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-sm">No activity recorded yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const Icon = EVENT_ICONS[log.event_type] || Activity;
                  return (
                    <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                      <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={15} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{log.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(log.created_at).toLocaleString()} · <span className="capitalize">{log.actor_type}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {meta.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Page {meta.current_page} of {meta.last_page} · {meta.total} events</span>
                <div className="flex gap-2">
                  <button disabled={meta.current_page <= 1} onClick={() => fetchLogs(meta.current_page - 1)} className="p-1.5 rounded border border-gray-200 disabled:opacity-40"><ChevronLeft size={14} /></button>
                  <button disabled={meta.current_page >= meta.last_page} onClick={() => fetchLogs(meta.current_page + 1)} className="p-1.5 rounded border border-gray-200 disabled:opacity-40"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
