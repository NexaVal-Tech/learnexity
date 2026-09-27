// Legal document block (Privacy Policy, Terms of Service, Refund Policy, and
// any other policy page made in the page builder).
import React, { useMemo, useState } from "react";
import { f } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

export interface LegalDocumentData {
  title: string;
  intro: string;
  lastUpdated: string;
  showToc: boolean;
  bodyHtml: string;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/&amp;/g, "and").replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";

const stripTags = (s: string) =>
  s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

/**
 * Adds anchor ids to every top-level <h2> (the stored HTML never has ids —
 * the sanitizer strips them) and returns the matching table of contents.
 * Pure string work, so it runs identically on the server and in the browser.
 */
function withAnchors(html: string): { html: string; toc: { id: string; label: string }[] } {
  const toc: { id: string; label: string }[] = [];
  const used = new Set<string>();
  const out = (html || "").replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    let id = slugify(inner);
    let n = 2;
    while (used.has(id)) id = `${slugify(inner)}-${n++}`;
    used.add(id);
    toc.push({ id, label: stripTags(inner) });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export function LegalDocument({ data }: { data: LegalDocumentData }) {
  const { html, toc } = useMemo(() => withAnchors(data.bodyHtml), [data.bodyHtml]);
  const [tocOpen, setTocOpen] = useState(false);
  const showToc = data.showToc && toc.length > 1;

  const tocList = (onPick?: () => void) => (
    <ul className="space-y-2 text-sm">
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} onClick={onPick} className="text-blue-600 dark:text-blue-400 hover:underline">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] pb-12">
      <style>{`.cms-legal h2 { scroll-margin-top: 96px; }`}</style>

      {/* Header banner */}
      <div className="bg-slate-900 max-w-[1000px] rounded-2xl mx-auto text-white py-8 px-4 sm:px-6 mt-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
              {data.intro && <p className="text-sm text-gray-300 leading-relaxed">{data.intro}</p>}
              {data.lastUpdated && <p className="text-xs text-gray-400 mt-2">Last updated: {data.lastUpdated}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className={`${showToc ? "max-w-[1200px]" : "max-w-5xl"} mx-auto px-4 sm:px-6 py-8`}>
        <div className={showToc ? "flex flex-col lg:flex-row gap-8" : ""}>
          {showToc && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 p-6 border-2 border-gray-200 dark:border-white/10 rounded-2xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Table of Contents</p>
                <div className="h-px bg-gray-300 dark:bg-white/10 mb-4" />
                {tocList()}
              </div>
            </aside>
          )}
          <article className="flex-1 min-w-0 cms-legal">
            <div className="cms-prose cms-prose-sm" dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </div>

      {/* Mobile table of contents */}
      {showToc && (
        <>
          <button
            onClick={() => setTocOpen((v) => !v)}
            className="lg:hidden fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg"
            aria-label="Table of contents"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {tocOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setTocOpen(false)}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0a0a0f] rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Table of Contents</p>
                {tocList(() => setTocOpen(false))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const legalBlocks: BlockDefinition[] = [
  {
    type: "legal.document",
    label: "Policy document",
    category: "Legal",
    description: "Title banner, optional table of contents (built from the Heading 2s), and the full text.",
    fields: [
      f.text("title", "Title"),
      f.textarea("intro", "Short summary under the title", { rows: 2 }),
      f.text("lastUpdated", "Last updated (e.g. November 30, 2024)"),
      f.bool("showToc", "Show a table of contents", "Built automatically from every “Heading 2” in the text."),
      f.rich("bodyHtml", "Document text", "Use Heading 2 for main sections and Heading 3 for sub-sections."),
    ],
    defaults: {
      title: "Policy",
      intro: "",
      lastUpdated: "",
      showToc: false,
      bodyHtml: "<h2>1. Introduction</h2><p>Write your policy here.</p>",
    } satisfies LegalDocumentData,
  },
];
