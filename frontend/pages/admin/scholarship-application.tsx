import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import {
  Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckCircle, XCircle, Clock, Eye, X, ChevronDown, ChevronUp, Award, Ban
} from 'lucide-react';
import { adminApi, handleAdminApiError } from '@/lib/adminApi';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScholarshipApplication {
  id: number;
  user_id: number;
  course_id: string;
  course_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  score: number;
  location_bonus: number;
  total_score: number;
  discount_percentage: number;
  answers: Record<string, any>;
  is_used: boolean;
  used_at: string | null;
  review_notes: string | null;
  applicant_country: string | null;
  applicant_ip: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ScholarshipStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revoked: number;
  used: number;
}

const ANSWER_ORDER: [string, string][] = [
  ['why_scholarship', 'Why should we give you this scholarship?'],
  ['long_term_goal', 'Long-term goal after graduation'],
  ['weekly_hours', 'Hours per week'],
  ['is_student', 'Student'],
  ['is_employed', 'Employed'],
  ['salary_range', 'Monthly income'],
  ['current_location', 'Current location (chosen by applicant)'],
  ['detected_location', 'Location from their connection'],
  ['country', 'Country'],
];
const ANSWER_LABEL: Record<string, string> = {
  '1_3': '1–3 hrs/week', '4_6': '4–6 hrs/week', '7_10': '7–10 hrs/week', '10_plus': '10+ hrs/week',
  under_100: 'Under ₦100k / $100 per month', '100_200': '₦100k–₦200k / $100–$200 per month', above_200: 'Above ₦200k / $200 per month',
  not_employed: 'Not employed', yes: 'Yes', no: 'No',
};
const wordCount = (t: string) => (t.match(new RegExp("[\\p{L}][\\p{L}\\p{M}'’-]*", 'gu')) || []).length;

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  application: ScholarshipApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: number, discountPercentage: number, notes: string) => Promise<void>;
  onRevoke: (id: number) => Promise<void>;
  onReject: (id: number, notes: string, sendNote: boolean) => Promise<void>;
}> = ({ application, onClose, onUpdateStatus, onRevoke, onReject }) => {
  const [notes, setNotes] = useState('');
  const [sendNote, setSendNote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'full' | 'partial' | 'revoke' | 'reject' | null>(null);

  useEffect(() => {
    if (application) {
      setNotes(application.review_notes ?? '');
      setSendNote(false);
      setError(null);
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = async (discountPercentage: number) => {
    if (!confirm(`Approve ${application.user?.name ?? 'this applicant'}'s scholarship for ${application.course_name}? They will be emailed their payment link.`)) return;
    setAction(discountPercentage >= 100 ? 'full' : 'partial');
    setSaving(true);
    setError(null);
    try {
      await onUpdateStatus(application.id, discountPercentage, notes);
      onClose();
    } catch (e) {
      setError(handleAdminApiError(e));
    } finally {
      setSaving(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Reject ${application.user?.name ?? 'this applicant'}'s application? They will be emailed and can apply again later.`)) return;
    setAction('reject');
    setSaving(true);
    setError(null);
    try {
      await onReject(application.id, notes, sendNote);
      onClose();
    } catch (e) {
      setError(handleAdminApiError(e));
    } finally {
      setSaving(false);
      setAction(null);
    }
  };

  const handleRevoke = async () => {
    setAction('revoke');
    setSaving(true);
    try {
      await onRevoke(application.id);
      onClose();
    } finally {
      setSaving(false);
      setAction(null);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-[#0f0f14] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scholarship Application</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{application.user?.name} · {application.course_name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Applicant Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Applicant</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{application.user?.name ?? 'Unknown'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{application.user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Country</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{application.applicant_country ?? '—'}</p>
            </div>
          </div>

          {/* Answers */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Application answers</p>
            <div className="space-y-3">
              {ANSWER_ORDER.filter(([k]) => application.answers?.[k] !== undefined && application.answers?.[k] !== null && application.answers?.[k] !== '').map(([k, label]) => {
                const raw = application.answers[k];
                const text = typeof raw === 'string' ? (ANSWER_LABEL[raw] ?? raw) : JSON.stringify(raw);
                const long = k === 'why_scholarship' || k === 'long_term_goal';
                return (
                  <div key={k} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</p>
                    <p className={`text-sm text-gray-900 dark:text-white break-words ${long ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>{text}</p>
                    {long && <p className="text-[11px] text-gray-400 mt-1">{wordCount(String(raw))} words</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Section */}
          {application.status === 'pending' && (
            <div className="border-t border-gray-100 dark:border-white/10 pt-4 space-y-4">
              <div className="bg-[#F5F3FF] dark:bg-indigo-500/10 border border-[#E0D9FE] dark:border-indigo-500/25 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-[#4A3AFF] dark:text-indigo-300">Your decision</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Approve: the student is emailed a payment link and only pays the registration fee.
                  Reject: the student is emailed that it wasn’t successful this time and can apply again later.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Review Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Optional notes for this decision (private unless you tick the box below)…"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/30"
                />
                <label className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <input type="checkbox" checked={sendNote} onChange={(e) => setSendNote(e.target.checked)} className="accent-[#4A3AFF]" />
                  If rejecting, include this note in the email to the student
                </label>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {/* Existing review notes */}
          {application.status !== 'pending' && application.review_notes && (
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Review Notes</p>
              <p className="text-sm text-gray-900 dark:text-white">{application.review_notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {application.status === 'pending' && (
          <div className="p-6 border-t border-gray-100 dark:border-white/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              onClick={handleReject}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60"
            >
              {saving && action === 'reject' ? <Loader2 size={14} className="animate-spin" /> : null}
              Reject
            </button>
            <button
              onClick={() => handleSubmit(100)}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4A3AFF] text-white rounded-lg text-sm font-semibold hover:bg-[#3b2de0] disabled:opacity-60"
            >
              {saving && action === 'full' ? <Loader2 size={14} className="animate-spin" /> : null}
              Approve scholarship
            </button>
          </div>
        )}

        {application.status === 'approved' && !application.is_used && (
          <div className="p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
              Revoking clears the award — future payment emails show the real course price, and the student can reapply.
            </p>
            <button
              onClick={handleRevoke}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-60"
            >
              {saving && action === 'revoke' ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              Revoke Scholarship
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
function ScholarshipApplicationsPage() {
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [stats, setStats] = useState<ScholarshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, page]);

  const fetchStats = async () => {
    try {
      const data = await adminApi.get('/api/admin/scholarships/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch scholarship stats:', err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminApi.get('/api/admin/scholarships', { params });
      setApplications(data.data ?? data);
      setTotalPages(data.last_page ?? data.meta?.last_page ?? 1);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    discountPercentage: number,
    notes: string
  ) => {
    await adminApi.patch(`/api/admin/scholarships/${id}/review`, { discount_percentage: discountPercentage, review_notes: notes });
    fetchApplications();
    fetchStats();
  };

  const handleReject = async (id: number, notes: string, sendNote: boolean) => {
    await adminApi.patch(`/api/admin/scholarships/${id}/reject`, { review_notes: notes, send_note: sendNote });
    fetchApplications();
    fetchStats();
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Revoke this scholarship? The student will see the real course price in future emails, and can reapply if they want.')) return;
    try {
      await adminApi.patch(`/api/admin/scholarships/${id}/revoke`, {});
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert(handleAdminApiError(err));
      throw err;
    }
  };

  const statusConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', style: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/30', icon: <Clock size={12} /> },
    approved: { label: 'Approved', style: 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/30', icon: <CheckCircle size={12} /> },
    rejected: { label: 'Rejected', style: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/30', icon: <XCircle size={12} /> },
    revoked: { label: 'Revoked', style: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10', icon: <Ban size={12} /> },
  };

  const statsDisplay = stats ? [
    { label: 'Total', value: stats.total, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending Review', value: stats.pending, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Approved', value: stats.approved, color: 'text-green-600 dark:text-green-400' },
    { label: 'Rejected', value: stats.rejected, color: 'text-red-600 dark:text-red-400' },
    { label: 'Revoked', value: stats.revoked, color: 'text-gray-500 dark:text-gray-400' },
    { label: 'Used', value: stats.used, color: 'text-purple-600 dark:text-purple-400' },
  ] : [];

  return (
    <AdminRouteGuard requiredPermission="scholarships">
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scholarship Applications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage student scholarship requests</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {statsDisplay.map(s => (
                <div key={s.label} className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-4 py-2 border border-gray-200 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-white/5 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
              {['', 'pending', 'approved', 'rejected', 'revoked'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                    statusFilter === s ? 'bg-white dark:bg-[#0f0f14] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                      {['Applicant', 'Course', 'Why (preview)', 'Location', 'Award', 'Status', 'Used', 'Applied', 'Action'].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <Award className="w-10 h-10 text-gray-200 dark:text-white/10 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 dark:text-gray-500">No applications found</p>
                        </td>
                      </tr>
                    ) : applications.map(app => {
                      const sc = statusConfig[app.status];
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{app.user?.name ?? `User #${app.user_id}`}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{app.user?.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{app.course_name}</td>
                          <td className="py-3 px-4 max-w-[260px]">
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{app.answers?.why_scholarship ? String(app.answers.why_scholarship) : '—'}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{app.applicant_country ?? '—'}</td>
                          <td className="py-3 px-4">
                            {app.status === 'approved' ? (
                              <span className="text-sm font-semibold text-[#4A3AFF] dark:text-indigo-300">
                                {'Registration fee only'}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-medium ${sc.style}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded ${app.is_used ? 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400' : 'bg-white dark:bg-transparent text-gray-400 dark:text-gray-500'}`}>
                              {app.is_used ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                <Eye size={12} />
                                {app.status === 'pending' ? 'Review & decide' : 'View'}
                              </button>
                              {app.status === 'approved' && !app.is_used && (
                                <button
                                  onClick={() => handleRevoke(app.id)}
                                  title="Revoke scholarship"
                                  className="p-1.5 border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                  <Ban size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"><ChevronsLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"><ChevronRight size={16} /></button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40"><ChevronsRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateStatus={handleUpdateStatus}
          onRevoke={handleRevoke}
          onReject={handleReject}
        />
      </AdminLayout>
    </AdminRouteGuard>
  );
}

export default ScholarshipApplicationsPage;