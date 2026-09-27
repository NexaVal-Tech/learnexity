// Image grid with captions.
import React from 'react';
import { CmsImage, CmsText } from '@/components/cms/ui';
import { SectionHeading, headingFields, Container, COLUMN_CLASSES, columnsField, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface GalleryBlockData extends HeadingData {
  columns: '2' | '3' | '4';
  aspect: 'square' | 'landscape' | 'portrait';
  images: { image: string; alt: string; caption: string }[];
}

const ASPECT = { square: 'aspect-square', landscape: 'aspect-[4/3]', portrait: 'aspect-[3/4]' };

export default function GalleryBlock({ data }: { data: GalleryBlockData }) {
  return (
    <section className="py-14">
      <Container>
        <SectionHeading data={data} />
        <div className={`grid gap-4 ${COLUMN_CLASSES[data.columns] ?? COLUMN_CLASSES['3']}`}>
          {(data.images ?? []).filter((i) => i.image).map((img, i) => (
            <figure key={i}>
              <div className={`relative w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] ${ASPECT[data.aspect] ?? ASPECT.landscape}`}>
                <CmsImage src={img.image} alt={img.alt || img.caption || ''} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(min-width: 1024px) 33vw, 50vw" />
              </div>
              {img.caption && (
                <figcaption className="mt-2 text-sm text-[var(--text-muted)]">
                  <CmsText text={img.caption} />
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<GalleryBlockData> = {
  type: 'general.gallery',
  label: 'Image gallery',
  category: 'Media',
  fields: [
    ...headingFields,
    columnsField(),
    f.select('aspect', 'Image shape', [
      { value: 'landscape', label: 'Landscape' },
      { value: 'square', label: 'Square' },
      { value: 'portrait', label: 'Portrait' },
    ]),
    f.list('images', 'Images', [f.image('image', 'Image'), f.text('alt', 'Description (for screen readers)'), f.text('caption', 'Caption')], {
      itemLabelKey: 'caption',
      addLabel: 'Add image',
      itemDefaults: { image: '', alt: '', caption: '' },
    }),
  ],
  defaults: { eyebrow: '', heading: '', intro: '', headingAlign: 'center', columns: '3', aspect: 'landscape', images: [] },
};
