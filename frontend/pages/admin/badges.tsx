import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import {
  Award, Plus, Trash2, Pencil, Users, X, Loader2, Search, CheckCircle, XCircle, Eye,
} from 'lucide-react';
import BadgePreviewModal from '@/components/achievements/BadgePreviewModal';

interface Badge {
  id: number;
  course_id: string;
  course_title: string | null;
  name: string;
  description: string;
  badge_icon: string | null;
  badge_color: string;
  unlock_type: 'sprint_completion' | 'course_completion' | 'milestone';
  unlock_value: number;
  holders_count: number;
  created_at: string;
}

interface CourseOption {
  course_id: string;
  title: string;
}

interface Holder {
  user_id: number;
  name: string;
  email: string;
  unlocked_at: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

const unlockLabel = (b: Badge) => {
  if (b.unlock_type === 'course_completion') return 'On course completion';
  if (b.unlock_type === 'sprint_completion') return `On completing sprint #${b.unlock_value}`;
  return `Milestone: ${b.unlock_value}`;
};

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Badge | null>(null);
  const [saving, setSaving] = useState(false);

  const [holdersFor, setHoldersFor] = useState<Badge | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [holdersLoading, setHoldersLoading] = useState(false);

  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  const [awardFor, setAwardFor] = useState<Badge | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [awarding, setAwarding] = useState(false);

  const [form, setForm] = useState({
    course_id: '', name: '', description: '', badge_color: '#9333EA',
    badge_icon: '', unlock_type: 'course_completion' as Badge['unlock_type'], unlock_value: 1,
  });

  useEffect(() => {
    fetchBadges();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get<{ badges: Badge[] }>('/api/admin/badges');
      setBadges(res.badges);
    } catch {
      setToast({ msg: 'Failed to load badges', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await adminApi.get<{ data: any[] }>('/api/admin/courses');
      setCourses(res.data.map((c) => ({ course_id: c.course_id, title: c.title })));
    } catch {
      // non-critical
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ course_id: courses[0]?.course_id || '', name: '', description: '', badge_color: '#9333EA', badge_icon: '', unlock_type: 'course_completion', unlock_value: 1 });
    setShowForm(true);
  };

  const openEdit = (b: Badge) => {
    setEditing(b);
    setForm({
      course_id: b.course_id, name: b.name, description: b.description,
      badge_color: b.badge_color, badge_icon: b.badge_icon || '',
      unlock_type: b.unlock_type, unlock_value: b.unlock_value,
    });
    setShowForm(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminApi.put(`/api/admin/badges/${editing.id}`, {
          name: form.name, description: form.description, badge_color: form.badge_color,
          badge_icon: form.badge_icon || null, unlock_type: form.unlock_type, unlock_value: form.unlock_value,
        });
        setToast({ msg: 'Badge updated', type: 'success' });
      } else {
        await adminApi.post('/api/admin/badges', form);
        setToast({ msg: 'Badge created', type: 'success' });
      }
      setShowForm(false);
      fetchBadges();
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const deleteBadge = async (b: Badge) => {
    if (!confirm(`Delete badge "${b.name}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/api/admin/badges/${b.id}`);
      setToast({ msg: 'Badge deleted', type: 'success' });
      fetchBadges();
    } catch {
      setToast({ msg: 'Delete failed', type: 'error' });
    }
  };

  const openHolders = async (b: Badge) => {
    setHoldersFor(b);
    setHoldersLoading(true);
    try {
      const res = await adminApi.get<{ holders: Holder[] }>(`/api/admin/badges/${b.id}/holders`);
      setHolders(res.holders);
    } catch {
      setHolders([]);
    } finally {
      setHoldersLoading(false);
    }
  };

  const searchUsers = async (q: string) => {
    setUserQuery(q);
    if (q.trim().length < 2) { setUserResults([]); return; }
    try {
      const res = await adminApi.get<{ users: UserOption[] }>(`/api/admin/badges/users/search?q=${encodeURIComponent(q)}`);
      setUserResults(res.users);
    } catch {
      setUserResults([]);
    }
  };

  const award = async (user: UserOption) => {
    if (!awardFor) return;
    setAwarding(true);
    try {
      await adminApi.post(`/api/admin/badges/${awardFor.id}/award`, { user_id: user.id });
      setToast({ msg: `Awarded "${awardFor.name}" to ${user.name}`, type: 'success' });
      setAwardFor(null);
      setUserQuery('');
      setUserResults([]);
      fetchBadges();
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message || 'Award failed', type: 'error' });
    } finally {
      setAwarding(false);
    }
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6">
          {toast && (
            <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {toast.msg}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Badges</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Create achievement badges and award them to students.</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              <Plus size={16} /> New Badge
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={24} /></div>
            ) : badges.length === 0 ? (
              <div className="py-16 text-center text-gray-500 dark:text-gray-400">No badges yet. Create your first one.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Badge</th>
                    <th className="text-left px-5 py-3">Course</th>
                    <th className="text-left px-5 py-3">Unlock Rule</th>
                    <th className="text-left px-5 py-3">Holders</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {badges.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${b.badge_color}22`, color: b.badge_color }}>
                            <Award size={16} />
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{b.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{b.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{b.course_title || b.course_id}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{unlockLabel(b)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => openHolders(b)} className="flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:underline font-medium">
                          <Users size={13} /> {b.holders_count}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setPreviewBadge(b)} title="Preview" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><Eye size={15} /></button>
                          <button onClick={() => setAwardFor(b)} title="Manually award" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400"><Plus size={15} /></button>
                          <button onClick={() => openEdit(b)} title="Edit" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><Pencil size={15} /></button>
                          <button onClick={() => deleteBadge(b)} title="Delete" className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/15 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create / edit modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !saving && setShowForm(false)}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitForm} className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Badge' : 'New Badge'}</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                {!editing && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Course</label>
                    <select required value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm">
                      <option value="" disabled>Select a course</option>
                      {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sprint 1 Champion" className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                  <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Color</label>
                    <input type="color" value={form.badge_color} onChange={(e) => setForm({ ...form, badge_color: e.target.value })} className="w-full h-9 border border-gray-200 dark:border-white/10 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Icon (optional)</label>
                    <input value={form.badge_icon} onChange={(e) => setForm({ ...form, badge_icon: e.target.value })} placeholder="icon name/url" className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Unlock Rule</label>
                    <select value={form.unlock_type} onChange={(e) => setForm({ ...form, unlock_type: e.target.value as Badge['unlock_type'] })} className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm">
                      <option value="course_completion">Course completion</option>
                      <option value="sprint_completion">Sprint completion</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {form.unlock_type === 'sprint_completion' ? 'Sprint #' : 'Value'}
                    </label>
                    <input type="number" min={1} value={form.unlock_value} onChange={(e) => setForm({ ...form, unlock_value: parseInt(e.target.value || '1', 10) })} className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Badge'}
              </button>
            </form>
          </div>
        )}

        {/* Holders modal */}
        {holdersFor && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setHoldersFor(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{holdersFor.name} — Holders</h3>
                <button onClick={() => setHoldersFor(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={18} /></button>
              </div>
              {holdersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400 dark:text-gray-500" size={20} /></div>
              ) : holders.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No one has earned this badge yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-white/10">
                  {holders.map((h) => (
                    <li key={h.user_id} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{h.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{h.email}</div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(h.unlocked_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Award modal */}
        {awardFor && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAwardFor(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Award "{awardFor.name}"</h3>
                <button onClick={() => setAwardFor(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={18} /></button>
              </div>
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input autoFocus value={userQuery} onChange={(e) => searchUsers(e.target.value)} placeholder="Search by name or email…" className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm" />
              </div>
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-white/10">
                {userResults.map((u) => (
                  <li key={u.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </div>
                    <button disabled={awarding} onClick={() => award(u)} className="text-purple-700 dark:text-purple-400 hover:underline font-medium text-xs disabled:opacity-50">Award</button>
                  </li>
                ))}
                {userQuery.length >= 2 && userResults.length === 0 && (
                  <li className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">No matching users</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <BadgePreviewModal
          open={!!previewBadge}
          onClose={() => setPreviewBadge(null)}
          name={previewBadge?.name || ''}
          description={previewBadge?.description || ''}
          badgeColor={previewBadge?.badge_color || '#9333EA'}
        />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
