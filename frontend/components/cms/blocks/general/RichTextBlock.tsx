// Rich text — headings, paragraphs, lists, links, images, tables.
import React from 'react';
import { RichText } from '@/components/cms/ui';
import { SectionHeading, headingFields, Container, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface RichTextBlockData extends HeadingData {
  html: string;
  width: 'narrow' | 'wide';
  boxed: boolean;
}

export default function RichTextBlock({ data }: { data: RichTextBlockData }) {
  const narrow = data.width !== 'wide';
  return (
    <section className="py-12">
      <Container narrow={narrow}>
        <SectionHeading data={data} />
        <div
          className={data.boxed ? 'border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 md:p-10' : ''}
          style={data.boxed ? { borderRadius: '2rem 0.75rem 2rem 0.75rem' } : undefined}
        >
          <RichText html={data.html} className="text-lg" />
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<RichTextBlockData> = {
  type: 'general.richText',
  label: 'Rich text',
  category: 'Layout & Text',
  description: 'Formatted text: headings, paragraphs, lists, links, tables.',
  fields: [
    ...headingFields,
    f.rich('html', 'Content'),
    f.select('width', 'Width', [
      { value: 'narrow', label: 'Narrow (best for reading)' },
      { value: 'wide', label: 'Wide' },
    ]),
    f.bool('boxed', 'Show inside a card'),
  ],
  defaults: {
    eyebrow: '',
    heading: '',
    intro: '',
    headingAlign: 'left',
    html: '<p>Start writing here…</p>',
    width: 'narrow',
    boxed: false,
  },
};
