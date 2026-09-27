// components/admin/cms/RichTextEditor.tsx
//
// Lightweight WYSIWYG editor (no extra npm dependency): a contentEditable
// area with a formatting toolbar and an HTML source view. Whatever it
// produces is sanitized again by the backend on save
// (CmsContentSanitizer), so this editor only has to be convenient, not
// secure.
import React, { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Heading2, Heading3, Pilcrow, List, ListOrdered, Quote, Link2, Unlink,
  ImagePlus, Minus, RemoveFormatting, Undo2, Redo2, Code2,
} from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { MediaPickerModal } from "./MediaLibrary";

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string>("");
  const [source, setSource] = useState(false);
  const [picker, setPicker] = useState(false);
  const savedRange = useRef<Range | null>(null);

  // Only overwrite the DOM when the value changed from outside (e.g. a
  // revision was restored) — never while the admin is typing, or the caret
  // would jump to the start.
  useEffect(() => {
    if (!source && ref.current && value !== lastEmitted.current) {
      ref.current.innerHTML = value || "";
      lastEmitted.current = value || "";
    }
  }, [value, source]);

  const emit = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML === "<br>" ? "" : ref.current.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  };

  const run = (command: string, arg?: string) => {
    ref.current?.focus();
    exec(command, arg);
    emit();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const addLink = () => {
    saveSelection();
    const url = window.prompt("Link address (e.g. /courses/courses, https://…, mailto:…)");
    if (!url) return;
    restoreSelection();
    const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    run("createLink", safe);
  };

  const buttons: { icon: React.ReactNode; title: string; action: () => void }[] = [
    { icon: <Bold size={15} />, title: "Bold", action: () => run("bold") },
    { icon: <Italic size={15} />, title: "Italic", action: () => run("italic") },
    { icon: <Underline size={15} />, title: "Underline", action: () => run("underline") },
    { icon: <Heading2 size={15} />, title: "Heading 2 (main section)", action: () => run("formatBlock", "<h2>") },
    { icon: <Heading3 size={15} />, title: "Heading 3 (sub-section)", action: () => run("formatBlock", "<h3>") },
    { icon: <Pilcrow size={15} />, title: "Normal paragraph", action: () => run("formatBlock", "<p>") },
    { icon: <List size={15} />, title: "Bullet list", action: () => run("insertUnorderedList") },
    { icon: <ListOrdered size={15} />, title: "Numbered list", action: () => run("insertOrderedList") },
    { icon: <Quote size={15} />, title: "Highlighted box / quote", action: () => run("formatBlock", "<blockquote>") },
    { icon: <Link2 size={15} />, title: "Add link", action: addLink },
    { icon: <Unlink size={15} />, title: "Remove link", action: () => run("unlink") },
    {
      icon: <ImagePlus size={15} />,
      title: "Insert image",
      action: () => {
        saveSelection();
        setPicker(true);
      },
    },
    { icon: <Minus size={15} />, title: "Divider line", action: () => run("insertHorizontalRule") },
    { icon: <RemoveFormatting size={15} />, title: "Clear formatting", action: () => run("removeFormat") },
    { icon: <Undo2 size={15} />, title: "Undo", action: () => run("undo") },
    { icon: <Redo2 size={15} />, title: "Redo", action: () => run("redo") },
  ];

  return (
    <div className="border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden bg-white dark:bg-white/5">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
        {!source &&
          buttons.map((b) => (
            <button
              key={b.title}
              type="button"
              title={b.title}
              onMouseDown={(e) => e.preventDefault()} // keep the text selection
              onClick={b.action}
              className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              {b.icon}
            </button>
          ))}
        <button
          type="button"
          onClick={() => {
            // Leaving HTML view re-mounts the visual editor, so make the
            // effect above repopulate it.
            if (source) lastEmitted.current = "\u0000";
            setSource((v) => !v);
          }}
          className={`ml-auto inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            source ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
          title="Edit the HTML directly"
        >
          <Code2 size={13} /> HTML
        </button>
      </div>

      {source ? (
        <textarea
          value={value}
          onChange={(e) => {
            lastEmitted.current = "\u0000"; // force a DOM refresh when switching back
            onChange(e.target.value);
          }}
          rows={14}
          spellCheck={false}
          className="w-full p-3 font-mono text-xs bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            // Keep structure (headings, lists, links, bold) but drop the
            // styling junk that comes with text copied from Word/Docs/sites.
            const html = e.clipboardData.getData("text/html");
            if (html) {
              e.preventDefault();
              exec("insertHTML", sanitizeHtml(html));
              emit();
            }
          }}
          className="cms-prose cms-prose-sm min-h-[180px] max-h-[520px] overflow-y-auto p-3 focus:outline-none"
        />
      )}

      <MediaPickerModal
        kind="image"
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(url, item) => {
          ref.current?.focus();
          restoreSelection();
          const alt = (item?.alt || "").replace(/"/g, "&quot;");
          exec("insertHTML", `<img src="${url}" alt="${alt}">`);
          emit();
        }}
      />
    </div>
  );
}
