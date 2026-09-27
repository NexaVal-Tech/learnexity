// components/admin/cms/PreviewFrame.tsx
//
// Device-width preview of unsaved CMS content. Renders /admin/cms/preview
// in an iframe and posts the draft to it (debounced) whenever it changes.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet, X, ExternalLink } from "lucide-react";
import type { CmsPreviewPayload } from "@/pages/admin/cms/preview";

const WIDTHS = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;

export default function PreviewFrame({
  payload,
  onClose,
  livePath,
}: {
  payload: CmsPreviewPayload;
  onClose: () => void;
  livePath?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const [device, setDevice] = useState<keyof typeof WIDTHS>("desktop");

  const send = useCallback(() => {
    if (!ready.current) return;
    frame.current?.contentWindow?.postMessage({ type: "cms-preview", payload }, window.location.origin);
  }, [payload]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "cms-preview-ready") {
        ready.current = true;
        send();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    const t = setTimeout(send, 250);
    return () => clearTimeout(t);
  }, [send]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] bg-gray-900/90 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-white/10 text-white">
        <span className="text-sm font-semibold mr-2">Preview</span>
        <span className="text-xs text-gray-400 hidden sm:inline">Unsaved changes are shown here — nothing is live until you save.</span>
        <div className="ml-auto flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
          {(
            [
              ["desktop", <Monitor key="d" size={15} />],
              ["tablet", <Tablet key="t" size={15} />],
              ["mobile", <Smartphone key="m" size={15} />],
            ] as const
          ).map(([key, icon]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              title={key}
              className={`p-1.5 rounded-md ${device === key ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"}`}
            >
              {icon}
            </button>
          ))}
        </div>
        {livePath && (
          <a href={livePath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white px-2">
            <ExternalLink size={13} /> Live page
          </a>
        )}
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10" aria-label="Close preview">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-auto flex justify-center p-3">
        <iframe
          ref={frame}
          src="/admin/cms/preview"
          title="Page preview"
          className="bg-white rounded-lg shadow-2xl h-full transition-[width] duration-300"
          style={{ width: WIDTHS[device], maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
