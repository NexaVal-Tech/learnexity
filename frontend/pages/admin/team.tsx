// pages/admin/team.tsx
//
// Super-admin-only page for managing other admin accounts and their
// freeform permission checkboxes. Mirrors AdminManagementController on the
// backend (routes: GET/POST /api/admin/team, PUT/DELETE /api/admin/team/{id}).

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi, handleAdminApiError, Admin as AdminAccount, ADMIN_PERMISSIONS } from '@/lib/adminApi';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  Plus, Edit, Trash, Loader2, X, CheckCircle, XCircle, ShieldCheck, Shield,
} from 'lucide-react';

const permissionKeys = Object.keys(ADMIN_PERMISSIONS);

const emptyPermissions: Record<string, boolean> = permissionKeys.reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {}
);

function permsToArray(perms: Record<string, boolean>): string[] {
  return permissionKeys.filter((key) => perms[key]);
}

function arrayToPerms(arr: string[] | null | undefined): Record<string, boolean> {
  const perms = { ...emptyPermissions };
  (arr ?? []).forEach((key) => {
    if (key in perms) perms[key] = true;
  });
  return perms;
}

export default function AdminTeamPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', is_super_admin: false,
    permissions: { ...emptyPermissions },
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [editForm, setEditForm] = useState({
    name: '', email: '', password: '', is_super_admin: false,
    permissions: { ...emptyPermissions },
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get<{ admins: AdminAccount[] }>('/api/admin/team');
      setAdmins(res.admins ?? []);
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Create ────────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.post('/api/admin/team', {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        is_super_admin: createForm.is_super_admin,
        permissions: permsToArray(createForm.permissions),
      });
      showToast('Admin account created.');
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', is_super_admin: false, permissions: { ...emptyPermissions } });
      fetchData();
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const openEdit = (a: AdminAccount) => {
    setEditTarget(a);
    setEditForm({
      name: a.name,
      email: a.email,
      password: '',
      is_super_admin: !!a.is_super_admin,
      permissions: arrayToPerms(a.permissions),
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setSubmitting(true);
      const payload: Record<string, any> = {
        name: editForm.name,
        email: editForm.email,
        is_super_admin: editForm.is_super_admin,
        permissions: permsToArray(editForm.permissions),
      };
      if (editForm.password) payload.password = editForm.password;

      await adminApi.put(`/api/admin/team/${editTarget.id}`, payload);
      showToast('Admin account updated.');
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
    if (!confirm(`Delete admin account "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi.delete(`/api/admin/team/${id}`);
      showToast('Admin account deleted.');
      fetchData();
    } catch (e) {
      showToast(handleAdminApiError(e), 'error');
    }
  };

  // ── Permission checkbox grid (shared between create/edit forms) ────────────

  const PermissionGrid = ({
    perms, onToggle, disabled,
  }: {
    perms: Record<string, boolean>;
    onToggle: (key: string) => void;
    disabled?: boolean;
  }) => (
    <div className={`border border-gray-200 dark:border-white/10 rounded-lg p-3 max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {permissionKeys.map((key) => (
        <label key={key} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 px-1 py-0.5 rounded">
          <input
            type="checkbox"
            checked={perms[key]}
            onChange={() => onToggle(key)}
            className="rounded text-indigo-600 mt-0.5"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{ADMIN_PERMISSIONS[key]}</span>
        </label>
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminRouteGuard requireSuperAdmin>
      <AdminLayout>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {admins.length} admin account{admins.length !== 1 ? 's' : ''} — grant super admins or limited admins with specific capabilities.
              </p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Plus size={16} /> Add Admin
            </button>
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
                      {['Admin', 'Email', 'Role', 'Permissions', 'Actions'].map((h) => (
                        <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                    {admins.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">No admin accounts found.</td></tr>
                    ) : admins.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
                              {a.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {a.name}{a.id === currentAdmin?.id && <span className="text-gray-400 dark:text-gray-500 font-normal"> (you)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{a.email}</td>
                        <td className="py-3 px-4">
                          {a.is_super_admin ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 px-2.5 py-0.5 rounded-full w-fit">
                              <ShieldCheck size={11} /> Super Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full w-fit">
                              <Shield size={11} /> Limited Admin
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {a.is_super_admin
                            ? 'All capabilities'
                            : (a.permissions?.length
                              ? `${a.permissions.length} capabilit${a.permissions.length !== 1 ? 'ies' : 'y'}`
                              : 'None assigned')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(a)} title="Edit" className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                              <Edit size={15} />
                            </button>
                            {a.id !== currentAdmin?.id && (
                              <button onClick={() => handleDelete(a.id, a.name)} title="Delete" className="p-1.5 text-red-400 dark:text-red-500/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-lg">
                                <Trash size={15} />
                              </button>
                            )}
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Admin Account</h2>
                <button onClick={() => setCreateOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900 dark:text-white">Full Name *</label>
                    <input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className={iCls} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="label text-gray-900 dark:text-white">Email Address *</label>
                    <input required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className={iCls} placeholder="jane@learnexity.com" />
                  </div>
                </div>
                <div>
                  <label className="label text-gray-900 dark:text-white">Password *</label>
                  <input required type="password" minLength={8} value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className={iCls} placeholder="At least 8 characters" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.is_super_admin}
                    onChange={(e) => setCreateForm({ ...createForm, is_super_admin: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Super Admin (all capabilities, can manage other admins)</span>
                </label>

                <div>
                  <label className="label text-gray-900 dark:text-white">
                    Capabilities {createForm.is_super_admin && <span className="text-gray-400 dark:text-gray-500 font-normal">(not needed — super admins have all)</span>}
                  </label>
                  <PermissionGrid
                    perms={createForm.permissions}
                    disabled={createForm.is_super_admin}
                    onToggle={(key) => setCreateForm({
                      ...createForm,
                      permissions: { ...createForm.permissions, [key]: !createForm.permissions[key] },
                    })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    {submitting ? 'Creating…' : 'Create Admin'}
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Admin Account</h2>
                <button onClick={() => setEditOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
              </div>
              <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-900 dark:text-white">Full Name</label>
                    <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={iCls} />
                  </div>
                  <div>
                    <label className="label text-gray-900 dark:text-white">Email Address</label>
                    <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={iCls} />
                  </div>
                </div>
                <div>
                  <label className="label text-gray-900 dark:text-white">New Password</label>
                  <input type="password" minLength={8} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className={iCls} placeholder="Leave blank to keep current password" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_super_admin}
                    disabled={editTarget.id === currentAdmin?.id && editTarget.is_super_admin}
                    onChange={(e) => setEditForm({ ...editForm, is_super_admin: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Super Admin (all capabilities, can manage other admins)</span>
                </label>

                <div>
                  <label className="label text-gray-900 dark:text-white">
                    Capabilities {editForm.is_super_admin && <span className="text-gray-400 dark:text-gray-500 font-normal">(not needed — super admins have all)</span>}
                  </label>
                  <PermissionGrid
                    perms={editForm.permissions}
                    disabled={editForm.is_super_admin}
                    onToggle={(key) => setEditForm({
                      ...editForm,
                      permissions: { ...editForm.permissions, [key]: !editForm.permissions[key] },
                    })}
                  />
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
