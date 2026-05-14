// pages/admin/instructors/index.tsx

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import { handleAdminApiError } from '@/lib/adminApi';
import {
  Plus, Search, Edit, Trash, Loader2, X, Mail, Phone,
  GraduationCap, CheckCircle, XCircle, RefreshCw,
} from 'lucide-react';

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
      await adminApi.post('/api/admin/instructors', createForm);
      showToast('Instructor created and welcome email sent!');
      setCreateOpen(false);
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
    if (!confirm(`Reset password for "${name}"? A new password will be emailed to them.`)) return;
    try {
      await adminApi.post(`/api/admin/instructors/${id}/reset-password`);
      showToast('New password sent to instructor email.');
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
    <AdminRouteGuard>
      <AdminLayout>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Management</h1>
              <p className="text-sm text-gray-500 mt-1">{instructors.length} instructor{instructors.length !== 1 ? 's' : ''} registered</p>
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
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Instructor', 'Email', 'Specialisation', 'Courses', 'Status', 'Last Login', 'Actions'].map((h) => (
                        <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="py-10 text-center text-gray-500">No instructors found.</td></tr>
                    ) : filtered.map((instructor) => (
                      <tr key={instructor.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                              {instructor.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{instructor.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{instructor.specialisation || '—'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {instructor.assigned_course_ids?.length ?? 0} course{instructor.assigned_course_ids?.length !== 1 ? 's' : ''}
                        </td>
                        <td className="py-3 px-4">
                          {instructor.is_active ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full w-fit">
                              <CheckCircle size={11} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full w-fit">
                              <XCircle size={11} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">
                          {instructor.last_login_at
                            ? new Date(instructor.last_login_at).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(instructor)} title="Edit" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleResetPassword(instructor.id, instructor.name)} title="Reset Password" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <RefreshCw size={15} />
                            </button>
                            <button onClick={() => handleDelete(instructor.id, instructor.name)} title="Delete" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Add New Instructor</h2>
                <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900">Full Name *</label>
                    <input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className={iCls} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="label text-gray-900">Email Address *</label>
                    <input required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={iCls} placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900">Phone</label>
                    <input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className={iCls} placeholder="+234..." />
                  </div>
                  <div>
                    <label className="label text-gray-900">Specialisation</label>
                    <input value={createForm.specialisation} onChange={(e) => setCreateForm({ ...createForm, specialisation: e.target.value })} className={iCls} placeholder="e.g. Product Design" />
                  </div>
                </div>
                <div>
                  <label className="label text-gray-900">Bio (optional)</label>
                  <textarea rows={2} value={createForm.bio} onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })} className={iCls} placeholder="Brief bio…" />
                </div>
                <div>
                  <label className="label text-gray-900">Assign Courses</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {courses.length === 0 ? (
                      <p className="text-xs text-gray-400">No courses available.</p>
                    ) : courses.map((course) => (
                      <label key={course.course_id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={createForm.course_ids.includes(course.course_id)}
                          onChange={() => toggleCourse(course.course_id, createForm.course_ids, (ids) => setCreateForm({ ...createForm, course_ids: ids }))}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{course.title}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">The instructor will only be able to manage selected courses.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                  <strong>Note:</strong> A random password will be generated and emailed to the instructor automatically.
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
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
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Edit Instructor</h2>
                <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={iCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone</label>
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={iCls} />
                  </div>
                  <div>
                    <label className="label">Specialisation</label>
                    <input value={editForm.specialisation} onChange={(e) => setEditForm({ ...editForm, specialisation: e.target.value })} className={iCls} />
                  </div>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select value={editForm.is_active ? '1' : '0'} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === '1' })} className={iCls}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="label">Assigned Courses</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {courses.map((course) => (
                      <label key={course.course_id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={editForm.course_ids.includes(course.course_id)}
                          onChange={() => toggleCourse(course.course_id, editForm.course_ids, (ids) => setEditForm({ ...editForm, course_ids: ids }))}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{course.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
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

const iCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';