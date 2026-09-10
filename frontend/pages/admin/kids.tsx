import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import {
  Loader2, Pencil, Check, X, Users, BookOpen,
  DollarSign, ChevronDown, ChevronUp, Package, Tag
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

// ── Types ─────────────────────────────────────────────────────────────────────
interface KidsCourse {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  emoji: string;
  color: string;
  duration_months: number;
  is_foundation: boolean;
  one_on_one_price_usd: number;
  group_price_usd: number;
  one_on_one_price_ngn: number;
  group_price_ngn: number;
  bundle_one_on_one_usd: number;
  bundle_group_usd: number;
  bundle_one_on_one_ngn: number;
  bundle_group_ngn: number;
  onetime_discount_percent: number;
  is_active: boolean;
  order: number;
}

interface KidsEnrollment {
  id: number;
  parent_name: string;
  parent_email: string;
  student_name: string;
  student_age: number;
  enrollment_type: 'bundle' | 'track_only' | 'foundation_only';
  session_type: 'one_on_one' | 'group_mentorship';
  chosen_track: string;
  payment_type: 'onetime' | 'installment';
  payment_status: 'pending' | 'partial' | 'completed' | 'failed';
  currency: 'USD' | 'NGN';
  total_price: number;
  amount_paid: number;
  has_access: boolean;
  enrolled_at: string | null;
  created_at: string;
  course?: { name: string; emoji: string };
}

interface PriceField {
  key: keyof KidsCourse;
  label: string;
  currency: string;
}

// ── Price Editor Component ─────────────────────────────────────────────────────
const PriceEditor: React.FC<{
  course: KidsCourse;
  onSave: (id: number, data: Partial<KidsCourse>) => Promise<void>;
}> = ({ course, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Partial<KidsCourse>>({});

  const priceFields: PriceField[] = [
    { key: 'one_on_one_price_usd', label: '1-on-1', currency: 'USD' },
    { key: 'group_price_usd', label: 'Group', currency: 'USD' },
    { key: 'one_on_one_price_ngn', label: '1-on-1', currency: 'NGN' },
    { key: 'group_price_ngn', label: 'Group', currency: 'NGN' },
  ];

  const bundleFields: PriceField[] = [
    { key: 'bundle_one_on_one_usd', label: 'Bundle 1-on-1', currency: 'USD' },
    { key: 'bundle_group_usd', label: 'Bundle Group', currency: 'USD' },
    { key: 'bundle_one_on_one_ngn', label: 'Bundle 1-on-1', currency: 'NGN' },
    { key: 'bundle_group_ngn', label: 'Bundle Group', currency: 'NGN' },
  ];

  const startEdit = () => {
    const initial: Partial<KidsCourse> = {};
    [...priceFields, ...bundleFields].forEach(f => {
      (initial as any)[f.key] = (course as any)[f.key];
    });
    initial.onetime_discount_percent = course.onetime_discount_percent;
    setValues(initial);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(course.id, values);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const fmt = (val: number, currency: string) =>
    currency === 'USD'
      ? `$${Number(val).toLocaleString()}`
      : `₦${Number(val).toLocaleString()}`;

  return (
    <div className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{course.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{course.name}</h3>
              {course.is_foundation && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-500/30">
                  Foundation
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                course.is_active
                  ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/30'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'
              }`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {course.duration_months} month{course.duration_months > 1 ? 's' : ''} · {course.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <Pencil size={12} />
              Edit Prices
            </button>
          )}
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="p-4 space-y-4">
        {/* Standalone Prices */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Standalone Prices</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priceFields.map(f => (
              <div key={f.key as string} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{f.label} ({f.currency})</p>
                {editing ? (
                  <input
                    type="number"
                    value={(values as any)[f.key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                    className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt((course as any)[f.key], f.currency)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bundle Prices (track courses only) */}
        {!course.is_foundation && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bundle Prices (DF + Track)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bundleFields.map(f => (
                <div key={f.key as string} className="bg-purple-50 dark:bg-indigo-500/15 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{f.label} ({f.currency})</p>
                  {editing ? (
                    <input
                      type="number"
                      value={(values as any)[f.key] ?? ''}
                      onChange={e => setValues(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                      className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {fmt((course as any)[f.key], f.currency)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discount */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-white/10">
          <Tag size={14} className="text-gray-400 dark:text-gray-500" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-300">One-time payment discount:</span>
            {editing ? (
              <input
                type="number"
                min={0}
                max={100}
                value={values.onetime_discount_percent ?? ''}
                onChange={e => setValues(prev => ({ ...prev, onetime_discount_percent: Number(e.target.value) }))}
                className="w-16 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-white/5 border border-gray-200 dark:border-white/20 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{course.onetime_discount_percent}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Enrollment Row ─────────────────────────────────────────────────────────────
const EnrollmentRow: React.FC<{ enrollment: KidsEnrollment }> = ({ enrollment }) => {
  const statusColors: Record<string, string> = {
    completed: 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/30',
    pending: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/30',
    partial: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/30',
    failed: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/30',
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{enrollment.student_name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{enrollment.parent_name}</p>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{enrollment.parent_email}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <span>{enrollment.course?.emoji ?? '📚'}</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{enrollment.course?.name ?? enrollment.chosen_track}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
          {enrollment.enrollment_type.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
          {enrollment.session_type.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {enrollment.currency === 'USD' ? '$' : '₦'}
          {Number(enrollment.total_price).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Paid: {enrollment.currency === 'USD' ? '$' : '₦'}
          {Number(enrollment.amount_paid).toLocaleString()}
        </p>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${statusColors[enrollment.payment_status] ?? 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
          {enrollment.payment_status}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${enrollment.has_access ? 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
          {enrollment.has_access ? 'Yes' : 'No'}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
        {enrollment.enrolled_at
          ? new Date(enrollment.enrolled_at).toLocaleDateString()
          : new Date(enrollment.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
function KidsAdminPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'enrollments'>('courses');
  const [courses, setCourses] = useState<KidsCourse[]>([]);
  const [enrollments, setEnrollments] = useState<KidsEnrollment[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, revenue_usd: 0, revenue_ngn: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Enrollment filters
  const [statusFilter, setStatusFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (activeTab === 'enrollments') fetchEnrollments();
  }, [activeTab, statusFilter, trackFilter, page]);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await adminApi.get('/api/admin/kids/courses');
      setCourses(data.courses ?? data);
      setStats(data.stats ?? stats);
    } catch (err) {
      console.error('Failed to fetch kids courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const params: any = { page, per_page: 15 };
      if (statusFilter) params.payment_status = statusFilter;
      if (trackFilter) params.track = trackFilter;
      const data = await adminApi.get('/api/admin/kids/enrollments', { params });
      setEnrollments(data.data ?? data);
      setTotalPages(data.meta?.last_page ?? 1);
    } catch (err) {
      console.error('Failed to fetch kids enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleSavePrices = async (courseId: number, values: Partial<KidsCourse>) => {
    setSaveError(null);
    try {
      await adminApi.put(`/api/admin/kids/courses/${courseId}/prices`, values);
      setSaveSuccess('Prices updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
      fetchCourses();
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Failed to update prices');
      throw err;
    }
  };

  const statCards = [
    { label: 'Total Enrollments', value: stats.total, icon: Users, color: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    { label: 'Completed Payments', value: stats.completed, icon: Check, color: 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400' },
    { label: 'Pending Payments', value: stats.pending, icon: Loader2, color: 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400' },
    { label: 'Revenue (USD)', value: `$${Number(stats.revenue_usd ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 dark:bg-indigo-500/15 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <AdminRouteGuard requiredPermission="kids">
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kids Program</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage courses, pricing, and enrollments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toast messages */}
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 rounded-lg text-green-700 dark:text-green-400 text-sm">
              <Check size={16} /> {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <X size={16} /> {saveError}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1.5 rounded-full w-fit">
            {(['courses', 'enrollments'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  activeTab === tab ? 'bg-white dark:bg-[#0f0f14] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'courses' ? '📚 Courses & Pricing' : '👥 Enrollments'}
              </button>
            ))}
          </div>

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {loadingCourses ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center">
                  <BookOpen className="w-10 h-10 text-gray-300 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No courses found.</p>
                </div>
              ) : (
                courses.map(course => (
                  <PriceEditor key={course.id} course={course} onSave={handleSavePrices} />
                ))
              )}
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-white/5 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={trackFilter}
                  onChange={e => { setTrackFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-200 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-white/5 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tracks</option>
                  <option value="digital_foundations">Digital Foundations</option>
                  <option value="creative_design">Creative Design</option>
                  <option value="game_builder">Game Builder</option>
                  <option value="media_creator">Media Creator</option>
                </select>
              </div>

              <div className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                {loadingEnrollments ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                          {['Student / Parent', 'Email', 'Track', 'Type', 'Session', 'Amount', 'Payment', 'Access', 'Date'].map(h => (
                            <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                        {enrollments.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">No enrollments found</td>
                          </tr>
                        ) : (
                          enrollments.map(e => <EnrollmentRow key={e.id} enrollment={e} />)
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

export default KidsAdminPage;