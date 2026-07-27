'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';

export default function RegistrationFeeSettings() {
  const [priceUsd, setPriceUsd] = useState('');
  const [priceNgn, setPriceNgn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.registrationFee.getSettings();
        setPriceUsd(String(data.price_usd));
        setPriceNgn(String(data.price_ngn));
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
        price_usd: parseFloat(priceUsd) || 0,
        price_ngn: parseFloat(priceNgn) || 0,
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
          Students who are approved through the scholarship screening pay this flat fee instead
          of the course price — on any course. This is a single platform-wide setting, not
          configured per course.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-hidden="true" />
          <span className="sr-only">Loading registration fee settings…</span>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="reg-fee-ngn" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Nigeria (₦)
              </label>
              <input
                id="reg-fee-ngn"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={priceNgn}
                onChange={(e) => setPriceNgn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <div>
              <label htmlFor="reg-fee-usd" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                Other countries ($)
              </label>
              <input
                id="reg-fee-usd"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
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