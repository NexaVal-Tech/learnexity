'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit2, Trash2, Search, Filter, X, ChevronDown, Calendar, Clock, RefreshCw, Plus, Gift } from 'lucide-react';
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
  scheduled: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
  completed: 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400',
  no_show: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
};

const PAYMENT_COLORS: Record<string, string> = {
  free: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
  paid: 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400',
  pending: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
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
      <div className="bg-white dark:bg-[#0f0f14] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Consultation Details</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Student</p>
              <p className="font-medium text-gray-900 dark:text-white">{c.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.email}</p>
              {c.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{c.phone}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Session</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(c.preferred_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.preferred_time}</p>
            </div>
          </div>

          {c.course && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Course</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{c.course}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Type</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{TYPE_LABELS[c.consultation_type] || c.consultation_type}</p>
          </div>

          {c.message && (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Message</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-lg p-3">{c.message}</p>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as any)}
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 block">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Add notes about this consultation…"
              className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
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

// consultation price setting 
function PricingSettingsPanel() {
  const [prices, setPrices] = useState({ price_usd: 10, price_ngn: 10000 });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/api/admin/consultations/settings');
        setPrices(res);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.put('/api/admin/consultations/settings', prices);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-2xl mb-5 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Consultation Pricing</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Nigerians are charged in NGN, everyone else in USD — detected by IP location.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Price (USD)</label>
          <input type="number" min={0} step="0.01" value={prices.price_usd}
            onChange={e => setPrices(p => ({ ...p, price_usd: parseFloat(e.target.value) || 0 }))}
            className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Price (NGN)</label>
          <input type="number" min={0} step="1" value={prices.price_ngn}
            onChange={e => setPrices(p => ({ ...p, price_ngn: parseFloat(e.target.value) || 0 }))}
            className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <button onClick={save} disabled={saving}
          className="text-sm font-medium text-white rounded-lg py-2 px-4 transition-colors disabled:opacity-50"
          style={{ background: '#000000' }}>
          {saving ? 'Saving…' : 'Save Pricing'}
        </button>
      </div>
    </div>
  );
}

// ─── Free consultation days panel ────────────────────────────────────────────
interface FreeDay { id: number; date: string; note: string | null; }

function FreeDaysPanel() {
  const [freeDays, setFreeDays] = useState<FreeDay[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const fetchFreeDays = useCallback(async () => {
    try {
      const res = await adminApi.get('/api/admin/consultations/free-days');
      setFreeDays(res.free_days || []);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchFreeDays(); }, [fetchFreeDays]);

  const addFreeDay = async () => {
    if (!newDate) { setError('Please pick a date.'); return; }
    setAdding(true);
    setError('');
    try {
      await adminApi.post('/api/admin/consultations/free-days', { date: newDate, note: newNote || undefined });
      setNewDate('');
      setNewNote('');
      fetchFreeDays();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to add free day.');
    } finally {
      setAdding(false);
    }
  };

  const removeFreeDay = async (id: number) => {
    if (!confirm('Remove this free day? Bookings on this date will go back to requiring payment.')) return;
    await adminApi.delete(`/api/admin/consultations/free-days/${id}`);
    fetchFreeDays();
  };

  if (!loaded) return null;

  return (
    <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-2xl mb-5 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Gift size={16} className="text-green-600 dark:text-green-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Free Consultation Days</h3>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
        On these dates, anyone can book a consultation with no payment and no slot limit — many people can book the same or different times. All other days keep the normal paid, one-booking-per-slot rule.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
        <div>
          <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Date</label>
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
            className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Note (optional)</label>
          <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)}
            placeholder="e.g. Open house day"
            className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <button onClick={addFreeDay} disabled={adding}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-white rounded-lg py-2 px-4 transition-colors disabled:opacity-50"
          style={{ background: '#16a34a' }}>
          <Plus size={14} /> {adding ? 'Adding…' : 'Add Free Day'}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 dark:text-red-400 mb-3">{error}</p>}

      {freeDays.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No free days configured yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {freeDays.map(fd => (
            <div key={fd.id}
              className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/30">
              <span className="text-sm font-medium text-green-800 dark:text-green-400">
                {new Date(fd.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {fd.note && <span className="text-xs text-green-600 dark:text-green-500">— {fd.note}</span>}
              <button onClick={() => removeFreeDay(fd.id)}
                className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-500/25 text-green-500 dark:text-green-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
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

  const inputCls = "w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 focus:border-blue-400 bg-white dark:bg-[#08080c] text-gray-700 dark:text-gray-300";
  const selectCls = inputCls + " appearance-none";

  return (
    <div className="p-6 max-w-screen-xl mx-auto" style={{ fontFamily: 'Inter, DM Sans, sans-serif' }}>
      {selected && <DetailModal c={selected} onClose={() => setSelected(null)} onUpdate={fetchData} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage student consultations, schedules, and follow-ups</p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-2xl mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/10 cursor-pointer select-none"
          onClick={() => setFiltersOpen(o => !o)}>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Filter size={15} className="text-gray-400 dark:text-gray-500" />
            Filter Consultations
          </div>
          <div className="flex items-center gap-3">
            <button onClick={e => { e.stopPropagation(); resetFilters(); }}
              className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <X size={12} /> Reset Filters
            </button>
            <ChevronDown size={15} className={`text-gray-400 dark:text-gray-500 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {filtersOpen && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">Search and filter consultations by various criteria</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Search by student name, email, or course…"
                className={inputCls + " pl-9"} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Consultation Type</label>
                <select value={filters.consultation_type} onChange={e => handleFilterChange('consultation_type', e.target.value)} className={selectCls}>
                  <option value="">All Types</option>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Status</label>
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className={selectCls}>
                  <option value="">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Payment Status</label>
                <select value={filters.payment_status} onChange={e => handleFilterChange('payment_status', e.target.value)} className={selectCls}>
                  <option value="">All Payment Statuses</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Student Course</label>
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
                <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Date From</label>
                <input type="date" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Date To</label>
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

      <PricingSettingsPanel />
      <FreeDaysPanel />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Consultations', value: stats.total,     color: 'text-gray-900 dark:text-white' },
          { label: 'Scheduled',           value: stats.scheduled, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Completed',           value: stats.completed, color: 'text-green-600 dark:text-green-400' },
          { label: 'Cancelled',           value: stats.cancelled, color: 'text-red-500 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-2xl p-5">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Consultations</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Showing {consultations.length} of {meta.total} consultations</p>
          </div>
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/10">
                {['Student Name', 'Course Enrolled', 'Consultation Type', 'Date & Time', 'Status', 'Payment', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-white/10 rounded animate-pulse" style={{ width: j === 6 ? '60px' : '100%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
                    No consultations found.
                  </td>
                </tr>
              ) : (
                consultations.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{c.full_name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{c.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{c.course || <span className="text-gray-400 dark:text-gray-500 italic">None</span>}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{TYPE_LABELS[c.consultation_type] || c.consultation_type}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar size={12} className="text-gray-400 dark:text-gray-500 shrink-0" />
                        {new Date(c.preferred_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        <Clock size={11} className="shrink-0" />
                        {c.preferred_time}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[c.payment_status] || 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
                        {c.payment_status.charAt(0).toUpperCase() + c.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/15 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/15 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete">
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
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/10">
            <p className="text-sm text-gray-400 dark:text-gray-500">Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-2">
              <button disabled={meta.current_page === 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300">
                Previous
              </button>
              <button disabled={meta.current_page === meta.last_page}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300">
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
    <AdminRouteGuard requiredPermission="consultations">
      <AdminLayout>
        <ConsultationsPageInner />
      </AdminLayout>
    </AdminRouteGuard>
  );
}