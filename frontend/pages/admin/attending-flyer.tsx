// pages/admin/attending-flyer.tsx
//
// Singleton settings page for the standalone "I will be attending" flyer
// (a one-off feature, not part of the reusable certificate/badge
// generator system). Admin uploads a background template (everything
// except the attendee's own photo) and an optional foreground overlay
// (any artwork — like a photo frame border — that needs to sit visually
// on top of the photo), configures where the photo goes, and edits every
// piece of text via the same field editor used by the generators.

import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { api, handleApiError } from '@/lib/api';
import type { AttendingFlyerSetting } from '@/lib/types';
import CertificateFieldEditor from '@/components/admin/CertificateFieldEditor';
import { Loader2, Save, Upload, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

export default function AttendingFlyerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontOptions, setFontOptions] = useState<string[]>(['sans-bold', 'sans-medium', 'sans-regular', 'serif', 'serif-italic']);
  const [setting, setSetting] = useState<AttendingFlyerSetting | null>(null);
  const [copied, setCopied] = useState(false);

  const [slug, setSlug] = useState('attending');
  const [isActive, setIsActive] = useState(true);
  const [pageHeading, setPageHeading] = useState('RSVP — I Will Be Attending');
  const [fields, setFields] = useState<AttendingFlyerSetting['fields']>([]);
  const [photoRect, setPhotoRect] = useState({ photo_x_pct: 61.6, photo_y_pct: 57.5, photo_width_pct: 28.1, photo_height_pct: 22.7 });

  const bgFileRef = useRef<HTMLInputElement>(null);
  const fgFileRef = useRef<HTMLInputElement>(null);
  const previewPhotoRef = useRef<HTMLInputElement>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [fgFile, setFgFile] = useState<File | null>(null);

  const [previewPhoto, setPreviewPhoto] = useState<File | null>(null);
  const [previewName, setPreviewName] = useState('Jane Doe');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // Object URLs for the positioning canvas — memoized so a fresh blob URL
  // isn't minted (and leaked) on every render, only when the file changes.
  const bgFileUrl = React.useMemo(() => (bgFile ? URL.createObjectURL(bgFile) : null), [bgFile]);
  const fgFileUrl = React.useMemo(() => (fgFile ? URL.createObjectURL(fgFile) : null), [fgFile]);
  useEffect(() => () => { if (bgFileUrl) URL.revokeObjectURL(bgFileUrl); }, [bgFileUrl]);
  useEffect(() => () => { if (fgFileUrl) URL.revokeObjectURL(fgFileUrl); }, [fgFileUrl]);
  const bgCanvasUrl = bgFileUrl || setting?.background_template_url || null;
  const fgCanvasUrl = fgFileUrl || setting?.foreground_template_url || null;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.admin.attendingFlyer.getSettings();
        setSetting(res.setting);
        setSlug(res.setting.slug);
        setIsActive(res.setting.is_active);
        setPageHeading(res.setting.page_heading);
        setFields(res.setting.fields || []);
        setPhotoRect({
          photo_x_pct: res.setting.photo_x_pct,
          photo_y_pct: res.setting.photo_y_pct,
          photo_width_pct: res.setting.photo_width_pct,
          photo_height_pct: res.setting.photo_height_pct,
        });
        setFontOptions(res.font_options?.length ? res.font_options : fontOptions);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('slug', slug);
      formData.append('is_active', isActive ? '1' : '0');
      formData.append('page_heading', pageHeading);
      formData.append('fields', JSON.stringify(fields));
      Object.entries(photoRect).forEach(([k, v]) => formData.append(k, String(v)));
      if (bgFile) formData.append('background_template', bgFile);
      if (fgFile) formData.append('foreground_template', fgFile);

      const res = await api.admin.attendingFlyer.updateSettings(formData);
      setSetting(res.setting);
      setBgFile(null);
      setFgFile(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!previewPhoto) {
      setError('Upload a sample photo first to render a preview.');
      return;
    }
    setPreviewing(true);
    setError(null);
    try {
      const url = await api.admin.attendingFlyer.preview(previewPhoto, fields, previewName, photoRect);
      setPreviewUrl(url);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setPreviewing(false);
    }
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/attending/${slug}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard permission denied — non-critical
    }
  };

  if (loading) {
    return (
      <AdminRouteGuard requiredPermission="attending_flyer">
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard requiredPermission="attending_flyer">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">"I Will Be Attending" Flyer</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              A standalone, shareable page — no nav link. A visitor uploads their own photo and types their name;
              every other piece of text is fixed by you below.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                  URL slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                  Page heading (shown above the form, not on the image)
                </label>
                <input
                  value={pageHeading}
                  onChange={(e) => setPageHeading(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pb-2">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active (public page reachable)
              </label>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <code className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-gray-700 dark:text-gray-300">{publicUrl}</code>
              <button onClick={handleCopy} className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10">
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              </button>
              <a href={`/attending/${slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10">
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Background template</h2>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                Everything except the attendee's photo — background art, logo, quote, date/time, speaker photo, footer bars.
              </p>
              <div className="aspect-[4/5] bg-gray-50 dark:bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-white/10">
                {bgFile ? (
                  <img src={URL.createObjectURL(bgFile)} alt="Background preview" className="max-h-full max-w-full object-contain" />
                ) : setting?.background_template_url ? (
                  <img src={setting.background_template_url} alt="Background" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">No template uploaded</span>
                )}
              </div>
              <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => setBgFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => bgFileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Upload className="w-3.5 h-3.5" /> {bgFile ? bgFile.name : 'Upload / replace'}
              </button>
            </div>

            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Foreground overlay (optional)</h2>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                A transparent PNG, same size as the background, for anything that sits on top of the photo — e.g. the
                purple frame border and the verified checkmark badge in the reference design.
              </p>
              <div className="aspect-[4/5] bg-gray-50 dark:bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-white/10">
                {fgFile ? (
                  <img src={URL.createObjectURL(fgFile)} alt="Foreground preview" className="max-h-full max-w-full object-contain" />
                ) : setting?.foreground_template_url ? (
                  <img src={setting.foreground_template_url} alt="Foreground" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">No overlay uploaded</span>
                )}
              </div>
              <input ref={fgFileRef} type="file" accept="image/png" hidden onChange={(e) => setFgFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => fgFileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Upload className="w-3.5 h-3.5" /> {fgFile ? fgFile.name : 'Upload / replace'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Photo placement</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Where the visitor's uploaded photo gets cropped and placed (% of the template image). It's scaled to fill
              this box without distorting, cropping whichever side overflows.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs max-w-xl">
              {(['photo_x_pct', 'photo_y_pct', 'photo_width_pct', 'photo_height_pct'] as const).map((key) => (
                <div key={key}>
                  <label className="block text-gray-500 dark:text-gray-500 mb-1">
                    {{ photo_x_pct: 'X %', photo_y_pct: 'Y %', photo_width_pct: 'Width %', photo_height_pct: 'Height %' }[key]}
                  </label>
                  <input
                    type="number" min={0} max={100} step={0.1}
                    value={photoRect[key]}
                    onChange={(e) => setPhotoRect((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Text fields</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Check "visitor's name" on exactly one field (the attendee name) so it's replaced with whatever the visitor
              types. Everything else — headline, quote, date, speaker info, footer — stays fixed text you control here.
            </p>
            <CertificateFieldEditor
              fields={fields}
              onChange={setFields}
              fontOptions={fontOptions}
              allowVisitorName
              imageUrl={bgCanvasUrl}
              overlayUrl={fgCanvasUrl}
              visitorNamePreview={previewName}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4" role="alert">{error}</p>}

          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Live preview</h2>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                  Sample photo
                </label>
                <input ref={previewPhotoRef} type="file" accept="image/*" hidden onChange={(e) => setPreviewPhoto(e.target.files?.[0] || null)} />
                <button
                  onClick={() => previewPhotoRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold"
                >
                  <Upload className="w-3.5 h-3.5" /> {previewPhoto ? previewPhoto.name : 'Choose photo'}
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                  Preview name
                </label>
                <input
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-sm font-semibold disabled:opacity-50"
              >
                {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Render preview
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Renders your current unsaved edits directly, but always against the last-saved background/foreground —
              upload and save those first.
            </p>
            <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              {previewUrl ? <img src={previewUrl} alt="Flyer preview" className="max-w-full max-h-[600px]" /> : <span className="text-xs text-gray-400">No preview yet</span>}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
