// pages/admin/cms/emails/[key].tsx — edit one email: subject, and optionally heading / body / button.
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, Eye, Loader2, RotateCcw, Save, Send } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { useUnsavedGuard } from "@/components/admin/cms/useUnsavedGuard";
import {
  apiErrorMessage,
  emailTemplatesAdmin,
  type EmailTemplateDetail,
  type EmailTemplateInput,
} from "@/lib/cms/adminClient";

const input =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-[#0b0b10] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40";
const label = "block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1";

export default function EmailTemplateEditor() {
  const router = useRouter();
  const key = typeof router.query.key === "string" ? router.query.key : "";
  const [detail, setDetail] = useState<EmailTemplateDetail | null>(null);
  const [form, setForm] = useState<EmailTemplateInput | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "ok" | "error" } | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<keyof EmailTemplateInput>("body");

  useUnsavedGuard(dirty);

  const load = useCallback(async () => {
    if (!key) return;
    try {
      const d = await emailTemplatesAdmin.get(key);
      setDetail(d);
      const t = d.template;
      setForm({
        subject: t?.subject ?? "",
        customize_body: !!t?.customize_body,
        heading: t?.heading ?? d.defaults.heading,
        body: t?.body ?? d.defaults.body,
        button_label: t?.button_label ?? d.defaults.button,
      });
      setDirty(false);
    } catch (e) {
      setToast({ text: apiErrorMessage(e, "Couldn't load this email."), kind: "error" });
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k: keyof EmailTemplateInput, v: string | boolean) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setDirty(true);
  };

  /** Insert {placeholder} into the field the admin last typed in. */
  const insert = (name: string) => {
    if (!form) return;
    const k = lastFocused.current;
    if (k === "customize_body") return;
    const token = `{${name}}`;
    if (k === "body" && bodyRef.current) {
      const el = bodyRef.current;
      const start = el.selectionStart ?? form.body.length;
      const end = el.selectionEnd ?? start;
      set("body", form.body.slice(0, start) + token + form.body.slice(end));
      requestAnimationFrame(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = start + token.length;
      });
      return;
    }
    set(k, `${(form[k] as string) ?? ""}${token}`);
  };

  const save = async () => {
    if (!form || saving) return;
    setSaving(true);
    try {
      await emailTemplatesAdmin.save(key, form);
      setDirty(false);
      setToast({ text: "Saved — the next emails will use this.", kind: "ok" });
      load();
    } catch (e) {
      setToast({ text: apiErrorMessage(e, "Couldn't save."), kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Go back to the original email? Your custom text will be removed.")) return;
    try {
      await emailTemplatesAdmin.reset(key);
      setToast({ text: "Back to the original email.", kind: "ok" });
      load();
    } catch (e) {
      setToast({ text: apiErrorMessage(e), kind: "error" });
    }
  };

  const showPreview = async () => {
    if (!form) return;
    setPreviewing(true);
    try {
      setPreview(await emailTemplatesAdmin.preview(key, form));
    } catch (e) {
      setToast({ text: apiErrorMessage(e, "Couldn't build the preview."), kind: "error" });
    } finally {
      setPreviewing(false);
    }
  };

  const sendTest = async () => {
    if (!form) return;
    setSending(true);
    try {
      const r = await emailTemplatesAdmin.test(key, form);
      setToast({ text: r.message, kind: "ok" });
    } catch (e) {
      setToast({ text: apiErrorMessage(e, "Couldn't send the test email."), kind: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminRouteGuard requiredPermission="cms">
      <AdminLayout>
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
          <Link href="/admin/cms/emails" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
            <ArrowLeft size={15} /> Emails
          </Link>

          {!detail || !form ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-5">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{detail.label}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{detail.description}</p>
                </div>
                <button
                  onClick={save}
                  disabled={saving || !dirty}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>

              {toast && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex ${toast.kind === "ok" ? "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300" : "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300"}`}>
                  <span className="flex-1">{toast.text}</span>
                  <button onClick={() => setToast(null)}>✕</button>
                </div>
              )}

              <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-5">
                {/* Placeholders */}
                {detail.placeholders.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Placeholders — click to insert. They&apos;re replaced with the real details when the email is sent.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.placeholders.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => insert(p.name)}
                          title={`${p.label} — e.g. ${p.sample}`}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 hover:bg-indigo-100"
                        >
                          {`{${p.name}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className={label}>Subject</label>
                  <input
                    className={input}
                    value={form.subject}
                    placeholder={detail.defaults.subject}
                    onFocus={() => (lastFocused.current = "subject")}
                    onChange={(e) => set("subject", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep the original subject.</p>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.customize_body}
                    onChange={(e) => set("customize_body", e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">Customise the email content</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Off: the original designed email is sent. On: your heading, text and button below are sent in the Learnexity email layout.
                    </span>
                  </span>
                </label>

                {form.customize_body && (
                  <>
                    <div>
                      <label className={label}>Heading</label>
                      <input className={input} value={form.heading} onFocus={() => (lastFocused.current = "heading")} onChange={(e) => set("heading", e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Message</label>
                      <textarea
                        ref={bodyRef}
                        className={`${input} font-[inherit] leading-relaxed`}
                        rows={10}
                        value={form.body}
                        onFocus={() => (lastFocused.current = "body")}
                        onChange={(e) => set("body", e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave a blank line between paragraphs. Wrap words in **double asterisks** to make them bold.</p>
                    </div>
                    <div>
                      <label className={label}>Button text</label>
                      <input className={input} value={form.button_label} onFocus={() => (lastFocused.current = "button_label")} onChange={(e) => set("button_label", e.target.value)} />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for no button. The button always links to the right page automatically.</p>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
                  <button onClick={showPreview} disabled={previewing} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                    {previewing ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Preview
                  </button>
                  <button onClick={sendTest} disabled={sending} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send me a test
                  </button>
                  {detail.template && (
                    <button onClick={reset} className="ml-auto inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600">
                      <RotateCcw size={14} /> Reset to original
                    </button>
                  )}
                </div>
                {!form.customize_body && (
                  <p className="text-xs text-gray-500">The preview and test show the Learnexity layout with this text; the live email keeps its original design until you turn on “Customise the email content”.</p>
                )}
              </div>
            </>
          )}
        </div>

        {preview && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
            <div className="bg-white dark:bg-[#0f0f14] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                <p className="flex-1 text-sm text-gray-900 dark:text-white truncate"><span className="text-gray-500">Subject:</span> {preview.subject}</p>
                <button onClick={() => setPreview(null)} className="text-gray-500">✕</button>
              </div>
              <iframe title="Email preview" srcDoc={preview.html} sandbox="" className="flex-1 w-full min-h-[70vh] bg-[#f4f4f5]" />
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
}
