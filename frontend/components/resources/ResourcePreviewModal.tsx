import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, ChevronDown, Play, AlertCircle, FileX, ExternalLink, Check,
  Clock, CheckCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentBlock {
  type: 'text' | 'image' | 'video';
  content: string;
}

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

function toEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Google Drive
  if (url.includes('drive.google.com')) {
    if (url.includes('/preview')) return url;
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0`;

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([^?]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}

function parseBlocks(raw: string | null | undefined): ContentBlock[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(b => b.type && b.content !== undefined);
    }
  } catch {
    // Legacy plain text
    if (raw.trim()) {
      const html = raw
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .split('\n').map(l => l ? `<p>${l}</p>` : '<p><br></p>').join('');
      return [{ type: 'text', content: html }];
    }
  }
  return [];
}

function getFileTypeLabel(type: string) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pdf:      { label: 'PDF', bg: 'bg-red-50',    text: 'text-red-500' },
    document: { label: 'DOC', bg: 'bg-orange-50', text: 'text-orange-500' },
    video:    { label: 'VID', bg: 'bg-violet-50', text: 'text-violet-500' },
    link:     { label: 'LNK', bg: 'bg-emerald-50', text: 'text-emerald-500' },
    text:     { label: 'TXT', bg: 'bg-blue-50',   text: 'text-blue-500' },
  };
  return map[type] ?? { label: type.slice(0, 3).toUpperCase(), bg: 'bg-gray-100', text: 'text-gray-500' };
}

const READING_TIME_MS = 30_000; // 30 seconds minimum reading time

// ─── Storage helpers for scroll position ─────────────────────────────────────

function saveScrollPos(itemId: number, pos: number) {
  try { localStorage.setItem(`rp_scroll_${itemId}`, String(Math.round(pos))); } catch {}
}

function loadScrollPos(itemId: number): number {
  try { return parseInt(localStorage.getItem(`rp_scroll_${itemId}`) || '0', 10) || 0; } catch { return 0; }
}

// ─── Video Block ──────────────────────────────────────────────────────────────

function VideoBlock({
  url,
  title,
  itemId,
  isCompleted,
  onComplete,
}: {
  url: string;
  title?: string;
  itemId?: number;
  isCompleted?: boolean;
  onComplete?: () => void;
}) {
  const embedUrl = toEmbedUrl(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasCompleted = useRef(isCompleted || false);

  // For YouTube — use postMessage API to detect ~90% watched
  useEffect(() => {
    if (!embedUrl?.includes('youtube.com/embed') || hasCompleted.current) return;

    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'onStateChange' && data?.info === 0) {
          // state 0 = ended
          if (!hasCompleted.current) {
            hasCompleted.current = true;
            onComplete?.();
          }
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [embedUrl, onComplete]);

  if (!embedUrl) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
        <ExternalLink size={14} />
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline truncate">{title || url}</a>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-black">
      <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title || 'Video'}
        />
      </div>
      {!isCompleted && (
        <div className="px-3 py-2 bg-gray-950 flex items-center gap-2">
          <Play size={12} className="text-violet-400 flex-shrink-0" />
          <span className="text-xs text-gray-400">Watch to completion to auto-mark as done</span>
        </div>
      )}
    </div>
  );
}

// ─── Image Block ──────────────────────────────────────────────────────────────

function ImageBlock({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100">
      <img
        src={url}
        alt=""
        className="w-full object-contain max-h-[500px]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ─── Text Block ───────────────────────────────────────────────────────────────

function TextBlock({ html }: { html: string }) {
  return (
    <div
      className="
        prose prose-sm max-w-none text-gray-800
        prose-headings:font-semibold prose-headings:text-gray-900
        prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-2
        prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1
        prose-p:leading-relaxed prose-p:mb-3
        prose-ul:list-disc prose-ul:ml-5 prose-ul:mb-3
        prose-ol:list-decimal prose-ol:ml-5 prose-ol:mb-3
        prose-li:mb-1
        prose-strong:font-semibold prose-em:italic
        [&_p:empty]:hidden
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Topic Content Renderer ───────────────────────────────────────────────────
// Renders all blocks inline (text → image → video → text…).
// Auto-marks complete when: all text scrolled past + 30s elapsed.

function TopicContent({
  item,
  onComplete,
}: {
  item: CourseResourceItem;
  onComplete: (itemId: number) => void;
}) {
  const blocks = parseBlocks(item.text_content);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrolledToBottom = useRef(false);
  const timeElapsed = useRef(false);
  const completed = useRef(item.is_completed || false);

  const tryComplete = useCallback(() => {
    if (completed.current || item.is_completed) return;
    if (scrolledToBottom.current && timeElapsed.current) {
      completed.current = true;
      onComplete(item.id);
    }
  }, [item.id, item.is_completed, onComplete]);

  // Start 30s timer when component mounts (student opened the topic)
  useEffect(() => {
    if (item.is_completed) return;
    timerRef.current = setTimeout(() => {
      timeElapsed.current = true;
      tryComplete();
    }, READING_TIME_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [item.id, item.is_completed, tryComplete]);

  // IntersectionObserver on sentinel at bottom of content
  useEffect(() => {
    if (item.is_completed || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          scrolledToBottom.current = true;
          tryComplete();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [item.is_completed, tryComplete]);

  // Video completion handler
  const handleVideoComplete = useCallback(() => {
    if (!item.is_completed && !completed.current) {
      completed.current = true;
      onComplete(item.id);
    }
  }, [item.id, item.is_completed, onComplete]);

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <FileX className="w-6 h-6 text-gray-200" />
        <p className="text-sm text-gray-400">No content yet</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'text') return <TextBlock key={i} html={block.content} />;
        if (block.type === 'image') return <ImageBlock key={i} url={block.content} />;
        if (block.type === 'video') return (
          <VideoBlock
            key={i}
            url={block.content}
            title={item.title}
            itemId={item.id}
            isCompleted={item.is_completed}
            onComplete={handleVideoComplete}
          />
        );
        return null;
      })}
      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-1" aria-hidden />
    </div>
  );
}

// ─── Material Card ────────────────────────────────────────────────────────────

function MaterialCard({
  item,
  onComplete,
}: {
  item: CourseResourceItem;
  onComplete: (itemId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = getFileTypeLabel(item.type);
  const blocks = parseBlocks(item.text_content);
  const hasContent = blocks.length > 0;

  return (
    <div className={`rounded-xl border mb-2 overflow-hidden transition-colors ${
      item.is_completed ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100 bg-white'
    }`}>
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition"
        onClick={() => hasContent && setExpanded(e => !e)}
      >
        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
          <span className={`text-[10px] font-bold tracking-wide ${typeInfo.text}`}>{typeInfo.label}</span>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium truncate ${item.is_completed ? 'text-gray-400' : 'text-gray-800'}`}>
            {item.title}
          </p>
          {item.file_size && <p className="text-xs text-gray-400 mt-0.5">{item.file_size}</p>}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {item.is_completed ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <CheckCircle size={11} /> Done
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              <Clock size={11} /> Auto-tracks
            </span>
          )}
          {hasContent && (
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && hasContent && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-4">
            <TopicContent item={item} onComplete={onComplete} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sprint Section ───────────────────────────────────────────────────────────

function SprintSection({
  sprint,
  onComplete,
  initiallyExpanded = false,
}: {
  sprint: Sprint;
  onComplete: (itemId: number) => void;
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition border border-gray-100 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            sprint.progress_percentage === 100 ? 'bg-emerald-500 text-white' : 'bg-violet-100 text-violet-600'
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
          {sprint.items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No materials in this sprint yet.
            </div>
          ) : (
            sprint.items.map(item => (
              <MaterialCard key={item.id} item={item} onComplete={onComplete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ResourcePreviewModal({
  url,
  title,
  onClose,
  sprints,
  onMarkComplete,
  onDownload,
  onPreviewFile,
  externalVideos,
}: ResourcePreviewModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keyboard close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Restore scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const saved = parseInt(localStorage.getItem('rp_modal_scroll') || '0', 10);
    if (saved) el.scrollTop = saved;
    const onScroll = () => { try { localStorage.setItem('rp_modal_scroll', String(el.scrollTop)); } catch {} };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-complete handler: calls the markComplete API
  const handleAutoComplete = useCallback(async (itemId: number) => {
    if (onMarkComplete) {
      // Pass false as currentStatus since we're marking as complete (not toggling)
      await onMarkComplete(itemId, false);
    }
  }, [onMarkComplete]);

  if (!url && !sprints) return null;

  // ── Simple single-file fallback ──────────────────────────────────────────
  if (!sprints && url) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl flex flex-col" style={{ height: '90vh' }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{title || 'Preview'}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe src={url} className="flex-1 w-full border-0" title={title || 'Preview'} />
        </div>
      </div>
    );
  }

  // ── Full sprints modal ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '95vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0 bg-white">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Course Materials</h2>
            <p className="text-xs text-gray-400 mt-0.5">Progress tracked automatically as you read & watch</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body — everything flows together */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 sm:px-5 py-5">

          {/* External videos notice (non-embeddable) */}
          {externalVideos && externalVideos.some(v => !toEmbedUrl(v.url)) && (
            <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 flex items-start gap-2">
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Some videos can't be embedded and will open in a new tab:{' '}
                  {externalVideos.filter(v => !toEmbedUrl(v.url)).map(v => (
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900 mr-1">{v.title}</a>
                  ))}
                </span>
              </p>
            </div>
          )}

          {/* Sprint materials */}
          {(!sprints || sprints.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <FileX className="w-8 h-8 text-gray-200" />
              <p className="text-sm">No materials available.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">Sprint Materials</p>
              {sprints.map((sprint, idx) => (
                <SprintSection
                  key={sprint.id}
                  sprint={sprint}
                  onComplete={handleAutoComplete}
                  initiallyExpanded={idx === 0}
                />
              ))}
            </>
          )}

          {/* External resources section */}
          {externalVideos && externalVideos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">External Resources</p>
              <div className="space-y-3">
                {externalVideos.map(v => {
                  const embed = toEmbedUrl(v.url);
                  if (embed) {
                    return (
                      <div key={v.id} className="rounded-xl overflow-hidden border border-gray-100">
                        <div className="relative" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={embed}
                            className="absolute inset-0 w-full h-full border-0"
                            allow="autoplay; fullscreen"
                            allowFullScreen
                            title={v.title}
                          />
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-800">{v.title}</p>
                          {v.source && <p className="text-xs text-gray-400">{v.source}{v.duration ? ` · ${v.duration}` : ''}</p>}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 transition group">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Play size={14} className="text-violet-600 ml-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-violet-700 truncate">{v.title}</p>
                        <p className="text-xs text-gray-400">{v.source}{v.duration ? ` · ${v.duration}` : ''}</p>
                      </div>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-violet-500 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom padding for comfortable scrolling */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}