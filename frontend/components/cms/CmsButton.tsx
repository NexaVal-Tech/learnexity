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
  radius = 'rounded-full',
}: {
  button?: CmsButtonData | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Corner rounding class (default: pill). */
  radius?: string;
}) {
  if (!button || !button.label) return null;
  const style = STYLES[button.style ?? 'primary'] ?? STYLES.primary;
  const sizing =
    size === 'sm' ? 'px-4 py-1.5 text-sm' : size === 'lg' ? 'px-7 py-3 text-lg' : 'px-5 py-2 text-base md:text-lg';
  return (
    <CmsLink
      href={button.href}
      newTab={button.newTab}
      className={`inline-flex items-center justify-center gap-2 ${radius} font-semibold transition-colors ${sizing} ${style} ${className}`}
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
  stackOnMobile = false,
  radius,
}: {
  buttons?: CmsButtonData[] | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Keep buttons on one row (the homepage hero's original layout). */
  nowrap?: boolean;
  /** One under the other, full width, on phones; in a row from `sm` up. */
  stackOnMobile?: boolean;
  radius?: string;
}) {
  const list = (buttons ?? []).filter((b) => b && b.label);
  if (list.length === 0) return null;
  const layout = stackOnMobile
    ? 'flex-col items-stretch sm:flex-row sm:flex-wrap sm:items-center w-full sm:w-auto'
    : `${nowrap ? 'flex-row' : 'flex-wrap'} items-center`;
  return (
    <div className={`flex ${layout} gap-3 sm:gap-4 ${className}`}>
      {list.map((b, i) => (
        <CmsButton key={i} button={b} size={size} radius={radius} className={stackOnMobile ? 'w-full sm:w-auto' : ''} />
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
