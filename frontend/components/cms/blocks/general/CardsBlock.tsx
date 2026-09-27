// Grid of cards — features, benefits, services, steps.
import React from 'react';
import { CmsIcon, CmsImage, CmsLink, CmsText, BRAND } from '@/components/cms/ui';
import { ScrollFadeIn } from '@/components/animations/Animation';
import { SectionHeading, headingFields, Container, CARD_CLASS, CARD_RADIUS, COLUMN_CLASSES, columnsField, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface CardItem {
  icon: string;
  image: string;
  title: string;
  text: string;
  linkLabel: string;
  linkHref: string;
}

export interface CardsBlockData extends HeadingData {
  columns: '2' | '3' | '4';
  numbered: boolean;
  align: 'left' | 'center';
  cards: CardItem[];
}

export default function CardsBlock({ data }: { data: CardsBlockData }) {
  const center = data.align === 'center';
  return (
    <section className="py-16">
      <Container>
        <SectionHeading data={data} />
        <div className={`grid gap-6 ${COLUMN_CLASSES[data.columns] ?? COLUMN_CLASSES['3']}`}>
          {(data.cards ?? []).map((card, i) => (
            <ScrollFadeIn key={i} delay={i * 0.1}>
              <div
                className={`h-full overflow-hidden flex flex-col hover:-translate-y-1 hover:border-[#4A3AFF66] ${CARD_CLASS} ${center ? 'text-center items-center' : ''}`}
                style={CARD_RADIUS}
              >
                {card.image && (
                  <div className="relative w-full aspect-[16/9]">
                    <CmsImage src={card.image} alt="" fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
                  </div>
                )}
                <div className={`p-6 md:p-8 flex flex-col flex-1 ${center ? 'items-center' : ''}`}>
                  {data.numbered && (
                    <span className="text-sm font-mono mb-4" style={{ color: `${BRAND}99` }}>
                      [ {String(i + 1).padStart(2, '0')} ]
                    </span>
                  )}
                  {card.icon && (
                    <span className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND}14` }}>
                      <CmsIcon value={card.icon} size={24} color={BRAND} />
                    </span>
                  )}
                  {card.title && (
                    <h3 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-3">
                      <CmsText text={card.title} />
                    </h3>
                  )}
                  {card.text && (
                    <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                      <CmsText text={card.text} />
                    </p>
                  )}
                  {card.linkLabel && card.linkHref && (
                    <CmsLink href={card.linkHref} className="mt-auto pt-6 font-semibold" style={{ color: BRAND }}>
                      {card.linkLabel} →
                    </CmsLink>
                  )}
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}

export const cardItemFields = [
  f.icon('icon', 'Icon'),
  f.image('image', 'Image (optional, shown at the top)'),
  f.textarea('title', 'Title', { rows: 1 }),
  f.textarea('text', 'Text', { rows: 3 }),
  f.text('linkLabel', 'Link text (optional)'),
  f.url('linkHref', 'Link'),
];

export const block: BlockDefinition<CardsBlockData> = {
  type: 'general.cards',
  label: 'Cards grid',
  category: 'Lists & Cards',
  description: 'Two to four columns of cards with icon/image, title and text.',
  fields: [
    ...headingFields,
    columnsField(),
    f.select('align', 'Card text alignment', [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Centre' },
    ]),
    f.bool('numbered', 'Number the cards ([ 01 ], [ 02 ] …)'),
    f.list('cards', 'Cards', cardItemFields, {
      itemLabelKey: 'title',
      addLabel: 'Add card',
      itemDefaults: { icon: 'lucide:Star', image: '', title: 'New card', text: 'Describe this point.', linkLabel: '', linkHref: '' },
    }),
  ],
  defaults: {
    eyebrow: '',
    heading: 'Why it matters',
    intro: '',
    headingAlign: 'center',
    columns: '3',
    align: 'left',
    numbered: false,
    cards: [
      { icon: 'lucide:Rocket', image: '', title: 'First point', text: 'A sentence or two about it.', linkLabel: '', linkHref: '' },
      { icon: 'lucide:Target', image: '', title: 'Second point', text: 'A sentence or two about it.', linkLabel: '', linkHref: '' },
      { icon: 'lucide:Users', image: '', title: 'Third point', text: 'A sentence or two about it.', linkLabel: '', linkHref: '' },
    ],
  },
};
