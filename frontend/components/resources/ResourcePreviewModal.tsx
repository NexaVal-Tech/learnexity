import React, { useEffect } from 'react';

interface ResourcePreviewModalProps {
  url: string | null;
  title?: string | null;
  onClose: () => void;
}

export default function ResourcePreviewModal({
  url,
  title,
  onClose
}: ResourcePreviewModalProps) {

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-lg overflow-hidden shadow-xl relative">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900 truncate">
            {title || 'Preview'}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-lg"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        {/* Preview Body */}
        <iframe
          src={url}
          className="w-full h-full"
          title={title || 'Resource preview'}
        />
      </div>
    </div>
  );
}
