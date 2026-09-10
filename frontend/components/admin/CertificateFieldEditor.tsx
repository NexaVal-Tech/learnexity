// components/admin/CertificateFieldEditor.tsx
//
// Shared text-field editor used by both the reusable certificate/badge
// generator system (pages/admin/generators/[id].tsx) and the standalone
// "I will be attending" flyer settings (pages/admin/attending-flyer.tsx).
// Every field is one positioned, wrapped, single-color line of text
// composited server-side by CertificateBadgeRenderService.

import React, { useState } from 'react';
import type { CertificateBadgeField } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react';
import TemplateFieldCanvas from './TemplateFieldCanvas';

const ALIGN_OPTIONS: CertificateBadgeField['align'][] = ['left', 'center', 'right'];

export function emptyField(source: string = 'admin'): CertificateBadgeField {
  return {
    key: `field_${Date.now()}`,
    label: 'New field',
    text: source === 'admin' ? 'Sample text' : 'Jane Doe',
    source,
    x_pct: 50,
    y_pct: 50,
    font: 'sans-regular',
    font_size: 24,
    color: '#000000',
    align: 'center',
    max_width_pct: 80,
    line_height: 1.2,
  };
}

interface FieldEditorProps {
  fields: CertificateBadgeField[];
  onChange: (fields: CertificateBadgeField[]) => void;
  fontOptions: string[];
  /** Legacy single-toggle mode: adds a "fill with visitor's name" checkbox
   * that switches a field between 'admin' and 'visitor_name'. Ignored if
   * `sourceOptions` is provided. */
  allowVisitorName: boolean;
  /** New multi-variable mode: a dropdown of auto-fill sources (beyond
   * fixed text) a field can pull from — e.g. course-completion templates
   * offer recipient_name/course_title/reference_number/etc. Takes
   * precedence over `allowVisitorName` when provided. */
  sourceOptions?: { value: string; label: string }[];
  /** Actual uploaded template image — when provided, a drag-and-drop
   * positioning canvas is shown above the field list so positions can be
   * set visually instead of by guessing X/Y percentages blind. */
  imageUrl?: string | null;
  /** Optional foreground overlay (e.g. attending-flyer's frame border)
   * composited visually on top of the canvas image for context. */
  overlayUrl?: string | null;
  /** Sample text shown for visitor_name-sourced fields on the canvas. */
  visitorNamePreview?: string;
  /** Preview text for sourceOptions-driven fields on the canvas. */
  previewValues?: Record<string, string>;
  /** Matches the course-certificate/badge templates' top-left anchor
   * convention (see TemplateFieldCanvas). Defaults to the GD generator's
   * center-anchor convention. */
  topAnchored?: boolean;
}

export default function CertificateFieldEditor({
  fields,
  onChange,
  fontOptions,
  allowVisitorName,
  sourceOptions,
  imageUrl = null,
  overlayUrl = null,
  visitorNamePreview,
  previewValues,
  topAnchored = false,
}: FieldEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const update = (index: number, patch: Partial<CertificateBadgeField>) => {
    const next = fields.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
    setSelectedIndex((cur) => (cur === index ? null : cur !== null && cur > index ? cur - 1 : cur));
  };

  const add = () => {
    onChange([...fields, emptyField('admin')]);
    setSelectedIndex(fields.length);
  };

  return (
    <div className="space-y-4">
      <TemplateFieldCanvas
        imageUrl={imageUrl}
        overlayUrl={overlayUrl}
        fields={fields}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onMove={(index, x_pct, y_pct) => update(index, { x_pct, y_pct })}
        visitorNamePreview={visitorNamePreview}
        previewValues={previewValues}
        topAnchored={topAnchored}
      />

      {fields.map((field, i) => (
        <div
          key={field.key}
          onClick={() => setSelectedIndex(i)}
          className={`border rounded-lg p-4 transition-colors cursor-pointer ${
            selectedIndex === i
              ? 'border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-400/50'
              : 'border-gray-200 dark:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <input
              value={field.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="font-semibold text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none border-b border-transparent focus:border-gray-300 dark:focus:border-white/20"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {sourceOptions && sourceOptions.length > 0 ? (
            <div className="mb-3">
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Content source</label>
              <select
                value={field.source}
                onChange={(e) => update(i, { source: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-xs text-gray-900 dark:text-white"
              >
                <option value="admin">Fixed text (typed below)</option>
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {field.source !== 'admin' && (
                <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
                  Auto-filled with: {sourceOptions.find((o) => o.value === field.source)?.label ?? field.source}
                </p>
              )}
            </div>
          ) : (
            allowVisitorName && (
              <label className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={field.source === 'visitor_name'}
                  onChange={(e) => update(i, { source: e.target.checked ? 'visitor_name' : 'admin' })}
                />
                Fill this in with whatever name the visitor types (instead of fixed text)
              </label>
            )
          )}

          {field.source === 'admin' && (
            <textarea
              value={field.text}
              onChange={(e) => update(i, { text: e.target.value })}
              rows={2}
              className="w-full mb-3 px-3 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">X %</label>
              <input
                type="number" min={0} max={100}
                value={field.x_pct}
                onChange={(e) => update(i, { x_pct: Number(e.target.value) })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Y %</label>
              <input
                type="number" min={0} max={100}
                value={field.y_pct}
                onChange={(e) => update(i, { y_pct: Number(e.target.value) })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Font size</label>
              <input
                type="number" min={6} max={200}
                value={field.font_size}
                onChange={(e) => update(i, { font_size: Number(e.target.value) })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Max width %</label>
              <input
                type="number" min={5} max={100}
                value={field.max_width_pct}
                onChange={(e) => update(i, { max_width_pct: Number(e.target.value) })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Font</label>
              <select
                value={field.font}
                onChange={(e) => update(i, { font: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              >
                {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Align</label>
              <select
                value={field.align}
                onChange={(e) => update(i, { align: e.target.value as CertificateBadgeField['align'] })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              >
                {ALIGN_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Color</label>
              <input
                type="color"
                value={field.color}
                onChange={(e) => update(i, { color: e.target.value })}
                className="w-full h-[30px] border border-gray-200 dark:border-white/20 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-500 dark:text-gray-500 mb-1">Line height</label>
              <input
                type="number" min={1} max={3} step={0.1}
                value={field.line_height}
                onChange={(e) => update(i, { line_height: Number(e.target.value) })}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 rounded text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
      >
        <Plus className="w-4 h-4" /> Add text field
      </button>
    </div>
  );
}
