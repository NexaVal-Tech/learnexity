'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';

/** `datetime-local` inputs need "YYYY-MM-DDTHH:mm" in the browser's local
 * time, not a UTC ISO string — convert both directions explicitly so the
 * admin picks a date/time that means what it looks like it means. */
function isoToLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputValueToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function ScholarshipCountdownSettings() {
  const [deadlineInput, setDeadlineInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.admin.scholarshipCountdown.getSettings();
        setDeadlineInput(data.deadline ? isoToLocalInputValue(data.deadline) : '');
        setIsActive(data.is_active);
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
      await api.admin.scholarshipCountdown.updateSettings({
        deadline: localInputValueToIso(deadlineInput),
        is_active: isActive,
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
    <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scholarship Countdown Banner</h2>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          One global deadline shown as a fixed countdown banner above the navbar on the homepage.
          Turn it off any time without losing the date you set — the banner also disappears
          automatically once the deadline passes.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <span className="sr-only">Loading scholarship countdown settings…</span>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                isActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              Banner {isActive ? 'enabled' : 'disabled'}
            </span>
          </div>

          <div className="mb-5 max-w-xs">
            <label htmlFor="scholarship-deadline" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-500 mb-1.5">
              Deadline (your local time)
            </label>
            <input
              id="scholarship-deadline"
              type="datetime-local"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">{error}</p>
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
