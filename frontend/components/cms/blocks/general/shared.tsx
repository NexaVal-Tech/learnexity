// Shared bits for the general page-builder blocks.
import React from 'react';
import { CmsText, BRAND } from '@/components/cms/ui';
import { ScrollFadeIn } from '@/components/animations/Animation';
import { f, EMPHASIS_HELP, type Field } from '@/lib/cms/fields';

export interface HeadingData {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  headingAlign?: 'left' | 'center';
}

export const headingFields: Field[] = [
  f.text('eyebrow', 'Small label above heading'),
  f.textarea('heading', 'Heading', { rows: 2, help: EMPHASIS_HELP }),
  f.textarea('intro', 'Intro text', { rows: 3, help: EMPHASIS_HELP }),
  f.select('headingAlign', 'Heading alignment', [
    { value: 'center', label: 'Centre' },
    { value: 'left', label: 'Left' },
  ]),
];

export function SectionHeading({ data, className = '' }: { data: HeadingData; className?: string }) {
  if (!data.eyebrow && !data.heading && !data.intro) return null;
  const center = (data.headingAlign ?? 'center') === 'center';
  return (
    <ScrollFadeIn>
      <div className={`mb-10 ${center ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'} ${className}`}>
        {data.eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BRAND }}>
            {data.eyebrow}
          </p>
        )}
        {data.heading && (
          <h2 className="text-3xl md:text-5xl font-semibold text-[var(--text-primary)] leading-tight">
            <CmsText text={data.heading} />
          </h2>
        )}
        {data.intro && (
          <p className="mt-4 text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
            <CmsText text={data.intro} />
          </p>
        )}
      </div>
    </ScrollFadeIn>
  );
}

/** Card shell matching the site's asymmetric-corner card style. */
export const CARD_CLASS =
  'border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-2xl shadow-black/10 dark:shadow-black/60 transition-all duration-300';
export const CARD_RADIUS = { borderRadius: '2rem 0.75rem 2rem 0.75rem' } as const;

export const COLUMN_CLASSES: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export const columnsField = (key = 'columns', label = 'Columns'): Field =>
  f.select(key, label, [
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
  ]);

export function Container({ children, narrow, className = '' }: { children: React.ReactNode; narrow?: boolean; className?: string }) {
  return <div className={`${narrow ? 'max-w-4xl' : 'max-w-screen-xl'} mx-auto px-6 ${className}`}>{children}</div>;
}
