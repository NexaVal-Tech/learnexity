// lib/sanitizeHtml.ts
//
// Lightweight allowlist HTML sanitizer for rendering admin/instructor-authored
// rich text (course material) via dangerouslySetInnerHTML.
//
// Why hand-rolled instead of DOMPurify: this sandbox couldn't complete an
// `npm install` (no network access to the registry), so pulling in a new
// dependency here would leave the project in a broken state until someone
// runs `npm install` anyway. This sanitizer covers the real threat model for
// this app — a compromised/malicious admin or instructor account injecting
// <script>, event-handler attributes, or javascript: URLs into course
// material that every enrolled student's browser then executes — using only
// the browser's own DOMParser, so no install step is required.
//
// If you later add DOMPurify (`npm install dompurify`), swap the body of
// sanitizeHtml() for `DOMPurify.sanitize(html)` — the call site doesn't
// change.

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'div',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'hr', 'img',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'width', 'height']),
};

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('#')
  );
}

function sanitizeNode(node: Element): void {
  // Walk children back-to-front so removing a node doesn't skip its sibling.
  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i];
    const tag = child.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      child.remove();
      continue;
    }

    // Strip every attribute except an explicit per-tag allowlist — this is
    // what removes onclick=, onerror=, style=, class=, etc.
    const allowed = ALLOWED_ATTRS[tag];
    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase();
      if (!allowed || !allowed.has(name)) {
        child.removeAttribute(attr.name);
        continue;
      }
      if ((name === 'href' || name === 'src') && !isSafeUrl(attr.value)) {
        child.removeAttribute(attr.name);
      }
    }

    if (tag === 'a') {
      child.setAttribute('target', '_blank');
      child.setAttribute('rel', 'noopener noreferrer nofollow');
    }

    sanitizeNode(child);
  }
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Server-side (or any environment without DOMParser): fail closed by
  // stripping all tags rather than risking unsanitized markup reaching
  // the client unfiltered.
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  } catch {
    return '';
  }
}
