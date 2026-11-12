// pages/admin/instructors/index.tsx

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import { handleAdminApiError } from '@/lib/adminApi';
import {
  Plus, Search, Edit, Trash, Loader2, X, Mail, Phone,
  GraduationCap, CheckCircle, XCircle, RefreshCw, Copy, KeyRound,
} from 'lucide-react';

interface Credentials { email: string; password: string; login_url: string }
interface CredentialsNotice { title: string; note: string; emailSent: boolean; credentials: Credentials }

interface Instructor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialisation?: string;
  is_active: boolean;
  last_login_at?: string;
  assigned_course_ids?: string[];
}

interface Course { id: number; course_id: string; title: string }

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [creds, setCreds]             = useState<CredentialsNotice | null>(null);
  const [copied, setCopied]           = useState<string | null>(null);

  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard blocked */ }
  };

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', phone: '', bio: '', specialisation: '', course_ids: [] as string[],
  });

  // Edit modal
  const [editOpen, setEditOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Instructor | null>(null);
  const [editForm, setEditForm]   = useState({
    name: '', phone: '', bio: '', specialisation: '', is_active: true, course_ids: [] as string[],
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [instrRes, courseRes] = await Promise.all([
        adminApi.get('/api/admin/instructors'),
        adminApi.get('/api/admin/courses?per_page=100'),
      ]);
      setInstructors(instrRes.data ?? instrRes);
      setCourses(courseRes.data ?? courseRes);
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res: any = await adminApi.post('/api/admin/instructors', createForm);
      setCreateOpen(false);
      if (res?.credentials) {
        setCreds({
          title: 'Instructor created',
          emailSent: !!res.email_sent,
          note: res.email_sent
            ? 'A welcome email with these login details is on its way. If it doesn’t arrive in a few minutes (check spam), share them directly.'
            : 'The welcome email could not be sent — please share these login details with the instructor.',
          credentials: res.credentials,
        });
      } else {
        showToast('Instructor created.');
      }
      setCreateForm({ name: '', email: '', phone: '', bio: '', specialisation: '', course_ids: [] });
      fetchData();
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const openEdit = (instructor: Instructor) => {
    setEditTarget(instructor);
    setEditForm({
      name:           instructor.name,
      phone:          instructor.phone ?? '',
      bio:            instructor.bio ?? '',
      specialisation: instructor.specialisation ?? '',
      is_active:      instructor.is_active,
      course_ids:     instructor.assigned_course_ids ?? [],
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setSubmitting(true);
      await adminApi.put(`/api/admin/instructors/${editTarget.id}`, editForm);
      showToast('Instructor updated successfully.');
      setEditOpen(false);
      fetchData();
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete instructor "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/api/admin/instructors/${id}`);
      showToast('Instructor deleted.');
      fetchData();
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    }
  };

  // ── Reset password ────────────────────────────────────────────────────────

  const handleResetPassword = async (id: number, name: string) => {
    if (!confirm(`Resend login details to "${name}"? A new temporary password will be created and emailed to them (the old one stops working).`)) return;
    try {
      const res: any = await adminApi.post(`/api/admin/instructors/${id}/reset-password`);
      if (res?.credentials) {
        setCreds({
          title: `New login details for ${name}`,
          emailSent: !!res.email_sent,
          note: res.message || 'New login details emailed to the instructor.',
          credentials: res.credentials,
        });
      } else {
        showToast(res?.message || 'New login details emailed to the instructor.');
      }
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    }
  };

  // ── Course multi-select helper ────────────────────────────────────────────

  const toggleCourse = (courseId: string, current: string[], setter: (ids: string[]) => void) => {
    setter(current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminRouteGuard requiredPermission="instructors">
      <AdminLayout>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{instructors.length} instructor{instructors.length !== 1 ? 's' : ''} registered</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Plus size={16} /> Add Instructor
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                      {['Instructor', 'Email', 'Specialisation', 'Courses', 'Status', 'Last Login', 'Actions'].map((h) => (
                        <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">No instructors found.</td></tr>
                    ) : filtered.map((instructor) => (
                      <tr key={instructor.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
                              {instructor.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{instructor.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{instructor.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{instructor.specialisation || '—'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {instructor.assigned_course_ids?.length ?? 0} course{instructor.assigned_course_ids?.length !== 1 ? 's' : ''}
                        </td>
                        <td className="py-3 px-4">
                          {instructor.is_active ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-2.5 py-0.5 rounded-full w-fit">
                              <CheckCircle size={11} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/15 px-2.5 py-0.5 rounded-full w-fit">
                              <XCircle size={11} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400 dark:text-gray-500">
                          {instructor.last_login_at
                            ? new Date(instructor.last_login_at).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(instructor)} title="Edit" className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleResetPassword(instructor.id, instructor.name)} title="Resend login email (new password)" aria-label="Resend login email" className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-[#4A3AFF] hover:bg-[#F5F3FF] dark:hover:bg-indigo-500/15 rounded-lg">
                              <RefreshCw size={15} />
                            </button>
                            <button onClick={() => handleDelete(instructor.id, instructor.name)} title="Delete" className="p-1.5 text-red-400 dark:text-red-500/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-lg">
                              <Trash size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ══ CREATE MODAL ══════════════════════════════════════════════════ */}
        {createOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0f0f14] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#0f0f14]">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Instructor</h2>
                <button onClick={() => setCreateOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900 dark:text-white">Full Name *</label>
                    <input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className={iCls} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="label text-gray-900 dark:text-white">Email Address *</label>
                    <input required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={iCls} placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900 dark:text-white">Phone</label>
                    <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className={iCls} placeholder="+234..." />
                  </div>
                  <div>
                    <label className="label text-gray-900 dark:text-white">Specialisation</label>
                    <input value={createForm.specialisation} onChange={(e) => setCreateForm({ ...createForm, specialisation: e.target.value })} className={iCls} placeholder="e.g. Product Design" />
                  </div>
                </div>
                <div>
                  <label className="label text-gray-900 dark:text-white">Bio (optional)</label>
                  <textarea rows={2} value={createForm.bio} onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })} className={iCls} placeholder="Brief bio…" />
                </div>
                <div>
                  <label className="label text-gray-900 dark:text-white">Assign Courses</label>
                  <div className="border border-gray-200 dark:border-white/10 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {courses.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">No courses available.</p>
                    ) : courses.map((course) => (
                      <label key={course.course_id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={createForm.course_ids.includes(course.course_id)}
                          onChange={() => toggleCourse(course.course_id, createForm.course_ids, (ids) => setCreateForm({ ...createForm, course_ids: ids }))}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{course.title}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">The instructor will only be able to manage selected courses.</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> A temporary password will be created and emailed to the instructor. You&apos;ll also see it on screen after saving, so you can share it if the email is slow.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? 'Creating…' : 'Create & Send Credentials'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ EDIT MODAL ════════════════════════════════════════════════════ */}
        {editOpen && editTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0f0f14] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#0f0f14]">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Instructor</h2>
                <button onClick={() => setEditOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="label text-gray-900 dark:text-white">Full Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={iCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900 dark:text-white">Phone</label>
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={iCls} />
                  </div>
                  <div>
                    <label className="label text-gray-900 dark:text-white">Specialisation</label>
                    <input value={editForm.specialisation} onChange={(e) => setEditForm({ ...editForm, specialisation: e.target.value })} className={iCls} />
                  </div>
                </div>
                <div>
                  <label className="label text-gray-900 dark:text-white">Status</label>
                  <select value={editForm.is_active ? '1' : '0'} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === '1' })} className={iCls}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="label text-gray-900 dark:text-white">Assigned Courses</label>
                  <div className="border border-gray-200 dark:border-white/10 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {courses.map((course) => (
                      <label key={course.course_id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={editForm.course_ids.includes(course.course_id)}
                          onChange={() => toggleCourse(course.course_id, editForm.course_ids, (ids) => setEditForm({ ...editForm, course_ids: ids }))}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{course.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ LOGIN DETAILS (shown once) ═══════════════════════════════════ */}
        {creds && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0f0f14] rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><KeyRound size={18} className="text-[#4A3AFF]" /> {creds.title}</h2>
                <button onClick={() => setCreds(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={20} /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <p className={`text-sm rounded-lg p-3 border ${creds.emailSent ? 'bg-[#F5F3FF] border-[#E0D9FE] text-[#4A3AFF] dark:bg-indigo-500/10 dark:border-indigo-500/25 dark:text-indigo-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-300'}`}>
                  {creds.note}
                </p>
                {([
                  ['Email', creds.credentials.email],
                  ['Temporary password', creds.credentials.password],
                  ['Login page', creds.credentials.login_url],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 min-w-0 truncate px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white">{value}</code>
                      <button type="button" onClick={() => copy(label, value)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10">
                        <Copy size={13} /> {copied === label ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => copy('all', `Your Learnexity instructor account\nLogin: ${creds.credentials.login_url}\nEmail: ${creds.credentials.email}\nTemporary password: ${creds.credentials.password}`)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#4A3AFF] text-white text-sm font-semibold hover:bg-[#3b2de0]"
                >
                  <Copy size={15} /> {copied === 'all' ? 'Copied — paste it in WhatsApp or email' : 'Copy all as a message'}
                </button>
                <p className="text-[11px] text-gray-400">For security this password is shown only now. Use “Resend login email” (↻) later to create a new one.</p>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}

const iCls = 'w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';