// components/achievements/BadgePreviewModal.tsx
// Badges aren't files (no PDF/PNG to download) — they're just an
// icon + color + name/description rendered on unlock. This modal gives
// admins and users a large, "what it actually looks like" preview,
// mirroring the certificate preview UX even though there's no download step.
'use client';

import { X, Award } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  description: string;
  badgeColor: string;
  unlockedAt?: string | null;
}

export default function BadgePreviewModal({ open, onClose, name, description, badgeColor, unlockedAt }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
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

          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>

          {unlockedAt && (
            <p className="text-xs text-gray-400 mt-4">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
