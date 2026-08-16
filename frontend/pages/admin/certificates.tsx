import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { adminApi } from '@/lib/adminApi';
import {
  FileBadge, Plus, X, Loader2, Search, CheckCircle, XCircle, Eye,
  RotateCcw, Ban, Search as SearchIcon, AlertTriangle, RefreshCw,
} from 'lucide-react';
import CertificatePreviewModal from '@/components/achievements/CertificatePreviewModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CertificateRow {
  id: number;
  certificate_uid: string;
  course_id: string;
  course_title: string;
  recipient_name: string;
  issue_type: 'auto' | 'manual';
  issued_at: string;
  revoked_at: string | null;
  pdf_path: string | null;
  download_url: string;
  user?: { id: number; name: string; email: string };
  issued_by_admin?: { id: number; name: string } | null;
}

interface Stats { total: number; active: number; revoked: number; auto: number; manual: number; }

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [showIssue, setShowIssue] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<{ id: number; name: string; email: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [courses, setCourses] = useState<{ course_id: string; title: string }[]>([]);
  const [courseId, setCourseId] = useState('');
  const [issuing, setIssuing] = useState(false);

  useEffect(() => { fetchCertificates(); fetchStats(); fetchCourses(); }, [search, statusFilter]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }
  }, [toast]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await adminApi.get<{ data: CertificateRow[] }>(`/api/admin/certificates?${params.toString()}`);
      setCertificates(res.data);
    } catch {
      setToast({ msg: 'Failed to load certificates', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try { setStats(await adminApi.get<Stats>('/api/admin/certificates/statistics')); } catch {}
  };

  const fetchCourses = async () => {
    try {
      const res = await adminApi.get<{ data: any[] }>('/api/admin/courses');
      setCourses(res.data.map((c) => ({ course_id: c.course_id, title: c.title })));
    } catch {}
  };

  const searchUsers = async (q: string) => {
    setUserQuery(q);
    setSelectedUser(null);
    if (q.trim().length < 2) { setUserResults([]); return; }
    try {
      const res = await adminApi.get<{ users: any[] }>(`/api/admin/badges/users/search?q=${encodeURIComponent(q)}`);
      setUserResults(res.users);
    } catch { setUserResults([]); }
  };

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !courseId) return;
    setIssuing(true);
    try {
      await adminApi.post('/api/admin/certificates/issue', { user_id: selectedUser.id, course_id: courseId });
      setToast({ msg: 'Certificate issued', type: 'success' });
      setShowIssue(false);
      setSelectedUser(null); setUserQuery(''); setUserResults([]); setCourseId('');
      fetchCertificates(); fetchStats();
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message || 'Issue failed', type: 'error' });
    } finally {
      setIssuing(false);
    }
  };

  const revoke = async (c: CertificateRow) => {
    const reason = prompt(`Revoke certificate for ${c.recipient_name}? Optional reason:`);
    if (reason === null) return;
    try {
      await adminApi.post(`/api/admin/certificates/${c.id}/revoke`, { reason });
      setToast({ msg: 'Certificate revoked', type: 'success' });
      fetchCertificates(); fetchStats();
    } catch { setToast({ msg: 'Revoke failed', type: 'error' }); }
  };

  const reinstate = async (c: CertificateRow) => {
    try {
      await adminApi.post(`/api/admin/certificates/${c.id}/reinstate`);
      setToast({ msg: 'Certificate reinstated', type: 'success' });
      fetchCertificates(); fetchStats();
    } catch { setToast({ msg: 'Reinstate failed', type: 'error' }); }
  };

  // ── Preview (admin download endpoint is auth-gated — Google's viewer
  // can't reach it, so we fetch the PDF bytes ourselves with the admin's
  // bearer token and hand the modal a local blob: URL instead) ──────────────
  const [previewCert, setPreviewCert] = useState<CertificateRow | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const openPreview = async (c: CertificateRow) => {
    setPreviewCert(c);
    setPreviewLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch(`${API_URL}/api/admin/certificates/${c.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load certificate');
      const blob = await res.blob();
      setPreviewBlobUrl(URL.createObjectURL(blob));
    } catch {
      setToast({ msg: 'Failed to load certificate preview', type: 'error' });
      setPreviewCert(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setPreviewBlobUrl(null);
    setPreviewCert(null);
  };

  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const regenerate = async (c: CertificateRow) => {
    setRegeneratingId(c.id);
    try {
      await adminApi.post(`/api/admin/certificates/${c.id}/regenerate`);
      setToast({ msg: 'PDF generated', type: 'success' });
      fetchCertificates();
    } catch (err: any) {
      setToast({ msg: err?.response?.data?.message || 'PDF generation failed', type: 'error' });
    } finally {
      setRegeneratingId(null);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certificates</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Certificates auto-issue on course completion — or issue one manually below.</p>
            </div>
            <button onClick={() => setShowIssue(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              <Plus size={16} /> Issue Certificate
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {[
                ['Total', stats.total], ['Active', stats.active], ['Revoked', stats.revoked],
                ['Auto-issued', stats.auto], ['Manually issued', stats.manual],
              ].map(([label, val]) => (
                <div key={label as string} className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] p-4 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{val}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipient, course, or ID…" className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] text-gray-900 dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm">
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={24} /></div>
            ) : certificates.length === 0 ? (
              <div className="py-16 text-center text-gray-500 dark:text-gray-400">No certificates yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Recipient</th>
                    <th className="text-left px-5 py-3">Course</th>
                    <th className="text-left px-5 py-3">Issued</th>
                    <th className="text-left px-5 py-3">Type</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                  {certificates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <FileBadge size={15} className="text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{c.recipient_name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{c.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{c.course_title}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(c.issued_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 capitalize">{c.issue_type}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {c.revoked_at ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30">Revoked</span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">Active</span>
                          )}
                          {!c.pdf_path && (
                            <span title="PDF not generated yet — install barryvdh/laravel-dompdf on the server and click Regenerate" className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border border-amber-200 dark:border-yellow-500/30">
                              <AlertTriangle size={11} /> No PDF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {c.pdf_path ? (
                            <button onClick={() => openPreview(c)} title="Preview" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                              {previewLoading && previewCert?.id === c.id ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                            </button>
                          ) : (
                            <button onClick={() => regenerate(c)} disabled={regeneratingId === c.id} title="Generate PDF" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 disabled:opacity-50">
                              {regeneratingId === c.id ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                            </button>
                          )}
                          {c.revoked_at ? (
                            <button onClick={() => reinstate(c)} title="Reinstate" className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400"><RotateCcw size={15} /></button>
                          ) : (
                            <button onClick={() => revoke(c)} title="Revoke" className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/15 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"><Ban size={15} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showIssue && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !issuing && setShowIssue(false)}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={issue} className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Certificate</h3>
                <button type="button" onClick={() => setShowIssue(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={18} /></button>
              </div>

              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Student</label>
              <div className="relative mb-1">
                <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input value={userQuery} onChange={(e) => searchUsers(e.target.value)} placeholder="Search by name or email…" className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm" />
              </div>
              {selectedUser ? (
                <div className="text-xs text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 rounded-lg px-3 py-2 mb-3">Selected: {selectedUser.name} ({selectedUser.email})</div>
              ) : userResults.length > 0 ? (
                <ul className="border border-gray-100 dark:border-white/10 rounded-lg mb-3 max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-white/10">
                  {userResults.map((u) => (
                    <li key={u.id} onClick={() => { setSelectedUser(u); setUserResults([]); setUserQuery(u.name); }} className="px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </li>
                  ))}
                </ul>
              ) : <div className="mb-3" />}

              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Course</label>
              <select required value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#08080c] text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm mb-4">
                <option value="" disabled>Select a course</option>
                {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.title}</option>)}
              </select>

              <button type="submit" disabled={issuing || !selectedUser || !courseId} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm">
                {issuing ? 'Issuing…' : 'Issue Certificate'}
              </button>
            </form>
          </div>
        )}

        <CertificatePreviewModal
          open={!!previewCert && !!previewBlobUrl}
          onClose={closePreview}
          pdfUrl={previewBlobUrl || ''}
          title={previewCert?.course_title || 'Certificate'}
          subtitle={previewCert ? `${previewCert.recipient_name} · issued ${new Date(previewCert.issued_at).toLocaleDateString()}` : undefined}
          viaGoogleViewer={false}
        />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
