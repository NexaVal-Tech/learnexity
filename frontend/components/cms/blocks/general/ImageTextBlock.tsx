// Image beside text — the classic "feature" row.
import React from 'react';
import { CmsImage, CmsText, RichText, BRAND } from '@/components/cms/ui';
import { CmsButtons, buttonsField, type CmsButtonData } from '@/components/cms/CmsButton';
import { ScrollFadeIn } from '@/components/animations/Animation';
import { Container } from './shared';
import { f, EMPHASIS_HELP } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface ImageTextBlockData {
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  image: string;
  imageAlt: string;
  video: string;
  imagePosition: 'left' | 'right';
  buttons: CmsButtonData[];
}

export default function ImageTextBlock({ data }: { data: ImageTextBlockData }) {
  const media = data.video ? (
    <video src={data.video} poster={data.image || undefined} controls playsInline className="w-full h-full object-cover" />
  ) : data.image ? (
    <div className="relative w-full aspect-[4/3]">
      <CmsImage src={data.image} alt={data.imageAlt || ''} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
    </div>
  ) : null;

  return (
    <section className="py-16">
      <Container>
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
          {media && (
            <ScrollFadeIn>
              <div
                className={`overflow-hidden border border-[var(--border-subtle)] shadow-2xl shadow-black/20 ${
                  data.imagePosition === 'right' ? 'lg:order-2' : ''
                }`}
                style={{ borderRadius: '2rem 0.75rem 2rem 0.75rem' }}
              >
                {media}
              </div>
            </ScrollFadeIn>
          )}
          <ScrollFadeIn delay={0.1}>
            <div className={data.imagePosition === 'right' ? 'lg:order-1' : ''}>
              {data.eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: BRAND }}>
                  {data.eyebrow}
                </p>
              )}
              {data.heading && (
                <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] leading-tight mb-5">
                  <CmsText text={data.heading} />
                </h2>
              )}
              <RichText html={data.bodyHtml} className="text-lg" />
              <CmsButtons buttons={data.buttons} className="mt-8" />
            </div>
          </ScrollFadeIn>
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<ImageTextBlockData> = {
  type: 'general.imageText',
  label: 'Image + text',
  category: 'Layout & Text',
  description: 'A picture (or video) next to a heading, text and buttons.',
  fields: [
    f.text('eyebrow', 'Small label above heading'),
    f.textarea('heading', 'Heading', { rows: 2, help: EMPHASIS_HELP }),
    f.rich('bodyHtml', 'Text'),
    f.image('image', 'Image', 'Also used as the poster frame if you add a video.'),
    f.text('imageAlt', 'Image description (for screen readers & SEO)'),
    f.video('video', 'Video (optional — replaces the image)'),
    f.select('imagePosition', 'Image position', [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
    ]),
    buttonsField(),
  ],
  defaults: {
    eyebrow: '',
    heading: 'A heading for this feature',
    bodyHtml: '<p>Describe the feature, benefit or story here.</p>',
    image: '/images/about-1.png',
    imageAlt: '',
    video: '',
    imagePosition: 'left',
    buttons: [],
  },
};
