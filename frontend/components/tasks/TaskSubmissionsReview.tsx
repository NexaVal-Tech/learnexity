import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Download, Link2, Loader2, RotateCcw, Search, XCircle, Inbox } from "lucide-react";
import {
  STATUS_LABEL, formatBytes, formatScore, safeHref, saveBlob,
  type GradePayload, type GraderSubmission, type SubmissionStatus, type TaskListParams, type TaskSubmissionList,
} from "./types";

const FILTERS: { key: SubmissionStatus | "all"; label: string }[] = [
  { key: "submitted", label: "Awaiting review" },
  { key: "needs_revision", label: "Needs revision" },
  { key: "passed", label: "Passed" },
  { key: "graded", label: "Graded" },
  { key: "all", label: "All" },
];

function badge(status: SubmissionStatus) {
  switch (status) {
    case "passed": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "needs_revision": return "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
    case "graded": return "bg-[#4A3AFF]/10 text-[#4A3AFF] dark:text-[#a59dff]";
    default: return "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200";
  }
}

function ReviewCard({
  s, onGrade, onDownload,
}: {
  s: GraderSubmission;
  onGrade: (id: number, p: GradePayload) => Promise<GraderSubmission>;
  onDownload: (id: number) => Promise<Blob>;
}) {
  const [open, setOpen] = useState(s.status === "submitted");
  const [cur, setCur] = useState(s);
  const [score, setScore] = useState<string>(s.score != null ? String(s.score) : "");
  const [feedback, setFeedback] = useState(s.feedback ?? "");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState<null | "grade" | "request_revision" | "file">(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const href = safeHref(cur.link_url);

  const act = async (action: GradePayload["action"]) => {
    setMsg(null);
    const n = score.trim() === "" ? null : Number(score);
    if (action === "grade" && (n === null || Number.isNaN(n) || n < 0 || n > 100)) {
      setMsg({ ok: false, text: "Enter a score between 0 and 100." });
      return;
    }
    try {
      setBusy(action);
      const updated = await onGrade(cur.id, { action, score: n, feedback: feedback.trim(), notify });
      setCur(updated);
      setMsg({ ok: true, text: action === "grade" ? "Grade saved." : "Resubmission requested." });
    } catch (e: any) {
      const d = e?.response?.data;
      setMsg({ ok: false, text: (d?.errors && (Object.values(d.errors).flat()[0] as string)) || d?.message || "Could not save the review." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{cur.student?.name ?? "Student"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {cur.item?.title}{cur.item?.sprint ? ` · ${cur.item.sprint}` : ""} · attempt {cur.attempt}
            {cur.submitted_at ? ` · ${new Date(cur.submitted_at).toLocaleString()}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {cur.score != null && <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatScore(cur.score)}</span>}
          <span className={`text-xs px-2 py-1 rounded-full ${badge(cur.status)}`}>{STATUS_LABEL[cur.status]}</span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-white/10 p-4 grid lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Submission */}
          <div className="space-y-3 min-w-0">
            {cur.student?.email && <p className="text-xs text-gray-500 dark:text-gray-400">{cur.student.email}</p>}
            {cur.text_response && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Written answer</p>
                {/* Rendered as plain text — never HTML */}
                <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words max-h-80 overflow-y-auto rounded-lg bg-gray-50 dark:bg-white/5 p-3">{cur.text_response}</p>
              </div>
            )}
            {cur.link_url && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Link</p>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="inline-flex items-center gap-1.5 text-sm text-[#4A3AFF] hover:underline break-all">
                    <Link2 size={14} className="flex-shrink-0" /> {cur.link_url}
                  </a>
                ) : (
                  <span className="text-sm text-gray-500 break-all">{cur.link_url}</span>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5">Opens the student&apos;s link in a new tab — check it looks right before clicking.</p>
              </div>
            )}
            {cur.has_file && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">File</p>
                <button
                  type="button"
                  disabled={busy === "file"}
                  onClick={async () => {
                    try {
                      setBusy("file");
                      saveBlob(await onDownload(cur.id), cur.file_name || "submission");
                    } catch {
                      setMsg({ ok: false, text: "Could not download the file." });
                    } finally {
                      setBusy(null);
                    }
                  }}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/15 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  {busy === "file" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {cur.file_name} <span className="text-xs text-gray-400">{formatBytes(cur.file_size)}</span>
                </button>
              </div>
            )}
            {cur.checks?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Automatic marking {cur.auto_score != null ? `· ${formatScore(cur.auto_score)}` : ""}
                </p>
                <ul className="space-y-1">
                  {cur.checks.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                      {c.passed ? <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" /> : <XCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />}
                      <span>{c.label}{c.detail ? <span className="text-gray-400"> — {c.detail}</span> : null}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Review */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Score (0–100){cur.item?.pass_mark != null ? ` · pass mark ${cur.item.pass_mark}%` : ""}
              </label>
              <input
                type="number" min={0} max={100} step="0.5" value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Feedback for the student</label>
              <textarea
                rows={5} maxLength={5000} value={feedback} onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="What went well, and what to improve…"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-[#4A3AFF]" />
              Email the student about this review
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!!busy} onClick={() => act("grade")} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#4A3AFF] text-white disabled:opacity-60">
                {busy === "grade" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save grade
              </button>
              <button type="button" disabled={!!busy} onClick={() => act("request_revision")} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-60">
                {busy === "request_revision" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Ask to resubmit
              </button>
            </div>
            {cur.graded_by && cur.graded_by !== "auto" && (
              <p className="text-[11px] text-gray-400">Last reviewed by {cur.graded_by_name || cur.graded_by}{cur.graded_at ? ` · ${new Date(cur.graded_at).toLocaleString()}` : ""}</p>
            )}
            {msg && <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/** Review queue for sprint task submissions — used by admin and instructor pages. */
export default function TaskSubmissionsReview({
  load, grade, download,
}: {
  load: (p: TaskListParams) => Promise<TaskSubmissionList>;
  grade: (id: number, p: GradePayload) => Promise<{ submission: GraderSubmission }>;
  download: (id: number) => Promise<Blob>;
}) {
  const [status, setStatus] = useState<SubmissionStatus | "all">("submitted");
  const [itemId, setItemId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TaskSubmissionList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Callers often pass inline functions — keep the latest in a ref so the
  // list doesn't refetch on every parent render.
  const loadRef = useRef(load);
  loadRef.current = load;

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await loadRef.current({ status, item_id: itemId || undefined, search: query || undefined, page }));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, [status, itemId, query, page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const counts = data?.counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const n = f.key === "all" ? total : counts[f.key] ?? 0;
          return (
            <button
              key={f.key}
              onClick={() => { setStatus(f.key); setPage(1); }}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                status === f.key ? "bg-[#4A3AFF] border-[#4A3AFF] text-white" : "border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-[#4A3AFF]"
              }`}
            >
              {f.label} <span className="opacity-70">({n})</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={itemId}
          onChange={(e) => { setItemId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white sm:max-w-xs"
        >
          <option value="">All tasks</option>
          {data?.tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); setQuery(search.trim()); setPage(1); }}
        >
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value.slice(0, 100))}
            placeholder="Search student name or email, then press Enter"
            className="w-full rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : error ? (
        <p className="text-sm text-red-600 py-8 text-center">{error}</p>
      ) : !data || data.submissions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-500 dark:text-gray-400">
          <Inbox className="w-8 h-8 text-gray-300" />
          <p className="text-sm">
            {data && data.tasks.length === 0
              ? "No tasks yet. Open a topic in Sprints and use “Task” to set requirements."
              : "No submissions here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.submissions.map((s) => (
            <ReviewCard
              key={s.id}
              s={s}
              onDownload={download}
              onGrade={async (id, p) => {
                const r = await grade(id, p);
                // refresh counts in the background
                loadRef.current({ status, item_id: itemId || undefined, search: query || undefined, page })
                  .then((d) => setData((prev) => (prev ? { ...prev, counts: d.counts } : d)))
                  .catch(() => {});
                return r.submission;
              }}
            />
          ))}
          {data.pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/15 disabled:opacity-40">Previous</button>
              <span className="text-sm text-gray-500">Page {data.pagination.current_page} of {data.pagination.last_page}</span>
              <button disabled={page >= data.pagination.last_page} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-white/15 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
