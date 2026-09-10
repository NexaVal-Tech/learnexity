// pages/admin/badge-template.tsx
//
// Single platform-wide design used for every sprint/course-completion
// badge unlock. Badges previously had no downloadable artifact at all —
// this makes every unlock render a real PDF, same pattern as certificates.

import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { api, handleApiError } from '@/lib/api';
import type { CertificateBadgeField } from '@/lib/types';
import { Loader2, Save, Upload, RefreshCw } from 'lucide-react';
import CertificateFieldEditor from '@/components/admin/CertificateFieldEditor';

const SOURCE_OPTIONS = [
  { value: 'recipient_name', label: "Recipient's name" },
  { value: 'badge_name', label: 'Badge name' },
  { value: 'badge_description', label: 'Badge description' },
  { value: 'course_title', label: 'Course title' },
  { value: 'issue_date', label: 'Unlock date' },
  { value: 'reference_number', label: 'Reference number' },
];

const PREVIEW_VALUES = {
  recipient_name: 'Jane Doe',
  badge_name: 'ACTIVE MEMBER',
  badge_description: 'Thank you for being engaged, supportive and making an impact!',
  course_title: 'Advanced Product Management',
  issue_date: 'September 4, 2026',
  reference_number: 'LX-BADGE-000123',
};

export default function BadgeTemplatePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontOptions, setFontOptions] = useState<string[]>(['sans-bold', 'sans-medium', 'sans-regular', 'serif', 'serif-italic']);

  const [fields, setFields] = useState<CertificateBadgeField[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const imageFileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.admin.courseBadgeTemplate.getSettings();
        setFields(res.template.fields || []);
        setExistingImageUrl(res.template.template_image_url);
        setFontOptions(res.font_options?.length ? res.font_options : fontOptions);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imageFileUrl = React.useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  useEffect(() => () => { if (imageFileUrl) URL.revokeObjectURL(imageFileUrl); }, [imageFileUrl]);
  const canvasUrl = imageFileUrl || existingImageUrl;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('fields', JSON.stringify(fields));
      if (imageFile) formData.append('template_image', imageFile);

      const res = await api.admin.courseBadgeTemplate.updateSettings(formData);
      setExistingImageUrl(res.template.template_image_url);
      setImageFile(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    setError(null);
    try {
      const url = await api.admin.courseBadgeTemplate.preview(fields, PREVIEW_VALUES.recipient_name);
      setPreviewUrl(url);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setPreviewing(false);
    }
  };

  if (loading) {
    return (
      <AdminRouteGuard requiredPermission="course_badge_template">
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard requiredPermission="course_badge_template">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sprint/Course Badge</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              The design used for every badge a student unlocks, whether by finishing a sprint or completing a
              course. One design; the badge name/description text (set per-badge on the Badges page) is what
              differentiates them.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Badge template image</h2>
            <div className="aspect-square max-w-md bg-gray-50 dark:bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-white/10">
              {imageFile ? (
                <img src={URL.createObjectURL(imageFile)} alt="Template preview" className="max-h-full max-w-full object-contain" />
              ) : existingImageUrl ? (
                <img src={existingImageUrl} alt="Template" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-600">No template uploaded</span>
              )}
            </div>
            <input ref={imageFileRef} type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <button
              onClick={() => imageFileRef.current?.click()}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <Upload className="w-3.5 h-3.5" /> {imageFile ? imageFile.name : 'Upload / replace'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Text fields</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Each field is either fixed text or an auto-fill variable pulled from the real unlock at render time.
              Drag fields on the image above to position them.
            </p>
            <CertificateFieldEditor
              fields={fields}
              onChange={setFields}
              fontOptions={fontOptions}
              allowVisitorName={false}
              sourceOptions={SOURCE_OPTIONS}
              imageUrl={canvasUrl}
              previewValues={PREVIEW_VALUES}
              topAnchored
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
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-sm font-semibold disabled:opacity-50"
              >
                {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Render preview
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Uses the last-saved template image + your current field edits.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-black/30 rounded-lg min-h-[400px] flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-[600px]" title="Badge preview" />
              ) : (
                <span className="text-xs text-gray-400">No preview yet</span>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
