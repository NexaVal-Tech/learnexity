// pages/admin/generators/[id].tsx

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { api, handleApiError } from '@/lib/api';
import type { CertificateBadgeField, CertificateBadgeGenerator } from '@/lib/types';
import { Loader2, Save, ArrowLeft, Upload, RefreshCw } from 'lucide-react';
import CertificateFieldEditor from '@/components/admin/CertificateFieldEditor';

/** Mirrors CertificateBadgeGenerator::defaultBadgeFields()/defaultCertificateFields()
 * on the backend — pre-tuned starting positions for the reference badge/
 * certificate designs, so a brand-new generator isn't a blank editor. */
const DEFAULT_BADGE_FIELDS: CertificateBadgeField[] = [
  {
    key: 'headline', label: 'Headline', text: 'ACTIVE MEMBER', source: 'admin',
    x_pct: 50, y_pct: 46, font: 'sans-bold', font_size: 72, color: '#FFFFFF',
    align: 'center', max_width_pct: 85, line_height: 1.1,
  },
  {
    key: 'subtext', label: 'Appreciation message',
    text: 'Thank you for being engaged, supportive and making an impact!', source: 'admin',
    x_pct: 50, y_pct: 65, font: 'sans-medium', font_size: 26, color: '#FFFFFF',
    align: 'center', max_width_pct: 65, line_height: 1.3,
  },
  {
    key: 'ribbon_text', label: 'Ribbon tagline', text: 'ENGAGE • LEARN • INSPIRE', source: 'admin',
    x_pct: 50, y_pct: 83, font: 'sans-bold', font_size: 32, color: '#FFFFFF',
    align: 'center', max_width_pct: 80, line_height: 1.2,
  },
];

const DEFAULT_CERTIFICATE_FIELDS: CertificateBadgeField[] = [
  {
    key: 'recipient_name', label: "Recipient's name (from visitor)", text: 'Jane Doe', source: 'visitor_name',
    x_pct: 50, y_pct: 49, font: 'serif-italic', font_size: 52, color: '#1F2937',
    align: 'center', max_width_pct: 75, line_height: 1.2,
  },
  {
    key: 'webinar_line', label: 'Webinar / event line',
    text: 'For attending and participating on the Webinar "How to Communicate Like a Global Professional"',
    source: 'admin', x_pct: 50, y_pct: 57, font: 'sans-regular', font_size: 20, color: '#374151',
    align: 'center', max_width_pct: 85, line_height: 1.3,
  },
  {
    key: 'date_line', label: 'Date line', text: 'On August 28, 2026', source: 'admin',
    x_pct: 50, y_pct: 60, font: 'sans-regular', font_size: 20, color: '#374151',
    align: 'center', max_width_pct: 85, line_height: 1.3,
  },
  {
    key: 'body_text', label: 'Body paragraph',
    text: 'This certifies that you have taken a bold step toward mastering communication skills that open doors to global opportunities, leadership, and career growth.',
    source: 'admin', x_pct: 50, y_pct: 65, font: 'sans-regular', font_size: 18, color: '#374151',
    align: 'center', max_width_pct: 80, line_height: 1.4,
  },
  {
    key: 'signer_name', label: 'Signer name', text: 'MARY EZE', source: 'admin',
    x_pct: 72, y_pct: 82, font: 'sans-bold', font_size: 18, color: '#1F2937',
    align: 'center', max_width_pct: 24, line_height: 1.2,
  },
  {
    key: 'signer_role', label: 'Signer role/title', text: 'Director', source: 'admin',
    x_pct: 72, y_pct: 85, font: 'sans-regular', font_size: 15, color: '#6B7280',
    align: 'center', max_width_pct: 24, line_height: 1.2,
  },
];

export default function GeneratorEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === 'new';
  const generatorId = !isNew && typeof id === 'string' ? parseInt(id, 10) : null;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontOptions, setFontOptions] = useState<string[]>(['sans-bold', 'sans-medium', 'sans-regular', 'serif', 'serif-italic']);

  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [badgeFields, setBadgeFields] = useState<CertificateBadgeField[]>([]);
  const [certificateFields, setCertificateFields] = useState<CertificateBadgeField[]>([]);
  const [savedGenerator, setSavedGenerator] = useState<CertificateBadgeGenerator | null>(null);

  const badgeFileRef = useRef<HTMLInputElement>(null);
  const certFileRef = useRef<HTMLInputElement>(null);
  const sigFileRef = useRef<HTMLInputElement>(null);
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);

  const [previewName, setPreviewName] = useState('Jane Doe');
  const [badgePreviewUrl, setBadgePreviewUrl] = useState<string | null>(null);
  const [certPreviewUrl, setCertPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  // Object URLs for the positioning canvas — memoized so a fresh blob URL
  // isn't minted (and leaked) on every render, only when the file changes.
  const badgeFileUrl = React.useMemo(() => (badgeFile ? URL.createObjectURL(badgeFile) : null), [badgeFile]);
  const certFileUrl = React.useMemo(() => (certFile ? URL.createObjectURL(certFile) : null), [certFile]);
  useEffect(() => () => { if (badgeFileUrl) URL.revokeObjectURL(badgeFileUrl); }, [badgeFileUrl]);
  useEffect(() => () => { if (certFileUrl) URL.revokeObjectURL(certFileUrl); }, [certFileUrl]);
  const badgeCanvasUrl = badgeFileUrl || savedGenerator?.badge_template_url || null;
  const certCanvasUrl = certFileUrl || savedGenerator?.certificate_template_url || null;

  useEffect(() => {
    if (isNew) {
      setBadgeFields(DEFAULT_BADGE_FIELDS);
      setCertificateFields(DEFAULT_CERTIFICATE_FIELDS);
      setLoading(false);
      return;
    }
    if (!generatorId) return;

    (async () => {
      try {
        const res = await api.admin.certificateBadgeGenerators.get(generatorId);
        setSavedGenerator(res.generator);
        setTitle(res.generator.title);
        setIsActive(res.generator.is_active);
        setBadgeFields(res.generator.badge_fields || []);
        setCertificateFields(res.generator.certificate_fields || []);
        setFontOptions(res.font_options?.length ? res.font_options : fontOptions);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('is_active', isActive ? '1' : '0');
      formData.append('badge_fields', JSON.stringify(badgeFields));
      formData.append('certificate_fields', JSON.stringify(certificateFields));
      if (badgeFile) formData.append('badge_template', badgeFile);
      if (certFile) formData.append('certificate_template', certFile);
      if (sigFile) formData.append('certificate_signature', sigFile);

      if (isNew) {
        const res = await api.admin.certificateBadgeGenerators.create(formData);
        router.replace(`/admin/generators/${res.generator.id}`);
      } else if (generatorId) {
        const res = await api.admin.certificateBadgeGenerators.update(generatorId, formData);
        setSavedGenerator(res.generator);
        setBadgeFile(null);
        setCertFile(null);
        setSigFile(null);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!generatorId) {
      setError('Save the generator once before previewing (templates need to be uploaded first).');
      return;
    }
    setPreviewing(true);
    setError(null);
    try {
      const [badgeUrl, certUrl] = await Promise.all([
        savedGenerator?.badge_template_url
          ? api.admin.certificateBadgeGenerators.previewBadge(generatorId, badgeFields, previewName)
          : Promise.resolve(null),
        savedGenerator?.certificate_template_url
          ? api.admin.certificateBadgeGenerators.previewCertificate(generatorId, certificateFields, previewName)
          : Promise.resolve(null),
      ]);
      if (badgeUrl) setBadgePreviewUrl(badgeUrl);
      if (certUrl) setCertPreviewUrl(certUrl);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setPreviewing(false);
    }
  };

  if (loading) {
    return (
      <AdminRouteGuard requiredPermission="certificate_badge_generators">
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard requiredPermission="certificate_badge_generators">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6 max-w-5xl mx-auto">
          <button
            onClick={() => router.push('/admin/generators')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to generators
          </button>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-wrap items-end gap-4 mb-2">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Legacy Masterclass"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pb-2">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active (public page reachable)
              </label>
              {savedGenerator && (
                <p className="text-xs text-gray-500 dark:text-gray-500 pb-2">
                  Public link: <code>/certificate/{savedGenerator.slug}</code>
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Badge template image</h2>
              <div className="aspect-square bg-gray-50 dark:bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-white/10">
                {badgeFile ? (
                  <img src={URL.createObjectURL(badgeFile)} alt="Badge preview" className="max-h-full max-w-full object-contain" />
                ) : savedGenerator?.badge_template_url ? (
                  <img src={savedGenerator.badge_template_url} alt="Badge" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">No template uploaded</span>
                )}
              </div>
              <input ref={badgeFileRef} type="file" accept="image/*" hidden onChange={(e) => setBadgeFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => badgeFileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Upload className="w-3.5 h-3.5" /> {badgeFile ? badgeFile.name : 'Upload / replace'}
              </button>
            </div>

            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Certificate template image</h2>
              <div className="aspect-[4/3] bg-gray-50 dark:bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-white/10">
                {certFile ? (
                  <img src={URL.createObjectURL(certFile)} alt="Certificate preview" className="max-h-full max-w-full object-contain" />
                ) : savedGenerator?.certificate_template_url ? (
                  <img src={savedGenerator.certificate_template_url} alt="Certificate" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">No template uploaded</span>
                )}
              </div>
              <input ref={certFileRef} type="file" accept="image/*" hidden onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => certFileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 mb-3"
              >
                <Upload className="w-3.5 h-3.5" /> {certFile ? certFile.name : 'Upload / replace'}
              </button>

              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-2">Signature image (optional)</h3>
              <input ref={sigFileRef} type="file" accept="image/*" hidden onChange={(e) => setSigFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => sigFileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Upload className="w-3.5 h-3.5" /> {sigFile ? sigFile.name : (savedGenerator?.certificate_signature_url ? 'Replace signature' : 'Upload signature')}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Badge text fields</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Positions are % of the image (0,0 = top-left, 100,100 = bottom-right). The reference "Active Member" badge has no
              visitor name printed on it — the wreaths, arc text, logo and ribbon are part of the uploaded artwork.
            </p>
            <CertificateFieldEditor
              fields={badgeFields}
              onChange={setBadgeFields}
              fontOptions={fontOptions}
              allowVisitorName={false}
              imageUrl={badgeCanvasUrl}
            />
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Certificate text fields</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Check "visitor's name" on exactly one field (usually the recipient name) so it's replaced with whatever the
              visitor types on the public page. Everything else stays fixed admin text.
            </p>
            <CertificateFieldEditor
              fields={certificateFields}
              onChange={setCertificateFields}
              fontOptions={fontOptions}
              allowVisitorName
              imageUrl={certCanvasUrl}
              visitorNamePreview={previewName}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4" role="alert">{error}</p>}

          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleSave}
              disabled={saving || !title}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isNew ? 'Create Generator' : 'Save Changes'}
            </button>
          </div>

          {!isNew && (
            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Live preview</h2>
              <div className="flex flex-wrap items-end gap-3 mb-4">
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
                Renders your current field edits directly (no need to save first) — but always uses the last saved template
                image, so upload/save that first.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                  {badgePreviewUrl ? <img src={badgePreviewUrl} alt="Badge preview" className="max-w-full" /> : <span className="text-xs text-gray-400">No preview yet</span>}
                </div>
                <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                  {certPreviewUrl ? <img src={certPreviewUrl} alt="Certificate preview" className="max-w-full" /> : <span className="text-xs text-gray-400">No preview yet</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
