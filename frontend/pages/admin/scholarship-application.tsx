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
  onUpdateStatus: (id: number, status: 'approved' | 'rejected', notes: string, discount: number) => Promise<void>;
}> = ({ application, onClose, onUpdateStatus }) => {
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (application) {
      setNotes(application.review_notes ?? '');
      setDiscount(application.discount_percentage);
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = async (status: 'approved' | 'rejected') => {
    setSaving(true);
    try {
      await onUpdateStatus(application.id, status, notes, discount);
      onClose();
    } finally {
      setSaving(false);
      setAction(null);
    }
  };

  const scoreColor = application.total_score >= 70 ? 'text-green-600' : application.total_score >= 40 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Scholarship Application</h2>
            <p className="text-sm text-gray-500 mt-0.5">{application.user?.name} · {application.course_name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Base Score</p>
              <p className="text-2xl font-bold text-gray-900">{application.score}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Location Bonus</p>
              <p className="text-2xl font-bold text-blue-600">+{application.location_bonus}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Total Score</p>
              <p className={`text-2xl font-bold ${scoreColor}`}>{application.total_score}</p>
            </div>
          </div>

          {/* Applicant Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Applicant</p>
              <p className="text-sm font-medium text-gray-900">{application.user?.name ?? 'Unknown'}</p>
              <p className="text-xs text-gray-500">{application.user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Country</p>
              <p className="text-sm font-medium text-gray-900">{application.applicant_country ?? '—'}</p>
            </div>
          </div>

          {/* Answers */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Application Answers</p>
            <div className="space-y-3">
              {Object.entries(application.answers ?? {}).map(([question, answer]) => (
                <div key={question} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1 capitalize">{question.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-900">
                    {typeof answer === 'object' ? JSON.stringify(answer) : String(answer)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Review Section */}
          {application.status === 'pending' && (
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  Discount to Award (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Auto-suggested: {application.discount_percentage}%</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  Review Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes for this decision..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Existing review notes */}
          {application.status !== 'pending' && application.review_notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Review Notes</p>
              <p className="text-sm text-gray-900">{application.review_notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {application.status === 'pending' && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              onClick={() => handleSubmit('rejected')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60"
            >
              {saving && action === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
            <button
              onClick={() => handleSubmit('approved')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {saving && action === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve ({discount}% discount)
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
    status: 'approved' | 'rejected',
    notes: string,
    discount: number
  ) => {
    await adminApi.patch(`/api/admin/scholarships/${id}/review`, { status, review_notes: notes, discount_percentage: discount });
    fetchApplications();
    fetchStats();
  };

  const statusConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', style: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Clock size={12} /> },
    approved: { label: 'Approved', style: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCircle size={12} /> },
    rejected: { label: 'Rejected', style: 'bg-red-50 text-red-600 border-red-100', icon: <XCircle size={12} /> },
  };

  const statsDisplay = stats ? [
    { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Review', value: stats.pending, color: 'bg-orange-50 text-orange-600' },
    { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-600' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-600' },
    { label: 'Used', value: stats.used, color: 'bg-purple-50 text-purple-600' },
  ] : [];

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scholarship Applications</h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage student scholarship requests</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {statsDisplay.map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {['', 'pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                    statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Applicant', 'Course', 'Score', 'Location', 'Discount', 'Status', 'Used', 'Applied', 'Action'].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <Award className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No applications found</p>
                        </td>
                      </tr>
                    ) : applications.map(app => {
                      const sc = statusConfig[app.status];
                      const scoreColor = app.total_score >= 70 ? 'text-green-600' : app.total_score >= 40 ? 'text-orange-500' : 'text-red-500';
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium text-gray-900">{app.user?.name ?? `User #${app.user_id}`}</p>
                            <p className="text-xs text-gray-500">{app.user?.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{app.course_name}</td>
                          <td className="py-3 px-4">
                            <span className={`text-sm font-bold ${scoreColor}`}>{app.total_score}</span>
                            <span className="text-xs text-gray-400 ml-1">/100</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{app.applicant_country ?? '—'}</td>
                          <td className="py-3 px-4">
                            {app.discount_percentage > 0 ? (
                              <span className="text-sm font-semibold text-green-700">{app.discount_percentage}%</span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-medium ${sc.style}`}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-0.5 rounded ${app.is_used ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-400'}`}>
                              {app.is_used ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
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
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"><ChevronsLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"><ChevronRight size={16} /></button>
                  <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40"><ChevronsRight size={16} /></button>
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