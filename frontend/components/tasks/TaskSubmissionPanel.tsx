import React, { useMemo, useRef, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, Download, FileUp, Link2, Loader2, PenLine, RotateCcw, Send, X, XCircle, Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  STATUS_LABEL, formatBytes, formatScore, safeHref, saveBlob,
  type StudentTask, type TaskSubmission, type SubmissionStatus,
} from "./types";

const BRAND = "#4A3AFF";
const TEXT_MAX = 30000;

function statusStyle(status: SubmissionStatus) {
  switch (status) {
    case "passed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "needs_revision": return "bg-amber-50 text-amber-800 border-amber-200";
    case "graded": return "bg-[#4A3AFF]/10 text-[#4A3AFF] border-[#4A3AFF]/20";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function TaskStatusPill({ task }: { task?: StudentTask | null }) {
  if (!task || task.locked) return null;
  const s = task.latest?.status;
  if (!s) {
    return (
      <span className="flex items-center gap-1 text-xs text-[#4A3AFF] bg-[#4A3AFF]/10 px-2 py-1 rounded-full whitespace-nowrap">
        <PenLine size={11} /> Task · to do
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border whitespace-nowrap ${statusStyle(s)}`}>
      {s === "passed" ? <CheckCircle2 size={11} /> : s === "needs_revision" ? <RotateCcw size={11} /> : s === "graded" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {STATUS_LABEL[s]}
      {task.latest?.score != null && s !== "submitted" ? ` · ${formatScore(task.latest.score)}` : ""}
    </span>
  );
}

function wordCount(t: string) {
  const s = t.trim();
  return s ? s.split(/\s+/u).length : 0;
}

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function SubmissionView({ s, compact = false }: { s: TaskSubmission; compact?: boolean }) {
  const [showText, setShowText] = useState(!compact);
  const [downloading, setDownloading] = useState(false);
  const href = safeHref(s.link_url);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle(s.status)}`}>
          {STATUS_LABEL[s.status]}
        </span>
        {s.score != null && s.status !== "submitted" && (
          <span className="text-sm font-semibold text-gray-900">Score: {formatScore(s.score)}</span>
        )}
        <span className="text-xs text-gray-400">
          Attempt {s.attempt}
          {s.submitted_at ? ` · ${new Date(s.submitted_at).toLocaleString()}` : ""}
          {s.graded_by && s.graded_by !== "auto" ? ` · reviewed by your ${s.graded_by === "instructor" ? "instructor" : "tutor"}` : s.graded_by === "auto" ? " · marked automatically" : ""}
        </span>
      </div>

      {s.checks?.length > 0 && (
        <ul className="space-y-1.5">
          {s.checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {c.passed ? <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" /> : <XCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />}
              <span className="text-gray-700">
                {c.label}
                {c.detail ? <span className="text-gray-400"> — {c.detail}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      {s.feedback && (
        <div className="border-l-[3px] pl-3 py-1" style={{ borderColor: BRAND }}>
          <p className="text-xs font-semibold text-gray-500 mb-0.5">Feedback</p>
          {/* Plain text only — never HTML */}
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{s.feedback}</p>
        </div>
      )}

      {(s.text_response || href || s.has_file) && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500">Your submission</p>
          {s.text_response && (
            <div>
              {compact && (
                <button type="button" onClick={() => setShowText((v) => !v)} className="text-xs text-[#4A3AFF] hover:underline">
                  {showText ? "Hide written answer" : "Show written answer"}
                </button>
              )}
              {showText && <p className="text-sm text-gray-800 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">{s.text_response}</p>}
            </div>
          )}
          {href && (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="flex items-center gap-1.5 text-sm text-[#4A3AFF] hover:underline break-all">
              <Link2 size={14} className="flex-shrink-0" /> {s.link_url}
            </a>
          )}
          {s.has_file && (
            <button
              type="button"
              disabled={downloading}
              onClick={async () => {
                try {
                  setDownloading(true);
                  saveBlob(await api.courseResources.downloadTaskFile(s.id), s.file_name || "submission");
                } catch {
                  alert("Could not download the file. Please try again.");
                } finally {
                  setDownloading(false);
                }
              }}
              className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {s.file_name} <span className="text-gray-400 text-xs">{formatBytes(s.file_size)}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TaskSubmissionPanel({
  itemId,
  task: initialTask,
  onUpdated,
}: {
  itemId: number;
  task: StudentTask;
  onUpdated?: (task: StudentTask) => void;
}) {
  const [task, setTask] = useState<StudentTask>(initialTask);
  const cfg = task.config;
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => wordCount(text), [text]);
  const accept = useMemo(() => {
    const exts = new Set(cfg.file.allowed_types);
    if (exts.has("jpg")) exts.add("jpeg");
    return [...exts].map((e) => "." + e).join(",");
  }, [cfg.file.allowed_types]);
  const typeLabel = cfg.file.allowed_types.filter((e) => e !== "jpeg").map((e) => e.toUpperCase()).join(", ");

  const pickFile = (f: File | null) => {
    setErrors((e) => ({ ...e, file: [] }));
    if (!f) return setFile(null);
    const ext = extOf(f.name);
    const ok = cfg.file.allowed_types.includes(ext) || (ext === "jpeg" && cfg.file.allowed_types.includes("jpg"));
    if (!ok) {
      setErrors((e) => ({ ...e, file: [`That file type isn't accepted. Allowed: ${typeLabel}.`] }));
      if (fileRef.current) fileRef.current.value = "";
      return setFile(null);
    }
    if (f.size > cfg.file.max_size_mb * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: [`The file must be ${cfg.file.max_size_mb} MB or smaller.`] }));
      if (fileRef.current) fileRef.current.value = "";
      return setFile(null);
    }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const errs: Record<string, string[]> = {};
    if (cfg.text.mode === "required" && !text.trim()) errs.text = ["A written answer is required."];
    if (cfg.link.mode === "required" && !link.trim()) errs.link = ["A link is required."];
    if (cfg.file.mode === "required" && !file) errs.file = ["Please choose a file to upload."];
    if (!Object.keys(errs).length && !text.trim() && !link.trim() && !file) errs.text = ["Please add your response before submitting."];
    if (text.length > TEXT_MAX) errs.text = ["Your written answer is too long."];
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setSubmitting(true);
      setProgress(0);
      const res = await api.courseResources.submitTask(
        itemId,
        {
          text: cfg.text.mode !== "off" ? text : undefined,
          link: cfg.link.mode !== "off" ? link.trim() : undefined,
          file: cfg.file.mode !== "off" ? file : null,
        },
        setProgress
      );
      setTask(res.task);
      onUpdated?.(res.task);
      setText("");
      setLink("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setMessage({ ok: res.task.latest?.status !== "needs_revision", text: res.message });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") setErrors(data.errors);
      setMessage({ ok: false, text: data?.message || err?.friendlyMessage || "Could not submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const latest = task.latest;
  const exhausted = task.attempts_left === 0;

  return (
    <div className="rounded-xl border border-[#4A3AFF]/20 bg-[#4A3AFF]/[0.03] p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <PenLine size={16} style={{ color: BRAND }} /> Your task
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {cfg.auto_grade ? "Marked automatically against your instructor's requirements" : "Reviewed by your instructor"}
            {cfg.pass_mark != null ? ` · pass mark ${cfg.pass_mark}%` : ""}
            {cfg.max_attempts ? ` · ${task.attempts} of ${cfg.max_attempts} attempts used` : ""}
          </p>
        </div>
      </div>

      {cfg.instructions && <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{cfg.instructions}</p>}

      {/* Requirements */}
      <ul className="flex flex-wrap gap-2">
        {cfg.text.mode !== "off" && (
          <li className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
            ✍️ Written answer {cfg.text.mode === "required" ? "(required)" : "(optional)"}
            {cfg.text.min_words ? ` · min ${cfg.text.min_words} words` : ""}
            {cfg.text.max_words ? ` · max ${cfg.text.max_words} words` : ""}
          </li>
        )}
        {cfg.link.mode !== "off" && (
          <li className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
            🔗 Link {cfg.link.mode === "required" ? "(required)" : "(optional)"}
            {cfg.link.allowed_domains.length ? ` · ${cfg.link.allowed_domains.join(", ")}` : ""}
          </li>
        )}
        {cfg.file.mode !== "off" && (
          <li className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
            📎 File {cfg.file.mode === "required" ? "(required)" : "(optional)"} · {typeLabel} · max {cfg.file.max_size_mb} MB
          </li>
        )}
      </ul>

      {latest && (
        <div className="rounded-lg bg-white border border-gray-200 p-3.5">
          <SubmissionView s={latest} />
        </div>
      )}

      {message && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
          {message.ok ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {task.can_submit ? (
        <form onSubmit={submit} className="space-y-3" noValidate>
          {latest && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {latest.status === "needs_revision" ? "Resubmit" : "Submit a new attempt"}
            </p>
          )}

          {cfg.text.mode !== "off" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Written answer {cfg.text.mode === "required" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, TEXT_MAX))}
                rows={6}
                maxLength={TEXT_MAX}
                spellCheck
                placeholder="Type your answer here…"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/30 focus:border-[#4A3AFF]"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={
                  (cfg.text.min_words && words < cfg.text.min_words) || (cfg.text.max_words && words > cfg.text.max_words)
                    ? "text-amber-700" : "text-gray-400"
                }>
                  {words} word{words === 1 ? "" : "s"}
                  {cfg.text.min_words ? ` · min ${cfg.text.min_words}` : ""}
                  {cfg.text.max_words ? ` · max ${cfg.text.max_words}` : ""}
                </span>
              </div>
              {errors.text?.map((m, i) => <p key={i} className="text-xs text-red-600 mt-1">{m}</p>)}
            </div>
          )}

          {cfg.link.mode !== "off" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Link {cfg.link.mode === "required" && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value.slice(0, 2048))}
                  maxLength={2048}
                  placeholder={cfg.link.allowed_domains.length ? `https://${cfg.link.allowed_domains[0]}/…` : "https://…"}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/30 focus:border-[#4A3AFF]"
                />
              </div>
              {errors.link?.map((m, i) => <p key={i} className="text-xs text-red-600 mt-1">{m}</p>)}
            </div>
          )}

          {cfg.file.mode !== "off" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                File {cfg.file.mode === "required" && <span className="text-red-500">*</span>}
              </label>
              {file ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <span className="text-sm text-gray-800 truncate">{file.name} <span className="text-xs text-gray-400">{formatBytes(file.size)}</span></span>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Remove file">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-4 text-sm text-gray-600 hover:border-[#4A3AFF] hover:text-[#4A3AFF] transition"
                >
                  <FileUp size={16} /> Choose a file ({typeLabel}, up to {cfg.file.max_size_mb} MB)
                </button>
              )}
              <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
              {errors.file?.map((m, i) => <p key={i} className="text-xs text-red-600 mt-1">{m}</p>)}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition hover:opacity-90"
            style={{ background: BRAND, borderRadius: "1rem 0.4rem 1rem 0.4rem" }}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {submitting ? (file && progress < 100 ? `Uploading ${progress}%` : "Checking…") : latest ? "Resubmit" : "Submit"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-600">
          {latest?.status === "passed"
            ? "🎉 You've completed this task."
            : exhausted
            ? "You've used all your attempts for this task. Your instructor can still review it."
            : "This task has been graded."}
        </p>
      )}

      {task.history?.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowHistory((v) => !v)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800">
            <ChevronDown size={14} className={`transition-transform ${showHistory ? "rotate-180" : ""}`} />
            Previous attempts ({task.history.length})
          </button>
          {showHistory && (
            <div className="mt-2 space-y-2">
              {task.history.map((h) => (
                <div key={h.id} className="rounded-lg bg-white border border-gray-100 p-3">
                  <SubmissionView s={h} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
