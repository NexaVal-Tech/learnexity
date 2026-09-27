// components/admin/cms/RevisionsPanel.tsx — version history drawer.
import React, { useEffect, useState } from "react";
import { Eye, History, Loader2, RotateCcw, X } from "lucide-react";
import { cmsAdmin, apiErrorMessage, type CmsRevisionItem } from "@/lib/cms/adminClient";

export default function RevisionsPanel({
  type,
  subjectKey,
  onClose,
  onRestored,
  onPreview,
}: {
  type: "page" | "global";
  subjectKey: string;
  onClose: () => void;
  onRestored: () => void;
  /** Show a past version in the preview without restoring it. */
  onPreview?: (snapshot: any) => void;
}) {
  const [items, setItems] = useState<CmsRevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cmsAdmin
      .revisions(type, subjectKey)
      .then((r) => setItems(r.revisions))
      .catch((e) => setError(apiErrorMessage(e, "Couldn't load history.")))
      .finally(() => setLoading(false));
  }, [type, subjectKey]);

  const restore = async (rev: CmsRevisionItem) => {
    if (!window.confirm("Restore this version? Your current version is kept in the history, so you can undo this.")) return;
    setBusy(rev.id);
    try {
      await cmsAdmin.restoreRevision(rev.id);
      onRestored();
    } catch (e) {
      setError(apiErrorMessage(e, "Couldn't restore."));
    } finally {
      setBusy(null);
    }
  };

  const preview = async (rev: CmsRevisionItem) => {
    if (!onPreview) return;
    setBusy(rev.id);
    try {
      const r = await cmsAdmin.revision(rev.id);
      onPreview(r.revision.snapshot);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-sm h-full bg-white dark:bg-[#0f0f14] shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><History size={16} /> Version history</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} className="text-gray-500" /></button>
        </div>
        <p className="px-4 pt-3 text-xs text-gray-500 dark:text-gray-400">
          A copy is saved automatically every time someone saves, resets or restores (the last 30 are kept).
        </p>
        {error && <p className="mx-4 mt-3 text-sm text-red-600">{error}</p>}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-10">No earlier versions yet.</p>
          ) : (
            items.map((rev) => (
              <div key={rev.id} className="border border-gray-200 dark:border-white/10 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(rev.created_at).toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Replaced by {rev.admin?.name || rev.admin?.email || "an admin"}
                </p>
                <div className="flex gap-3 mt-2">
                  {onPreview && (
                    <button disabled={busy === rev.id} onClick={() => preview(rev)} className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                      <Eye size={13} /> Preview
                    </button>
                  )}
                  <button disabled={busy === rev.id} onClick={() => restore(rev)} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                    {busy === rev.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
