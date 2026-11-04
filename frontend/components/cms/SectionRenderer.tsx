// components/cms/SectionRenderer.tsx
//
// Renders a page's sections in order. Each section gets its own error
// boundary, so a broken or half-filled section can never take the rest of
// the page down with it (it just renders nothing, and logs in the console).
//
// Anchors: a section gets its admin-set anchor, or — when it has a small
// label ("eyebrow", e.g. a student's name on the blog) — an automatic one
// made from that label, so links like /blog#daniel-ugwusiani jump straight
// to that story. If the link's #name doesn't match exactly (spelling, word
// order), the closest section by matching words is used.
import React, { useEffect } from "react";
import { BLOCK_COMPONENTS } from "@/lib/cms/components";
import type { CmsSection } from "@/lib/cms/types";

class SectionBoundary extends React.Component<{ type: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[cms] Section "${this.props.type}" failed to render:`, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function anchorSlug(text: string): string {
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const words = (s: string) => s.split("-").filter((w) => w.length > 1);

/** Find the section whose anchor shares the most words with the link's #name. */
function closestAnchor(hash: string, anchors: string[]): string | null {
  const want = words(anchorSlug(hash));
  if (!want.length) return null;
  let best: string | null = null;
  let bestScore = 0;
  for (const a of anchors) {
    const have = words(a);
    let score = 0;
    for (const w of want) {
      if (have.includes(w)) score += 2;
      else if (w.length >= 4 && have.some((h) => h.length >= 4 && (h.startsWith(w.slice(0, 4)) || w.startsWith(h.slice(0, 4))))) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return bestScore >= 2 ? best : null;
}

export default function SectionRenderer({ sections }: { sections: CmsSection[] | null | undefined }) {
  // Work out each visible section's anchor (unique on the page).
  const used = new Set<string>();
  const items = (sections ?? [])
    .filter((s) => !s.hidden && BLOCK_COMPONENTS[s.type])
    .map((section) => {
      const eyebrow = (section.data as { eyebrow?: unknown } | null)?.eyebrow;
      let anchor = section.anchor || (typeof eyebrow === "string" && eyebrow.trim() ? anchorSlug(eyebrow) : "");
      if (anchor) {
        let candidate = anchor;
        let n = 2;
        while (used.has(candidate)) candidate = `${anchor}-${n++}`;
        anchor = candidate;
        used.add(anchor);
      }
      return { section, anchor };
    });
  const anchorList = items.map((i) => i.anchor).filter(Boolean);
  const anchorKey = anchorList.join("|");

  // Jump to #name on load (and when the hash changes), with a fuzzy fallback.
  useEffect(() => {
    const go = () => {
      const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!raw) return;
      if (document.getElementById(raw)) {
        document.getElementById(raw)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const match = closestAnchor(raw, anchorKey ? anchorKey.split("|") : []);
      if (match) document.getElementById(match)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = window.setTimeout(go, 250);
    window.addEventListener("hashchange", go);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", go);
    };
  }, [anchorKey]);

  return (
    <>
      {items.map(({ section, anchor }) => {
        const Component = BLOCK_COMPONENTS[section.type];
        const rendered = (
          <SectionBoundary key={section.id} type={section.type}>
            <Component data={section.data} />
          </SectionBoundary>
        );
        return anchor ? (
          <div key={section.id} id={anchor} style={{ scrollMarginTop: 110 }}>
            {rendered}
          </div>
        ) : (
          rendered
        );
      })}
    </>
  );
}
