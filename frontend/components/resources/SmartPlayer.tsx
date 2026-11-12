// components/resources/SmartPlayer.tsx
//
// Mobile-first course video player used by the focused player (VideoTheater).
//
//  - Uploaded video files (mp4/webm/mov): our own player — tap to show the
//    controls, double-tap the left / right side to skip back / forward 10s
//    (keep tapping to skip more), speed, seek bar, full screen.
//  - YouTube: double-tap left / right to skip 10s, tap to pause / play, and
//    we're told when it ends (auto-next).
//  - Vimeo: we're told when it ends (auto-next).
//  - Google Drive / Loom / others: their own player (they can't be
//    controlled from our page), fitted to the screen.
//
// Nothing here opens new tabs or leaves the site (see SafeVideoFrame).
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Loader2, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import SafeVideoFrame, { toVideoEmbedUrl } from "./SafeVideoFrame";

export type VideoKind = "file" | "youtube" | "vimeo" | "other";

export function videoKind(url: string): VideoKind {
  const u = (url || "").trim();
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u)) return "file";
  if (/(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(u)) return "youtube";
  if (/vimeo\.com\/(video\/)?\d+/i.test(u)) return "vimeo";
  return "other";
}

/** Whether double-tap seeking works for this video. */
export const canSeek = (url: string) => {
  const k = videoKind(url);
  return k === "file" || k === "youtube";
};

export interface SmartPlayerHandle {
  /** iPhone: element full screen isn't available, but the video element's own is. */
  enterNativeFullscreen: () => boolean;
}

interface Props {
  url: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  /** Real shape of an uploaded video (width / height), so the stage can fit it. */
  onAspect?: (ratio: number) => void;
  /** Theater full screen state + toggle (shown in our control bar). */
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Respond to keyboard shortcuts (space, ← →, J / K / L, F, M). */
  keyboard?: boolean;
  /** Called on any tap / interaction (the theater uses it to show its bars). */
  onActivity?: () => void;
}

const SEEK = 10;
const DOUBLE_TAP_MS = 300;
const TAP_CHAIN_MS = 650;

const fmt = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};

// ─── Double-tap gesture (shared by file + YouTube players) ─────────────────────

type Side = "left" | "center" | "right";
type Ripple = { side: "left" | "right"; amount: number; key: number } | null;

function useTapGestures(opts: { onSingle: (side: Side, pointer: string) => void; onSeek: (delta: number) => void; enabled: boolean }) {
  const last = useRef<{ t: number; side: Side }>({ t: 0, side: "center" });
  const chain = useRef<{ until: number; side: Side }>({ until: 0, side: "center" });
  const single = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ripple, setRipple] = useState<Ripple>(null);
  const rippleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const showRipple = (side: "left" | "right") => {
    setRipple((r) => ({ side, amount: r && r.side === side ? r.amount + SEEK : SEEK, key: Date.now() }));
    if (rippleTimer.current) clearTimeout(rippleTimer.current);
    rippleTimer.current = setTimeout(() => setRipple(null), 700);
  };

  useEffect(() => () => {
    if (single.current) clearTimeout(single.current);
    if (rippleTimer.current) clearTimeout(rippleTimer.current);
  }, []);

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!optsRef.current.enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const side: Side = x < rect.width * 0.38 ? "left" : x > rect.width * 0.62 ? "right" : "center";
    const now = Date.now();

    const seekSide = (s: "left" | "right") => {
      if (single.current) { clearTimeout(single.current); single.current = null; }
      optsRef.current.onSeek(s === "left" ? -SEEK : SEEK);
      showRipple(s);
      chain.current = { until: now + TAP_CHAIN_MS, side: s };
    };

    // Already skipping: every further tap on that side skips again.
    if (side !== "center" && chain.current.until > now && chain.current.side === side) {
      last.current = { t: now, side };
      seekSide(side);
      return;
    }
    // Second tap on the same side → skip.
    if (side !== "center" && now - last.current.t < DOUBLE_TAP_MS && last.current.side === side) {
      last.current = { t: 0, side };
      seekSide(side);
      return;
    }
    last.current = { t: now, side };
    if (single.current) clearTimeout(single.current);
    const pointer = e.pointerType;
    // Mouse clicks act straight away; touch waits to see if a second tap follows.
    const delay = pointer === "mouse" && side === "center" ? 0 : DOUBLE_TAP_MS;
    single.current = setTimeout(() => {
      single.current = null;
      optsRef.current.onSingle(side, pointer);
    }, delay);
  };

  return { onPointerUp, ripple };
}

function RippleBadge({ ripple }: { ripple: Ripple }) {
  if (!ripple) return null;
  const left = ripple.side === "left";
  return (
    <div
      key={ripple.key}
      className={`pointer-events-none absolute top-0 bottom-0 ${left ? "left-0 rounded-r-[50%]" : "right-0 rounded-l-[50%]"} w-[38%] flex items-center justify-center bg-white/10 animate-[lxfade_.7s_ease-out_forwards]`}
    >
      <div className="flex flex-col items-center gap-1 text-white drop-shadow">
        {left ? <RotateCcw size={28} /> : <RotateCw size={28} />}
        <span className="text-sm font-semibold">{left ? "−" : "+"}{ripple.amount}s</span>
      </div>
    </div>
  );
}

const KEYFRAMES = `@keyframes lxfade{0%{opacity:1}70%{opacity:1}100%{opacity:0}}`;

// ─── Uploaded video files ──────────────────────────────────────────────────────

const FilePlayer = forwardRef<SmartPlayerHandle, Props>(function FilePlayer(
  { url, title, autoPlay, onEnded, onAspect, isFullscreen, onToggleFullscreen, keyboard, onActivity },
  ref
) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waiting, setWaiting] = useState(true);
  const [controls, setControls] = useState(true);
  const [rate, setRate] = useState(1);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    enterNativeFullscreen: () => {
      const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      if (v?.webkitEnterFullscreen) { v.webkitEnterFullscreen(); return true; }
      return false;
    },
  }));

  const bumpControls = useCallback(() => {
    setControls(true);
    onActivity?.();
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (video.current && !video.current.paused) setControls(false);
    }, 2800);
  }, [onActivity]);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const togglePlay = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    bumpControls();
  }, [bumpControls]);

  const seekBy = useCallback((d: number) => {
    const v = video.current;
    if (!v) return;
    const max = Number.isFinite(v.duration) ? v.duration : v.currentTime + d;
    v.currentTime = Math.max(0, Math.min(max - 0.1, v.currentTime + d));
    setTime(v.currentTime);
  }, []);

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const next = rates[(rates.indexOf(rate) + 1) % rates.length];
    setRate(next);
    if (video.current) video.current.playbackRate = next;
    bumpControls();
  };

  const { onPointerUp, ripple } = useTapGestures({
    enabled: true,
    onSeek: (d) => { seekBy(d); onActivity?.(); },
    onSingle: (side, pointer) => {
      if (pointer === "mouse") togglePlay();
      else if (controls && playing) { setControls(false); }
      else bumpControls();
    },
  });

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") { e.preventDefault(); togglePlay(); }
      else if (k === "arrowleft" || k === "j") { e.preventDefault(); seekBy(-SEEK); bumpControls(); }
      else if (k === "arrowright" || k === "l") { e.preventDefault(); seekBy(SEEK); bumpControls(); }
      else if (k === "f") { e.preventDefault(); onToggleFullscreen?.(); }
      else if (k === "m" && video.current) { video.current.muted = !video.current.muted; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, togglePlay, seekBy, bumpControls, onToggleFullscreen]);

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="absolute inset-0 bg-black select-none" onContextMenu={(e) => e.preventDefault()}>
      <style>{KEYFRAMES}</style>
      <video
        ref={video}
        key={url}
        src={url}
        title={title}
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture={false}
        className="absolute inset-0 w-full h-full object-contain"
        onPlay={() => { setPlaying(true); bumpControls(); }}
        onPause={() => { setPlaying(false); setControls(true); }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDuration(v.duration);
          v.playbackRate = rate;
          if (v.videoWidth && v.videoHeight) onAspect?.(v.videoWidth / v.videoHeight);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onWaiting={() => setWaiting(true)}
        onCanPlay={() => setWaiting(false)}
        onPlaying={() => setWaiting(false)}
        onEnded={() => { setPlaying(false); setControls(true); onEnded?.(); }}
      />

      {/* Gesture layer */}
      <div className="absolute inset-0" style={{ touchAction: "manipulation" }} onPointerUp={onPointerUp} onPointerMove={(e) => { if (e.pointerType === "mouse") bumpControls(); }} />
      <RippleBadge ripple={ripple} />

      {waiting && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-white/80" />
        </div>
      )}

      {/* Controls */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${controls ? "opacity-100" : "opacity-0"}`}>
        {/* Centre: back 10 · play/pause · forward 10 */}
        {!waiting && (
          <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-14">
            <button type="button" aria-label="Back 10 seconds" onClick={() => { seekBy(-SEEK); bumpControls(); }} className={`${controls ? "pointer-events-auto" : ""} w-12 h-12 rounded-full bg-black/45 text-white flex items-center justify-center`}>
              <RotateCcw size={22} />
            </button>
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={togglePlay} className={`${controls ? "pointer-events-auto" : ""} w-16 h-16 rounded-full bg-[#4A3AFF] text-white flex items-center justify-center shadow-xl`}>
              {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button type="button" aria-label="Forward 10 seconds" onClick={() => { seekBy(SEEK); bumpControls(); }} className={`${controls ? "pointer-events-auto" : ""} w-12 h-12 rounded-full bg-black/45 text-white flex items-center justify-center`}>
              <RotateCw size={22} />
            </button>
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute inset-x-0 bottom-0 px-3 sm:px-4 pb-2 pt-8 bg-gradient-to-t from-black/85 to-transparent">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(time, duration || 0)}
            aria-label="Seek"
            onChange={(e) => { const v = video.current; if (v) { v.currentTime = Number(e.target.value); setTime(v.currentTime); } bumpControls(); }}
            className={`${controls ? "pointer-events-auto" : ""} w-full h-6 cursor-pointer accent-[#4A3AFF]`}
            style={{ background: "transparent" }}
          />
          <div className="flex items-center gap-3 text-white text-xs sm:text-sm">
            <span className="tabular-nums">{fmt(time)} / {fmt(duration)}</span>
            <span className="flex-1" />
            <button type="button" onClick={cycleRate} className={`${controls ? "pointer-events-auto" : ""} px-2 py-1 rounded-md bg-white/15 font-semibold min-w-[3rem]`} aria-label="Playback speed">
              {rate}x
            </button>
            {onToggleFullscreen && (
              <button type="button" onClick={onToggleFullscreen} className={`${controls ? "pointer-events-auto" : ""} p-1.5 rounded-md hover:bg-white/15`} aria-label={isFullscreen ? "Exit full screen" : "Full screen"}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            )}
          </div>
          <div className="sr-only" aria-live="polite">{Math.round(pct)}% played</div>
        </div>
      </div>
    </div>
  );
});

// ─── YouTube ───────────────────────────────────────────────────────────────────

function YouTubePlayer({ url, title, autoPlay, onEnded, keyboard, onActivity }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const time = useRef(0);
  const [state, setState] = useState<number>(-1); // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering
  const started = useRef(false);
  const [flash, setFlash] = useState<{ icon: "play" | "pause"; key: number } | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const base = toVideoEmbedUrl(url) || "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const src = `${base}${base.includes("?") ? "&" : "?"}playsinline=1&fs=1${autoPlay ? "&autoplay=1" : ""}${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`;

  const send = useCallback((func: string, args: unknown[] = []) => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);

  const listen = useCallback(() => {
    // Ask the player to report its state and time.
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
  }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      let host = "";
      try { host = new URL(e.origin).hostname; } catch { return; }
      if (!/(^|\.)youtube(-nocookie)?\.com$/i.test(host)) return;
      let d: any;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (d?.event === "onReady") listen();
      const info = d?.info;
      if (d?.event === "infoDelivery" && info && typeof info === "object") {
        if (typeof info.currentTime === "number") time.current = info.currentTime;
        if (typeof info.playerState === "number") {
          setState(info.playerState);
          if (info.playerState === 1) started.current = true;
          if (info.playerState === 0) onEndedRef.current?.();
        }
      }
      if (d?.event === "onStateChange" && typeof info === "number") {
        setState(info);
        if (info === 1) started.current = true;
        if (info === 0) onEndedRef.current?.();
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [listen]);

  const seekBy = useCallback((d: number) => {
    const t = Math.max(0, time.current + d);
    time.current = t;
    send("seekTo", [t, true]);
  }, [send]);

  const toggle = useCallback(() => {
    if (state === 1) { send("pauseVideo"); setFlash({ icon: "pause", key: Date.now() }); }
    else { send("playVideo"); setFlash({ icon: "play", key: Date.now() }); }
  }, [state, send]);

  const { onPointerUp, ripple } = useTapGestures({
    enabled: true,
    onSeek: (d) => { seekBy(d); onActivity?.(); },
    onSingle: () => { toggle(); onActivity?.(); },
  });

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "j") { e.preventDefault(); seekBy(-SEEK); }
      else if (k === "arrowright" || k === "l") { e.preventDefault(); seekBy(SEEK); }
      else if (k === " " || k === "k") { e.preventDefault(); toggle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, seekBy, toggle]);

  // The gesture layer is only added once the video has started, so the
  // first tap always reaches YouTube's own play button (needed on iPhone).
  const overlay = started.current && state !== 0;

  return (
    <div className="absolute inset-0 bg-black" onContextMenu={(e) => e.preventDefault()}>
      <style>{KEYFRAMES}</style>
      <iframe
        ref={frame}
        key={src}
        src={src}
        title={title || "Video"}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={listen}
      />
      {overlay && (
        // Leaves the bottom strip free for YouTube's own controls bar.
        <div className="absolute inset-x-0 top-0 bottom-14" style={{ touchAction: "manipulation" }} onPointerUp={onPointerUp} />
      )}
      <RippleBadge ripple={ripple} />
      {flash && (
        <div key={flash.key} className="pointer-events-none absolute inset-0 flex items-center justify-center animate-[lxfade_.6s_ease-out_forwards]">
          <span className="w-16 h-16 rounded-full bg-black/55 text-white flex items-center justify-center">
            {flash.icon === "pause" ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Vimeo (end detection only) ────────────────────────────────────────────────

function VimeoPlayer({ url, title, autoPlay, onEnded }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const base = toVideoEmbedUrl(url) || "";
  const src = `${base}${base.includes("?") ? "&" : "?"}playsinline=1${autoPlay ? "&autoplay=1" : ""}`;

  useEffect(() => {
    const post = (msg: object) => frame.current?.contentWindow?.postMessage(JSON.stringify(msg), "https://player.vimeo.com");
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== "https://player.vimeo.com" || !frame.current || e.source !== frame.current.contentWindow) return;
      let d: any;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (d?.event === "ready") post({ method: "addEventListener", value: "finish" });
      if (d?.event === "finish") onEndedRef.current?.();
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <div className="absolute inset-0 bg-black" onContextMenu={(e) => e.preventDefault()}>
      <iframe
        ref={frame}
        key={src}
        src={src}
        title={title || "Video"}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

// ─── Entry ─────────────────────────────────────────────────────────────────────

const SmartPlayer = forwardRef<SmartPlayerHandle, Props>(function SmartPlayer(props, ref) {
  const kind = videoKind(props.url);
  const inner = useRef<SmartPlayerHandle>(null);
  useImperativeHandle(ref, () => ({ enterNativeFullscreen: () => inner.current?.enterNativeFullscreen() ?? false }), []);

  if (kind === "file") return <FilePlayer ref={inner} {...props} />;
  if (kind === "youtube") return <YouTubePlayer {...props} />;
  if (kind === "vimeo") return <VimeoPlayer {...props} />;
  return <SafeVideoFrame url={props.url} title={props.title} layout="fill" autoPlay={props.autoPlay} />;
});

export default SmartPlayer;
