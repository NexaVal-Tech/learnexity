import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import {
  Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Users, DollarSign, TrendingUp, Link2, CheckCircle, Clock, XCircle,
  X, Check, Eye, Copy
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReferralHistoryItem {
  id: number;
  referral_code: string;
  referrer_type: 'user' | 'public';   // user = logged-in user, public = public_referrer
  referrer_id: number | null;
  public_referrer_id: number | null;
  referred_user_id: number;
  status: 'pending' | 'completed' | 'failed';
  reward_amount: number | null;
  reward_paid: boolean;
  created_at: string;
  updated_at: string;

  // eager-loaded relations (add to your API response)
  referrer?: { id: number; name?: string; email: string };
  referred_user?: { id: number; name: string; email: string };
  public_referrer?: { id: number; email: string; referral_code: string };
}

interface PublicReferrer {
  id: number;
  email: string;
  referral_code: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  created_at: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyle = (s: string) => {
  if (s === 'completed') return 'bg-green-50 text-green-700 border-green-200';
  if (s === 'failed') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const statusIcon = (s: string) => {
  if (s === 'completed') return <CheckCircle size={12} />;
  if (s === 'failed') return <XCircle size={12} />;
  return <Clock size={12} />;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReferralHistoryPage: React.FC = () => {
  // ── State ──
  const [tab, setTab] = useState<'history' | 'public_referrers'>('history');

  // History tab
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [historyMeta, setHistoryMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Public referrers tab
  const [referrers, setReferrers] = useState<PublicReferrer[]>([]);
  const [referrersMeta, setReferrersMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [referrersLoading, setReferrersLoading] = useState(false);
  const [referrersSearch, setReferrersSearch] = useState('');

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Fetch history ──
  useEffect(() => {
    if (tab === 'history') fetchHistory(1);
  }, [historySearch, statusFilter, tab]);

  const fetchHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const params: any = { page, per_page: historyMeta.per_page };
      if (historySearch) params.search = historySearch;
      if (statusFilter !== 'all') params.status = statusFilter;
        const response = await adminApi.get('/api/admin/referrals/history', { params });

        setHistory(response.data.data ?? []);
        setHistoryMeta(response.data.meta ?? {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 15
        });
    } catch {
      showToast('Failed to load referral history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Fetch public referrers ──
  useEffect(() => {
    if (tab === 'public_referrers') fetchReferrers(1);
  }, [referrersSearch, tab]);

  const fetchReferrers = async (page = 1) => {
    try {
      setReferrersLoading(true);
      const params: any = { page, per_page: referrersMeta.per_page };
      if (referrersSearch) params.search = referrersSearch;
        const response = await adminApi.get('/api/admin/referrals/public-referrers', { params });

        setReferrers(response.data.data ?? []);
        setReferrersMeta(response.data.meta ?? {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 15
        });
    } catch {
      showToast('Failed to load referrers', 'error');
    } finally {
      setReferrersLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied: ${code}`, 'success');
  };

  // ── Aggregate stats from current page (replace with a real stats endpoint if available) ──
  const completedCount = history.filter(h => h.status === 'completed').length;
  const pendingCount   = history.filter(h => h.status === 'pending').length;

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Referral History</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all referral activity and public referrer accounts</p>
          </div>

          {/* Stats (history tab only) */}
          {tab === 'history' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total (this page)', value: history.length, icon: <Link2 size={16} />, color: 'text-gray-600' },
                { label: 'Completed', value: completedCount, icon: <CheckCircle size={16} />, color: 'text-green-600' },
                { label: 'Pending', value: pendingCount, icon: <Clock size={16} />, color: 'text-amber-600' },
                { label: 'Public Referrers', value: referrersMeta.total || '—', icon: <Users size={16} />, color: 'text-blue-600' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className={s.color}>{s.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-full w-fit">
            {(['history', 'public_referrers'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'history' ? 'All Referrals' : 'Public Referrers'}
              </button>
            ))}
          </div>

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Search by email, code…"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-16">
                    <Link2 size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No referral records found.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {['Referrer', 'Referred User', 'Code', 'Type', 'Reward', 'Status', 'Date'].map(h => (
                              <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {history.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4">
                                {item.public_referrer ? (
                                  <div>
                                    <p className="text-sm text-gray-900">{item.public_referrer.email}</p>
                                    <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded">Public</span>
                                  </div>
                                ) : item.referrer ? (
                                  <div>
                                    <p className="text-sm text-gray-900">{item.referrer.name || item.referrer.email}</p>
                                    <p className="text-xs text-gray-500">{item.referrer.email}</p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {item.referred_user ? (
                                  <div>
                                    <p className="text-sm text-gray-900">{item.referred_user.name}</p>
                                    <p className="text-xs text-gray-500">{item.referred_user.email}</p>
                                  </div>
                                ) : <span className="text-xs text-gray-400">—</span>}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => copyCode(item.referral_code)}
                                  className="flex items-center gap-1.5 text-xs font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                >
                                  {item.referral_code} <Copy size={11} className="text-gray-400" />
                                </button>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                                  item.referrer_type === 'public'
                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                  {item.referrer_type === 'public' ? 'Public' : 'User'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">
                                {item.reward_amount != null ? `$${item.reward_amount}` : '—'}
                                {item.reward_paid && <span className="ml-1 text-xs text-green-600">✓</span>}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-medium ${statusStyle(item.status)}`}>
                                  {statusIcon(item.status)} {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-100">
                      {history.map(item => (
                        <div key={item.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.referred_user?.name || `User #${item.referred_user_id}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                Referred by: {item.public_referrer?.email || item.referrer?.email || '—'}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium flex-shrink-0 ${statusStyle(item.status)}`}>
                              {statusIcon(item.status)} {item.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{item.referral_code}</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{historyMeta.total} total records</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Page {historyMeta.current_page} of {historyMeta.last_page}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => fetchHistory(1)} disabled={historyMeta.current_page === 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronsLeft size={15} /></button>
                          <button onClick={() => fetchHistory(historyMeta.current_page - 1)} disabled={historyMeta.current_page === 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronLeft size={15} /></button>
                          <button onClick={() => fetchHistory(historyMeta.current_page + 1)} disabled={historyMeta.current_page === historyMeta.last_page} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronRight size={15} /></button>
                          <button onClick={() => fetchHistory(historyMeta.last_page)} disabled={historyMeta.current_page === historyMeta.last_page} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronsRight size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── PUBLIC REFERRERS TAB ── */}
          {tab === 'public_referrers' && (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={referrersSearch}
                  onChange={e => setReferrersSearch(e.target.value)}
                  placeholder="Search by email or code…"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {referrersLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : referrers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No public referrers found.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            {['Email', 'Code', 'Total', 'Successful', 'Pending', 'Total Earnings', 'Joined'].map(h => (
                              <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {referrers.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4 text-sm text-gray-900">{r.email}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => copyCode(r.referral_code)}
                                  className="flex items-center gap-1.5 text-xs font-mono bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                >
                                  {r.referral_code} <Copy size={11} className="text-gray-400" />
                                </button>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">{r.total_referrals}</td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-green-600">{r.successful_referrals}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-amber-600">{r.pending_referrals}</span>
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                ${Number(r.total_earnings).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {new Date(r.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-100">
                      {referrers.map(r => (
                        <div key={r.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{r.email}</p>
                              <button onClick={() => copyCode(r.referral_code)}
                                className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded mt-0.5">
                                {r.referral_code} <Copy size={10} className="text-gray-400" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-gray-900">${Number(r.total_earnings).toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                              { label: 'Total', value: r.total_referrals, color: 'text-gray-900' },
                              { label: 'Success', value: r.successful_referrals, color: 'text-green-600' },
                              { label: 'Pending', value: r.pending_referrals, color: 'text-amber-600' },
                            ].map(s => (
                              <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-500">{s.label}</p>
                                <p className={`text-sm font-semibold ${s.color}`}>{s.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{referrersMeta.total} total referrers</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Page {referrersMeta.current_page} of {referrersMeta.last_page}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => fetchReferrers(1)} disabled={referrersMeta.current_page === 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronsLeft size={15} /></button>
                          <button onClick={() => fetchReferrers(referrersMeta.current_page - 1)} disabled={referrersMeta.current_page === 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronLeft size={15} /></button>
                          <button onClick={() => fetchReferrers(referrersMeta.current_page + 1)} disabled={referrersMeta.current_page === referrersMeta.last_page} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronRight size={15} /></button>
                          <button onClick={() => fetchReferrers(referrersMeta.last_page)} disabled={referrersMeta.current_page === referrersMeta.last_page} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronsRight size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default ReferralHistoryPage;