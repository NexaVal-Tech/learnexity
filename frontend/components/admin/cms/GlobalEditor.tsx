// components/admin/cms/GlobalEditor.tsx — editor for site-wide content (navbar, footer, scholarship wording).
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, History, Loader2, RotateCcw, Save } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import FieldEditor from "./FieldEditor";
import PreviewFrame from "./PreviewFrame";
import RevisionsPanel from "./RevisionsPanel";
import { useSaveShortcut, useUnsavedGuard } from "./useUnsavedGuard";
import { GLOBAL_EDITORS } from "@/lib/cms/globalSchemas";
import { cmsAdmin, revalidatePaths, allCmsPaths, apiErrorMessage } from "@/lib/cms/adminClient";
import { invalidateCmsGlobalsCache } from "@/contexts/CmsGlobalsContext";

type Key = keyof typeof GLOBAL_EDITORS;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export default function GlobalEditor({ globalKey }: { globalKey: Key }) {
  const editor = GLOBAL_EDITORS[globalKey];
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isCustomized, setIsCustomized] = useState(false);
  const [base, setBase] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "ok" | "warn" | "error" } | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [history, setHistory] = useState(false);

  useUnsavedGuard(dirty);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAdmin.getGlobal(globalKey);
      setData({ ...clone(editor.defaults), ...(res.data ?? {}) });
      setIsCustomized(!!res.data);
      setBase(res.updated_at ?? null);
      setDirty(false);
    } catch (e) {
      setToast({ text: apiErrorMessage(e, "Couldn't load."), kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [globalKey, editor.defaults]);

  useEffect(() => {
    load();
  }, [load]);

  const publishEverywhere = async () => {
    invalidateCmsGlobalsCache();
    const ok = await revalidatePaths(await allCmsPaths());
    return ok;
  };

  const save = useCallback(async () => {
    if (!data || saving) return;
    setSaving(true);
    try {
      const res = await cmsAdmin.saveGlobal(globalKey, data, base);
      setBase(res.updated_at);
      setIsCustomized(true);
      setDirty(false);
      const ok = await publishEverywhere();
      setToast(
        ok
          ? { text: `Saved — the ${editor.title.toLowerCase()} is updated on every page.`, kind: "ok" }
          : { text: "Saved. Some pages couldn't be refreshed right away; they'll update within 10 minutes.", kind: "warn" }
      );
    } catch (e: any) {
      setToast({ text: apiErrorMessage(e, "Couldn't save."), kind: "error" });
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, saving, base, globalKey, editor.title]);

  useSaveShortcut(save, !loading);

  const reset = async () => {
    if (!window.confirm(`Reset the ${editor.title.toLowerCase()} to its original content? The current version is kept in the history.`)) return;
    try {
      await cmsAdmin.resetGlobal(globalKey);
      await load();
      await publishEverywhere();
      setToast({ text: "Reset to the original.", kind: "ok" });
    } catch (e) {
      setToast({ text: apiErrorMessage(e), kind: "error" });
    }
  };

  const payload = useMemo(
    () => ({ chromeOnly: true, sections: [], [globalKey]: preview }),
    [preview, globalKey]
  );

  return (
    <AdminRouteGuard requiredPermission="cms">
      <AdminLayout>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <Link href="/admin/cms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
            <ArrowLeft size={15} /> Website CMS
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{editor.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{editor.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setHistory(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                <History size={14} /> History
              </button>
              {editor.preview && (
                <button onClick={() => setPreview(clone(data))} disabled={!data} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                  <Eye size={14} /> Preview
                </button>
              )}
              <button onClick={save} disabled={saving || !data || (!dirty && isCustomized)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save & publish
              </button>
            </div>
          </div>

          {dirty && <p className="mb-3 text-xs text-amber-600">You have unsaved changes.</p>}
          {toast && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex ${toast.kind === "ok" ? "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300" : toast.kind === "warn" ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300"}`}>
              <span className="flex-1">{toast.text}</span>
              <button onClick={() => setToast(null)}>✕</button>
            </div>
          )}

          {loading || !data ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <FieldEditor
                fields={editor.fields}
                value={data}
                onChange={(next) => {
                  setData(next);
                  setDirty(true);
                }}
              />
              {isCustomized && (
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/10">
                  <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600">
                    <RotateCcw size={14} /> Reset to the original {editor.title.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {preview && <PreviewFrame payload={payload} onClose={() => setPreview(null)} livePath="/" />}
        {history && (
          <RevisionsPanel
            type="global"
            subjectKey={globalKey}
            onClose={() => setHistory(false)}
            onPreview={(snap) => editor.preview && setPreview({ ...clone(editor.defaults), ...(snap?.data ?? {}) })}
            onRestored={async () => {
              setHistory(false);
              await load();
              await publishEverywhere();
              setToast({ text: "Version restored and published.", kind: "ok" });
            }}
          />
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}
