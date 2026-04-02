import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Check, X, ChevronDown, ChevronUp, Download, Play, Pause, SkipForward, SkipBack, AlertCircle, FileX } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseResourceItem {
  id: number;
  title: string;
  type: string;
  file_size?: string | null;
  download_url?: string | null;
  is_completed?: boolean;
  video_url?: string | null;
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

interface ResourcePreviewModalProps {
  url: string | null;
  title?: string | null;
  onClose: () => void;
  sprints?: Sprint[];
  initialItemId?: number;
  onMarkComplete?: (itemId: number, currentStatus: boolean) => Promise<void>;
  onDownload?: (itemId: number, title: string) => Promise<void>;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
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
    pdf:      { label: 'PDF', bg: 'bg-red-100',    text: 'text-red-600' },
    document: { label: 'DOC', bg: 'bg-orange-100', text: 'text-orange-600' },
    video:    { label: 'VID', bg: 'bg-purple-100', text: 'text-purple-600' },
    link:     { label: 'LNK', bg: 'bg-green-100',  text: 'text-green-600' },
  };
  return map[type] || { label: type.toUpperCase().slice(0, 3), bg: 'bg-gray-100', text: 'text-gray-600' };
}

// ─── File Content Viewer ──────────────────────────────────────────────────────

type FileLoadState = 'loading' | 'loaded' | 'empty' | 'error';

interface FileContentViewerProps {
  itemId: number;
  title: string;
  type: string;
  onPreviewFile: (itemId: number, title: string) => Promise<string>;
}

function FileContentViewer({ itemId, title, type, onPreviewFile }: FileContentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [state, setState] = useState<FileLoadState>('loading');
  const [textContent, setTextContent] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      try {
        const objectUrl = await onPreviewFile(itemId, title);
        blobUrlRef.current = objectUrl;

        // Re-fetch the blob from the object URL to inspect it
        const res = await fetch(objectUrl);
        const blob = await res.blob();

        if (blob.size === 0) {
          setState('empty');
          window.URL.revokeObjectURL(objectUrl);
          blobUrlRef.current = null;
          return;
        }

        // Plain text — render as <pre>
        if (type === 'txt' || blob.type.startsWith('text/')) {
          const text = await blob.text();
          if (!text.trim()) {
            setState('empty');
            window.URL.revokeObjectURL(objectUrl);
            blobUrlRef.current = null;
            return;
          }
          setTextContent(text);
          setState('loaded');
          window.URL.revokeObjectURL(objectUrl);
          blobUrlRef.current = null;
          return;
        }

        // PDF / DOC — use iframe with blob URL
        setBlobUrl(objectUrl);
        setState('loaded');
        // Don't revoke — iframe still needs it
      } catch {
        setState('error');
        if (blobUrlRef.current) {
          window.URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
      }
    };

    load();

    return () => {
      // Cleanup on unmount
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading content…</span>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="flex items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <FileX className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">This file appears to have been deleted</p>
          <p className="text-xs text-gray-400">Contact your instructor if you need this material.</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center justify-center py-10 bg-red-50 rounded-xl border border-dashed border-red-200">
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-300" />
          <p className="text-sm font-medium text-red-500">Unable to load this file</p>
          <p className="text-xs text-red-400">Try downloading it instead.</p>
        </div>
      </div>
    );
  }

  // Plain text
  if (textContent !== null) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-auto max-h-[500px]">
        <pre className="p-5 text-sm text-gray-800 font-mono whitespace-pre-wrap break-words leading-relaxed">
          {textContent}
        </pre>
      </div>
    );
  }

  // PDF / DOC via iframe
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
      <iframe
        src={blobUrl!}
        className="w-full border-0 block"
        style={{ height: '540px' }}
        title={title}
      />
    </div>
  );
}

// ─── Material Card ────────────────────────────────────────────────────────────

interface MaterialCardProps {
  item: CourseResourceItem;
  onMarkComplete: (itemId: number, currentStatus: boolean) => Promise<void>;
  onDownload?: (itemId: number, title: string) => Promise<void>;
  onPreviewFile: (itemId: number, title: string) => Promise<string>;
}

function MaterialCard({ item, onMarkComplete, onDownload, onPreviewFile }: MaterialCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const typeInfo = getFileTypeLabel(item.type);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onMarkComplete(item.id, item.is_completed || false);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`rounded-2xl border transition-all mb-5 overflow-hidden ${
      item.is_completed ? 'border-green-200 bg-green-50/20' : 'border-gray-200 bg-white'
    }`}>
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
          <span className={`text-[10px] font-bold ${typeInfo.text}`}>{typeInfo.label}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${
            item.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}>
            {item.title}
          </p>
          {item.file_size && (
            <p className="text-xs text-gray-400 mt-0.5">{item.file_size}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* {onDownload && (
            <button
              onClick={() => onDownload(item.id, item.title)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )} */}
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              item.is_completed
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
            } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            {item.is_completed ? 'Completed' : 'Mark done'}
          </button>
        </div>
      </div>

      {/* Inline file content */}
      <div className="px-5 py-4">
        <FileContentViewer
          itemId={item.id}
          title={item.title}
          type={item.type}
          onPreviewFile={onPreviewFile}
        />
      </div>
    </div>
  );
}

// ─── Sprint Section ───────────────────────────────────────────────────────────

interface SprintSectionProps {
  sprint: Sprint;
  onMarkComplete: (itemId: number, currentStatus: boolean) => Promise<void>;
  onDownload?: (itemId: number, title: string) => Promise<void>;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
  initiallyExpanded?: boolean;
}

function SprintSection({ sprint, onMarkComplete, onDownload, onPreviewFile, initiallyExpanded = true }: SprintSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const nonVideoItems = sprint.items.filter(
    i => i.type !== 'video' && !(i.video_url && isGDriveUrl(i.video_url || ''))
  );

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition mb-3 border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            sprint.progress_percentage === 100 ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
          }`}>
            {sprint.progress_percentage === 100 ? <Check className="w-5 h-5" /> : `S${sprint.sprint_number}`}
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900 text-sm">{sprint.sprint_name}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {sprint.completed_items ?? 0}/{sprint.total_items ?? sprint.items.length} completed · {sprint.progress_percentage}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-24 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${sprint.progress_percentage === 100 ? 'bg-green-500' : 'bg-purple-500'}`}
              style={{ width: `${sprint.progress_percentage}%` }}
            />
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div>
          {nonVideoItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No downloadable materials in this sprint yet.
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

// ─── Stitched Video Player ────────────────────────────────────────────────────

function StitchedVideoPlayer({ videos }: { videos: { id: number; title: string; embedUrl: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [segmentProgress, setSegmentProgress] = useState<number[]>(new Array(videos.length).fill(0));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const SEGMENT_DURATION_SECS = 600;
  const totalSegments = videos.length;
  const current = videos[currentIndex];

  const overallFill = segmentProgress.reduce((sum, p, i) => {
    if (i < currentIndex) return sum + 100;
    if (i === currentIndex) return sum + p;
    return sum;
  }, 0) / totalSegments;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSegmentProgress(prev => {
        const next = [...prev];
        if (next[currentIndex] < 100) {
          next[currentIndex] = Math.min(100, next[currentIndex] + (100 / SEGMENT_DURATION_SECS));
        } else {
          if (currentIndex < totalSegments - 1) {
            setCurrentIndex(i => i + 1);
            setIsPlaying(false);
          }
          clearInterval(timerRef.current!);
        }
        return next;
      });
    }, 1000);
  }, [currentIndex, totalSegments]);

  useEffect(() => {
    if (isPlaying) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, startTimer]);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(totalSegments - 1, Math.floor(ratio * totalSegments)));
    setCurrentIndex(clamped);
    setIsPlaying(false);
    setSegmentProgress(prev => {
      const next = [...prev];
      next[clamped] = (ratio * totalSegments - clamped) * 100;
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          key={current.embedUrl}
          src={current.embedUrl}
          className="absolute inset-0 w-full h-full rounded-t-xl border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={current.title}
        />
      </div>
      <div className="bg-gray-900 rounded-b-xl px-4 pt-3 pb-3 select-none">
        {totalSegments > 1 && (
          <div className="flex gap-1 mb-2">
            {videos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => { setCurrentIndex(i); setIsPlaying(false); }}
                title={v.title}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i < currentIndex ? 'bg-purple-400' : i === currentIndex ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
        <div className="w-full h-2 bg-gray-700 rounded-full cursor-pointer mb-3 relative group" onClick={handleBarClick}>
          <div className="h-full bg-purple-500 rounded-full transition-all relative" style={{ width: `${overallFill}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { if (currentIndex > 0) { setCurrentIndex(i => i - 1); setIsPlaying(false); } }} disabled={currentIndex === 0} className="text-gray-400 hover:text-white disabled:opacity-30 transition p-1">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => setIsPlaying(p => !p)} className="w-8 h-8 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center transition">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={() => { if (currentIndex < totalSegments - 1) { setCurrentIndex(i => i + 1); setIsPlaying(false); } }} disabled={currentIndex === totalSegments - 1} className="text-gray-400 hover:text-white disabled:opacity-30 transition p-1">
              <SkipForward className="w-4 h-4" />
            </button>
            {totalSegments > 1 && <span className="text-gray-400 text-xs ml-1">{currentIndex + 1} / {totalSegments}</span>}
          </div>
          <span className="text-gray-300 text-xs truncate max-w-[160px] md:max-w-xs">{current.title}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ResourcePreviewModal({
  url, title, onClose, sprints, onMarkComplete, onDownload, onPreviewFile,
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

  const allVideoItems = (sprints || []).flatMap(s =>
    s.items
      .filter(i => i.video_url && isGDriveUrl(i.video_url))
      .map(i => ({ id: i.id, title: i.title, embedUrl: toGDriveEmbed(i.video_url!) }))
  );

  // Fallback: simple single-file preview
  if (!sprints && url) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 truncate">{title || 'Preview'}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <iframe src={url} className="flex-1 w-full border-0" title={title || 'Preview'} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '95vh', height: '95vh' }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b bg-white rounded-t-2xl flex-shrink-0 z-10">
          <h2 className="font-bold text-gray-900 text-base truncate">Course Materials</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {allVideoItems.length > 0 && (
            <div className="flex-shrink-0 bg-black px-0 sm:px-4 sm:pt-4">
              <StitchedVideoPlayer videos={allVideoItems} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5">
            {(!sprints || sprints.length === 0) ? (
              <div className="text-center py-16 text-gray-400 text-sm">No materials available.</div>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-5 uppercase tracking-wider font-medium">
                  Sprint Materials — read and mark complete as you go
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
    </div>
  );
}