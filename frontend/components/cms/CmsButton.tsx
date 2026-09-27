// components/cms/CmsButton.tsx
//
// Admin-configurable button. The variants reproduce the site's existing
// hand-written buttons (components/button/Button.tsx) so CMS-driven
// sections look identical to what was there before.
import React from 'react';
import { CmsLink } from './ui';
import { f, type Field } from '@/lib/cms/fields';

export type CmsButtonStyle = 'primary' | 'light' | 'outline' | 'ghost' | 'text' | 'textLight' | 'dark';

export interface CmsButtonData {
  label: string;
  href: string;
  style?: CmsButtonStyle;
  newTab?: boolean;
}

const STYLES: Record<CmsButtonStyle, string> = {
  // = PrimaryButton2 / SignUpButton2
  primary: 'bg-[#4A3AFF] text-white hover:bg-[#3A2AFF]',
  // = PrimaryButton (white pill, purple text)
  light: 'bg-white text-[#6C63FF] hover:bg-gray-50',
  outline: 'border-2 border-current text-[var(--text-primary)] hover:bg-[var(--surface-alt)]',
  // For dark/colour backgrounds (hero, CTA bands)
  ghost: 'border-2 border-white/70 text-white hover:bg-white/10',
  text: 'text-[#4A3AFF] hover:underline px-1',
  textLight: 'text-white hover:underline px-1',
  dark: 'bg-[#0f0f14] text-white hover:bg-black',
};

export function CmsButton({
  button,
  className = '',
  size = 'md',
}: {
  button?: CmsButtonData | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!button || !button.label) return null;
  const style = STYLES[button.style ?? 'primary'] ?? STYLES.primary;
  const sizing =
    size === 'sm' ? 'px-4 py-1.5 text-sm' : size === 'lg' ? 'px-7 py-3 text-lg' : 'px-5 py-2 text-base md:text-lg';
  return (
    <CmsLink
      href={button.href}
      newTab={button.newTab}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ${sizing} ${style} ${className}`}
    >
      <span>{button.label}</span>
    </CmsLink>
  );
}

export function CmsButtons({
  buttons,
  className = '',
  size,
  nowrap = false,
}: {
  buttons?: CmsButtonData[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Keep buttons on one row (the homepage hero's original layout). */
  nowrap?: boolean;
}) {
  const list = (buttons ?? []).filter((b) => b && b.label);
  if (list.length === 0) return null;
  return (
    <div className={`flex ${nowrap ? 'flex-row' : 'flex-wrap'} items-center gap-4 ${className}`}>
      {list.map((b, i) => (
        <CmsButton key={i} button={b} size={size} />
      ))}
    </div>
  );
}

export const BUTTON_STYLE_OPTIONS = [
  { value: 'primary', label: 'Brand (purple)' },
  { value: 'light', label: 'White' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Outline — white (for dark backgrounds)' },
  { value: 'dark', label: 'Dark' },
  { value: 'text', label: 'Text link' },
  { value: 'textLight', label: 'Text link — white (for dark backgrounds)' },
];

/** Field set for one button — reuse in any block schema. */
export const buttonFields: Field[] = [
  f.text('label', 'Button text'),
  f.url('href', 'Link', 'A page path like /courses/courses, or a full https:// URL.'),
  f.select('style', 'Style', BUTTON_STYLE_OPTIONS),
  f.bool('newTab', 'Open in a new tab'),
];

export const buttonsField = (key = 'buttons', label = 'Buttons', max = 3): Field =>
  f.list(key, label, buttonFields, {
    itemLabelKey: 'label',
    addLabel: 'Add button',
    max,
    itemDefaults: { label: 'Learn more', href: '/', style: 'primary', newTab: false },
  });
