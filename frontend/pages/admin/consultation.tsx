'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit2, Trash2, Search, Filter, X, ChevronDown, Calendar, Clock, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Consultation {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  consultation_type: string;
  course?: string;
  message?: string;
  preferred_date: string;
  preferred_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'free' | 'paid' | 'pending';
  notes?: string;
  created_at: string;
}

interface ConsultationStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

interface Meta { current_page: number; last_page: number; total: number; per_page: number; }

const TYPE_LABELS: Record<string, string> = {
  course_guidance: 'Course Guidance',
  career_advice: 'Career Advice',
  technical_support: 'Technical Support',
  renewal: 'Renewal',
  general: 'General Inquiry',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

const PAYMENT_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ c, onClose, onUpdate }: { c: Consultation; onClose: () => void; onUpdate: () => void }) {
  const [status, setStatus] = useState(c.status);
  const [notes, setNotes] = useState(c.notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.patch(`/api/admin/consultations/${c.id}`, { status, notes });
      onUpdate();
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Consultation Details</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Student</p>
              <p className="font-medium text-gray-900">{c.full_name}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
              {c.phone && <p className="text-sm text-gray-500">{c.phone}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Session</p>
              <p className="font-medium text-gray-900">{new Date(c.preferred_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm text-gray-500">{c.preferred_time}</p>
            </div>
          </div>

          {c.course && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Course</p>
              <p className="text-sm text-gray-700">{c.course}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Type</p>
            <p className="text-sm text-gray-700">{TYPE_LABELS[c.consultation_type] || c.consultation_type}</p>
          </div>

          {c.message && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Message</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{c.message}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Add notes about this consultation…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ background: '#4A3AFF' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inner page (no layout wrappers) ─────────────────────────────────────────
function ConsultationsPageInner() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<ConsultationStats>({ total: 0, scheduled: 0, completed: 0, cancelled: 0 });
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selected, setSelected] = useState<Consultation | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    consultation_type: '',
    status: '',
    payment_status: '',
    course: '',
    date_from: '',
    date_to: '',
    page: 1,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 15, page: filters.page };
      if (filters.search)             params.search = filters.search;
      if (filters.consultation_type)  params.consultation_type = filters.consultation_type;
      if (filters.status)             params.status = filters.status;
      if (filters.payment_status)     params.payment_status = filters.payment_status;
      if (filters.course)             params.course = filters.course;
      if (filters.date_from)          params.date_from = filters.date_from;
      if (filters.date_to)            params.date_to = filters.date_to;

      const [listRes, statsRes] = await Promise.all([
        adminApi.get('/api/admin/consultations', { params }),
        adminApi.get('/api/admin/consultations/stats'),
      ]);
      setConsultations(listRes.data || []);
      setMeta(listRes.meta || meta);
      setStats(statsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v, page: 1 }));
  const resetFilters = () => setFilters({ search: '', consultation_type: '', status: '', payment_status: '', course: '', date_from: '', date_to: '', page: 1 });
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this consultation?')) return;
    await adminApi.delete(`/api/admin/consultations/${id}`);
    fetchData();
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white text-gray-700";
  const selectCls = inputCls + " appearance-none";

  return (
    <div className="p-6 max-w-screen-xl mx-auto" style={{ fontFamily: 'Inter, DM Sans, sans-serif' }}>
      {selected && <DetailModal c={selected} onClose={() => setSelected(null)} onUpdate={fetchData} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage student consultations, schedules, and follow-ups</p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 cursor-pointer select-none"
          onClick={() => setFiltersOpen(o => !o)}>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter size={15} className="text-gray-400" />
            Filter Consultations
          </div>
          <div className="flex items-center gap-3">
            <button onClick={e => { e.stopPropagation(); resetFilters(); }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <X size={12} /> Reset Filters
            </button>
            <ChevronDown size={15} className={`text-gray-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {filtersOpen && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-400">Search and filter consultations by various criteria</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Search by student name, email, or course…"
                className={inputCls + " pl-9"} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Consultation Type</label>
                <select value={filters.consultation_type} onChange={e => handleFilterChange('consultation_type', e.target.value)} className={selectCls}>
                  <option value="">All Types</option>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className={selectCls}>
                  <option value="">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Payment Status</label>
                <select value={filters.payment_status} onChange={e => handleFilterChange('payment_status', e.target.value)} className={selectCls}>
                  <option value="">All Payment Statuses</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Student Course</label>
                <select value={filters.course} onChange={e => handleFilterChange('course', e.target.value)} className={selectCls}>
                  <option value="">All Courses</option>
                  {['Full Stack Web Development', 'Data Science Fundamentals', 'UI/UX Design Masterclass', 'Mobile App Development', 'Cloud Computing AWS', 'Digital Marketing Strategy', 'Machine Learning A-Z'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date From</label>
                <input type="date" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date To</label>
                <input type="date" value={filters.date_to} onChange={e => handleFilterChange('date_to', e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-end">
                <button onClick={fetchData}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-lg py-2 px-4 transition-colors"
                  style={{ background: '#0f0f0f' }}>
                  <Filter size={13} /> Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Consultations', value: stats.total,     color: 'text-gray-900' },
          { label: 'Scheduled',           value: stats.scheduled, color: 'text-blue-600' },
          { label: 'Completed',           value: stats.completed, color: 'text-green-600' },
          { label: 'Cancelled',           value: stats.cancelled, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Consultations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Showing {consultations.length} of {meta.total} consultations</p>
          </div>
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Student Name', 'Course Enrolled', 'Consultation Type', 'Date & Time', 'Status', 'Payment', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 6 ? '60px' : '100%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-400 text-sm">
                    No consultations found.
                  </td>
                </tr>
              ) : (
                consultations.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{c.full_name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{c.course || <span className="text-gray-400 italic">None</span>}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{TYPE_LABELS[c.consultation_type] || c.consultation_type}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        {new Date(c.preferred_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <Clock size={11} className="shrink-0" />
                        {c.preferred_time}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[c.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                        {c.payment_status.charAt(0).toUpperCase() + c.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-2">
              <button disabled={meta.current_page === 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <button disabled={meta.current_page === meta.last_page}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Default export — wrapped in guard + layout ───────────────────────────────
export default function AdminConsultationsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <ConsultationsPageInner />
      </AdminLayout>
    </AdminRouteGuard>
  );
}