import React, { useEffect, useState } from "react";
import { Loader2, X, ClipboardCheck, Info } from "lucide-react";
import {
  DEFAULT_TASK_CONFIG, TASK_FILE_TYPES, normalizeTaskConfig,
  type ResponseMode, type TaskConfig,
} from "./types";

const inputCls =
  "w-full rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/30 focus:border-[#4A3AFF]";
const labelCls = "block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1";

function ModeSelect({ value, onChange }: { value: ResponseMode; onChange: (v: ResponseMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-white/15 overflow-hidden text-xs">
      {(["off", "optional", "required"] as ResponseMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 capitalize transition ${
            value === m ? "bg-[#4A3AFF] text-white" : "bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          {m === "off" ? "Not used" : m}
        </button>
      ))}
    </div>
  );
}

const numOrNull = (v: string): number | null => (v.trim() === "" ? null : Math.max(0, Math.floor(Number(v)) || 0));

/**
 * Admin / instructor editor for a material item's task requirements.
 * The caller supplies onSave (admin or instructor API).
 */
export default function TaskSettingsModal({
  open,
  itemTitle,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  itemTitle: string;
  initial: unknown;
  onClose: () => void;
  onSave: (cfg: TaskConfig) => Promise<void>;
}) {
  const [cfg, setCfg] = useState<TaskConfig>(DEFAULT_TASK_CONFIG);
  const [keywords, setKeywords] = useState("");
  const [domains, setDomains] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const hasExisting = initial && typeof initial === "object";
    const c = hasExisting ? normalizeTaskConfig(initial) : { ...DEFAULT_TASK_CONFIG };
    if (!hasExisting) c.enabled = true;
    setCfg(c);
    setKeywords(c.text.keywords.join(", "));
    setDomains(c.link.allowed_domains.join(", "));
    setError(null);
  }, [open, initial]);

  if (!open) return null;

  const set = <K extends keyof TaskConfig>(k: K, v: TaskConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const kwList = keywords.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);

  const save = async (enabled: boolean) => {
    setError(null);
    const next: TaskConfig = {
      ...cfg,
      enabled,
      text: { ...cfg.text, keywords: kwList.slice(0, 30) },
      link: { ...cfg.link, allowed_domains: domains.split(/[\n,\s]+/).map((d) => d.trim()).filter(Boolean).slice(0, 10) },
    };
    if (enabled && next.text.mode === "off" && next.link.mode === "off" && next.file.mode === "off") {
      setError("Choose at least one way for students to respond.");
      return;
    }
    if (enabled && next.file.mode !== "off" && next.file.allowed_types.length === 0) {
      setError("Pick at least one file type students may upload.");
      return;
    }
    try {
      setSaving(true);
      await onSave(next);
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      const first = data?.errors ? (Object.values(data.errors).flat()[0] as string) : null;
      setError(first || data?.message || "Could not save the task settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleType = (ext: string) =>
    set("file", {
      ...cfg.file,
      allowed_types: cfg.file.allowed_types.includes(ext) ? cfg.file.allowed_types.filter((e) => e !== ext) : [...cfg.file.allowed_types, ext],
    });

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#0f0f14] w-full sm:max-w-2xl max-h-[95vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-white/10">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck size={18} className="text-[#4A3AFF]" /> Task requirements
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-md">{itemTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 bg-[#4A3AFF]/5 border border-[#4A3AFF]/15 rounded-lg p-3">
            <Info size={14} className="text-[#4A3AFF] mt-0.5 flex-shrink-0" />
            <span>
              Students will see this material as a task with a response form. Their answer is marked automatically against
              the rules below, and you can always review it, change the score, give feedback or ask them to resubmit.
            </span>
          </div>

          <div>
            <label className={labelCls}>Instructions for students (optional — shown above the response form)</label>
            <textarea rows={3} maxLength={5000} value={cfg.instructions} onChange={(e) => set("instructions", e.target.value)} className={inputCls} placeholder="e.g. Write a short reflection on what you built this sprint and share your GitHub repo." />
          </div>

          {/* Written answer */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Written answer</p>
              <ModeSelect value={cfg.text.mode} onChange={(m) => set("text", { ...cfg.text, mode: m })} />
            </div>
            {cfg.text.mode !== "off" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Minimum words</label>
                  <input type="number" min={1} max={5000} value={cfg.text.min_words ?? ""} onChange={(e) => set("text", { ...cfg.text, min_words: numOrNull(e.target.value) })} className={inputCls} placeholder="No minimum" />
                </div>
                <div>
                  <label className={labelCls}>Maximum words</label>
                  <input type="number" min={1} max={5000} value={cfg.text.max_words ?? ""} onChange={(e) => set("text", { ...cfg.text, max_words: numOrNull(e.target.value) })} className={inputCls} placeholder="No maximum" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Key points / terms the answer should mention (comma separated — hidden from students)</label>
                  <textarea rows={2} value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputCls} placeholder="e.g. API, webhook, error handling" />
                </div>
                {kwList.length > 1 && (
                  <div>
                    <label className={labelCls}>How many of them must appear for full marks</label>
                    <input type="number" min={1} max={kwList.length} value={cfg.text.keyword_min ?? ""} onChange={(e) => set("text", { ...cfg.text, keyword_min: numOrNull(e.target.value) })} className={inputCls} placeholder={`All ${kwList.length}`} />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Link */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Link</p>
              <ModeSelect value={cfg.link.mode} onChange={(m) => set("link", { ...cfg.link, mode: m })} />
            </div>
            {cfg.link.mode !== "off" && (
              <div>
                <label className={labelCls}>Only accept links from these sites (optional, comma separated)</label>
                <input value={domains} onChange={(e) => setDomains(e.target.value)} className={inputCls} placeholder="e.g. github.com, figma.com, docs.google.com" />
              </div>
            )}
          </section>

          {/* File */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">File upload</p>
              <ModeSelect value={cfg.file.mode} onChange={(m) => set("file", { ...cfg.file, mode: m })} />
            </div>
            {cfg.file.mode !== "off" && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Allowed file types</label>
                  <div className="flex flex-wrap gap-2">
                    {TASK_FILE_TYPES.map((t) => {
                      const on = cfg.file.allowed_types.includes(t.ext);
                      return (
                        <button
                          key={t.ext}
                          type="button"
                          onClick={() => toggleType(t.ext)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition ${
                            on ? "bg-[#4A3AFF] border-[#4A3AFF] text-white" : "border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-[#4A3AFF]"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="max-w-[12rem]">
                  <label className={labelCls}>Maximum size (MB, up to 20)</label>
                  <input type="number" min={1} max={20} value={cfg.file.max_size_mb} onChange={(e) => set("file", { ...cfg.file, max_size_mb: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })} className={inputCls} />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Every upload is checked on the server: the real file contents must match its type, and files with macros, scripts,
                  embedded programs or hidden code are rejected. Files are stored privately and only you and the student can download them.
                </p>
              </div>
            )}
          </section>

          {/* Marking */}
          <section className="space-y-3 border-t border-gray-100 dark:border-white/10 pt-5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Marking</p>
            <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={cfg.auto_grade} onChange={(e) => set("auto_grade", e.target.checked)} className="mt-0.5 accent-[#4A3AFF]" />
              <span>
                Mark automatically using these requirements
                <span className="block text-xs text-gray-500 dark:text-gray-400">If off, submissions wait for you to grade them.</span>
              </span>
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Pass mark % (optional)</label>
                <input type="number" min={0} max={100} value={cfg.pass_mark ?? ""} onChange={(e) => set("pass_mark", e.target.value === "" ? null : Math.min(100, numOrNull(e.target.value) ?? 0))} className={inputCls} placeholder="No pass mark" />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">When set, students below it are asked to revise and the task only counts as complete once passed.</p>
              </div>
              <div>
                <label className={labelCls}>Maximum attempts (optional)</label>
                <input type="number" min={1} max={20} value={cfg.max_attempts ?? ""} onChange={(e) => set("max_attempts", e.target.value === "" ? null : Math.min(20, Math.max(1, numOrNull(e.target.value) ?? 1)))} className={inputCls} placeholder="Unlimited" />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-t border-gray-100 dark:border-white/10">
          {initial && typeof initial === "object" && (initial as any).enabled ? (
            <button type="button" disabled={saving} onClick={() => save(false)} className="text-sm text-red-600 hover:underline disabled:opacity-50">
              Turn off task
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/15 text-gray-700 dark:text-gray-200">Cancel</button>
            <button type="button" disabled={saving} onClick={() => save(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#4A3AFF] text-white disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />} Save task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
