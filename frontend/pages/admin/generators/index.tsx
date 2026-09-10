// pages/admin/generators/index.tsx

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { api, handleApiError } from '@/lib/api';
import type { CertificateBadgeGenerator } from '@/lib/types';
import { Loader2, Plus, Trash2, ExternalLink, Copy, Check, Stamp } from 'lucide-react';

export default function GeneratorsIndexPage() {
  const router = useRouter();
  const [generators, setGenerators] = useState<CertificateBadgeGenerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchGenerators();
  }, []);

  const fetchGenerators = async () => {
    try {
      setLoading(true);
      const res = await api.admin.certificateBadgeGenerators.getAll();
      setGenerators(res.generators);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeletingId(id);
    try {
      await api.admin.certificateBadgeGenerators.delete(id);
      setGenerators((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const publicUrl = (slug: string) => `${window.location.origin}/certificate/${slug}`;

  const handleCopy = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(publicUrl(slug));
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // clipboard permissions denied — non-critical
    }
  };

  return (
    <AdminRouteGuard requiredPermission="certificate_badge_generators">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Stamp className="w-6 h-6" />
                Certificate/Badge Generators
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Each generator is a badge + certificate template pairing with its own public link.
                Visitors type their name and get a personalized image — no login or payment needed.
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/generators/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Generator
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : generators.length === 0 ? (
            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No generators yet.</p>
              <button
                onClick={() => router.push('/admin/generators/new')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create your first generator
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {generators.map((g) => (
                <div
                  key={g.id}
                  className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-white/10 h-36">
                    <div className="bg-gray-50 dark:bg-black/30 flex items-center justify-center overflow-hidden">
                      {g.badge_template_url ? (
                        <img src={g.badge_template_url} alt="Badge template" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600">No badge</span>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-black/30 flex items-center justify-center overflow-hidden">
                      {g.certificate_template_url ? (
                        <img src={g.certificate_template_url} alt="Certificate template" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600">No certificate</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{g.title}</h3>
                      <span
                        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          g.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'
                        }`}
                      >
                        {g.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 truncate">/certificate/{g.slug}</p>

                    <div className="mt-auto flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
                      <Link
                        href={`/admin/generators/${g.id}`}
                        className="flex-1 text-center text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleCopy(g.slug)}
                        title="Copy public link"
                        className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        {copiedSlug === g.slug ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`/certificate/${g.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open public page"
                        className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(g.id, g.title)}
                        disabled={deletingId === g.id}
                        title="Delete"
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {deletingId === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
