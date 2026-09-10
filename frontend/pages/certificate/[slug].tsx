// pages/certificate/[slug].tsx
//
// Public, self-serve certificate/badge generator page. No nav link points
// here — it's only reachable via the direct shareable URL an admin copies
// from the generators dashboard. No login or payment required.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api, handleApiError } from '@/lib/api';
import { Loader2, Download, Sparkles } from 'lucide-react';

export default function PublicGeneratorPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [meta, setMeta] = useState<{ title: string; has_badge: boolean; has_certificate: boolean; needs_name: boolean } | null>(null);
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<'badge' | 'certificate' | null>(null);

  useEffect(() => {
    if (typeof slug !== 'string') return;
    (async () => {
      try {
        const res = await api.certificateBadgeGenerator.getMeta(slug);
        setMeta(res.generator);
        if (!res.generator.needs_name) {
          setSubmittedName(''); // nothing to type — show the images immediately
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmittedName(name.trim());
  };

  const download = async (kind: 'badge' | 'certificate') => {
    if (typeof slug !== 'string') return;
    setDownloading(kind);
    try {
      const url = kind === 'badge'
        ? api.certificateBadgeGenerator.badgeImageUrl(slug, submittedName ?? '')
        : api.certificateBadgeGenerator.certificateImageUrl(slug, submittedName ?? '');
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${meta?.title || 'learnexity'}-${kind}.png`.replace(/\s+/g, '-').toLowerCase();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !meta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500 text-sm">This link isn't available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Head>
        <title>{meta.title} — Learnexity</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[#4A3AFF] font-semibold text-sm mb-2">
            <Sparkles className="w-4 h-4" /> Learnexity
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        </div>

        {meta.needs_name && submittedName === null && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/20 focus:border-[#4A3AFF] mb-4"
              autoFocus
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 rounded-lg bg-[#4A3AFF] hover:bg-[#3d2fe0] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              Generate
            </button>
          </form>
        )}

        {submittedName !== null && (
          <div className="space-y-6">
            {meta.needs_name && (
              <button onClick={() => setSubmittedName(null)} className="text-xs text-gray-500 hover:text-gray-700 underline">
                ← Use a different name
              </button>
            )}

            {meta.has_badge && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <img
                  src={api.certificateBadgeGenerator.badgeImageUrl(slug as string, submittedName)}
                  alt="Badge"
                  className="max-w-full mx-auto mb-4 rounded-lg"
                />
                <button
                  onClick={() => download('badge')}
                  disabled={downloading === 'badge'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {downloading === 'badge' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download badge
                </button>
              </div>
            )}

            {meta.has_certificate && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <img
                  src={api.certificateBadgeGenerator.certificateImageUrl(slug as string, submittedName)}
                  alt="Certificate"
                  className="max-w-full mx-auto mb-4 rounded-lg"
                />
                <button
                  onClick={() => download('certificate')}
                  disabled={downloading === 'certificate'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {downloading === 'certificate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
