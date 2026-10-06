// components/resources/VideoTheater.tsx
//
// Focused video player for course materials: the video is shown large on a
// dark background and fitted to the screen, so the whole picture is always
// visible (landscape or phone-recorded). Previous / Next move through every
// video in the course, in order across sprints (keyboard ← → too, Esc closes).
import React, { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ListVideo, X } from "lucide-react";
import SafeVideoFrame from "./SafeVideoFrame";

export interface PlaylistVideo {
  /** Unique within the playlist, e.g. "item-12-0" or "ext-4". */
  key: string;
  title: string;
  url: string;
  /** e.g. "Sprint 2 · Building agents" or "Video tutorial". */
  group: string;
  /** Material item to mark complete when watched (sprint videos only). */
  itemId?: number;
}

type ContentBlock = { type: string; content: string };

function parseBlocks(raw: string | null | undefined): ContentBlock[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((b) => b && b.type && b.content !== undefined) : [];
  } catch {
    return [];
  }
}

/** Every video in the course, in the order students see it. */
export function buildVideoPlaylist(
  sprints: { id: number; sprint_number: number; sprint_name: string; locked?: boolean; items: any[] }[] | undefined | null,
  externalVideos?: { id: number; title: string; url: string; source?: string }[] | null
): PlaylistVideo[] {
  const list: PlaylistVideo[] = [];
  (sprints ?? []).forEach((sprint, si) => {
    if (sprint.locked) return;
    const items = [...(sprint.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
    items.forEach((item) => {
      if (item.locked) return;
      const videos = parseBlocks(item.text_content).filter((b) => b.type === "video" && String(b.content || "").trim());
      videos.forEach((b, vi) => {
        list.push({
          key: `item-${item.id}-${vi}`,
          title: videos.length > 1 ? `${item.title} (part ${vi + 1})` : item.title,
          url: String(b.content).trim(),
          group: `Sprint ${sprint.sprint_number ?? si + 1} · ${sprint.sprint_name}`,
          itemId: item.id,
        });
      });
      if (!videos.length && item.video_url) {
        list.push({ key: `item-${item.id}-v`, title: item.title, url: item.video_url, group: `Sprint ${sprint.sprint_number ?? si + 1} · ${sprint.sprint_name}`, itemId: item.id });
      }
    });
  });
  (externalVideos ?? []).forEach((v) => {
    if (v?.url) list.push({ key: `ext-${v.id}`, title: v.title, url: v.url, group: v.source ? `Video tutorial · ${v.source}` : "Video tutorial" });
  });
  return list;
}

export default function VideoTheater({
  playlist,
  index,
  onIndexChange,
  onClose,
  onWatched,
}: {
  playlist: PlaylistVideo[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  /** Called for sprint videos once watched (moving on with Next, or the video ending). */
  onWatched?: (itemId: number) => void;
}) {
  const video = playlist[index];
  const hasPrev = index > 0;
  const hasNext = index < playlist.length - 1;
  const watchedRef = useRef<Set<string>>(new Set());

  const markWatched = useCallback(() => {
    if (!video?.itemId || watchedRef.current.has(video.key)) return;
    watchedRef.current.add(video.key);
    onWatched?.(video.itemId);
  }, [video, onWatched]);

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = index + dir;
      if (next < 0 || next >= playlist.length) return;
      if (dir === 1) markWatched();
      onIndexChange(next);
    },
    [index, playlist.length, onIndexChange, markWatched]
  );

  // Keyboard: ← → to move, Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // YouTube tells us when a video ends.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d?.event === "onStateChange" && d?.info === 0) markWatched();
      } catch {}
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [markWatched]);

  // Lock page scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!video) return null;

  const navBtn =
    "inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-[80] bg-[#06060a] text-white flex flex-col" role="dialog" aria-modal="true" aria-label={video.title}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b border-white/10 flex-shrink-0">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10" aria-label="Back to materials">
          <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 truncate">{video.group}</p>
          <h2 className="text-sm sm:text-base font-semibold truncate">{video.title}</h2>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
          <ListVideo size={15} /> Video {index + 1} of {playlist.length}
        </span>
        <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* Stage: the video is fitted inside this area, never cropped */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-6">
        <div
          className="relative rounded-xl overflow-hidden bg-black shadow-2xl"
          style={{
            width: "100%",
            // Largest 16:9 box that fits both the width and the height.
            maxWidth: "calc((100dvh - 10.5rem) * 16 / 9)",
            aspectRatio: "16 / 9",
          }}
        >
          <SafeVideoFrame key={video.key} url={video.url} title={video.title} layout="fill" autoPlay onEnded={markWatched} />
        </div>
      </div>

      {/* Previous / Next */}
      <div className="flex items-center gap-3 px-3 sm:px-6 py-3 border-t border-white/10 flex-shrink-0">
        <button onClick={() => go(-1)} disabled={!hasPrev} className={`${navBtn} border border-white/20 text-white hover:bg-white/10`}>
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="flex-1 min-w-0 text-center">
          <p className="sm:hidden text-xs text-gray-400">Video {index + 1} of {playlist.length}</p>
          {hasNext && <p className="hidden sm:block text-xs text-gray-400 truncate">Up next: {playlist[index + 1].title}</p>}
          {!hasNext && <p className="hidden sm:block text-xs text-gray-400">That&apos;s the last video in this course.</p>}
        </div>
        <button onClick={() => go(1)} disabled={!hasNext} className={`${navBtn} bg-[#4A3AFF] hover:bg-[#3a2ae6] text-white`}>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
