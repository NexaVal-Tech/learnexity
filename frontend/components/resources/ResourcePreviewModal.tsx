// components/resources/ResourcePreviewModal.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, ChevronDown, Play, FileX, ExternalLink, Check,
  Clock, CheckCircle, Loader2, Code2, Terminal, Lock,
} from 'lucide-react';
import CodeEditor from '@/components/codeeditor/CodeEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentBlock {
  type: 'text' | 'image' | 'video';
  content: string;
}

interface CourseResourceItem {
  id: number;
  title: string;
  type: string;
  order?: number;
  file_size?: string | null;
  download_url?: string | null;
  is_completed?: boolean;
  is_locked?: boolean;
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
  is_locked?: boolean;
  items: CourseResourceItem[];
}

interface FreemiumMeta {
  is_freemium: boolean;
  free_sprint_limit: number;
  user_has_access: boolean;
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
  freemiumMeta?: FreemiumMeta;
  onEnrollClick?: () => void;
  onPayNowClick?: (() => void) | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('drive.google.com')) {
    if (url.includes('/preview')) return url;
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0`;
  const loomMatch = url.match(/loom\.com\/share\/([^?]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function parseBlocks(raw: string | null | undefined): ContentBlock[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(b => b.type && b.content !== undefined);
  } catch {
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
    pdf:      { label: 'PDF', bg: 'bg-red-50',     text: 'text-red-500' },
    document: { label: 'DOC', bg: 'bg-orange-50',  text: 'text-orange-500' },
    video:    { label: 'VID', bg: 'bg-violet-50',  text: 'text-violet-500' },
    link:     { label: 'LNK', bg: 'bg-emerald-50', text: 'text-emerald-500' },
    text:     { label: 'TXT', bg: 'bg-blue-50',    text: 'text-blue-500' },
  };
  return map[type] ?? { label: type.slice(0, 3).toUpperCase(), bg: 'bg-gray-100', text: 'text-gray-500' };
}

function sortItems(items: CourseResourceItem[]): CourseResourceItem[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
}

const READING_TIME_MS = 30_000;

// ─── Code Editor Panel ────────────────────────────────────────────────────────

function CodeEditorPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="hidden lg:flex flex-col rounded-2xl overflow-hidden shadow-2xl"
      style={{
        flex: '1 1 0',
        minWidth: 0,
        background: '#0f0f17',
        border: '1px solid #1e1e30',
        alignSelf: 'stretch',
      }}
    >
      <div
        style={{ background: '#13131f', borderBottom: '1px solid #1e1e30' }}
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div
              className="flex items-center justify-center rounded"
              style={{ width: 22, height: 22, background: 'rgba(74,58,255,0.2)' }}
            >
              <Terminal size={12} style={{ color: '#4A3AFF' }} />
            </div>
            <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              Code Playground
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-lg transition hover:bg-white/10"
          style={{ width: 28, height: 28, color: '#6b7280' }}
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor height="100%" showHeader={true} />
      </div>
    </div>
  );
}

// ─── Locked Sprint Paywall (inside modal) ─────────────────────────────────────

function LockedSprintPaywall({
  sprint,
  freemiumMeta,
  onEnrollClick,
  onPayNowClick,
}: {
  sprint: Sprint;
  freemiumMeta?: FreemiumMeta;
  onEnrollClick?: () => void;
  onPayNowClick?: () => void;
}) {
  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-indigo-100">
      {/* Sprint header — greyed out */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-400 truncate">{sprint.sprint_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sprint.total_items ?? sprint.items.length} items · Locked</p>
        </div>
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full flex-shrink-0">
          Premium
        </span>
      </div>

      {/* Locked item rows */}
      <div className="bg-white divide-y divide-gray-50">
        {sortItems(sprint.items).slice(0, 3).map(item => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3 opacity-50 select-none">
            <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-3 h-3 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400 line-through truncate flex-1">{item.title}</p>
          </div>
        ))}
        {sprint.items.length > 3 && (
          <div className="px-4 py-2 text-xs text-gray-400 text-center">
            +{sprint.items.length - 3} more items
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-indigo-100">
        <div>
          <p className="text-xs font-semibold text-indigo-900">Unlock this sprint</p>
          <p className="text-xs text-indigo-600 mt-0.5">
            {onPayNowClick
              ? 'Complete your payment to access this content.'
              : 'Enroll in the full course to access all sprints.'}
          </p>
        </div>
        <button
          onClick={onPayNowClick ?? onEnrollClick}
          className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {onPayNowClick ? 'Pay Now →' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
}

// ─── Video Block ──────────────────────────────────────────────────────────────

function VideoBlock({ url, title, isCompleted, onComplete }: {
  url: string; title?: string; isCompleted?: boolean; onComplete?: () => void;
}) {
  const embedUrl = toEmbedUrl(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasCompleted = useRef(isCompleted || false);

  useEffect(() => {
    if (!embedUrl?.includes('youtube.com/embed') || hasCompleted.current) return;
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'onStateChange' && data?.info === 0) {
          if (!hasCompleted.current) { hasCompleted.current = true; onComplete?.(); }
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
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe ref={iframeRef} src={embedUrl} className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={title || 'Video'} />
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
      <img src={url} alt="" className="w-full object-contain max-h-[500px]" onError={() => setFailed(true)} />
    </div>
  );
}

// ─── Text Block ───────────────────────────────────────────────────────────────

function TextBlock({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-headings:text-gray-900
        prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1
        prose-p:leading-relaxed prose-p:mb-3 prose-ul:list-disc prose-ul:ml-5 prose-ul:mb-3
        prose-ol:list-decimal prose-ol:ml-5 prose-ol:mb-3 prose-li:mb-1
        prose-strong:font-semibold prose-em:italic [&_p:empty]:hidden"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────────────────────

function PdfViewer({ itemId, title, isCompleted, onComplete, onPreviewFile }: {
  itemId: number; title: string; isCompleted?: boolean;
  onComplete: (id: number) => void; onPreviewFile: (itemId: number, title: string) => Promise<string>;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [fetching, setFetching] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completed = useRef(isCompleted || false);
  const objectUrlRef = useRef<string | null>(null);

  const doFetch = useCallback(async () => {
    try {
      setFetching(true); setLoadError(false);
      if (objectUrlRef.current?.startsWith('blob:')) URL.revokeObjectURL(objectUrlRef.current);
      const url = await onPreviewFile(itemId, title);
      objectUrlRef.current = url;
      setBlobUrl(url);
    } catch { setLoadError(true); } finally { setFetching(false); }
  }, [itemId, title, onPreviewFile]);

  useEffect(() => {
    doFetch();
    return () => { if (objectUrlRef.current?.startsWith('blob:')) URL.revokeObjectURL(objectUrlRef.current); };
  }, [doFetch]);

  useEffect(() => {
    if (isCompleted || completed.current || !blobUrl) return;
    timerRef.current = setTimeout(() => {
      if (!completed.current) { completed.current = true; onComplete(itemId); }
    }, 60_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [itemId, isCompleted, onComplete, blobUrl]);

  if (fetching) return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 bg-gray-50">
      <Loader2 size={24} className="animate-spin text-violet-500" />
      <p className="text-sm text-gray-500">Loading PDF…</p>
    </div>
  );

  if (loadError || !blobUrl) return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 bg-gray-50">
      <FileX size={24} className="text-red-400" />
      <p className="text-sm text-red-500">Failed to load PDF.</p>
      <button onClick={doFetch} className="text-xs text-violet-600 hover:underline">Retry</button>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div style={{ height: '500px' }} className="bg-gray-100">
        <iframe src={`${blobUrl}#toolbar=0&view=FitH`} className="w-full h-full border-0" title={title} />
      </div>
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <Clock size={11} /> {isCompleted ? 'Completed' : 'Marked complete after 60s of reading'}
        </span>
        {isCompleted && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={11} /> Completed</span>}
      </div>
    </div>
  );
}

// ─── Document Viewer ──────────────────────────────────────────────────────────

function DocViewer({ itemId, title, isCompleted, onComplete, onPreviewFile }: {
  itemId: number; title: string; isCompleted?: boolean;
  onComplete: (id: number) => void; onPreviewFile: (itemId: number, title: string) => Promise<string>;
}) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [fetching, setFetching] = useState(true);
  const completed = useRef(isCompleted || false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFetching(true); setLoadError(false);
        const rawUrl = await onPreviewFile(itemId, title);
        if (cancelled) return;
        const lowerTitle = title.toLowerCase();
        const isOffice = ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'].some(e => lowerTitle.endsWith(e));
        setViewUrl(isOffice ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}` : rawUrl);
        if (!completed.current && !isCompleted) { completed.current = true; onComplete(itemId); }
      } catch { if (!cancelled) setLoadError(true); } finally { if (!cancelled) setFetching(false); }
    })();
    return () => { cancelled = true; };
  }, [itemId, title, onPreviewFile, isCompleted, onComplete]);

  if (fetching) return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 bg-gray-50">
      <Loader2 size={24} className="animate-spin text-violet-500" />
      <p className="text-sm text-gray-500">Loading document…</p>
    </div>
  );

  if (loadError || !viewUrl) return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 bg-gray-50">
      <FileX size={24} className="text-red-400" />
      <p className="text-sm text-red-500">Failed to load document.</p>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div style={{ height: '500px' }} className="bg-gray-100">
        <iframe src={viewUrl} className="w-full h-full border-0" title={title} allow="autoplay" />
      </div>
      <div className="flex items-center px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <Clock size={11} /> {isCompleted ? 'Completed' : 'Marked complete when opened'}
        </span>
        {isCompleted && <span className="flex items-center gap-1 text-xs text-emerald-600 ml-auto"><CheckCircle size={11} /> Completed</span>}
      </div>
    </div>
  );
}

// ─── Topic Content ────────────────────────────────────────────────────────────

function TopicContent({ item, onComplete }: { item: CourseResourceItem; onComplete: (itemId: number) => void }) {
  const blocks = parseBlocks(item.text_content);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrolledToBottom = useRef(false);
  const timeElapsed = useRef(false);
  const completed = useRef(item.is_completed || false);

  const tryComplete = useCallback(() => {
    if (completed.current || item.is_completed) return;
    if (scrolledToBottom.current && timeElapsed.current) { completed.current = true; onComplete(item.id); }
  }, [item.id, item.is_completed, onComplete]);

  useEffect(() => {
    if (item.is_completed) return;
    timerRef.current = setTimeout(() => { timeElapsed.current = true; tryComplete(); }, READING_TIME_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [item.id, item.is_completed, tryComplete]);

  useEffect(() => {
    if (item.is_completed || !sentinelRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { scrolledToBottom.current = true; tryComplete(); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [item.is_completed, tryComplete]);

  const handleVideoComplete = useCallback(() => {
    if (!item.is_completed && !completed.current) { completed.current = true; onComplete(item.id); }
  }, [item.id, item.is_completed, onComplete]);

  if (blocks.length === 0) return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <FileX className="w-6 h-6 text-gray-200" />
      <p className="text-sm text-gray-400">No content yet</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'text') return <TextBlock key={i} html={block.content} />;
        if (block.type === 'image') return <ImageBlock key={i} url={block.content} />;
        if (block.type === 'video') return (
          <VideoBlock key={i} url={block.content} title={item.title}
            isCompleted={item.is_completed} onComplete={handleVideoComplete} />
        );
        return null;
      })}
      <div ref={sentinelRef} className="h-1" aria-hidden />
    </div>
  );
}

// ─── Material Card ────────────────────────────────────────────────────────────

function MaterialCard({ item, onComplete, onPreviewFile, initiallyExpanded = false }: {
  item: CourseResourceItem; onComplete: (itemId: number) => void;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>; initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const cardRef = useRef<HTMLDivElement>(null);
  const typeInfo = getFileTypeLabel(item.type);

  const isPdf       = item.type === 'pdf';
  const isDoc       = item.type === 'document';
  const hasBlocks   = parseBlocks(item.text_content).length > 0;
  const isExpandable = hasBlocks || ((isPdf || isDoc) && !!onPreviewFile);

  useEffect(() => {
    if (initiallyExpanded && cardRef.current) {
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [initiallyExpanded]);

  // Locked item — render a greyed-out, non-interactive row
  if (item.is_locked) {
    return (
      <div ref={cardRef} className="rounded-xl border border-gray-100 bg-gray-50/50 mb-2 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 select-none">
          <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Lock size={14} className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 line-through truncate">{item.title}</p>
            {item.file_size && <p className="text-xs text-gray-300 mt-0.5">{item.file_size}</p>}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-300 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
            <Lock size={10} /> Locked
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className={`rounded-xl border mb-2 overflow-hidden transition-colors ${
      item.is_completed ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100 bg-white'
    }`}>
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
          isExpandable ? 'hover:bg-gray-50/70 cursor-pointer' : 'cursor-default'
        }`}
        onClick={() => isExpandable && setExpanded(e => !e)}
        disabled={!isExpandable}
      >
        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
          <span className={`text-[10px] font-bold tracking-wide ${typeInfo.text}`}>{typeInfo.label}</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-sm font-medium truncate ${item.is_completed ? 'text-gray-400' : 'text-gray-800'}`}>
            {item.title}
          </p>
          {item.file_size && <p className="text-xs text-gray-400 mt-0.5">{item.file_size}</p>}
          {!item.is_completed && isExpandable && (
            <p className="text-xs text-gray-400 mt-0.5">
              {isPdf ? 'Click to read PDF' : isDoc ? 'Click to view document' : 'Click to read'}
            </p>
          )}
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
          {isExpandable && (
            <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {expanded && isExpandable && (
        <div className="border-t border-gray-100">
          {isPdf && onPreviewFile && (
            <PdfViewer itemId={item.id} title={item.title} isCompleted={item.is_completed}
              onComplete={onComplete} onPreviewFile={onPreviewFile} />
          )}
          {isDoc && !isPdf && onPreviewFile && (
            <DocViewer itemId={item.id} title={item.title} isCompleted={item.is_completed}
              onComplete={onComplete} onPreviewFile={onPreviewFile} />
          )}
          {!isPdf && !isDoc && hasBlocks && (
            <div className="px-4 pb-4 pt-4">
              <TopicContent item={item} onComplete={onComplete} />
            </div>
          )}
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
  onPreviewFile,
  initialItemId,
  freemiumMeta,
  onEnrollClick,
  onPayNowClick,
}: {
  sprint: Sprint;
  onComplete: (itemId: number) => void;
  initiallyExpanded?: boolean;
  onPreviewFile?: (itemId: number, title: string) => Promise<string>;
  initialItemId?: number;
  freemiumMeta?: FreemiumMeta;
  onEnrollClick?: () => void;
  onPayNowClick?: () => void;
}) {
  const isLocked = !!sprint.is_locked;

  // Locked sprints get the paywall card instead of the regular accordion
  if (isLocked) {
    return (
      <LockedSprintPaywall
        sprint={sprint}
        freemiumMeta={freemiumMeta}
        onEnrollClick={onEnrollClick}
        onPayNowClick={onPayNowClick}
      />
    );
  }

  const containsInitialItem = initialItemId != null && sprint.items.some(i => i.id === initialItemId);
  const [expanded, setExpanded] = useState(initiallyExpanded || containsInitialItem);
  const sortedItems = sortItems(sprint.items);

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
            <p className="text-sm font-medium text-gray-800">
              {sprint.sprint_name}
              {freemiumMeta?.is_freemium && sprint.sprint_number <= (freemiumMeta?.free_sprint_limit ?? 0) && (
                <span className="ml-2 text-xs font-normal bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">
                  Free
                </span>
              )}
            </p>
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
          {sortedItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No materials in this sprint yet.
            </div>
          ) : sortedItems.map(item => (
            <MaterialCard key={item.id} item={item} onComplete={onComplete}
              onPreviewFile={onPreviewFile} initiallyExpanded={item.id === initialItemId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ResourcePreviewModal({
  url, title, onClose, sprints, initialItemId, onMarkComplete, onDownload,
  onPreviewFile, externalVideos, freemiumMeta, onEnrollClick, onPayNowClick,
}: ResourcePreviewModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (editorOpen) setEditorOpen(false); else onClose(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, editorOpen]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!initialItemId) {
      const saved = parseInt(localStorage.getItem('rp_modal_scroll') || '0', 10);
      if (saved) el.scrollTop = saved;
    }
    const onScroll = () => { try { localStorage.setItem('rp_modal_scroll', String(el.scrollTop)); } catch {} };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [initialItemId]);

  const handleAutoComplete = useCallback(async (itemId: number) => {
    if (onMarkComplete) await onMarkComplete(itemId, false);
  }, [onMarkComplete]);

  if (!url && !sprints) return null;

  // Simple single-file fallback
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

  // Locked sprint count for the upgrade banner
  const lockedCount = sprints?.filter(s => s.is_locked).length ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="flex items-end sm:items-stretch gap-3 w-full sm:w-auto"
        style={{ maxWidth: editorOpen ? 'calc(768px + 12px + 680px)' : '768px', width: '100%' }}
      >
        {/* ── Modal panel ─────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden flex-shrink-0"
          style={{ height: '95vh', width: '100%', maxWidth: '768px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0 bg-white">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Course Materials</h2>
              <p className="text-xs text-gray-400 mt-0.5">Progress tracked automatically as you read &amp; watch</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditorOpen(o => !o)}
                className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  editorOpen
                    ? 'bg-[#4A3AFF] text-white border-[#4A3AFF] shadow-md shadow-[#4A3AFF]/30'
                    : 'bg-[#f0eeff] text-[#4A3AFF] border-[#d4ceff] hover:bg-[#e5e0ff]'
                }`}
              >
                <Code2 size={13} />
                {editorOpen ? 'Close Editor' : 'Open Editor'}
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Freemium upgrade strip — shown inside modal when sprints are locked */}
          {lockedCount > 0 && freemiumMeta?.is_freemium && !freemiumMeta.user_has_access && (
            <div className="flex items-center justify-between px-5 py-2.5 bg-indigo-600 text-white flex-shrink-0">
              <p className="text-xs font-medium">
                {lockedCount} sprint{lockedCount > 1 ? 's' : ''} locked,  enroll to unlock everything
              </p>
              <button
                onClick={onPayNowClick ?? onEnrollClick}
                className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors ml-4 flex-shrink-0"
              >
                {onPayNowClick ? 'Pay Now' : 'Enroll'}
              </button>
            </div>
          )}

          {/* Scrollable content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-4 sm:px-5 py-5">
            {externalVideos && externalVideos.some(v => !toEmbedUrl(v.url)) && (
              <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Some videos can't be embedded and will open in a new tab:{' '}
                    {externalVideos.filter(v => !toEmbedUrl(v.url)).map(v => (
                      <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                        className="underline hover:text-amber-900 mr-1">{v.title}</a>
                    ))}
                  </span>
                </p>
              </div>
            )}

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
                    initiallyExpanded={initialItemId == null ? idx === 0 : false}
                    onPreviewFile={onPreviewFile}
                    initialItemId={initialItemId}
                    freemiumMeta={freemiumMeta}
                    onEnrollClick={onEnrollClick}
                    onPayNowClick={onPayNowClick}
                  />
                ))}
              </>
            )}

            {externalVideos && externalVideos.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">External Resources</p>
                <div className="space-y-3">
                  {externalVideos.map(v => {
                    const embed = toEmbedUrl(v.url);
                    if (embed) return (
                      <div key={v.id} className="rounded-xl overflow-hidden border border-gray-100">
                        <div className="relative" style={{ paddingBottom: '56.25%' }}>
                          <iframe src={embed} className="absolute inset-0 w-full h-full border-0"
                            allow="autoplay; fullscreen" allowFullScreen title={v.title} />
                        </div>
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-800">{v.title}</p>
                          {v.source && <p className="text-xs text-gray-400">{v.source}{v.duration ? ` · ${v.duration}` : ''}</p>}
                        </div>
                      </div>
                    );
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

            <div className="h-8" />
          </div>
        </div>

        {/* ── Code editor panel ────────────────────────────────────────── */}
        {editorOpen && <CodeEditorPanel onClose={() => setEditorOpen(false)} />}
      </div>
    </div>
  );
}