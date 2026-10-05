import { formatMoney } from '@/lib/format';
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import {
  Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Users, DollarSign, TrendingUp, Link2, CheckCircle, Clock, XCircle,
  X, Check, Eye, Copy, Banknote, ThumbsDown
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

interface PayoutItem {
  id: number;
  payee_type: 'user' | 'public_referrer';
  payee_id: number;
  payee: { id: number; name?: string; email: string } | null;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'approved' | 'declined';
  admin_note: string | null;
  processed_at: string | null;
  created_at: string;
}

interface PayoutStats {
  pending: number;
  approved: number;
  declined: number;
  pending_amount: number;
  paid_amount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyle = (s: string) => {
  if (s === 'completed') return 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30';
  if (s === 'failed') return 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30';
  return 'bg-amber-50 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/30';
};

const statusIcon = (s: string) => {
  if (s === 'completed') return <CheckCircle size={12} />;
  if (s === 'failed') return <XCircle size={12} />;
  return <Clock size={12} />;
};

// adminApi.get() already returns the response body, and Laravel's paginator
// puts current_page/last_page/total/per_page at the top level of that body
// (not under a "meta" key), so read them from there.
const toMeta = (body: any): Meta => ({
  current_page: body?.current_page ?? 1,
  last_page: body?.last_page ?? 1,
  total: body?.total ?? 0,
  per_page: body?.per_page ?? 15,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReferralHistoryPage: React.FC = () => {
  // ── State ──
  const [tab, setTab] = useState<'history' | 'public_referrers' | 'payouts'>('history');

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

  // Payouts tab
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [payoutsMeta, setPayoutsMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('pending');
  const [payoutStats, setPayoutStats] = useState<PayoutStats | null>(null);
  const [declineTarget, setDeclineTarget] = useState<PayoutItem | null>(null);
  const [declineNote, setDeclineNote] = useState('');
  const [actingOn, setActingOn] = useState<number | null>(null);

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

        setHistory(response?.data ?? []);
        setHistoryMeta(toMeta(response));
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

        setReferrers(response?.data ?? []);
        setReferrersMeta(toMeta(response));
    } catch {
      showToast('Failed to load referrers', 'error');
    } finally {
      setReferrersLoading(false);
    }
  };

  // ── Fetch payouts ──
  useEffect(() => {
    if (tab === 'payouts') {
      fetchPayouts(1);
      fetchPayoutStats();
    }
  }, [payoutStatusFilter, tab]);

  const fetchPayouts = async (page = 1) => {
    try {
      setPayoutsLoading(true);
      const params: any = { page, per_page: payoutsMeta.per_page };
      if (payoutStatusFilter !== 'all') params.status = payoutStatusFilter;
      const response = await adminApi.get('/api/admin/payouts', { params });

      setPayouts(response?.data ?? []);
      setPayoutsMeta(toMeta(response));
    } catch {
      showToast('Failed to load payout requests', 'error');
    } finally {
      setPayoutsLoading(false);
    }
  };

  const fetchPayoutStats = async () => {
    try {
      const response = await adminApi.get('/api/admin/payouts/stats');
      setPayoutStats(response);
    } catch {
      // Non-critical — the table still works without the stat cards.
    }
  };

  const approvePayout = async (payout: PayoutItem) => {
    setActingOn(payout.id);
    try {
      await adminApi.post(`/api/admin/payouts/${payout.id}/approve`, {});
      showToast('Payout marked as paid.', 'success');
      fetchPayouts(payoutsMeta.current_page);
      fetchPayoutStats();
    } catch {
      showToast('Failed to approve payout', 'error');
    } finally {
      setActingOn(null);
    }
  };

  const declinePayout = async () => {
    if (!declineTarget) return;
    setActingOn(declineTarget.id);
    try {
      await adminApi.post(`/api/admin/payouts/${declineTarget.id}/decline`, { admin_note: declineNote });
      showToast('Payout request declined.', 'success');
      setDeclineTarget(null);
      setDeclineNote('');
      fetchPayouts(payoutsMeta.current_page);
      fetchPayoutStats();
    } catch {
      showToast('Failed to decline payout', 'error');
    } finally {
      setActingOn(null);
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
    <AdminRouteGuard requiredPermission="referrals">
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track all referral activity and public referrer accounts</p>
          </div>

          {/* Stats (history tab only) */}
          {tab === 'history' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total (this page)', value: history.length, icon: <Link2 size={16} />, color: 'text-gray-600 dark:text-gray-300' },
                { label: 'Completed', value: completedCount, icon: <CheckCircle size={16} />, color: 'text-green-600 dark:text-green-400' },
                { label: 'Pending', value: pendingCount, icon: <Clock size={16} />, color: 'text-amber-600 dark:text-yellow-400' },
                { label: 'Public Referrers', value: referrersMeta.total || '—', icon: <Users size={16} />, color: 'text-blue-600 dark:text-blue-400' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <div className={s.color}>{s.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1.5 rounded-full w-fit">
            {(['history', 'public_referrers', 'payouts'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t ? 'bg-white dark:bg-[#0f0f14] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t === 'history' ? 'All Referrals' : t === 'public_referrers' ? 'Public Referrers' : 'Payout Requests'}
                {t === 'payouts' && payoutStats && payoutStats.pending > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {payoutStats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder="Search by email, code…"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-16">
                    <Link2 size={32} className="mx-auto text-gray-300 dark:text-white/10 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No referral records found.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                          <tr>
                            {['Referrer', 'Referred User', 'Code', 'Type', 'Reward', 'Status', 'Date'].map(h => (
                              <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                          {history.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4">
                                {item.public_referrer ? (
                                  <div>
                                    <p className="text-sm text-gray-900 dark:text-white">{item.public_referrer.email}</p>
                                    <span className="text-xs bg-purple-50 dark:bg-indigo-500/15 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-indigo-500/30 px-1.5 py-0.5 rounded">Public</span>
                                  </div>
                                ) : item.referrer ? (
                                  <div>
                                    <p className="text-sm text-gray-900 dark:text-white">{item.referrer.name || item.referrer.email}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.referrer.email}</p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {item.referred_user ? (
                                  <div>
                                    <p className="text-sm text-gray-900 dark:text-white">{item.referred_user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.referred_user.email}</p>
                                  </div>
                                ) : <span className="text-xs text-gray-400 dark:text-gray-500">—</span>}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => copyCode(item.referral_code)}
                                  className="flex items-center gap-1.5 text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-white/20"
                                >
                                  {item.referral_code} <Copy size={11} className="text-gray-400 dark:text-gray-500" />
                                </button>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                                  item.referrer_type === 'public'
                                    ? 'bg-purple-50 dark:bg-indigo-500/15 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-indigo-500/30'
                                    : 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/30'
                                }`}>
                                  {item.referrer_type === 'public' ? 'Public' : 'User'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                {item.reward_amount != null ? `$${item.reward_amount}` : '—'}
                                {item.reward_paid && <span className="ml-1 text-xs text-green-600 dark:text-green-400">✓</span>}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-medium ${statusStyle(item.status)}`}>
                                  {statusIcon(item.status)} {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(item.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-white/10">
                      {history.map(item => (
                        <div key={item.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.referred_user?.name || `User #${item.referred_user_id}`}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Referred by: {item.public_referrer?.email || item.referrer?.email || '—'}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium flex-shrink-0 ${statusStyle(item.status)}`}>
                              {statusIcon(item.status)} {item.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{item.referral_code}</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{historyMeta.total} total records</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-300">Page {historyMeta.current_page} of {historyMeta.last_page}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => fetchHistory(1)} disabled={historyMeta.current_page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronsLeft size={15} /></button>
                          <button onClick={() => fetchHistory(historyMeta.current_page - 1)} disabled={historyMeta.current_page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronLeft size={15} /></button>
                          <button onClick={() => fetchHistory(historyMeta.current_page + 1)} disabled={historyMeta.current_page === historyMeta.last_page} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronRight size={15} /></button>
                          <button onClick={() => fetchHistory(historyMeta.last_page)} disabled={historyMeta.current_page === historyMeta.last_page} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronsRight size={15} /></button>
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
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  value={referrersSearch}
                  onChange={e => setReferrersSearch(e.target.value)}
                  placeholder="Search by email or code…"
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {referrersLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                ) : referrers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users size={32} className="mx-auto text-gray-300 dark:text-white/10 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No public referrers found.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                          <tr>
                            {['Email', 'Code', 'Total', 'Successful', 'Pending', 'Total Earnings', 'Joined'].map(h => (
                              <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                          {referrers.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{r.email}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => copyCode(r.referral_code)}
                                  className="flex items-center gap-1.5 text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-white/20"
                                >
                                  {r.referral_code} <Copy size={11} className="text-gray-400 dark:text-gray-500" />
                                </button>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{r.total_referrals}</td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">{r.successful_referrals}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium text-amber-600 dark:text-yellow-400">{r.pending_referrals}</span>
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                                {formatMoney(r.total_earnings, 'NGN')}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(r.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-white/10">
                      {referrers.map(r => (
                        <div key={r.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{r.email}</p>
                              <button onClick={() => copyCode(r.referral_code)}
                                className="flex items-center gap-1 text-xs font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded mt-0.5">
                                {r.referral_code} <Copy size={10} className="text-gray-400 dark:text-gray-500" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatMoney(r.total_earnings, 'NGN')}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                              { label: 'Total', value: r.total_referrals, color: 'text-gray-900 dark:text-white' },
                              { label: 'Success', value: r.successful_referrals, color: 'text-green-600 dark:text-green-400' },
                              { label: 'Pending', value: r.pending_referrals, color: 'text-amber-600 dark:text-yellow-400' },
                            ].map(s => (
                              <div key={s.label} className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                                <p className={`text-sm font-semibold ${s.color}`}>{s.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{referrersMeta.total} total referrers</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-300">Page {referrersMeta.current_page} of {referrersMeta.last_page}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => fetchReferrers(1)} disabled={referrersMeta.current_page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronsLeft size={15} /></button>
                          <button onClick={() => fetchReferrers(referrersMeta.current_page - 1)} disabled={referrersMeta.current_page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronLeft size={15} /></button>
                          <button onClick={() => fetchReferrers(referrersMeta.current_page + 1)} disabled={referrersMeta.current_page === referrersMeta.last_page} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronRight size={15} /></button>
                          <button onClick={() => fetchReferrers(referrersMeta.last_page)} disabled={referrersMeta.current_page === referrersMeta.last_page} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronsRight size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── PAYOUTS TAB ── */}
          {tab === 'payouts' && (
            <div className="space-y-4">
              {/* Stats */}
              {payoutStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Pending', value: payoutStats.pending, icon: <Clock size={16} />, color: 'text-amber-600 dark:text-yellow-400' },
                    { label: 'Approved', value: payoutStats.approved, icon: <CheckCircle size={16} />, color: 'text-green-600 dark:text-green-400' },
                    { label: 'Pending Amount', value: formatMoney(payoutStats.pending_amount, 'NGN'), icon: <Banknote size={16} />, color: 'text-amber-600 dark:text-yellow-400' },
                    { label: 'Paid Out', value: formatMoney(payoutStats.paid_amount, 'NGN'), icon: <DollarSign size={16} />, color: 'text-green-600 dark:text-green-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                      <div className={s.color}>{s.icon}</div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filter */}
              <select
                value={payoutStatusFilter}
                onChange={e => setPayoutStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="all">All Statuses</option>
              </select>

              <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {payoutsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-16">
                    <Banknote size={32} className="mx-auto text-gray-300 dark:text-white/10 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No payout requests found.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                          <tr>
                            {['Referrer', 'Amount', 'Bank Details', 'Status', 'Requested', 'Actions'].map(h => (
                              <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                          {payouts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-sm text-gray-900 dark:text-white">{p.payee?.name || p.payee?.email || `#${p.payee_id}`}</p>
                                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
                                    p.payee_type === 'public_referrer'
                                      ? 'bg-purple-50 dark:bg-indigo-500/15 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-indigo-500/30'
                                      : 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/30'
                                  }`}>
                                    {p.payee_type === 'public_referrer' ? 'Public' : 'Student'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">{formatMoney(p.amount, 'NGN')}</td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{p.bank_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{p.account_number} · {p.account_name}</p>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-medium ${statusStyle(p.status === 'approved' ? 'completed' : p.status)}`}>
                                  {statusIcon(p.status === 'approved' ? 'completed' : p.status)} {p.status === 'approved' ? 'Paid' : p.status}
                                </span>
                                {p.admin_note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[180px]">{p.admin_note}</p>}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(p.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                {p.status === 'pending' ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => approvePayout(p)}
                                      disabled={actingOn === p.id}
                                      className="flex items-center gap-1 text-xs font-medium bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 px-2.5 py-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/25 disabled:opacity-50"
                                    >
                                      <Check size={12} /> Approve
                                    </button>
                                    <button
                                      onClick={() => { setDeclineTarget(p); setDeclineNote(''); }}
                                      disabled={actingOn === p.id}
                                      className="flex items-center gap-1 text-xs font-medium bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2.5 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/25 disabled:opacity-50"
                                    >
                                      <ThumbsDown size={12} /> Decline
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{payoutsMeta.total} total requests</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-300">Page {payoutsMeta.current_page} of {payoutsMeta.last_page}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => fetchPayouts(1)} disabled={payoutsMeta.current_page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronsLeft size={15} /></button>
                          <button onClick={() => fetchPayouts(payoutsMeta.current_page - 1)} disabled={payoutsMeta.current_page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronLeft size={15} /></button>
                          <button onClick={() => fetchPayouts(payoutsMeta.current_page + 1)} disabled={payoutsMeta.current_page === payoutsMeta.last_page} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronRight size={15} /></button>
                          <button onClick={() => fetchPayouts(payoutsMeta.last_page)} disabled={payoutsMeta.current_page === payoutsMeta.last_page} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"><ChevronsRight size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decline modal */}
        {declineTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Decline payout request?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {formatMoney(declineTarget.amount, 'NGN')} for {declineTarget.payee?.name || declineTarget.payee?.email}. No money is sent — they'll be notified and can request again with corrected details.
              </p>
              <textarea
                value={declineNote}
                onChange={e => setDeclineNote(e.target.value)}
                placeholder="Optional note (e.g. 'Account number looks incorrect')"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setDeclineTarget(null); setDeclineNote(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={declinePayout}
                  disabled={actingOn === declineTarget.id}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actingOn === declineTarget.id ? 'Declining…' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-500/15 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-500/15 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/30'}`}>
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default ReferralHistoryPage;