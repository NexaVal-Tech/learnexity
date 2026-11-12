import React, { useState } from 'react';
import { X, Paperclip, Send, ArrowLeft, Mail, AlertCircle, Loader2, Eye, PencilLine, FlaskConical, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import EmailEditor, { emailText } from './EmailEditor';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  recipients: Array<{ id: number; name: string; email: string }>;
  onSend: (data: MessageData) => Promise<void>;
}

interface MessageData {
  student_ids: number[];
  subject: string;
  message: string;
  attachment?: File;
}

const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED = /\.(pdf|docx?|jpe?g|png)$/i;

function errorText(err: any, fallback: string): string {
  return err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  isOpen,
  onClose,
  recipientCount,
  recipients,
  onSend,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const hasContent = subject.trim() !== '' && emailText(message) !== '';
  const sampleName = recipients[0]?.name || 'Mary Johnson';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED.test(f.name)) return setError('Attachments can be PDF, Word (doc/docx), JPG or PNG.');
    if (f.size > MAX_FILE) return setError('Attachments can be up to 10 MB.');
    setError('');
    setAttachment(f);
  };

  const openPreview = async () => {
    setTab('preview');
    setError('');
    try {
      setLoadingPreview(true);
      setPreview(await api.admin.students.previewMessage({ subject, message, sample_name: sampleName }));
    } catch (err: any) {
      setPreview(null);
      setError(errorText(err, 'Could not load the preview'));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleTest = async () => {
    if (!hasContent) return setError('Add a subject and a message first.');
    try {
      setTesting(true);
      setError('');
      setNotice('');
      const r = await api.admin.students.sendTestMessage({ subject, message, attachment: attachment || undefined });
      setNotice(r.message || 'Test email sent to your inbox.');
    } catch (err: any) {
      setError(errorText(err, 'Could not send the test email'));
    } finally {
      setTesting(false);
    }
  };

  const handleSend = async () => {
    if (!hasContent) {
      setError('Subject and message are required');
      return;
    }
    if (!window.confirm(`Send this email to ${recipientCount} student${recipientCount === 1 ? '' : 's'}?`)) return;

    try {
      setSending(true);
      setError('');
      setNotice('');

      await onSend({
        student_ids: recipients.map((r) => r.id),
        subject,
        message,
        attachment: attachment || undefined,
      });

      setSubject('');
      setMessage('');
      setAttachment(null);
      setPreview(null);
      setTab('write');
      onClose();
    } catch (err: any) {
      setError(errorText(err, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const tabBtn = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-[#4A3AFF] text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f0f14] w-full h-full md:h-auto md:w-[780px] md:max-h-[92vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden p-1 -ml-1 text-gray-600 dark:text-gray-300" aria-label="Close">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compose Message</h2>
              <p className="text-xs text-gray-500">Send a branded email to your students</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={tabBtn(tab === 'write')} onClick={() => setTab('write')}>
              <PencilLine size={14} /> Write
            </button>
            <button type="button" className={tabBtn(tab === 'preview')} onClick={openPreview}>
              <Eye size={14} /> Preview
            </button>
            <button onClick={onClose} className="hidden md:block ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {notice && (
          <div className="mx-4 mt-4 p-3 bg-[#F5F3FF] dark:bg-indigo-500/10 border border-[#E0D9FE] dark:border-indigo-500/25 rounded-lg flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#4A3AFF] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#4A3AFF] dark:text-indigo-300">{notice}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {tab === 'write' ? (
            <>
              {/* Recipients */}
              <div className="bg-[#F5F3FF] dark:bg-indigo-500/10 rounded-xl p-4 border border-[#E0D9FE] dark:border-indigo-500/25">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg">
                      <Mail size={18} className="text-[#4A3AFF]" />
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">{recipientCount}</span> student{recipientCount === 1 ? '' : 's'} will receive this email
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto mt-3">
                  {recipients.map((r) => (
                    <span key={r.id} className="px-2 py-0.5 bg-white dark:bg-white/10 border border-[#E0D9FE] dark:border-indigo-500/25 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900 dark:text-white" htmlFor="compose-subject">Subject *</label>
                <input
                  id="compose-subject"
                  type="text"
                  maxLength={255}
                  placeholder="e.g. Our webinar is just two days away!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A3AFF]/25 focus:border-[#4A3AFF] text-sm"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Message *</label>
                <EmailEditor value={message} onChange={setMessage} placeholder="Start writing… Press Enter for a new paragraph." />
                <ul className="text-[12px] leading-5 text-gray-500 dark:text-gray-400 list-disc pl-5">
                  <li>Each student is greeted automatically (“Hello Mary,”) — start straight with your message.</li>
                  <li>Press <b>Enter</b> for a new paragraph. Use the toolbar for headings, lists, links and a purple button.</li>
                  <li>Type <code className="px-1 rounded bg-gray-100 dark:bg-white/10">{'{first_name}'}</code> (or use the person icon) to insert each student’s first name.</li>
                  <li>End with your own sign-off (e.g. “Warm regards, Team Learnexity”) — nothing else is added.</li>
                </ul>
              </div>

              {/* Attachment */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Attachment (optional)</label>
                <input type="file" id="attachment-input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('attachment-input')?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-white/5"
                  >
                    <Paperclip size={16} />
                    {attachment ? attachment.name : 'Add attachment (PDF, Word, JPG, PNG · max 10 MB)'}
                  </button>
                  {attachment && (
                    <button type="button" onClick={() => setAttachment(null)} className="text-xs text-red-600 dark:text-red-400 hover:underline">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                This is exactly what students will see — shown here for <b>{sampleName}</b>.
              </p>
              {loadingPreview ? (
                <div className="flex items-center justify-center py-24 text-gray-500 gap-2"><Loader2 size={18} className="animate-spin" /> Loading preview…</div>
              ) : preview ? (
                <>
                  <div className="rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm">
                    <span className="text-gray-500">Subject: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{preview.subject || '(no subject yet)'}</span>
                  </div>
                  <iframe
                    title="Email preview"
                    sandbox=""
                    srcDoc={preview.html}
                    className="w-full h-[60vh] min-h-[420px] rounded-lg border border-gray-200 dark:border-white/10 bg-[#f4f4f7]"
                  />
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:px-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#0f0f14]">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || sending || !hasContent}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[#4A3AFF] text-[#4A3AFF] dark:text-indigo-300 hover:bg-[#F5F3FF] dark:hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />}
              Send test to me
            </button>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !hasContent}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-[#4A3AFF] text-white rounded-lg text-sm font-semibold hover:bg-[#3b2de0] disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {sending ? (<><Loader2 size={16} className="animate-spin" /> Sending…</>) : (<><Send size={16} /> Send to {recipientCount}</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessageModal;
