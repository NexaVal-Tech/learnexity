// pages/admin/cms/pages/[slug].tsx — CMS page editor.
//
// Edit every section of a built-in page (homepage, about, …) or a page made
// in the page builder: reorder (drag or arrows), hide, duplicate, delete,
// add sections from the library, edit each section's fields, SEO, preview
// on desktop/tablet/mobile, save, and roll back from version history.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeft, ChevronDown, ChevronRight, ChevronUp, Copy, Eye, EyeOff, ExternalLink, GripVertical, History,
  Loader2, Plus, RotateCcw, Save, Search as SearchIcon, Settings2, Trash2, AlertTriangle,
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import FieldEditor from "@/components/admin/cms/FieldEditor";
import BlockLibrary from "@/components/admin/cms/BlockLibrary";
import PreviewFrame from "@/components/admin/cms/PreviewFrame";
import RevisionsPanel from "@/components/admin/cms/RevisionsPanel";
import { useSaveShortcut, useUnsavedGuard } from "@/components/admin/cms/useUnsavedGuard";
import { BLOCKS } from "@/lib/cms/blocks";
import { clone, newSectionId, resolvePage, resolveSections } from "@/lib/cms/resolve";
import { SYSTEM_PAGES } from "@/lib/cms/pages";
import { f } from "@/lib/cms/fields";
import { cmsAdmin, revalidatePaths, apiErrorMessage } from "@/lib/cms/adminClient";
import type { CmsPage, CmsSection } from "@/lib/cms/types";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const SEO_FIELDS = [
  f.text("title", "Page title (browser tab & Google)", { help: "About 50–60 characters." }),
  f.textarea("description", "Description (Google & link previews)", { rows: 3, help: "About 150–160 characters." }),
  f.image("og_image", "Share image (Facebook, WhatsApp, LinkedIn previews)", "1200×630 works best. Leave empty to use the site default."),
];

function sectionSummary(section: CmsSection): string {
  const d = section.data ?? {};
  const candidate = [d.heading, d.title, d.headline, d.eyebrow, d.badge].find((x) => typeof x === "string" && x.trim());
  if (!candidate) return "";
  const text = String(candidate).replace(/\*\*/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

type Toast = { text: string; kind: "ok" | "warn" | "error" } | null;

export default function CmsPageEditor() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<CmsPage | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [conflict, setConflict] = useState(false);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [library, setLibrary] = useState<{ at: number } | null>(null);
  const [preview, setPreview] = useState<CmsSection[] | null>(null);
  const [history, setHistory] = useState(false);
  const [tab, setTab] = useState<"sections" | "seo" | "settings">("sections");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [newSlug, setNewSlug] = useState("");

  useUnsavedGuard(dirty);

  const showToast = (t: Toast) => {
    setToast(t);
    if (t && t.kind !== "error") setTimeout(() => setToast(null), 5000);
  };

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError("");
    try {
      const res = await cmsAdmin.getPage(slug);
      const resolved = resolvePage(slug, res.page);
      if (!resolved) throw new Error("This page doesn't exist.");
      setDraft(resolved);
      setIsCustomized(!!res.page);
      setBaseUpdatedAt(res.page?.updated_at ?? null);
      setNewSlug(resolved.slug);
      setDirty(false);
      setConflict(false);
    } catch (e) {
      setLoadError(apiErrorMessage(e, "Couldn't load this page."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (fn: (p: CmsPage) => CmsPage) => {
    setDraft((p) => (p ? fn(p) : p));
    setDirty(true);
  };

  const setSections = (fn: (s: CmsSection[]) => CmsSection[]) => update((p) => ({ ...p, sections: fn(p.sections) }));

  // ─── Section operations ──────────────────────────────────────────────────

  const addSection = (block: BlockDefinition, at: number) => {
    const section: CmsSection = { id: newSectionId(), type: block.type, hidden: false, data: clone(block.defaults) };
    setSections((s) => [...s.slice(0, at), section, ...s.slice(at)]);
    setExpanded(section.id);
    setLibrary(null);
  };

  const moveSection = (from: number, to: number) =>
    setSections((s) => {
      if (to < 0 || to >= s.length || from === to) return s;
      const next = [...s];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  const patchSection = (id: string, patch: Partial<CmsSection>) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  // ─── Save / reset / delete ───────────────────────────────────────────────

  const save = useCallback(async () => {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const payload: Parameters<typeof cmsAdmin.savePage>[1] = {
        sections: draft.sections,
        seo: draft.seo,
        base_updated_at: baseUpdatedAt,
      };
      if (!draft.is_system) {
        payload.title = draft.title;
        payload.is_published = draft.is_published;
        if (newSlug && newSlug !== draft.slug) payload.new_slug = newSlug;
      }
      const res = await cmsAdmin.savePage(draft.slug, payload);
      const saved = resolvePage(res.page.slug, res.page)!;
      setDraft(saved);
      setBaseUpdatedAt(res.page.updated_at ?? null);
      setIsCustomized(true);
      setDirty(false);

      const paths = [saved.path, ...(res.old_path ? [res.old_path] : [])];
      const live = saved.is_system || saved.is_published ? await revalidatePaths(paths) : true;
      showToast(
        saved.is_system || saved.is_published
          ? live
            ? { text: "Saved — the live page is updated.", kind: "ok" }
            : { text: "Saved. The live page couldn't be refreshed right away; it will update within 10 minutes.", kind: "warn" }
          : { text: "Saved as a draft (not published).", kind: "ok" }
      );
      if (res.page.slug !== slug) router.replace(`/admin/cms/pages/${res.page.slug}`, undefined, { shallow: false });
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setConflict(true);
        showToast({ text: apiErrorMessage(e), kind: "error" });
      } else {
        showToast({ text: apiErrorMessage(e, "Couldn't save."), kind: "error" });
      }
    } finally {
      setSaving(false);
    }
  }, [draft, saving, baseUpdatedAt, newSlug, slug, router]);

  useSaveShortcut(save, !loading && !!draft);

  const resetToDefaults = async () => {
    if (!draft) return;
    if (!window.confirm("Reset this whole page to its original content? The current version is saved in the history, so you can restore it later.")) return;
    try {
      if (isCustomized) {
        await cmsAdmin.deletePage(draft.slug);
        await revalidatePaths([draft.path]);
      }
      await load();
      showToast({ text: "Page reset to its original content.", kind: "ok" });
    } catch (e) {
      showToast({ text: apiErrorMessage(e), kind: "error" });
    }
  };

  const deletePage = async () => {
    if (!draft) return;
    if (!window.confirm(`Delete “${draft.title}”? Visitors to ${draft.path} will see “page not found”. (It can be restored from the history.)`)) return;
    try {
      await cmsAdmin.deletePage(draft.slug);
      await revalidatePaths([draft.path]);
      setDirty(false);
      router.push("/admin/cms");
    } catch (e) {
      showToast({ text: apiErrorMessage(e), kind: "error" });
    }
  };

  const liveHref = draft && (draft.is_system || draft.is_published) ? draft.path : undefined;
  const systemDef = draft?.is_system ? SYSTEM_PAGES[draft.slug] : undefined;

  const previewPayload = useMemo(
    () => ({ slug: draft?.slug, sections: preview ?? [], isCustom: draft ? !draft.is_system : false }),
    [preview, draft]
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <AdminRouteGuard requiredPermission="cms">
      <AdminLayout>
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <Link href="/admin/cms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
            <ArrowLeft size={15} /> All pages
          </Link>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : loadError || !draft ? (
            <div className="p-6 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300">{loadError || "Page not found."}</div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{draft.title}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {draft.path}
                    {!draft.is_system && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${draft.is_published ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}>
                        {draft.is_published ? "Published" : "Draft"}
                      </span>
                    )}
                    {draft.is_system && !isCustomized && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Original content</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {liveHref && (
                    <a href={liveHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                      <ExternalLink size={14} /> View live
                    </a>
                  )}
                  <button onClick={() => setHistory(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                    <History size={14} /> History
                  </button>
                  <button onClick={() => setPreview(draft.sections)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || (!dirty && isCustomized)}
                    title="Save (Ctrl/⌘ + S)"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {draft.is_system || draft.is_published ? "Save & publish" : "Save draft"}
                  </button>
                </div>
              </div>

              {dirty && <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">You have unsaved changes.</p>}

              {toast && (
                <div
                  className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${
                    toast.kind === "ok"
                      ? "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300"
                      : toast.kind === "warn"
                      ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                      : "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                  }`}
                >
                  <span className="flex-1">{toast.text}</span>
                  {conflict && (
                    <button onClick={load} className="underline font-medium">Reload</button>
                  )}
                  <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">✕</button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 border-b border-gray-200 dark:border-white/10 mb-5">
                {([
                  ["sections", "Sections"],
                  ["seo", "SEO & sharing"],
                  ["settings", "Page settings"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                      tab === key ? "border-indigo-600 text-indigo-700 dark:text-indigo-300" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "sections" && (
                <div>
                  {draft.sections.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-500 mb-3">
                      This page has no sections yet.
                    </div>
                  )}

                  <div className="space-y-2">
                    {draft.sections.map((section, i) => {
                      const def = BLOCKS[section.type];
                      const isOpen = expanded === section.id;
                      return (
                        <React.Fragment key={section.id}>
                          <InsertButton onClick={() => setLibrary({ at: i })} />
                          <div
                            draggable={!isOpen}
                            onDragStart={() => setDragFrom(i)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (dragFrom !== null) moveSection(dragFrom, i);
                              setDragFrom(null);
                            }}
                            className={`rounded-xl border bg-white dark:bg-[#0f0f14] ${
                              section.hidden ? "border-dashed border-gray-300 dark:border-white/20 opacity-70" : "border-gray-200 dark:border-white/10"
                            } ${dragFrom === i ? "opacity-40" : ""}`}
                          >
                            <div className="flex items-center gap-1.5 px-3 py-2.5">
                              <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />
                              <button onClick={() => setExpanded(isOpen ? null : section.id)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
                                {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {def?.label ?? `Unknown section (${section.type})`}
                                    {section.hidden && <span className="ml-2 text-xs font-normal text-gray-500">Hidden</span>}
                                  </span>
                                  {sectionSummary(section) && (
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">{sectionSummary(section)}</span>
                                  )}
                                </span>
                              </button>
                              <IconBtn title="Move up" onClick={() => moveSection(i, i - 1)} disabled={i === 0}><ChevronUp size={15} /></IconBtn>
                              <IconBtn title="Move down" onClick={() => moveSection(i, i + 1)} disabled={i === draft.sections.length - 1}><ChevronDown size={15} /></IconBtn>
                              <IconBtn title={section.hidden ? "Show on the page" : "Hide from the page"} onClick={() => patchSection(section.id, { hidden: !section.hidden })}>
                                {section.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                              </IconBtn>
                              <IconBtn
                                title="Duplicate"
                                onClick={() => {
                                  const copy = { ...clone(section), id: newSectionId(), anchor: undefined };
                                  setSections((s) => [...s.slice(0, i + 1), copy, ...s.slice(i + 1)]);
                                }}
                              >
                                <Copy size={14} />
                              </IconBtn>
                              <IconBtn
                                title="Delete"
                                danger
                                onClick={() => {
                                  if (!window.confirm(`Delete the “${def?.label ?? section.type}” section? (You can undo by leaving without saving.)`)) return;
                                  setSections((s) => s.filter((x) => x.id !== section.id));
                                }}
                              >
                                <Trash2 size={14} />
                              </IconBtn>
                            </div>

                            {isOpen && (
                              <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-white/10">
                                {def ? (
                                  <>
                                    {def.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{def.description}</p>}
                                    {def.fields.length > 0 ? (
                                      <FieldEditor fields={def.fields} value={section.data} onChange={(data) => patchSection(section.id, { data })} />
                                    ) : (
                                      <p className="text-sm text-gray-500">This section has nothing to edit — it shows live data.</p>
                                    )}
                                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-end gap-4">
                                      <label className="block">
                                        <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Link anchor (optional)</span>
                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                          {draft.path === "/" ? "/" : draft.path}#
                                          <input
                                            value={section.anchor ?? ""}
                                            onChange={(e) => patchSection(section.id, { anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                                            placeholder="e.g. faqs"
                                            className="w-36 px-2 py-1 text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 dark:text-white rounded"
                                          />
                                        </span>
                                      </label>
                                      <button
                                        onClick={() => {
                                          if (window.confirm("Reset this section's content to the block's defaults?")) patchSection(section.id, { data: clone(def.defaults) });
                                        }}
                                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                      >
                                        <RotateCcw size={12} /> Reset this section
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                    <AlertTriangle size={15} /> This section type no longer exists in the website code, so it isn't shown. You can delete it.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setLibrary({ at: draft.sections.length })}
                    className="mt-3 w-full py-3 border-2 border-dashed border-gray-300 dark:border-white/15 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 inline-flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add section
                  </button>

                  {draft.is_system && isCustomized && (
                    <div className="mt-8 pt-5 border-t border-gray-200 dark:border-white/10">
                      <button onClick={resetToDefaults} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600">
                        <RotateCcw size={14} /> Reset the whole page to its original content
                      </button>
                    </div>
                  )}
                </div>
              )}

              {tab === "seo" && (
                <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
                    <SearchIcon size={16} /> <span className="text-sm">How this page appears in Google and when shared.</span>
                  </div>
                  <FieldEditor fields={SEO_FIELDS} value={draft.seo ?? {}} onChange={(seo) => update((p) => ({ ...p, seo }))} />
                  {systemDef && (
                    <p className="text-xs text-gray-500 mt-4">Empty fields fall back to the original: “{systemDef.seo.title}”.</p>
                  )}
                  <GooglePreview title={draft.seo?.title || draft.title} description={draft.seo?.description || ""} path={draft.path} />
                </div>
              )}

              {tab === "settings" && (
                <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-5">
                  {draft.is_system ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <Settings2 size={16} className="mt-0.5 flex-shrink-0" />
                      This is a built-in page — its address ({draft.path}) is fixed and it's always published. To change its name in the menu, edit the Navbar.
                    </p>
                  ) : (
                    <>
                      <label className="block">
                        <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Page name</span>
                        <input
                          value={draft.title}
                          onChange={(e) => update((p) => ({ ...p, title: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 dark:text-white rounded-lg"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Web address</span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          learnexity.org/
                          <input
                            value={newSlug}
                            onChange={(e) => {
                              setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"));
                              setDirty(true);
                            }}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 dark:text-white rounded"
                          />
                        </span>
                        {newSlug !== draft.slug && (
                          <span className="block mt-1 text-[11px] text-amber-600">Changing the address breaks existing links to {draft.path}. Update your navbar/footer links too.</span>
                        )}
                      </label>
                      <label className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-indigo-600"
                          checked={draft.is_published}
                          onChange={(e) => update((p) => ({ ...p, is_published: e.target.checked }))}
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">Published (visible to visitors)</span>
                      </label>
                      <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                        <button onClick={deletePage} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700">
                          <Trash2 size={14} /> Delete this page
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {library && draft && <BlockLibrary pageSlug={draft.slug} onClose={() => setLibrary(null)} onPick={(b) => addSection(b, library.at)} />}
        {preview && draft && <PreviewFrame payload={previewPayload} livePath={liveHref} onClose={() => setPreview(null)} />}
        {history && draft && (
          <RevisionsPanel
            type="page"
            subjectKey={draft.slug}
            onClose={() => setHistory(false)}
            onPreview={(snap) => setPreview(resolveSections(snap?.sections ?? []))}
            onRestored={async () => {
              setHistory(false);
              await load();
              await revalidatePaths([draft.path]);
              showToast({ text: "Version restored and published.", kind: "ok" });
            }}
          />
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 ${danger ? "hover:text-red-600" : "hover:text-gray-700 dark:hover:text-gray-200"}`}
    >
      {children}
    </button>
  );
}

function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="group relative h-3 flex items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-transparent group-hover:bg-indigo-300 dark:group-hover:bg-indigo-500/40" />
      <button
        onClick={onClick}
        className="relative opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-indigo-600 text-white rounded-full"
      >
        <Plus size={11} /> Insert section here
      </button>
    </div>
  );
}

function GooglePreview({ title, description, path }: { title: string; description: string; path: string }) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold text-gray-500 mb-2">Google preview</p>
      <div className="border border-gray-200 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-white/5 max-w-xl">
        <p className="text-xs text-gray-600 dark:text-gray-400">learnexity.org{path === "/" ? "" : path}</p>
        <p className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] leading-snug truncate">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{description || "Add a description so Google shows your own summary."}</p>
      </div>
    </div>
  );
}
