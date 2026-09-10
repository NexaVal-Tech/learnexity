// components/admin/TemplateFieldCanvas.tsx
//
// Visual drag-and-drop surface for positioning CertificateBadgeField text
// overlays directly on top of the actual uploaded template image, so an
// admin can see roughly where text lands (and avoid overlapping other
// artwork or a field above it that wraps to multiple lines) without
// round-tripping through the "Render preview" button for every tweak.
//
// Mirrors CertificateBadgeRenderService::drawField()'s anchor math in CSS
// terms: x_pct/y_pct is the field's anchor point — horizontal position per
// `align` (left/center/right edge of the wrap box sits at x_pct), vertical
// center of the wrapped text block sits at y_pct. Close enough for
// placement purposes; "Render preview" remains the pixel-exact source of
// truth since it calls the real GD renderer.

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import type { CertificateBadgeField } from '@/lib/types';

const FONT_CSS: Record<string, { family: string; weight: number; style: 'normal' | 'italic' }> = {
  'sans-bold':    { family: 'Poppins', weight: 700, style: 'normal' },
  'sans-medium':  { family: 'Poppins', weight: 500, style: 'normal' },
  'sans-regular': { family: 'Poppins', weight: 400, style: 'normal' },
  serif:          { family: 'Lora',    weight: 400, style: 'normal' },
  'serif-italic': { family: 'Lora',    weight: 400, style: 'italic' },
};

interface Props {
  imageUrl: string | null;
  overlayUrl?: string | null;
  fields: CertificateBadgeField[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onMove: (index: number, x_pct: number, y_pct: number) => void;
  visitorNamePreview?: string;
  /** Preview text for arbitrary non-'admin' source keys, e.g.
   * { course_title: 'Sample Course', reference_number: 'LX-CERT-000000' }.
   * Falls back to visitorNamePreview, then the field's own label. */
  previewValues?: Record<string, string>;
  /** When true, x_pct/y_pct is the TOP-LEFT of the text box (matches the
   * dompdf-rendered course-certificate/badge templates) instead of the
   * GD renderer's center-anchor convention. Skips the vertical centering
   * transform and the align-based horizontal box shift. */
  topAnchored?: boolean;
}

export default function TemplateFieldCanvas({
  imageUrl,
  overlayUrl,
  fields,
  selectedIndex,
  onSelect,
  onMove,
  visitorNamePreview = 'Jane Doe',
  previewValues,
  topAnchored = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  // container query units (cqw) let the per-field font-size scale exactly
  // with the rendered width of this box, without any JS resize tracking.
  useEffect(() => {
    containerRef.current?.style.setProperty('container-type', 'inline-size');
  }, [imageUrl]);

  useEffect(() => {
    setNaturalSize(null);
  }, [imageUrl]);

  const movePointer = (e: React.PointerEvent) => {
    if (dragIndexRef.current === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let xPct = ((e.clientX - rect.left) / rect.width) * 100;
    let yPct = ((e.clientY - rect.top) / rect.height) * 100;
    xPct = Math.min(100, Math.max(0, Math.round(xPct * 10) / 10));
    yPct = Math.min(100, Math.max(0, Math.round(yPct * 10) / 10));
    onMove(dragIndexRef.current, xPct, yPct);
  };

  const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    onSelect(index);
    dragIndexRef.current = index;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const handlePointerUp = () => {
    dragIndexRef.current = null;
  };

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-xs text-gray-400 dark:text-gray-600 mb-4">
        Upload and save a template image above to position fields visually here.
      </div>
    );
  }

  return (
    <>
      <Head>
        <link
          key="template-canvas-fonts"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&family=Lora:ital,wght@0,400;1,400&display=swap"
        />
      </Head>
      <div className="mb-4">
        <div
          ref={containerRef}
          onPointerMove={movePointer}
          onPointerUp={handlePointerUp}
          className="relative w-full select-none rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-black/30"
          style={naturalSize ? { aspectRatio: `${naturalSize.w} / ${naturalSize.h}` } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Template"
            draggable={false}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            onLoad={(e) => {
              const img = e.currentTarget;
              setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            }}
          />
          {overlayUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overlayUrl}
              alt="Foreground overlay"
              draggable={false}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
            />
          )}

          {naturalSize &&
            fields.map((field, i) => {
              const isAdmin = field.source === 'admin';
              const text = isAdmin
                ? field.text?.trim() || field.label || '(empty)'
                : previewValues?.[field.source] ?? (field.source === 'visitor_name' ? visitorNamePreview : undefined) ?? field.label;
              const fontCss = FONT_CSS[field.font] || FONT_CSS['sans-regular'];
              const align = field.align || 'center';
              const maxWidth = field.max_width_pct ?? 80;
              const left = topAnchored
                ? field.x_pct
                : align === 'left'
                ? field.x_pct
                : align === 'right'
                ? field.x_pct - maxWidth
                : field.x_pct - maxWidth / 2;
              const selected = selectedIndex === i;

              return (
                <React.Fragment key={field.key}>
                  <div
                    onPointerDown={handlePointerDown(i)}
                    className={`absolute cursor-move touch-none px-1 rounded ${
                      selected
                        ? 'z-20 ring-2 ring-indigo-500 bg-indigo-500/10'
                        : 'z-10 ring-1 ring-white/50 hover:ring-indigo-400/70'
                    }`}
                    style={{
                      top: `${field.y_pct}%`,
                      left: `${left}%`,
                      width: `${maxWidth}%`,
                      transform: topAnchored ? undefined : 'translateY(-50%)',
                      fontFamily: `'${fontCss.family}', sans-serif`,
                      fontWeight: fontCss.weight,
                      fontStyle: fontCss.style,
                      fontSize: `calc(${field.font_size} / ${naturalSize.w} * 100cqw)`,
                      color: field.color,
                      textAlign: align,
                      lineHeight: field.line_height || 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {text}
                  </div>
                  <div
                    className={`absolute w-2 h-2 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 ${
                      selected ? 'z-20 bg-indigo-500' : 'z-10 bg-white border border-gray-400'
                    }`}
                    style={{ left: `${field.x_pct}%`, top: `${field.y_pct}%` }}
                  />
                </React.Fragment>
              );
            })}
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1.5">
          Drag a field to reposition it, or click it to jump to its settings below. This is an approximation of the
          real fonts/wrapping — use "Render preview" for the exact output.
        </p>
      </div>
    </>
  );
}
