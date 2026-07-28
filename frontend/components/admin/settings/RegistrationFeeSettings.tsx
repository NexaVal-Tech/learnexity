'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';

export default function RegistrationFeeSettings() {
  const [deeptechUsd, setDeeptechUsd] = useState('');
  const [deeptechNgn, setDeeptechNgn] = useState('');
  const [flexibleUsd, setFlexibleUsd] = useState('');
  const [flexibleNgn, setFlexibleNgn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.registrationFee.getSettings();
        setDeeptechUsd(String(data.deeptech_price_usd));
        setDeeptechNgn(String(data.deeptech_price_ngn));
        setFlexibleUsd(String(data.flexible_price_usd));
        setFlexibleNgn(String(data.flexible_price_ngn));
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
    setSaved(false);
    try {
      await api.admin.registrationFee.updateSettings({
        deeptech_price_usd: parseFloat(deeptechUsd) || 0,
        deeptech_price_ngn: parseFloat(deeptechNgn) || 0,
        flexible_price_usd: parseFloat(flexibleUsd) || 0,
        flexible_price_ngn: parseFloat(flexibleNgn) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Scholarship Registration Fee</h2>
        <p className="text-sm text-gray-500 mt-1">
          Students approved through scholarship screening pay a flat registration fee instead of
          the course price. The fee depends on which learning track they enroll in — Deep-Tech
          (one-on-one / group mentorship) and Flexible (self-paced) are priced separately. These
          are platform-wide settings, not configured per course.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-hidden="true" />
          <span className="sr-only">Loading registration fee settings…</span>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Deep-Tech (one-on-one / group mentorship)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-fee-deeptech-ngn" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Nigeria (₦)
                </label>
                <input
                  id="reg-fee-deeptech-ngn"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={deeptechNgn}
                  onChange={(e) => setDeeptechNgn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="reg-fee-deeptech-usd" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Other countries ($)
                </label>
                <input
                  id="reg-fee-deeptech-usd"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={deeptechUsd}
                  onChange={(e) => setDeeptechUsd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Flexible (self-paced)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-fee-flexible-ngn" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Nigeria (₦)
                </label>
                <input
                  id="reg-fee-flexible-ngn"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={flexibleNgn}
                  onChange={(e) => setFlexibleNgn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="reg-fee-flexible-usd" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Other countries ($)
                </label>
                <input
                  id="reg-fee-flexible-usd"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={flexibleUsd}
                  onChange={(e) => setFlexibleUsd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Save className="w-4 h-4" aria-hidden="true" />
            )}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </>
      )}
    </div>
  );
}
