// components/resources/VideoTheater.tsx
//
// Focused, mobile-first video player for course materials.
//  - The video is always fitted to the screen (portrait or landscape, any
//    size) — measured live, so rotating the phone re-fits it instantly.
//  - On a phone turned sideways the bars float over the video and fade
//    away, so the video uses the whole screen.
//  - Full screen button (rotates to landscape on Android; iPhone uses the
//    video's own full screen for uploaded videos).
//  - Double-tap left / right to skip 10s (uploaded videos + YouTube).
//  - When a video ends, the next one starts after a 5-second countdown
//    (Play now / Cancel). Previous / Next move through every video in the
//    course, across sprints.
//  - Keyboard: ← → skip 10s, Space / K play-pause, F full screen,
//    N / P (or Shift + → / ←) next / previous, Esc closes.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, ListVideo, Maximize, Minimize, Play, X } from "lucide-react";
import SmartPlayer, { canSeek, videoKind, type SmartPlayerHandle } from "./SmartPlayer";

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

const COUNTDOWN = 5;

type FsDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

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
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<SmartPlayerHandle>(null);

  const [aspect, setAspect] = useState(16 / 9);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [compact, setCompact] = useState(false); // phone held sideways
  const [chrome, setChrome] = useState(true); // bars visible (compact mode)
  const [countdown, setCountdown] = useState<number | null>(null);
  const chromeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Watched / navigation ──────────────────────────────────────────────
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
      setCountdown(null);
      onIndexChange(next);
    },
    [index, playlist.length, onIndexChange, markWatched]
  );

  const handleEnded = useCallback(() => {
    markWatched();
    if (hasNext) setCountdown(COUNTDOWN);
  }, [markWatched, hasNext]);

  // New video → reset per-video state.
  useEffect(() => {
    setAspect(16 / 9);
    setCountdown(null);
  }, [video?.key]);

  // Auto-next countdown.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { go(1); return; }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, go]);

  // ── Fit the video to the available space (re-fits on rotate/resize) ───
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (!W || !H) return;
      const w = Math.min(W, H * aspect);
      setBox({ w: Math.floor(w), h: Math.floor(w / aspect) });
      setCompact(window.innerWidth > window.innerHeight && window.innerHeight < 560);
    };
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, [aspect, compact, fullscreen]);

  // ── Bars: always visible normally; float + auto-hide when sideways/full screen ──
  const immersive = compact || fullscreen;
  const showChrome = useCallback(() => {
    setChrome(true);
    if (chromeTimer.current) clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setChrome(false), 3000);
  }, []);
  useEffect(() => {
    if (immersive) showChrome();
    else setChrome(true);
    return () => { if (chromeTimer.current) clearTimeout(chromeTimer.current); };
  }, [immersive, showChrome, video?.key]);

  // ── Full screen (+ landscape lock where the browser allows it) ─────────
  const canElementFullscreen = typeof document !== "undefined" && !!(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled);

  useEffect(() => {
    const onFs = () => {
      const d = document as FsDoc;
      const on = !!(d.fullscreenElement || d.webkitFullscreenElement);
      setFullscreen(on);
      if (!on) {
        try { (screen.orientation as any)?.unlock?.(); } catch { /* not supported */ }
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs as EventListener);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const d = document as FsDoc;
    const root = rootRef.current as FsEl | null;
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      try { await (d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.()); } catch { /* ignore */ }
      return;
    }
    if (root && (root.requestFullscreen || root.webkitRequestFullscreen)) {
      try {
        await (root.requestFullscreen ? root.requestFullscreen({ navigationUI: "hide" } as FullscreenOptions) : root.webkitRequestFullscreen?.());
        if (aspect >= 1) await (screen.orientation as any)?.lock?.("landscape").catch(() => {});
      } catch { /* user / browser refused */ }
      return;
    }
    // iPhone: only the video element itself can go full screen.
    playerRef.current?.enterNativeFullscreen();
  }, [aspect]);

  const fsAvailable = canElementFullscreen || (video ? videoKind(video.url) === "file" : false);

  // Leave full screen when the player closes.
  useEffect(() => () => {
    const d = document as FsDoc;
    if (d.fullscreenElement || d.webkitFullscreenElement) {
      try { d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.(); } catch { /* ignore */ }
    }
  }, []);

  // ── Keyboard: N/P or Shift+arrows move; Esc closes (player handles ←/→/space) ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        const d = document as FsDoc;
        if (!(d.fullscreenElement || d.webkitFullscreenElement)) onClose();
        return;
      }
      if (k === "n" || (e.shiftKey && k === "arrowright")) { e.preventDefault(); go(1); }
      else if (k === "p" || (e.shiftKey && k === "arrowleft")) { e.preventDefault(); go(-1); }
      else if (!canSeek(video?.url || "") && (k === "arrowright" || k === "arrowleft")) {
        // Drive/Loom/etc. can't be skipped inside — arrows move between videos instead.
        e.preventDefault();
        go(k === "arrowright" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, video?.url]);

  // Lock page scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!video) return null;

  const seekable = canSeek(video.url);
  const navBtn =
    "inline-flex items-center justify-center gap-2 px-4 sm:px-5 min-h-[44px] rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const barFade = immersive ? `transition-opacity duration-300 ${chrome ? "opacity-100" : "opacity-0 pointer-events-none"}` : "";

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] bg-black text-white flex flex-col"
      style={{ height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onPointerDown={immersive ? showChrome : undefined}
    >
      {/* Top bar */}
      <div
        className={`${immersive ? "absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-black/85 to-transparent pb-6" : "relative border-b border-white/10 bg-[#06060a]"} ${barFade} flex items-center gap-2 sm:gap-3 px-2 sm:px-5 flex-shrink-0`}
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))", paddingLeft: "max(0.5rem, env(safe-area-inset-left))", paddingRight: "max(0.5rem, env(safe-area-inset-right))" }}
      >
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-2.5 min-h-[44px] rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/10" aria-label="Back to materials">
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="min-w-0 flex-1 py-2">
          <p className="text-[11px] sm:text-xs text-gray-400 truncate">{video.group}</p>
          <h2 className="text-sm sm:text-base font-semibold truncate">{video.title}</h2>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
          <ListVideo size={15} /> Video {index + 1} of {playlist.length}
        </span>
        {immersive && (
          <>
            <button onClick={() => go(-1)} disabled={!hasPrev} className="p-2.5 rounded-lg text-gray-200 hover:bg-white/10 disabled:opacity-30" aria-label="Previous video">
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => go(1)} disabled={!hasNext} className="p-2.5 rounded-lg bg-[#4A3AFF] text-white hover:bg-[#3a2ae6] disabled:opacity-30" aria-label="Next video">
              <ChevronRight size={22} />
            </button>
          </>
        )}
        {fsAvailable && (
          <button onClick={toggleFullscreen} className="p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10" aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
            {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        )}
        <button onClick={onClose} className="p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10" aria-label="Close">
          <X size={20} />
        </button>
      </div>

      {/* Stage: the video is fitted inside, never cropped */}
      <div ref={stageRef} className={`relative flex-1 min-h-0 flex items-center justify-center ${immersive ? "p-0" : "p-0 sm:p-4"}`}>
        <div
          className={`relative bg-black overflow-hidden ${immersive ? "" : "sm:rounded-xl sm:shadow-2xl"}`}
          style={{ width: box.w || "100%", height: box.h || "auto", aspectRatio: box.w ? undefined : "16 / 9" }}
        >
          <SmartPlayer
            ref={playerRef}
            key={video.key}
            url={video.url}
            title={video.title}
            autoPlay
            keyboard
            onEnded={handleEnded}
            onAspect={(r) => { if (r > 0.3 && r < 4) setAspect(r); }}
            isFullscreen={fullscreen}
            onToggleFullscreen={fsAvailable ? toggleFullscreen : undefined}
            onActivity={immersive ? showChrome : undefined}
          />
        </div>

          {/* Up next countdown (covers the whole stage, so it fits portrait videos too) */}
          {countdown !== null && hasNext && (
            <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm text-center">
                <p className="text-xs uppercase tracking-wider text-gray-400">Up next in {Math.max(0, countdown)}s</p>
                <p className="mt-1 text-base sm:text-lg font-semibold line-clamp-2">{playlist[index + 1].title}</p>
                <p className="text-xs text-gray-400 truncate">{playlist[index + 1].group}</p>
                <div className="mt-3 h-1 w-full rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-[#4A3AFF] transition-[width] duration-1000 ease-linear" style={{ width: `${((COUNTDOWN - Math.max(0, countdown)) / COUNTDOWN) * 100}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button onClick={() => setCountdown(null)} className="min-h-[44px] px-5 rounded-xl border border-white/25 text-sm font-semibold hover:bg-white/10">Cancel</button>
                  <button onClick={() => go(1)} className="min-h-[44px] px-5 rounded-xl bg-[#4A3AFF] text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#3a2ae6]">
                    <Play size={16} fill="currentColor" /> Play now
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Previous / Next (sideways / full screen: these move into the top bar) */}
      {!immersive && (
      <div
        className="relative border-t border-white/10 bg-[#06060a] flex items-center gap-3 px-3 sm:px-6 py-2 flex-shrink-0"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))", paddingLeft: "max(0.75rem, env(safe-area-inset-left))", paddingRight: "max(0.75rem, env(safe-area-inset-right))" }}
      >
        <button onClick={() => go(-1)} disabled={!hasPrev} className={`${navBtn} border border-white/20 text-white hover:bg-white/10`} aria-label="Previous video">
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs text-gray-300">Video {index + 1} of {playlist.length}</p>
          <p className="hidden sm:block text-[11px] text-gray-500 truncate">
            {hasNext ? `Up next: ${playlist[index + 1].title}` : "That's the last video in this course."}
            {seekable ? " · Double-tap left/right to skip 10s" : ""}
          </p>
        </div>
        <button onClick={() => go(1)} disabled={!hasNext} className={`${navBtn} bg-[#4A3AFF] hover:bg-[#3a2ae6] text-white`} aria-label="Next video">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
      )}
    </div>
  );
}
