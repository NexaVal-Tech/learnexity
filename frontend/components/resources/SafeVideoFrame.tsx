// components/resources/SafeVideoFrame.tsx
//
// Plays course videos inside our own pages only — never sends students
// out to Google Drive (or YouTube/Vimeo/Loom) in a new tab.
//
//  - Google Drive links are turned into the /preview player.
//  - The iframe is sandboxed WITHOUT allow-popups / allow-top-navigation,
//    so the player's "Open in new window" / "Watch on YouTube" buttons
//    can't open anything outside the site.
//  - On Drive videos a transparent shield also covers the pop-out button
//    in the top-right corner of the player.
import React, { forwardRef } from "react";

export function toVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const u = url.trim();

  if (/drive\.google\.com|docs\.google\.com/i.test(u)) {
    const fileMatch = u.match(/\/file\/d\/([^/?#]+)/) || u.match(/[?&]id=([^&#]+)/) || u.match(/\/d\/([^/?#]+)/);
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    return u.includes("/preview") ? u : null;
  }

  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/#]+)/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?enablejsapi=1&rel=0&modestbranding=1`;

  const loom = u.match(/loom\.com\/(?:share|embed)\/([^?#/]+)/);
  if (loom) return `https://www.loom.com/embed/${loom[1]}?hide_share=true&hideEmbedTopBar=true`;

  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return u;
}

export const isDriveUrl = (url: string) => /drive\.google\.com|docs\.google\.com/i.test(url || "");

const isDirectVideoFile = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");

type Props = {
  url: string;
  title?: string;
  className?: string;
  /**
   * "ratio" (default): a 16:9 box that sizes itself from its width.
   * "fill": fills a parent that already has a size (the focused player).
   */
  layout?: "ratio" | "fill";
  autoPlay?: boolean;
  /** Direct video files only: fired when playback ends. */
  onEnded?: () => void;
};

/** Video player. Use the ref to reach the iframe (e.g. YouTube completion tracking). */
const SafeVideoFrame = forwardRef<HTMLIFrameElement, Props>(function SafeVideoFrame(
  { url, title, className = "", layout = "ratio", autoPlay = false, onEnded },
  ref
) {
  const boxStyle: React.CSSProperties | undefined = layout === "ratio" ? { paddingBottom: "56.25%" } : undefined;
  const boxClass = layout === "ratio" ? "relative" : "relative w-full h-full";

  if (isDirectVideoFile(url)) {
    return (
      <div className={`${boxClass} bg-black ${className}`} style={boxStyle}>
        <video
          key={url}
          src={url}
          controls
          controlsList="nodownload"
          playsInline
          autoPlay={autoPlay}
          preload="metadata"
          // object-contain: the whole picture is always visible (landscape or phone-recorded)
          className="absolute inset-0 w-full h-full object-contain"
          onContextMenu={(e) => e.preventDefault()}
          onEnded={onEnded}
        />
      </div>
    );
  }

  const baseEmbed = toVideoEmbedUrl(url);
  if (!baseEmbed) {
    return (
      <div className={`relative bg-gray-900 text-gray-300 text-sm flex items-center justify-center p-6 text-center ${className}`} style={layout === "ratio" ? { aspectRatio: "16 / 9" } : { width: "100%", height: "100%" }}>
        This video link can&apos;t be played here. Please ask your instructor to share it as a Google Drive file, YouTube, Vimeo or Loom link.
      </div>
    );
  }

  const drive = isDriveUrl(url);
  // Start playing straight away in the focused player (YouTube / Vimeo / Loom honour this).
  const embed = autoPlay && !drive ? `${baseEmbed}${baseEmbed.includes("?") ? "&" : "?"}autoplay=1` : baseEmbed;

  return (
    <div className={`${boxClass} bg-black ${className}`} style={boxStyle} onContextMenu={(e) => e.preventDefault()}>
      <iframe
        key={embed}
        ref={ref}
        src={embed}
        title={title || "Video"}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        // No allow-popups / allow-top-navigation: nothing inside the player
        // can open a new tab or navigate the page away.
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      {drive && (
        // Covers Drive's "open in new window" button (top-right).
        <div aria-hidden className="absolute top-0 right-0 w-16 h-14 z-10" style={{ background: "transparent" }} />
      )}
    </div>
  );
});

export default SafeVideoFrame;
