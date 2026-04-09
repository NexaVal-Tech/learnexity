import React, { useEffect, useRef, useState } from 'react';
import {
  Check, X, ChevronDown, Play, SkipForward, SkipBack,
  AlertCircle, FileX, ExternalLink,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseResourceItem {
  id: number;
  title: string;
  type: string;
  file_size?: string | null;
  download_url?: string | null;
  is_completed?: boolean;
  video_url?: string | null;
  text_content?: string | null;
}

interface Sprint {
  id: number;
  sprint_number: number;
  sprint_name: string;
  progress_percentage: number;
  completed_items?: number;
  total_items?: number;
  items: CourseResourceItem[];
}

interface ExternalVideoResource {
  id: number;
  title: string;
  url: string;
  source: string;
  duration?: string | null;
}

interface ResourcePreviewModalProps {
  url: string | null;
  title?: string | null;
  onClose: () => void;
  sprints?: Sprint[];
  initialItemId?: number;
  onMarkComplete?: (itemId: number, currentStatus: boolean) => Promise<void>;
  onDownload?: (itemId: number, title: string) => Promise<void>;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
  externalVideos?: ExternalVideoResource[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toGDriveEmbed(url: string): string {
  if (!url) return url;
  if (url.includes('/preview')) return url;
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  return url;
}

function isGDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

function getFileTypeLabel(type: string) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pdf:      { label: 'PDF', bg: 'bg-red-50',    text: 'text-red-500' },
    document: { label: 'DOC', bg: 'bg-orange-50', text: 'text-orange-500' },
    video:    { label: 'VID', bg: 'bg-violet-50', text: 'text-violet-500' },
    link:     { label: 'LNK', bg: 'bg-emerald-50', text: 'text-emerald-500' },
    text:     { label: 'TXT', bg: 'bg-blue-50',   text: 'text-blue-500' },
  };
  return map[type] || { label: type.toUpperCase().slice(0, 3), bg: 'bg-gray-100', text: 'text-gray-500' };
}

// ─── Text Content Viewer ──────────────────────────────────────────────────────

function TextContentViewer({
  itemId, title, inlineText, onPreviewFile,
}: {
  itemId: number;
  title: string;
  inlineText?: string | null;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
}) {
  const [text, setText] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'empty' | 'error'>('loading');
  const loadedRef = useRef(false);

  useEffect(() => {
    // If we have inline text (even empty string), use it directly — no fetch
    if (inlineText !== undefined) {
      if (inlineText && inlineText.trim()) { setText(inlineText); setState('loaded'); }
      else setState('empty');
      return;
    }
    // No inline text and no fetch handler — nothing we can do
    if (!onPreviewFile) { setState('empty'); return; }
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const objectUrl = await onPreviewFile(itemId, title);
        if (!objectUrl) { setState('empty'); return; }
        const res = await fetch(objectUrl);
        const blob = await res.blob();
        window.URL.revokeObjectURL(objectUrl);
        if (blob.size === 0) { setState('empty'); return; }
        const content = await blob.text();
        if (!content.trim()) { setState('empty'); return; }
        setText(content);
        setState('loaded');
      } catch { setState('empty'); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (state === 'loading') return (
    <div className="flex items-center justify-center py-8">
      <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (state === 'empty') return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <FileX className="w-7 h-7 text-gray-300" />
      <p className="text-sm text-gray-400">No content added yet</p>
    </div>
  );

  if (state === 'error') return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <AlertCircle className="w-7 h-7 text-red-300" />
      <p className="text-sm text-red-400">Unable to load content</p>
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <div className="overflow-auto max-h-96">
        <pre className="p-4 text-sm text-gray-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
          {text}
        </pre>
      </div>
    </div>
  );
}

// ─── File Content Viewer ──────────────────────────────────────────────────────

function FileContentViewer({
  itemId, title, type, inlineText, onPreviewFile,
}: {
  itemId: number;
  title: string;
  type: string;
  inlineText?: string | null;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
}) {
  if (type === 'text' || type === 'txt') {
    return (
      <TextContentViewer
        itemId={itemId}
        title={title}
        inlineText={inlineText}
        onPreviewFile={onPreviewFile}
      />
    );
  }

  if (type === 'link') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
        <ExternalLink className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <span className="text-sm text-gray-500">This is an external link resource.</span>
      </div>
    );
  }

  if (!onPreviewFile) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <FileX className="w-7 h-7 text-gray-200" />
        <p className="text-sm text-gray-400">No preview available</p>
      </div>
    );
  }

  return <IframeViewer itemId={itemId} title={title} onPreviewFile={onPreviewFile} />;
}

// ─── Iframe Viewer ────────────────────────────────────────────────────────────

function IframeViewer({
  itemId, title, onPreviewFile,
}: {
  itemId: number;
  title: string;
  onPreviewFile: (itemId: number, title: string) => Promise<string>;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'loaded' | 'empty' | 'error'>('loading');
  const loadedRef = useRef(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const objectUrl = await onPreviewFile(itemId, title);
        blobUrlRef.current = objectUrl;
        const res = await fetch(objectUrl);
        const blob = await res.blob();
        if (blob.size === 0) {
          setState('empty');
          window.URL.revokeObjectURL(objectUrl);
          blobUrlRef.current = null;
          return;
        }
        setBlobUrl(objectUrl);
        setState('loaded');
      } catch {
        setState('error');
        if (blobUrlRef.current) { window.URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
      }
    })();
    return () => { if (blobUrlRef.current) window.URL.revokeObjectURL(blobUrlRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (state === 'loading') return (
    <div className="flex items-center justify-center py-10">
      <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (state === 'empty') return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <FileX className="w-8 h-8 text-gray-300" />
      <p className="text-sm text-gray-400">File appears to have been deleted</p>
    </div>
  );

  if (state === 'error') return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <AlertCircle className="w-8 h-8 text-red-300" />
      <p className="text-sm text-red-400">Unable to load file</p>
    </div>
  );

  return (
    <div className="rounded-lg overflow-hidden border border-gray-100">
      <iframe src={blobUrl!} className="w-full border-0 block" style={{ height: '520px' }} title={title} />
    </div>
  );
}

// ─── Material Card ────────────────────────────────────────────────────────────

function MaterialCard({
  item, onMarkComplete, onDownload, onPreviewFile,
}: {
  item: CourseResourceItem;
  onMarkComplete: (itemId: number, currentStatus: boolean) => Promise<void>;
  onDownload?: (itemId: number, title: string) => Promise<void>;
  onPreviewFile: (itemId: number, title: string) => Promise<string>;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const typeInfo = getFileTypeLabel(item.type);

  return (
    <div className={`rounded-xl border mb-3 overflow-hidden transition-colors ${
      item.is_completed ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100 bg-white'
    }`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
          <span className={`text-[10px] font-bold tracking-wide ${typeInfo.text}`}>{typeInfo.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {item.title}
          </p>
          {item.file_size && <p className="text-xs text-gray-400 mt-0.5">{item.file_size}</p>}
        </div>
        <button
          onClick={async () => {
            setIsCompleting(true);
            try { await onMarkComplete(item.id, item.is_completed || false); }
            finally { setIsCompleting(false); }
          }}
          disabled={isCompleting}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 ${
            item.is_completed
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-600'
          } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Check className="w-3 h-3" strokeWidth={3} />
          {item.is_completed ? 'Done' : 'Mark done'}
        </button>
      </div>
      <div className="px-4 pb-4">
        <FileContentViewer
          itemId={item.id}
          title={item.title}
          type={item.type}
          inlineText={item.text_content}
          onPreviewFile={onPreviewFile}
        />
      </div>
    </div>
  );
}

// ─── Sprint Section ───────────────────────────────────────────────────────────

function SprintSection({
  sprint, onMarkComplete, onDownload, onPreviewFile, initiallyExpanded = true,
}: {
  sprint: Sprint;
  onMarkComplete: (itemId: number, currentStatus: boolean) => Promise<void>;
  onDownload?: (itemId: number, title: string) => Promise<void>;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const nonVideoItems = sprint.items.filter(
    i => i.type !== 'video' && !(i.video_url && isGDriveUrl(i.video_url || ''))
  );

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition border border-gray-100 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            sprint.progress_percentage === 100
              ? 'bg-emerald-500 text-white'
              : 'bg-violet-100 text-violet-600'
          }`}>
            {sprint.progress_percentage === 100 ? <Check className="w-4 h-4" /> : `S${sprint.sprint_number}`}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800">{sprint.sprint_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {sprint.completed_items ?? 0}/{sprint.total_items ?? sprint.items.length} completed · {sprint.progress_percentage}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-20 bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all ${sprint.progress_percentage === 100 ? 'bg-emerald-500' : 'bg-violet-400'}`}
              style={{ width: `${sprint.progress_percentage}%` }}
            />
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="pl-2">
          {nonVideoItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No materials in this sprint yet.
            </div>
          ) : (
            nonVideoItems.map(item => (
              <MaterialCard
                key={item.id}
                item={item}
                onMarkComplete={onMarkComplete}
                onDownload={onDownload}
                onPreviewFile={onPreviewFile || (async () => '')}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Video Player ─────────────────────────────────────────────────────────────
// Uses a fixed pixel height calculated from the parent's available space.
// The iframe fills it completely; no aspect-ratio tricks needed.

interface VideoItem {
  id: number | string;
  title: string;
  embedUrl: string;
  source?: string;
  duration?: string | null;
}

function VideoPlayer({ videos }: { videos: VideoItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = videos[currentIndex];
  const total = videos.length;

  return (
    <div className="flex flex-col w-full h-full bg-black">
      {/* iframe fills all remaining height inside the fixed container */}
      <iframe
        key={current.embedUrl}
        src={current.embedUrl}
        className="flex-1 w-full border-0 block min-h-0"
        allow="autoplay; fullscreen"
        allowFullScreen
        title={current.title}
      />

      {/* Controls — only shown when there are multiple videos */}
      {total > 1 && (
        <div className="flex-shrink-0 bg-gray-900 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            {videos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setCurrentIndex(i)}
                title={v.title}
                className={`flex-1 h-0.5 rounded-full transition-all ${
                  i < currentIndex ? 'bg-violet-400' :
                  i === currentIndex ? 'bg-violet-500' :
                  'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <span className="text-gray-500 text-xs tabular-nums">{currentIndex + 1}/{total}</span>
            <button
              onClick={() => setCurrentIndex(i => Math.min(total - 1, i + 1))}
              disabled={currentIndex === total - 1}
              className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Playlist */}
      {total > 1 && (
        <div className="flex-shrink-0 bg-gray-950 border-t border-gray-800 overflow-y-auto" style={{ maxHeight: '80px' }}>
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition ${
                i === currentIndex ? 'bg-violet-900/40' : 'hover:bg-gray-800/60'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                i === currentIndex ? 'bg-violet-600' : 'bg-gray-700'
              }`}>
                <Play className="w-2.5 h-2.5 text-white ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate ${i === currentIndex ? 'text-violet-300 font-medium' : 'text-gray-400'}`}>
                  {v.title}
                </p>
                {v.duration && <p className="text-[11px] text-gray-600">{v.duration}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ResourcePreviewModal({
  url, title, onClose, sprints, onMarkComplete, onDownload, onPreviewFile, externalVideos,
}: ResourcePreviewModalProps) {

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!url && !sprints) return null;

  const externalVideoItems: VideoItem[] = (externalVideos || [])
    .filter(v => v.url && isGDriveUrl(v.url))
    .map(v => ({
      id: v.id,
      title: v.title,
      embedUrl: toGDriveEmbed(v.url),
      source: v.source,
      duration: v.duration,
    }));

  const sprintVideoItems: VideoItem[] = (sprints || []).flatMap(s =>
    s.items
      .filter(i => i.video_url && isGDriveUrl(i.video_url))
      .map(i => ({ id: i.id, title: i.title, embedUrl: toGDriveEmbed(i.video_url!) }))
  );

  const allVideos = [...externalVideoItems, ...sprintVideoItems];
  const hasVideos = allVideos.length > 0;

  // ── Simple single-file fallback ──
  if (!sprints && url) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl flex flex-col" style={{ height: '90vh' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{title || 'Preview'}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe src={url} className="flex-1 w-full border-0" title={title || 'Preview'} />
        </div>
      </div>
    );
  }

  // ── Full sprints modal ──
  // Layout strategy:
  //   - Modal = 95vh, flex column
  //   - Header: fixed height, flex-shrink-0
  //   - Video section: fixed at 45% of modal height (flex-shrink-0), fully visible
  //   - Scrollable area: flex-1, min-h-0, takes remaining space
  //
  // The video wrapper uses a fixed height (45vh), NOT maxHeight.
  // maxHeight would let the child be smaller; fixed height ensures the
  // iframe always fills the space and is never cut off by a sibling.

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '95vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0 bg-white">
          <h2 className="font-semibold text-gray-900 text-sm">Course Materials</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video section — fixed 45% of viewport height, fully visible, not scrollable */}
        {hasVideos && (
          <div
            className="flex-shrink-0 bg-black overflow-hidden"
            style={{ height: '45vh' }}
          >
            <VideoPlayer videos={allVideos} />
          </div>
        )}

        {/* Non-Drive external video notice */}
        {!hasVideos && externalVideos && externalVideos.length > 0 && (
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-5 py-2.5">
            <p className="text-xs text-amber-600 flex items-center gap-1.5 flex-wrap">
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Videos hosted externally:</span>
              {externalVideos.map(v => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-800"
                >
                  {v.title}
                </a>
              ))}
            </p>
          </div>
        )}

        {/* Scrollable sprint content — takes remaining height */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 sm:px-5 py-5">
          {(!sprints || sprints.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <FileX className="w-8 h-8 text-gray-200" />
              <p className="text-sm">No materials available.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">
                Sprint Materials
              </p>
              {sprints.map((sprint, idx) => (
                <SprintSection
                  key={sprint.id}
                  sprint={sprint}
                  onMarkComplete={onMarkComplete || (async () => {})}
                  onDownload={onDownload}
                  onPreviewFile={onPreviewFile}
                  initiallyExpanded={idx === 0}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}