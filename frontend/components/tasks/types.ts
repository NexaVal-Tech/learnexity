// Shared types for sprint tasks (see server TaskSubmissionService).

export type ResponseMode = "off" | "optional" | "required";
export type SubmissionStatus = "submitted" | "passed" | "needs_revision" | "graded";

/** Full requirements — what admins/instructors edit. */
export interface TaskConfig {
  enabled: boolean;
  instructions: string;
  text: { mode: ResponseMode; min_words: number | null; max_words: number | null; keywords: string[]; keyword_min: number | null };
  link: { mode: ResponseMode; allowed_domains: string[] };
  file: { mode: ResponseMode; allowed_types: string[]; max_size_mb: number };
  auto_grade: boolean;
  pass_mark: number | null;
  max_attempts: number | null;
}

/** What students see (keywords hidden). */
export interface PublicTaskConfig {
  instructions: string;
  text: { mode: ResponseMode; min_words: number | null; max_words: number | null; has_keywords: boolean };
  link: { mode: ResponseMode; allowed_domains: string[] };
  file: { mode: ResponseMode; allowed_types: string[]; max_size_mb: number };
  auto_grade: boolean;
  pass_mark: number | null;
  max_attempts: number | null;
}

export interface TaskCheck {
  label: string;
  passed: boolean;
  detail?: string | null;
}

export interface TaskSubmission {
  id: number;
  attempt: number;
  status: SubmissionStatus;
  text_response: string | null;
  link_url: string | null;
  file_name: string | null;
  file_size: number | null;
  has_file: boolean;
  score: number | null;
  auto_score: number | null;
  checks: TaskCheck[];
  feedback: string | null;
  graded_by: "auto" | "admin" | "instructor" | null;
  graded_at: string | null;
  submitted_at: string | null;
}

export interface GraderSubmission extends TaskSubmission {
  graded_by_name?: string | null;
  student: { id: number; name: string; email: string } | null;
  item: { id: number; title: string; sprint: string | null; pass_mark: number | null } | null;
}

export interface StudentTask {
  locked?: boolean;
  config: PublicTaskConfig;
  attempts: number;
  attempts_left: number | null;
  can_submit: boolean;
  latest: TaskSubmission | null;
  history: TaskSubmission[];
}

export interface TaskSubmissionList {
  submissions: GraderSubmission[];
  pagination: { current_page: number; last_page: number; total: number };
  counts: Partial<Record<SubmissionStatus, number>>;
  tasks: { id: number; title: string }[];
}

export interface TaskListParams {
  status?: SubmissionStatus | "all";
  item_id?: number;
  search?: string;
  page?: number;
}

export interface GradePayload {
  action: "grade" | "request_revision";
  score?: number | null;
  feedback?: string;
  notify?: boolean;
}

/** Must match TaskSubmissionService::FILE_TYPES. */
export const TASK_FILE_TYPES: { ext: string; label: string }[] = [
  { ext: "pdf", label: "PDF" },
  { ext: "docx", label: "Word (.docx)" },
  { ext: "xlsx", label: "Excel (.xlsx)" },
  { ext: "pptx", label: "PowerPoint (.pptx)" },
  { ext: "png", label: "PNG" },
  { ext: "jpg", label: "JPG / JPEG" },
  { ext: "webp", label: "WebP" },
  { ext: "txt", label: "Text (.txt)" },
  { ext: "md", label: "Markdown (.md)" },
  { ext: "csv", label: "CSV" },
  { ext: "zip", label: "ZIP" },
];

export const DEFAULT_TASK_CONFIG: TaskConfig = {
  enabled: true,
  instructions: "",
  text: { mode: "required", min_words: null, max_words: null, keywords: [], keyword_min: null },
  link: { mode: "off", allowed_domains: [] },
  file: { mode: "off", allowed_types: ["pdf", "docx", "png", "jpg"], max_size_mb: 10 },
  auto_grade: true,
  pass_mark: null,
  max_attempts: null,
};

export function normalizeTaskConfig(raw: unknown): TaskConfig {
  const c = (raw && typeof raw === "object" ? raw : {}) as Partial<TaskConfig>;
  const d = DEFAULT_TASK_CONFIG;
  return {
    enabled: c.enabled ?? false,
    instructions: c.instructions ?? "",
    text: { ...d.text, ...(c.text ?? {}) , keywords: c.text?.keywords ?? [] },
    link: { ...d.link, ...(c.link ?? {}), allowed_domains: c.link?.allowed_domains ?? [] },
    file: { ...d.file, ...(c.file ?? {}), allowed_types: (c.file?.allowed_types ?? d.file.allowed_types).filter((e) => e !== "jpeg") },
    auto_grade: c.auto_grade ?? true,
    pass_mark: c.pass_mark ?? null,
    max_attempts: c.max_attempts ?? null,
  };
}

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  submitted: "Awaiting review",
  passed: "Passed",
  needs_revision: "Needs revision",
  graded: "Graded",
};

export function formatScore(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `${Number(n.toFixed(2))}%`;
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Only ever link to http(s) — defence in depth on top of server validation. */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name || "submission";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
