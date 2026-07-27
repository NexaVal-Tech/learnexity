// components/achievements/CertificatePreviewModal.tsx
// Lets a user (or admin) see what a certificate PDF looks like before
// downloading it. By default it routes the given URL through Google's
// document viewer rather than rendering the PDF directly — this is the same
// pattern used in ResourcePreviewModal's PdfViewer, which fixed the mobile
// "dead Open button" bug: mobile browsers/webviews frequently lack a built-in
// PDF plugin, so a raw <iframe src={pdfUrl}> shows a blank/broken state on
// phones even though it works fine on desktop. Google's viewer renders
// consistently everywhere — but it only works for URLs Google's own servers
// can fetch, which means a plain public URL.
//
// Certificates are payment-gated and stored on a private disk (see
// CertificateController::download()), so the admin dashboard's certificate
// preview can't use a Google-fetchable URL — it has to fetch the PDF bytes
// itself (with the admin's auth header) and hand this component a local
// blob: URL instead. Pass viaGoogleViewer={false} for that case; it renders
// the iframe directly against the given URL rather than proxying through
// Google (blob: URLs work fine in desktop admin contexts, which is all this
// path is used for).
'use client';

import { X, Download, ExternalLink } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  subtitle?: string;
  viaGoogleViewer?: boolean;
}

export default function CertificatePreviewModal({ open, onClose, pdfUrl, title, subtitle, viaGoogleViewer = true }: Props) {
  if (!open) return null;

  const viewerUrl = viaGoogleViewer
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : pdfUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ height: '65vh' }} className="bg-gray-100">
          <iframe src={viewerUrl} className="w-full h-full border-0" title={title} />
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 bg-gray-50 border-t border-gray-100">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <ExternalLink size={14} />
            Open in new tab
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={!viaGoogleViewer ? `${title}.pdf` : undefined}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
