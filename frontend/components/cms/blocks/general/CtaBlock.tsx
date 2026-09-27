// Call-to-action band.
import React from 'react';
import { CmsText, CmsImage } from '@/components/cms/ui';
import { CmsButtons, buttonsField, type CmsButtonData } from '@/components/cms/CmsButton';
import { ScrollFadeIn } from '@/components/animations/Animation';
import { Container } from './shared';
import { f, EMPHASIS_HELP } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface CtaBlockData {
  heading: string;
  text: string;
  theme: 'brand' | 'dark' | 'light';
  image: string;
  buttons: CmsButtonData[];
}

const THEMES = {
  brand: { bg: 'linear-gradient(135deg, #4A3AFF 0%, #5B1EF6 100%)', text: 'text-white', sub: 'text-white/85' },
  dark: { bg: 'linear-gradient(135deg, #0b0b12 0%, #1b1740 100%)', text: 'text-white', sub: 'text-gray-300' },
  light: { bg: 'var(--surface-alt)', text: 'text-[var(--text-primary)]', sub: 'text-[var(--text-secondary)]' },
};

export default function CtaBlock({ data }: { data: CtaBlockData }) {
  const t = THEMES[data.theme] ?? THEMES.brand;
  return (
    <section className="py-12">
      <Container>
        <ScrollFadeIn>
          <div
            className="relative overflow-hidden px-6 py-14 md:px-14 md:py-16 text-center border border-[var(--border-subtle)]"
            style={{ background: t.bg, borderRadius: '2rem 0.75rem 2rem 0.75rem' }}
          >
            {data.image && (
              <>
                <CmsImage src={data.image} alt="" fill className="object-cover" sizes="100vw" />
                <div className="absolute inset-0 bg-black/60" />
              </>
            )}
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className={`text-3xl md:text-5xl font-semibold leading-tight ${data.image ? 'text-white' : t.text}`}>
                <CmsText text={data.heading} accentColor={data.theme === 'light' ? '#4A3AFF' : '#c7d2fe'} />
              </h2>
              {data.text && (
                <p className={`mt-4 text-lg md:text-xl leading-relaxed ${data.image ? 'text-white/85' : t.sub}`}>
                  <CmsText text={data.text} />
                </p>
              )}
              <CmsButtons buttons={data.buttons} className="mt-8 justify-center" />
            </div>
          </div>
        </ScrollFadeIn>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<CtaBlockData> = {
  type: 'general.cta',
  label: 'Call to action',
  category: 'Layout & Text',
  description: 'A bold band with a heading and buttons.',
  fields: [
    f.textarea('heading', 'Heading', { rows: 2, help: EMPHASIS_HELP }),
    f.textarea('text', 'Text', { rows: 3 }),
    f.select('theme', 'Colour', [
      { value: 'brand', label: 'Brand purple' },
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
    ]),
    f.image('image', 'Background image (optional)'),
    buttonsField(),
  ],
  defaults: {
    heading: 'Ready to get started?',
    text: 'Join thousands of learners building in-demand skills.',
    theme: 'brand',
    image: '',
    buttons: [
      { label: 'Explore courses', href: '/courses/courses', style: 'light' },
      { label: 'Book a consultation', href: '/consultation', style: 'textLight' },
    ],
  },
};
