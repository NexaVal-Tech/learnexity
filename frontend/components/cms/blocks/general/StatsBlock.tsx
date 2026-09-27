// Row of big numbers.
import React from 'react';
import { CmsText, BRAND } from '@/components/cms/ui';
import { ScrollFadeIn } from '@/components/animations/Animation';
import { SectionHeading, headingFields, Container, CARD_CLASS, CARD_RADIUS, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface StatsBlockData extends HeadingData {
  stats: { value: string; label: string }[];
}

export default function StatsBlock({ data }: { data: StatsBlockData }) {
  const stats = data.stats ?? [];
  return (
    <section className="py-14">
      <Container>
        <SectionHeading data={data} />
        <div className={`grid gap-5 grid-cols-2 ${stats.length >= 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : ''}`}>
          {stats.map((s, i) => (
            <ScrollFadeIn key={i} delay={i * 0.1}>
              <div className={`h-full text-center px-6 py-8 ${CARD_CLASS}`} style={CARD_RADIUS}>
                <p className="text-4xl md:text-5xl font-bold" style={{ color: BRAND }}>
                  {s.value}
                </p>
                <p className="mt-2 text-[var(--text-secondary)] text-lg">
                  <CmsText text={s.label} />
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<StatsBlockData> = {
  type: 'general.stats',
  label: 'Stats / numbers',
  category: 'Lists & Cards',
  fields: [
    ...headingFields,
    f.list('stats', 'Numbers', [f.text('value', 'Number (e.g. 2,500+)'), f.text('label', 'Label')], {
      itemLabelKey: 'label',
      addLabel: 'Add number',
      max: 8,
      itemDefaults: { value: '100+', label: 'Label' },
    }),
  ],
  defaults: {
    eyebrow: '',
    heading: '',
    intro: '',
    headingAlign: 'center',
    stats: [
      { value: '2,000+', label: 'Learners trained' },
      { value: '15+', label: 'Courses' },
      { value: '20+', label: 'Countries' },
      { value: '90%', label: 'Satisfaction' },
    ],
  },
};
