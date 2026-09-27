// components/admin/cms/FieldEditor.tsx
//
// Renders an edit form from a block's field schema (lib/cms/fields.ts).
// Every block, the navbar and the footer are edited through this one
// component, so a new block only needs a schema — no custom admin UI.
import React, { useState } from "react";
import {
  ChevronDown, ChevronRight, ChevronUp, Copy, GripVertical, ImageIcon, Film, Plus, Trash2, X, Upload,
} from "lucide-react";
import { isFieldVisible, type Field } from "@/lib/cms/fields";
import { CMS_ICONS, CmsIcon } from "@/components/cms/ui";
import { looksLikeVideo } from "@/lib/cms/url";
import RichTextEditor from "./RichTextEditor";
import { MediaPickerModal } from "./MediaLibrary";

type Obj = Record<string, any>;

const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

function Label({ field }: { field: Field }) {
  return (
    <div className="mb-1">
      <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{field.label}</span>
      {field.help && <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{field.help}</span>}
    </div>
  );
}

/** Edit an object whose keys are described by `fields`. */
export default function FieldEditor({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (next: Obj) => void }) {
  const v = value ?? {};
  return (
    <div className="space-y-4">
      {fields.map((field) =>
        isFieldVisible(field, v) ? (
          <FieldInput key={field.key} field={field} value={v[field.key]} onChange={(fv) => onChange({ ...v, [field.key]: fv })} />
        ) : null
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case "text":
      return (
        <label className="block">
          <Label field={field} />
          <input className={inputCls} value={value ?? ""} maxLength={field.maxLength} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </label>
      );
    case "textarea":
      return (
        <label className="block">
          <Label field={field} />
          <textarea className={`${inputCls} resize-y`} rows={field.rows ?? 3} value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </label>
      );
    case "richtext":
      return (
        <div>
          <Label field={field} />
          <RichTextEditor value={value ?? ""} onChange={onChange} />
        </div>
      );
    case "url":
      return (
        <label className="block">
          <Label field={field} />
          <input className={inputCls} value={value ?? ""} placeholder={field.placeholder ?? "/page or https://…"} onChange={(e) => onChange(e.target.value)} />
          <UrlWarning url={value} />
        </label>
      );
    case "number":
      return (
        <label className="block">
          <Label field={field} />
          <input
            type="number"
            className={inputCls}
            value={value ?? ""}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
      );
    case "boolean":
      return (
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-600" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>
            <span className="block text-sm text-gray-800 dark:text-gray-200">{field.label}</span>
            {field.help && <span className="block text-[11px] text-gray-500 dark:text-gray-400">{field.help}</span>}
          </span>
        </label>
      );
    case "select":
      return (
        <label className="block">
          <Label field={field} />
          <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {!field.options.some((o) => o.value === value) && <option value={value ?? ""}>{value ? String(value) : "— choose —"}</option>}
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      );
    case "color":
      return (
        <label className="block">
          <Label field={field} />
          <div className="flex gap-2">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value ?? "") ? value : "#4a3aff"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border border-gray-200 dark:border-white/20" />
            <input className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#4A3AFF" />
          </div>
        </label>
      );
    case "image":
    case "video":
      return <MediaField field={field} kind={field.type} value={value ?? ""} onChange={onChange} />;
    case "icon":
      return <IconField field={field} value={value ?? ""} onChange={onChange} />;
    case "link": {
      const v = value ?? {};
      return (
        <fieldset className="border border-gray-200 dark:border-white/10 rounded-lg p-3">
          <legend className="px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{field.label}</legend>
          {field.help && <p className="text-[11px] text-gray-500 mb-2">{field.help}</p>}
          <div className="grid sm:grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Text" value={v.label ?? ""} onChange={(e) => onChange({ ...v, label: e.target.value })} />
            <input className={inputCls} placeholder="/page or https://…" value={v.href ?? ""} onChange={(e) => onChange({ ...v, href: e.target.value })} />
          </div>
          <UrlWarning url={v.href} />
          <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
            <input type="checkbox" className="accent-indigo-600" checked={!!v.newTab} onChange={(e) => onChange({ ...v, newTab: e.target.checked })} />
            Open in a new tab
          </label>
        </fieldset>
      );
    }
    case "group":
      return (
        <fieldset className="border border-gray-200 dark:border-white/10 rounded-lg p-3">
          <legend className="px-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{field.label}</legend>
          {field.help && <p className="text-[11px] text-gray-500 mb-2">{field.help}</p>}
          <FieldEditor fields={field.fields} value={value ?? {}} onChange={onChange} />
        </fieldset>
      );
    case "list":
      return <ListEditor field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />;
    default:
      return null;
  }
}

function UrlWarning({ url }: { url?: string }) {
  const u = (url ?? "").trim();
  if (!u || /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(u)) return null;
  return <p className="mt-1 text-[11px] text-amber-600">Links should start with “/” (a page on this site) or “https://”.</p>;
}

// ─── Media ────────────────────────────────────────────────────────────────────

function MediaField({ field, kind, value, onChange }: { field: Field; kind: "image" | "video"; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const isVideo = kind === "video" || looksLikeVideo(value);
  return (
    <div>
      <Label field={field} />
      <div className="flex gap-3 items-start">
        <div className="w-28 h-20 flex-shrink-0 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 overflow-hidden flex items-center justify-center">
          {value ? (
            isVideo ? (
              <video src={value} className="w-full h-full object-cover" muted preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="w-full h-full object-contain" />
            )
          ) : kind === "video" ? (
            <Film size={22} className="text-gray-300" />
          ) : (
            <ImageIcon size={22} className="text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Upload size={13} /> {value ? "Replace" : kind === "video" ? "Upload / choose video" : "Upload / choose image"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/20 rounded-lg">
                <X size={13} /> Remove
              </button>
            )}
          </div>
          <input className={`${inputCls} text-xs font-mono`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste a URL" />
        </div>
      </div>
      <MediaPickerModal kind={kind} open={open} onClose={() => setOpen(false)} selectedUrl={value} onPick={(url) => onChange(url)} />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconField({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [upload, setUpload] = useState(false);
  const [q, setQ] = useState("");
  const names = Object.keys(CMS_ICONS).filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Label field={field} />
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-white/5">
          {value ? <CmsIcon value={value} size={22} color="#4A3AFF" /> : <span className="text-[10px] text-gray-400">none</span>}
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
          {open ? "Close" : "Choose icon"}
        </button>
        <button type="button" onClick={() => setUpload(true)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-white/20 rounded-lg text-gray-700 dark:text-gray-200">
          Upload icon / logo
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-gray-500 hover:text-red-600">Remove</button>
        )}
      </div>
      {open && (
        <div className="mt-2 border border-gray-200 dark:border-white/10 rounded-lg p-2">
          <input className={`${inputCls} mb-2`} placeholder="Search icons…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-48 overflow-y-auto">
            {names.map((name) => {
              const Icon = CMS_ICONS[name];
              const selected = value === `lucide:${name}`;
              return (
                <button
                  type="button"
                  key={name}
                  title={name}
                  onClick={() => {
                    onChange(`lucide:${name}`);
                    setOpen(false);
                  }}
                  className={`aspect-square rounded flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-white/10 ${selected ? "bg-indigo-100 dark:bg-indigo-500/20 ring-1 ring-indigo-500" : ""}`}
                >
                  <Icon size={18} className="text-gray-700 dark:text-gray-200" />
                </button>
              );
            })}
          </div>
        </div>
      )}
      <MediaPickerModal kind="image" open={upload} onClose={() => setUpload(false)} selectedUrl={value} onPick={(url) => onChange(url)} />
    </div>
  );
}

// ─── Lists ────────────────────────────────────────────────────────────────────

function itemTitle(item: any, key: string | undefined, index: number): string {
  const raw = key ? item?.[key] : undefined;
  const text = typeof raw === "string" ? raw.replace(/\*\*/g, "").replace(/<[^>]+>/g, "").split("\n")[0].trim() : "";
  return text ? (text.length > 70 ? `${text.slice(0, 70)}…` : text) : `Item ${index + 1}`;
}

function ListEditor({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: any[]; onChange: (v: any[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const atMax = field.max !== undefined && value.length >= field.max;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
    setOpen((o) => (o === from ? to : o === to ? from : o));
  };

  const add = () => {
    const template = field.itemDefaults ?? Object.fromEntries(field.fields.map((f) => [f.key, f.type === "list" ? [] : f.type === "boolean" ? false : ""]));
    onChange([...value, clone(template)]);
    setOpen(value.length);
  };

  return (
    <div>
      <Label field={field} />
      <div className="space-y-2">
        {value.map((item, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
            }}
            className={`border rounded-lg bg-white dark:bg-white/[0.03] ${dragFrom === i ? "opacity-50" : ""} ${
              item?.hidden ? "border-dashed border-gray-300 dark:border-white/20" : "border-gray-200 dark:border-white/10"
            }`}
          >
            <div className="flex items-center gap-1 px-2 py-1.5">
              <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex-1 min-w-0 flex items-center gap-1.5 text-left">
                {open === i ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                <span className={`text-sm truncate ${item?.hidden ? "text-gray-400 line-through" : "text-gray-800 dark:text-gray-200"}`}>
                  {itemTitle(item, field.itemLabelKey, i)}
                </span>
              </button>
              <button type="button" title="Move up" onClick={() => move(i, i - 1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp size={14} /></button>
              <button type="button" title="Move down" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown size={14} /></button>
              <button
                type="button"
                title="Duplicate"
                disabled={atMax}
                onClick={() => {
                  const next = [...value];
                  next.splice(i + 1, 0, clone(item));
                  onChange(next);
                }}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                title="Delete"
                disabled={field.min !== undefined && value.length <= field.min}
                onClick={() => {
                  if (!window.confirm(`Delete “${itemTitle(item, field.itemLabelKey, i)}”?`)) return;
                  onChange(value.filter((_, j) => j !== i));
                  setOpen(null);
                }}
                className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 size={13} />
              </button>
            </div>
            {open === i && (
              <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-white/10">
                <FieldEditor
                  fields={field.fields}
                  value={item ?? {}}
                  onChange={(nextItem) => onChange(value.map((x, j) => (j === i ? nextItem : x)))}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={atMax}
        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 rounded-lg hover:bg-indigo-100 disabled:opacity-40"
      >
        <Plus size={13} /> {field.addLabel ?? "Add item"}
        {field.max !== undefined && <span className="text-indigo-400">({value.length}/{field.max})</span>}
      </button>
    </div>
  );
}
