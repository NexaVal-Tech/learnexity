// pages/admin/cms/index.tsx — Website CMS home: pages, navbar, footer, media.
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FileText, GraduationCap, ImageIcon, Loader2, Mail, Menu, PanelBottom, Plus, X } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { cmsAdmin, apiErrorMessage, type CmsPageListItem } from "@/lib/cms/adminClient";
import { BLOCKS } from "@/lib/cms/blocks";
import { clone, newSectionId } from "@/lib/cms/resolve";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** Starter layouts for new pages. */
const TEMPLATES: { key: string; label: string; description: string; types: string[] }[] = [
  { key: "blank", label: "Blank", description: "Start from nothing and add sections.", types: [] },
  {
    key: "landing",
    label: "Landing page",
    description: "Hero, feature cards, testimonials, FAQ and a call to action.",
    types: ["general.hero", "general.cards", "general.testimonials", "general.faq", "general.cta"],
  },
  { key: "article", label: "Article / info page", description: "Hero, then formatted text and an image.", types: ["general.hero", "general.richText", "general.imageText"] },
  { key: "policy", label: "Policy / legal", description: "A policy document with a table of contents.", types: ["legal.document"] },
];

function PageRow({ page }: { page: CmsPageListItem }) {
  return (
    <Link
      href={`/admin/cms/pages/${page.slug}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
    >
      <FileText size={18} className="text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{page.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{page.path}</p>
      </div>
      {!page.is_system && (
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${page.is_published ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}>
          {page.is_published ? "Published" : "Draft"}
        </span>
      )}
      {page.is_system && !page.is_customized && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Original</span>
      )}
      <span className="text-xs text-gray-400 hidden sm:block w-28 text-right">
        {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : "—"}
      </span>
    </Link>
  );
}

export default function CmsHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [system, setSystem] = useState<CmsPageListItem[]>([]);
  const [custom, setCustom] = useState<CmsPageListItem[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    cmsAdmin
      .listPages()
      .then((r) => {
        setSystem(r.system_pages);
        setCustom(r.custom_pages);
      })
      .catch((e) => setError(apiErrorMessage(e, "Couldn't load pages.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminRouteGuard requiredPermission="cms">
      <AdminLayout>
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website CMS</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Edit the public website — pages, menu, footer, images and videos. Changes go live when you save.</p>
            </div>
            <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Plus size={15} /> New page
            </button>
          </div>

          {/* Site-wide */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {[
              { href: "/admin/cms/navbar", icon: <Menu size={18} />, title: "Navbar", text: "Menu items, dropdowns, logo, buttons" },
              { href: "/admin/cms/footer", icon: <PanelBottom size={18} />, title: "Footer", text: "Links, contact details, social icons" },
              { href: "/admin/cms/media", icon: <ImageIcon size={18} />, title: "Media library", text: "Upload images, logos & videos" },
              { href: "/admin/cms/scholarship", icon: <GraduationCap size={18} />, title: "Scholarship", text: "Award message, course picker, payment page wording" },
              { href: "/admin/cms/emails", icon: <Mail size={18} />, title: "Emails", text: "Subjects and text of every email the site sends" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] hover:border-indigo-400 transition-colors">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">{c.icon}<span className="font-semibold text-gray-900 dark:text-white">{c.title}</span></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.text}</p>
              </Link>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 text-sm">{error}</div>
          ) : (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Website pages</h2>
              <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl divide-y divide-gray-100 dark:divide-white/10 mb-8">
                {system.map((p) => <PageRow key={p.slug} page={p} />)}
              </div>

              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Your pages</h2>
              {custom.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500">
                  No custom pages yet. Use <strong>New page</strong> to build one from sections.
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl divide-y divide-gray-100 dark:divide-white/10">
                  {custom.map((p) => <PageRow key={p.slug} page={p} />)}
                </div>
              )}

              <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
                Course listings, prices, the scholarship countdown and consultation availability come from their own admin sections and appear on these pages automatically.
              </p>
            </>
          )}
        </div>

        {creating && (
          <CreatePageModal
            existing={[...system, ...custom].map((p) => p.slug)}
            onClose={() => setCreating(false)}
            onCreated={(slug) => router.push(`/admin/cms/pages/${slug}`)}
          />
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}

function CreatePageModal({ existing, onClose, onCreated }: { existing: string[]; onClose: () => void; onCreated: (slug: string) => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [template, setTemplate] = useState("landing");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const taken = existing.includes(effectiveSlug);

  const create = async () => {
    if (!title.trim() || !effectiveSlug) {
      setError("Give the page a name and address.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const types = TEMPLATES.find((t) => t.key === template)?.types ?? [];
      const sections = types
        .filter((t) => BLOCKS[t])
        .map((t) => ({
          id: newSectionId(),
          type: t,
          hidden: false,
          data: t === "general.hero" ? { ...clone(BLOCKS[t].defaults), heading: title.trim() } : t === "legal.document" ? { ...clone(BLOCKS[t].defaults), title: title.trim() } : clone(BLOCKS[t].defaults),
        }));
      const res = await cmsAdmin.createPage({ title: title.trim(), slug: effectiveSlug, sections });
      onCreated(res.page.slug);
    } catch (e) {
      setError(apiErrorMessage(e, "Couldn't create the page."));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0f0f14] rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-semibold text-gray-900 dark:text-white">New page</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Page name</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Partnerships"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 dark:text-white rounded-lg"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Web address</span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              learnexity.org/
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 dark:text-white rounded"
              />
            </span>
            {taken && <span className="block mt-1 text-xs text-red-600">That address is already used.</span>}
          </label>
          <div>
            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Start from</span>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTemplate(t.key)}
                  className={`text-left p-3 rounded-lg border ${template === t.key ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15" : "border-gray-200 dark:border-white/10"}`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">New pages start as drafts — publish them from the page's settings once they're ready. To show a page in the menu, add it in the Navbar.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
          <button onClick={create} disabled={saving || taken} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg disabled:opacity-50">
            {saving && <Loader2 size={14} className="animate-spin" />} Create page
          </button>
        </div>
      </div>
    </div>
  );
}
