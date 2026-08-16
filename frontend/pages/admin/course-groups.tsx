// pages/admin/course-groups.tsx
// Admin-only course grouping — e.g. "Data Analysis" as a group containing
// several related courses. One group can hold many courses; a course can
// also stand alone with no group. Purely organizational for now — there is
// no user-facing display of groups yet.

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import { api } from '@/lib/api';
import {
  FolderTree, Plus, Loader2, X, Trash2, Pencil, Check, AlertCircle,
} from 'lucide-react';

interface CourseLite {
  id: number;
  course_id: string;
  title: string;
  course_group_id: number | null;
}

interface CourseGroupItem {
  id: number;
  name: string;
  description: string | null;
  courses: CourseLite[];
  courses_count: number;
}

function GroupFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: { id: number; name: string; description: string | null } | null;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) { setError('Group name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-[#0f0f14] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{initial ? 'Edit Course Group' : 'New Course Group'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Data Analysis"
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What kind of courses belong in this group?"
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5"><AlertCircle size={14} /> {error}</p>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {initial ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignCoursesModal({
  group,
  allCourses,
  onClose,
  onAssign,
}: {
  group: CourseGroupItem;
  allCourses: CourseLite[];
  onClose: () => void;
  onAssign: (courseIds: string[]) => Promise<void>;
}) {
  const memberIds = new Set(group.courses.map(c => c.course_id));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const toggle = (courseId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId); else next.add(courseId);
      return next;
    });
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      await onAssign(Array.from(selected));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const filtered = allCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.course_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-[#0f0f14] rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Courses to "{group.name}"</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pick as many as you want. Courses already in another group will be moved here.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-white/10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No courses found</p>
          ) : filtered.map(c => {
            const alreadyInThisGroup = memberIds.has(c.course_id);
            const checked = selected.has(c.course_id) || alreadyInThisGroup;
            return (
              <label
                key={c.course_id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${alreadyInThisGroup ? 'bg-purple-50 dark:bg-indigo-500/15' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={alreadyInThisGroup}
                  onChange={() => toggle(c.course_id)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {c.course_id}
                    {alreadyInThisGroup && <span className="text-purple-600 dark:text-purple-400 font-medium"> · already in this group</span>}
                    {!alreadyInThisGroup && c.course_group_id && <span className="text-amber-600 dark:text-amber-400 font-medium"> · in another group</span>}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Add {selected.size > 0 ? `${selected.size} ` : ''}Course{selected.size === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseGroupsPage() {
  const [groups, setGroups] = useState<CourseGroupItem[]>([]);
  const [ungroupedCount, setUngroupedCount] = useState(0);
  const [allCourses, setAllCourses] = useState<CourseLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string; description: string | null } | null>(null);
  const [assigningGroup, setAssigningGroup] = useState<CourseGroupItem | null>(null);
  const [removingCourse, setRemovingCourse] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      const data = await adminApi.get<{ groups: CourseGroupItem[]; ungrouped_count: number }>('/api/admin/course-groups');
      setGroups(data.groups);
      setUngroupedCount(data.ungrouped_count);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load course groups');
    }
  };

  const loadCourses = async () => {
    try {
      const res = await api.admin.courses.getAll({ per_page: 500 });
      setAllCourses((res.data as any[]).map(c => ({
        id: c.id, course_id: c.course_id, title: c.title, course_group_id: c.course_group_id ?? null,
      })));
    } catch {
      // Non-critical for group management itself
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadGroups(), loadCourses()]);
      setLoading(false);
    })();
  }, []);

  const handleCreateOrUpdate = async (data: { name: string; description: string }) => {
    if (editingGroup) {
      await adminApi.put(`/api/admin/course-groups/${editingGroup.id}`, data);
    } else {
      await adminApi.post('/api/admin/course-groups', data);
    }
    await Promise.all([loadGroups(), loadCourses()]);
  };

  const handleDelete = async (group: CourseGroupItem) => {
    if (!confirm(`Delete "${group.name}"? Its courses won't be deleted — they'll just become ungrouped.`)) return;
    await adminApi.delete(`/api/admin/course-groups/${group.id}`);
    await Promise.all([loadGroups(), loadCourses()]);
  };

  const handleAssign = async (courseIds: string[]) => {
    if (!assigningGroup) return;
    await adminApi.post(`/api/admin/course-groups/${assigningGroup.id}/courses`, { course_ids: courseIds });
    await Promise.all([loadGroups(), loadCourses()]);
  };

  const handleRemoveCourse = async (group: CourseGroupItem, courseId: string) => {
    setRemovingCourse(courseId);
    try {
      await adminApi.delete(`/api/admin/course-groups/${group.id}/courses/${courseId}`);
      await Promise.all([loadGroups(), loadCourses()]);
    } finally {
      setRemovingCourse(null);
    }
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderTree className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Course Groups
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Organize related courses under one group — e.g. "Data Analysis" holding several
                related courses. A course can also stand alone with no group. Admin-only for now.
              </p>
            </div>
            <button
              onClick={() => { setEditingGroup(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              <Plus size={16} /> New Group
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-4 mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">{ungroupedCount}</span> course{ungroupedCount === 1 ? '' : 's'} currently stand alone (no group)
                </p>
              </div>

              {groups.length === 0 ? (
                <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
                  <FolderTree className="w-10 h-10 text-gray-200 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No course groups yet</p>
                  <button
                    onClick={() => { setEditingGroup(null); setShowForm(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    <Plus size={16} /> Create your first group
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                          {group.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{group.description}</p>}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{group.courses_count} course{group.courses_count === 1 ? '' : 's'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAssigningGroup(group)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-indigo-500/15 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-100 dark:hover:bg-indigo-500/25"
                          >
                            <Plus size={12} /> Add Courses
                          </button>
                          <button
                            onClick={() => { setEditingGroup({ id: group.id, name: group.name, description: group.description }); setShowForm(true); }}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                            title="Edit group"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(group)}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/15"
                            title="Delete group"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {group.courses.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No courses added yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {group.courses.map(c => (
                            <span
                              key={c.course_id}
                              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                            >
                              {c.title}
                              <button
                                onClick={() => handleRemoveCourse(group, c.course_id)}
                                disabled={removingCourse === c.course_id}
                                className="p-0.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-500/15"
                                title="Remove from group"
                              >
                                {removingCourse === c.course_id ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {showForm && (
          <GroupFormModal
            initial={editingGroup}
            onClose={() => { setShowForm(false); setEditingGroup(null); }}
            onSave={handleCreateOrUpdate}
          />
        )}

        {assigningGroup && (
          <AssignCoursesModal
            group={assigningGroup}
            allCourses={allCourses}
            onClose={() => setAssigningGroup(null)}
            onAssign={handleAssign}
          />
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}
