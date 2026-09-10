// pages/admin/certificate-signer.tsx
//
// Single platform-wide setting: the director's name + signature image that
// appears on every course-completion certificate (auto-issued or manually
// issued). See server/app/Models/CertificateSignerSetting.php.

import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { api, handleApiError } from '@/lib/api';
import { Loader2, Save, Upload } from 'lucide-react';

export default function CertificateSignerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');
  const [existingSignatureUrl, setExistingSignatureUrl] = useState<string | null>(null);

  const sigFileRef = useRef<HTMLInputElement>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.admin.certificateSigner.getSettings();
        setSignerName(res.setting.signer_name || '');
        setSignerTitle(res.setting.signer_title || '');
        setExistingSignatureUrl(res.setting.signature_url);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('signer_name', signerName);
      formData.append('signer_title', signerTitle);
      if (sigFile) formData.append('signature', sigFile);

      const res = await api.admin.certificateSigner.updateSettings(formData);
      setExistingSignatureUrl(res.setting.signature_url);
      setSigFile(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminRouteGuard requiredPermission="certificate_signer">
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard requiredPermission="certificate_signer">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#08080c] p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Certificate Signer</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This name and signature appear on every course-completion certificate — set it once here.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                Director / signer name
              </label>
              <input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g. Mary Eze"
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                Title (optional)
              </label>
              <input
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="e.g. Director"
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
                Signature image
              </label>
              <div className="h-28 bg-gray-50 dark:bg-black/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-dashed border-gray-300 dark:border-white/10">
                {sigFile ? (
                  <img src={URL.createObjectURL(sigFile)} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                ) : existingSignatureUrl ? (
                  <img src={existingSignatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-600">No signature uploaded</span>
                )}
              </div>
              <input ref={sigFileRef} type="file" accept="image/*" hidden onChange={(e) => setSigFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => sigFileRef.current?.click()}
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <Upload className="w-3.5 h-3.5" /> {sigFile ? sigFile.name : 'Upload / replace'}
              </button>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
