// lib/cms/url.ts — URL helpers shared by CMS rendering (SSR-safe, no DOM).

/** Blocks script URLs in admin-entered links; returns "#" for anything unsafe. */
export function safeHref(href: string | undefined | null): string {
  if (!href) return '#';
  const trimmed = href.trim();
  const compact = trimmed.replace(/[\x00-\x20]+/g, '').toLowerCase();
  if (
    compact.startsWith('javascript:') ||
    compact.startsWith('vbscript:') ||
    compact.startsWith('data:')
  ) {
    return '#';
  }
  return trimmed;
}

export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

/**
 * Whether next/image may optimize this src. Local /public files and the
 * production API host (listed in next.config remotePatterns) can be
 * optimized; any other absolute URL (e.g. http://localhost:8000 uploads in
 * development, or an external URL an admin pasted) is rendered unoptimized
 * so next/image doesn't throw on an unconfigured host.
 */
export function canOptimizeImage(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return !src.toLowerCase().endsWith('.svg');
  return /^https:\/\/api\.learnexity\.org\//i.test(src) && !/\.svg(\?|$)/i.test(src);
}

export function looksLikeVideo(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src || '');
}
