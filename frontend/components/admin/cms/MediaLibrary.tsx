// components/admin/cms/MediaLibrary.tsx
//
// Media grid with upload, search, alt text and delete. Used on its own
// (Admin → Website CMS → Media) and inside MediaPickerModal when choosing
// an image/video for a field.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Film, ImageIcon, Loader2, Search, Trash2, Upload, X } from "lucide-react";
import { cmsAdmin, apiErrorMessage, formatBytes, type CmsMediaItem } from "@/lib/cms/adminClient";

type MediaKind = "image" | "video" | "all";

export function MediaLibrary({
  kind = "all",
  onSelect,
  selectedUrl,
}: {
  kind?: MediaKind;
  /** When set, clicking an item selects it (picker mode). */
  onSelect?: (item: CmsMediaItem) => void;
  selectedUrl?: string;
}) {
  const [items, setItems] = useState<CmsMediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MediaKind>(kind);
  const [uploads, setUploads] = useState<{ name: string; pct: number; error?: string }[]>([]);
  const [active, setActive] = useState<CmsMediaItem | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const res = await cmsAdmin.listMedia({ type: filter === "all" ? undefined : filter, search: search || undefined, page: p, per_page: 40 });
        setItems((prev) => (p === 1 ? res.data : [...prev, ...res.data]));
        setPage(res.current_page);
        setLastPage(res.last_page);
      } catch (e) {
        setMessage({ text: apiErrorMessage(e, "Couldn't load media."), ok: false });
      } finally {
        setLoading(false);
      }
    },
    [filter, search]
  );

  useEffect(() => {
    const t = setTimeout(() => load(1), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const accept = filter === "image" ? "image/*" : filter === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*,video/mp4,video/webm,video/quicktime";

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? 50 : 8;
      if (file.size > limit * 1024 * 1024) {
        setUploads((u) => [...u, { name: file.name, pct: 0, error: `Too large (max ${limit} MB)` }]);
        continue;
      }
      setUploads((u) => [...u, { name: file.name, pct: 0 }]);
      try {
        const res = await cmsAdmin.uploadMedia(file, undefined, (pct) =>
          setUploads((u) => u.map((x) => (x.name === file.name && !x.error ? { ...x, pct } : x)))
        );
        setItems((prev) => [res.media, ...prev]);
        setUploads((u) => u.filter((x) => x.name !== file.name));
        if (onSelect && list.length === 1) onSelect(res.media);
      } catch (e) {
        setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, error: apiErrorMessage(e, "Upload failed") } : x)));
      }
    }
  };

  const remove = async (item: CmsMediaItem, force = false) => {
    try {
      await cmsAdmin.deleteMedia(item.id, force);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setActive(null);
      setMessage({ text: "Deleted.", ok: true });
    } catch (e: any) {
      if (e?.response?.status === 409) {
        if (window.confirm(`${e.response.data.message}\n\nDelete it anyway? Those places will show a broken image until you replace it.`)) {
          return remove(item, true);
        }
        return;
      }
      setMessage({ text: apiErrorMessage(e, "Couldn't delete."), ok: false });
    }
  };

  const saveAlt = async (item: CmsMediaItem, alt: string) => {
    try {
      const res = await cmsAdmin.updateMedia(item.id, alt);
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.media : i)));
      setActive(res.media);
      setMessage({ text: "Description saved.", ok: true });
    } catch (e) {
      setMessage({ text: apiErrorMessage(e), ok: false });
    }
  };

  return (
    <div
      className="flex flex-col h-full min-h-0"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
      }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {kind === "all" && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as MediaKind)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 dark:text-white"
          >
            <option value="all">All files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Upload size={15} /> Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Drag & drop files here. Images up to 8 MB (JPG, PNG, WebP, GIF, SVG, AVIF); videos up to 50 MB (MP4, WebM, MOV).
      </p>

      {message && (
        <div className={`mb-3 text-sm px-3 py-2 rounded-lg ${message.ok ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"}`}>
          {message.text}
          <button className="float-right" onClick={() => setMessage(null)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {uploads.map((u, i) => (
            <div key={i} className="text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span className="truncate">{u.name}</span>
                {u.error ? (
                  <span className="text-red-500 flex items-center gap-2">
                    {u.error}
                    <button onClick={() => setUploads((x) => x.filter((_, j) => j !== i))}><X size={12} /></button>
                  </span>
                ) : (
                  <span>{u.pct}%</span>
                )}
              </div>
              {!u.error && (
                <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${u.pct}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={`flex-1 min-h-0 overflow-y-auto rounded-xl ${dragOver ? "ring-2 ring-indigo-500 ring-dashed" : ""}`}>
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
            <ImageIcon className="mx-auto mb-2 text-gray-300" size={32} />
            No files yet — upload your first one.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.map((item) => {
              const selected = selectedUrl && item.url === selectedUrl;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => (onSelect ? onSelect(item) : setActive(item))}
                  className={`group relative aspect-square rounded-lg overflow-hidden border bg-gray-50 dark:bg-white/5 text-left ${
                    selected ? "border-indigo-500 ring-2 ring-indigo-500" : "border-gray-200 dark:border-white/10 hover:border-indigo-400"
                  }`}
                  title={item.original_name}
                >
                  {item.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt || ""} className="w-full h-full object-contain p-1" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-70" muted preload="metadata" />
                      <Film className="relative z-10 text-white drop-shadow" size={28} />
                    </div>
                  )}
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate opacity-0 group-hover:opacity-100">
                    {item.original_name}
                  </span>
                  {selected && (
                    <span className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5"><Check size={12} /></span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {page < lastPage && (
          <div className="text-center mt-4">
            <button onClick={() => load(page + 1)} disabled={loading} className="text-sm text-indigo-600 hover:underline disabled:opacity-50">
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Details drawer (library mode) */}
      {active && !onSelect && (
        <MediaDetails item={active} onClose={() => setActive(null)} onDelete={() => remove(active)} onSaveAlt={(alt) => saveAlt(active, alt)} />
      )}
    </div>
  );
}

function MediaDetails({
  item,
  onClose,
  onDelete,
  onSaveAlt,
}: {
  item: CmsMediaItem;
  onClose: () => void;
  onDelete: () => void;
  onSaveAlt: (alt: string) => void;
}) {
  const [alt, setAlt] = useState(item.alt ?? "");
  const [copied, setCopied] = useState(false);
  useEffect(() => setAlt(item.alt ?? ""), [item]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-4">{item.original_name}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center max-h-[45vh] overflow-hidden">
            {item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.alt || ""} className="max-h-[45vh] object-contain" />
            ) : (
              <video src={item.url} controls className="max-h-[45vh] w-full" />
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>{item.mime_type}</span>
            <span>{formatBytes(item.size)}</span>
            {item.width && item.height && <span>{item.width}×{item.height}px</span>}
            <span>Uploaded {new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            <input readOnly value={item.url} className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-gray-300 rounded-lg" />
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-300 inline-flex items-center gap-1.5"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy URL"}
            </button>
          </div>
          {item.type === "image" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description (alt text — for screen readers & SEO)</label>
              <div className="flex gap-2">
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg"
                />
                <button onClick={() => onSaveAlt(alt)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg">Save</button>
              </div>
            </div>
          )}
          <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex justify-end">
            <button onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700">
              <Trash2 size={14} /> Delete file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaPickerModal({
  kind,
  open,
  onClose,
  onPick,
  selectedUrl,
}: {
  kind: "image" | "video";
  open: boolean;
  onClose: () => void;
  onPick: (url: string, item?: CmsMediaItem) => void;
  selectedUrl?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-semibold text-gray-900 dark:text-white">Choose {kind === "image" ? "an image" : "a video"}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="flex-1 min-h-0 p-5 flex flex-col">
          <MediaLibrary
            kind={kind}
            selectedUrl={selectedUrl}
            onSelect={(item) => {
              onPick(item.url, item);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
