import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import {
  Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckCircle, XCircle, Clock, Eye, X, ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScholarshipApplication {
  id: number;
  user_id: number;
  course_id: string;
  course_name: string;
  status: 'pending' | 'approved' | 'rejected';
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
  used: number;
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal: React.FC<{
  application: ScholarshipApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: number, discountPercentage: number, notes: string) => Promise<void>;
}> = ({ application, onClose, onUpdateStatus }) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<'full' | 'partial' | null>(null);

  useEffect(() => {
    if (application) {
      setNotes(application.review_notes ?? '');
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = async (discountPercentage: number) => {
    setAction(discountPercentage >= 100 ? 'full' : 'partial');
    setSaving(true);
    try {
      await onUpdateStatus(application.id, discountPercentage, notes);
      onClose();
    } finally {
      setSaving(false);
      setAction(null);
    }
  };

  const scoreColor = application.total_score >= 70 ? 'text-green-600 dark:text-green-400' : application.total_score >= 40 ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400';

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
          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Base Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{application.score}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location Bonus</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+{application.location_bonus}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Score</p>
              <p className={`text-2xl font-bold ${scoreColor}`}>{application.total_score}</p>
            </div>
          </div>

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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Application Answers</p>
            <div className="space-y-3">
              {Object.entries(application.answers ?? {}).map(([question, answer]) => (
                <div key={question} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 capitalize">{question.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {typeof answer === 'object' ? JSON.stringify(answer) : String(answer)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Review Section */}
          {application.status === 'pending' && (
            <div className="border-t border-gray-100 dark:border-white/10 pt-4 space-y-4">
              <div className="bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-green-800 dark:text-green-400">Two-tier scholarship — no reject outcome</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                  Every applicant gets awarded something. Full tuition (100%) means the student only
                  pays the platform's registration fee (set under Settings). The partial award
                  (percentage set under Settings, default 50%) is a straight discount off the normal
                  course price through the regular payment flow.
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
                  placeholder="Optional notes for this decision..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
          <div className="p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={() => handleSubmit(50)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-60"
            >
              {saving && action === 'partial' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve (partial award)
            </button>
            <button
              onClick={() => handleSubmit(100)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {saving && action === 'full' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve (full tuition)
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
      setTotalPages(data.meta?.last_page ?? 1);
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

  const statusConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', style: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/30', icon: <Clock size={12} /> },
    approved: { label: 'Approved', style: 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/30', icon: <CheckCircle size={12} /> },
    rejected: { label: 'Rejected', style: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/30', icon: <XCircle size={12} /> },
  };

  const statsDisplay = stats ? [
    { label: 'Total', value: stats.total, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending Review', value: stats.pending, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Approved', value: stats.approved, color: 'text-green-600 dark:text-green-400' },
    { label: 'Rejected', value: stats.rejected, color: 'text-red-600 dark:text-red-400' },
    { label: 'Used', value: stats.used, color: 'text-purple-600 dark:text-purple-400' },
  ] : [];

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scholarship Applications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage student scholarship requests</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
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
              {['', 'pending', 'approved', 'rejected'].map(s => (
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
                      {['Applicant', 'Course', 'Score', 'Location', 'Award', 'Status', 'Used', 'Applied', 'Action'].map(h => (
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
                      const scoreColor = app.total_score >= 70 ? 'text-green-600 dark:text-green-400' : app.total_score >= 40 ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400';
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{app.user?.name ?? `User #${app.user_id}`}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{app.user?.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{app.course_name}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-bold ${scoreColor}`}>{app.total_score}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">/100</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{app.applicant_country ?? '—'}</td>
                          <td className="py-3 px-4">
                            {app.status === 'approved' ? (
                              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                {app.discount_percentage >= 100 ? 'Full tuition' : `${app.discount_percentage}% scholarship`}
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
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <Eye size={12} />
                              {app.status === 'pending' ? 'Review' : 'View'}
                            </button>
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
        />
      </AdminLayout>
    </AdminRouteGuard>
  );
}

export default ScholarshipApplicationsPage;