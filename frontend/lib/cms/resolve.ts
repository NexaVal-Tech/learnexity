// lib/cms/resolve.ts
//
// Turning stored page data into what the renderer needs. Imports the block
// registry, so it's for getStaticProps and the admin editor only.
import { BLOCKS } from "./blocks";
import { SYSTEM_PAGES } from "./pages";
import type { CmsPage, CmsSection } from "./types";

/** Short random id for a new section (unique enough within one page). */
export function newSectionId(): string {
  return `s${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Deep copy of plain JSON data (defaults must never be mutated by the editor). */
export function clone<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

/**
 * Fill each section's data with its block defaults (top-level keys only —
 * lists are replaced wholesale, never merged item-by-item, so deleting a
 * list item actually deletes it). Keeps rendering stable when a block
 * gains new fields after content was saved.
 */
export function resolveSections(sections: CmsSection[] | null | undefined): CmsSection[] {
  return (sections ?? [])
    .filter((s) => s && typeof s.type === "string")
    .map((s, i) => {
      const def = BLOCKS[s.type];
      return {
        id: s.id || `sec-${i}`,
        type: s.type,
        hidden: !!s.hidden,
        ...(s.anchor ? { anchor: s.anchor } : {}),
        data: def ? { ...clone(def.defaults), ...(s.data ?? {}) } : s.data ?? {},
      };
    });
}

/** The default content of a built-in page, exactly as the site shipped. */
export function defaultPage(slug: string): CmsPage | null {
  const def = SYSTEM_PAGES[slug];
  if (!def) return null;
  return {
    slug,
    title: def.title,
    is_system: true,
    is_published: true,
    path: def.path,
    seo: { ...def.seo },
    sections: def.sections.map((s, i) => ({
      id: `d${i}-${s.type.replace(/[^a-z0-9]+/gi, "-")}`,
      type: s.type,
      hidden: false,
      ...(s.anchor ? { anchor: s.anchor } : {}),
      data: clone(s.data ?? BLOCKS[s.type]?.defaults ?? {}),
    })),
    updated_at: null,
  };
}

/** Saved page (if any) merged with defaults, ready to render. */
export function resolvePage(slug: string, saved: CmsPage | null): CmsPage | null {
  const def = SYSTEM_PAGES[slug];
  let base = saved ?? defaultPage(slug);
  if (!base) return null;

  // A built-in page must never render (or open in the editor) blank just
  // because its saved row has no usable sections — e.g. a row left over
  // from an older cms_pages table, or content in a format we don't know.
  // Fall back to the page's original sections. (To remove a section from
  // a built-in page, hide it rather than deleting every section.)
  if (def && saved) {
    const usable = (Array.isArray(saved.sections) ? saved.sections : []).filter((s) => s && BLOCKS[s?.type]);
    if (usable.length === 0) {
      const defaults = defaultPage(slug)!;
      base = { ...saved, title: saved.title || defaults.title, path: defaults.path, is_system: true, is_published: true, sections: defaults.sections };
    }
  }
  return {
    ...base,
    // SEO: saved values win, but an empty saved field falls back to the default.
    seo: {
      ...(def?.seo ?? {}),
      ...Object.fromEntries(Object.entries(base.seo ?? {}).filter(([, v]) => typeof v === "string" && v.trim() !== "")),
    },
    sections: resolveSections(base.sections),
  };
}
