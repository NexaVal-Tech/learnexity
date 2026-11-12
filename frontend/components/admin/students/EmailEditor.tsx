// components/admin/students/EmailEditor.tsx
//
// Simple editor for student emails: Enter starts a new paragraph, and the
// toolbar adds bold, headings, lists, links, a purple button, a divider and
// the {first_name} placeholder. The server cleans the result again before
// sending (StudentEmailContent), so this only has to be convenient.
import React, { useEffect, useRef } from 'react';
import {
  Bold, Italic, Underline, Heading2, Pilcrow, List, ListOrdered, Link2, Unlink, MousePointerClick,
  Minus, UserRound, RemoveFormatting, Undo2, Redo2,
} from 'lucide-react';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function normalizeUrl(raw: string): string | null {
  const u = raw.trim();
  if (!u) return null;
  if (/^(javascript|vbscript|data):/i.test(u.replace(/\s+/g, ''))) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(u)) return u;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) return `mailto:${u}`;
  return `https://${u.replace(/^\/+/, '')}`;
}

/** Plain text pasted in → paragraphs (blank line = new paragraph). */
function textToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export default function EmailEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef('');
  const saved = useRef<Range | null>(null);

  // Only overwrite the DOM when the value changed from outside (e.g. reset).
  useEffect(() => {
    if (ref.current && value !== last.current) {
      ref.current.innerHTML = value || '';
      last.current = value || '';
    }
  }, [value]);

  const emit = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML === '<br>' ? '' : ref.current.innerHTML;
    last.current = html;
    onChange(html);
  };

  const focus = () => {
    ref.current?.focus();
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* older browsers */ }
  };

  const run = (cmd: string, arg?: string) => {
    focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSel = () => {
    focus();
    const sel = window.getSelection();
    if (saved.current && sel) { sel.removeAllRanges(); sel.addRange(saved.current); }
  };
  const selectedText = () => (saved.current ? saved.current.toString() : '');

  const addLink = () => {
    saveSel();
    const url = normalizeUrl(window.prompt('Link address (e.g. https://learnexity.org/courses)') || '');
    if (!url) return;
    const text = selectedText();
    restoreSel();
    if (text) {
      document.execCommand('createLink', false, url);
    } else {
      const label = window.prompt('Text to show for the link', url) || url;
      document.execCommand('insertHTML', false, `<a href="${esc(url)}">${esc(label)}</a>&nbsp;`);
    }
    emit();
  };

  const addButton = () => {
    saveSel();
    const label = (window.prompt('Button text (e.g. Register now)', selectedText() || 'Register now') || '').trim();
    if (!label) return;
    const url = normalizeUrl(window.prompt('Where should the button go?') || '');
    if (!url) return;
    restoreSel();
    document.execCommand('insertHTML', false, `<p><a class="email-btn" href="${esc(url)}">${esc(label)}</a></p><p><br></p>`);
    emit();
  };

  const tools: { icon: React.ReactNode; title: string; action: () => void }[] = [
    { icon: <Bold size={15} />, title: 'Bold', action: () => run('bold') },
    { icon: <Italic size={15} />, title: 'Italic', action: () => run('italic') },
    { icon: <Underline size={15} />, title: 'Underline', action: () => run('underline') },
    { icon: <Heading2 size={15} />, title: 'Heading', action: () => run('formatBlock', '<h2>') },
    { icon: <Pilcrow size={15} />, title: 'Normal paragraph', action: () => run('formatBlock', '<p>') },
    { icon: <List size={15} />, title: 'Bullet list', action: () => run('insertUnorderedList') },
    { icon: <ListOrdered size={15} />, title: 'Numbered list', action: () => run('insertOrderedList') },
    { icon: <Link2 size={15} />, title: 'Add link', action: addLink },
    { icon: <Unlink size={15} />, title: 'Remove link', action: () => run('unlink') },
    { icon: <MousePointerClick size={15} />, title: 'Add button', action: addButton },
    { icon: <Minus size={15} />, title: 'Divider line', action: () => run('insertHorizontalRule') },
    { icon: <UserRound size={15} />, title: "Insert student's first name", action: () => run('insertText', '{first_name}') },
    { icon: <RemoveFormatting size={15} />, title: 'Clear formatting', action: () => run('removeFormat') },
    { icon: <Undo2 size={15} />, title: 'Undo', action: () => run('undo') },
    { icon: <Redo2 size={15} />, title: 'Redo', action: () => run('redo') },
  ];

  return (
    <div className="border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden bg-white dark:bg-white/5 focus-within:ring-2 focus-within:ring-[#4A3AFF]/25 focus-within:border-[#4A3AFF]">
      <style>{`
        .lx-mail p { margin: 0 0 12px; }
        .lx-mail h2 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; }
        .lx-mail ul { list-style: disc; padding-left: 22px; margin: 0 0 12px; }
        .lx-mail ol { list-style: decimal; padding-left: 22px; margin: 0 0 12px; }
        .lx-mail a { color: #4A3AFF; text-decoration: underline; }
        .lx-mail a.email-btn { display: inline-block; background: #4A3AFF; color: #fff; text-decoration: none; padding: 8px 20px; border-radius: 9999px; font-weight: 600; }
        .lx-mail hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0; }
        .lx-mail:empty:before { content: attr(data-placeholder); color: #9ca3af; }
      `}</style>
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            onMouseDown={(e) => e.preventDefault()} // keep the text selection
            onClick={t.action}
            className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder || 'Type your message here…'}
        onFocus={focus}
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          // Paste as clean paragraphs — drops fonts/colours from Word, Docs or websites.
          const text = e.clipboardData.getData('text/plain');
          e.preventDefault();
          if (text) document.execCommand('insertHTML', false, textToHtml(text));
          emit();
        }}
        className="lx-mail min-h-[220px] max-h-[420px] overflow-y-auto px-4 py-3 text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 focus:outline-none"
      />
    </div>
  );
}

/** Readable text in the editor's HTML (for "is it empty?" checks). */
export function emailText(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
