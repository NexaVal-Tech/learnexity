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
  return normalizeHref(trimmed);
}

/** Our own site — links to it are turned into same-site paths. */
const OWN_HOSTS = /^(www\.)?learnexity\.org$/i;

/**
 * Repairs common typos in admin-entered links so they never turn into
 * broken relative paths like /https/learnexity.org/...:
 *   "https//site.com/x", "https:/site.com/x", "https/site.com/x" → https://site.com/x
 *   "learnexity.org/x", "www.site.com/x"                         → https://… (or /x for our site)
 *   "https://learnexity.org/x"                                    → /x (opens in the same tab)
 */
export function normalizeHref(href: string): string {
  let h = href.trim();
  if (!h || h.startsWith('#') || (h.startsWith('/') && !h.startsWith('//')) || /^(mailto|tel):/i.test(h)) {
    return h;
  }
  // Broken scheme: "https//", "https:/", "https/", "http//" …
  h = h.replace(/^(https?)(?::\/{0,1}|\/{1,2}|:\/{3,})(?=[^/])/i, (_m, scheme) => `${scheme.toLowerCase()}://`);
  // Protocol-relative → https
  if (h.startsWith('//')) h = 'https:' + h;
  // Bare domain like "learnexity.org/blog" or "www.site.com"
  if (!/^[a-z][a-z0-9+.-]*:/i.test(h) && /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$|\?|#)/i.test(h)) {
    h = 'https://' + h;
  }
  // Same-site absolute URL → path
  const m = h.match(/^https?:\/\/([^/?#]+)(.*)$/i);
  if (m && OWN_HOSTS.test(m[1])) {
    const rest = m[2] || '/';
    return rest.startsWith('/') ? rest : '/' + rest;
  }
  return h;
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
