// A single video with optional heading and caption.
import React from 'react';
import { CmsText } from '@/components/cms/ui';
import { SectionHeading, headingFields, Container, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface VideoBlockData extends HeadingData {
  video: string;
  poster: string;
  caption: string;
  autoplay: boolean;
}

export default function VideoBlock({ data }: { data: VideoBlockData }) {
  if (!data.video) return null;
  return (
    <section className="py-14">
      <Container narrow>
        <SectionHeading data={data} />
        <div className="overflow-hidden border border-[var(--border-subtle)] shadow-2xl shadow-black/30" style={{ borderRadius: '2rem 0.75rem 2rem 0.75rem' }}>
          <video
            src={data.video}
            poster={data.poster || undefined}
            className="w-full h-auto block bg-black"
            controls={!data.autoplay}
            autoPlay={data.autoplay}
            muted={data.autoplay}
            loop={data.autoplay}
            playsInline
            preload="metadata"
          />
        </div>
        {data.caption && (
          <p className="mt-4 text-center text-[var(--text-muted)]">
            <CmsText text={data.caption} />
          </p>
        )}
      </Container>
    </section>
  );
}

export const block: BlockDefinition<VideoBlockData> = {
  type: 'general.video',
  label: 'Video',
  category: 'Media',
  fields: [
    ...headingFields,
    f.video('video', 'Video'),
    f.image('poster', 'Cover image (shown before it plays)'),
    f.text('caption', 'Caption'),
    f.bool('autoplay', 'Autoplay silently on a loop (no controls)'),
  ],
  defaults: { eyebrow: '', heading: '', intro: '', headingAlign: 'center', video: '', poster: '', caption: '', autoplay: false },
};
