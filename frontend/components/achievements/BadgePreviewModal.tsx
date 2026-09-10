// components/achievements/BadgePreviewModal.tsx
// Badges now optionally render as a real downloadable PDF (once an admin
// sets up the badge template — see pages/admin/badge-template.tsx); this
// modal shows the in-app icon/color preview as before, plus a Download
// button when userBadgeId is provided and a rendered file exists.
'use client';

import { useState } from 'react';
import { X, Award, Download, Loader2 } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  description: string;
  badgeColor: string;
  unlockedAt?: string | null;
  /** Present once the badge has been rendered server-side — enables the
   * Download button (fetches the actual PDF on click). */
  userBadgeId?: number | null;
  referenceNumber?: string | null;
}

export default function BadgePreviewModal({
  open, onClose, name, description, badgeColor, unlockedAt, userBadgeId, referenceNumber,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!open) return null;

  const handleDownload = async () => {
    if (!userBadgeId) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const url = await api.achievements.downloadBadge(userBadgeId);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badge-${referenceNumber || name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setDownloadError(handleApiError(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0f0f14] rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center px-8 pb-8">
          <span
            className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
            style={{ background: `${badgeColor}22`, color: badgeColor, border: `2px solid ${badgeColor}55` }}
          >
            <Award size={44} />
          </span>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 leading-relaxed">{description}</p>

          {unlockedAt && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}

          {userBadgeId && (
            <>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download badge
              </button>
              {downloadError && <p className="text-xs text-red-500 mt-2">{downloadError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
