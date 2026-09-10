// pages/attending/[slug].tsx
//
// Public, self-serve "I will be attending" flyer page. No nav link points
// here — only reachable via the direct shareable URL an admin copies from
// the settings page. No login required.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api, handleApiError } from '@/lib/api';
import { Loader2, Download, Upload, Sparkles } from 'lucide-react';

export default function AttendingFlyerPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [meta, setMeta] = useState<{ page_heading: string; ready: boolean } | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof slug !== 'string') return;
    (async () => {
      try {
        const res = await api.attendingFlyer.getMeta(slug);
        setMeta(res.setting);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof slug !== 'string' || !photo || !name.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const url = await api.attendingFlyer.generate(slug, photo, name.trim());
      setResultUrl(url);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `i-will-be-attending-${name.trim().toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !meta || !meta.ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500 text-sm">This link isn't available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Head>
        <title>{meta.page_heading} — Learnexity</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[#4A3AFF] font-semibold text-sm mb-2">
            <Sparkles className="w-4 h-4" /> Learnexity
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.page_heading}</h1>
        </div>

        {!resultUrl ? (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your photo</label>
            <label className="flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#4A3AFF]/40 mb-4 overflow-hidden">
              {photo ? (
                <img src={URL.createObjectURL(photo)} alt="Selected" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Tap to choose a photo</span>
                </>
              )}
              <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </label>

            <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/20 focus:border-[#4A3AFF] mb-4"
            />

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <button
              type="submit"
              disabled={!photo || !name.trim() || generating}
              className="w-full py-3 rounded-lg bg-[#4A3AFF] hover:bg-[#3d2fe0] disabled:opacity-50 text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Generate my flyer
            </button>
          </form>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <img src={resultUrl} alt="Your flyer" className="max-w-full mx-auto mb-4 rounded-lg" />
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={download}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => setResultUrl(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
