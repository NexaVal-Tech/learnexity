// Accordion of questions and answers.
import React, { useState } from 'react';
import { CmsText, BRAND } from '@/components/cms/ui';
import { SectionHeading, headingFields, Container, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface FaqBlockData extends HeadingData {
  items: { question: string; answer: string }[];
  openFirst: boolean;
}

export default function FaqBlock({ data }: { data: FaqBlockData }) {
  const [open, setOpen] = useState<number | null>(data.openFirst ? 0 : null);
  return (
    <section className="py-16">
      <Container narrow>
        <SectionHeading data={data} />
        <div className="space-y-3">
          {(data.items ?? []).map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="border bg-[var(--surface-elevated)] transition-all duration-300"
                style={{
                  borderRadius: '2rem 0.75rem 2rem 0.75rem',
                  borderColor: isOpen ? `${BRAND}66` : 'var(--border-subtle)',
                  boxShadow: isOpen ? `0 0 30px ${BRAND}22` : undefined,
                }}
              >
                <button
                  className="w-full flex justify-between items-center text-left py-6 px-6 font-medium text-lg md:text-xl text-[var(--text-primary)]"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="pr-8">{item.question}</span>
                  <span className="text-2xl font-light flex-shrink-0" style={{ color: isOpen ? BRAND : 'var(--text-muted)' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-[var(--text-secondary)] text-lg leading-relaxed">
                    <CmsText text={item.answer} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<FaqBlockData> = {
  type: 'general.faq',
  label: 'FAQ',
  category: 'Lists & Cards',
  fields: [
    ...headingFields,
    f.bool('openFirst', 'Open the first question by default'),
    f.list('items', 'Questions', [f.text('question', 'Question'), f.textarea('answer', 'Answer', { rows: 4 })], {
      itemLabelKey: 'question',
      addLabel: 'Add question',
      itemDefaults: { question: 'New question?', answer: 'The answer.' },
    }),
  ],
  defaults: {
    eyebrow: '',
    heading: 'Frequently asked questions',
    intro: '',
    headingAlign: 'center',
    openFirst: true,
    items: [
      { question: 'A common question?', answer: 'A clear, helpful answer.' },
      { question: 'Another question?', answer: 'Another answer.' },
    ],
  },
};
