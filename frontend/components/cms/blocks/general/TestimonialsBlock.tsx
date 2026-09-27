// Quote cards — text, photo or video testimonials.
import React, { useRef, useState } from 'react';
import { CmsImage, CmsText, BRAND } from '@/components/cms/ui';
import { SectionHeading, headingFields, Container, CARD_CLASS, CARD_RADIUS, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  video: string;
}

export interface TestimonialsBlockData extends HeadingData {
  items: TestimonialItem[];
}

function VideoCard({ item }: { item: TestimonialItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`relative overflow-hidden aspect-[9/10] ${CARD_CLASS}`} style={CARD_RADIUS}>
      <video
        ref={ref}
        src={item.video}
        poster={item.avatar || undefined}
        className="absolute inset-0 w-full h-full object-cover"
        preload="metadata"
        controls={playing}
        playsInline
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <button
          onClick={() => { setPlaying(true); ref.current?.play(); }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
          aria-label={`Play ${item.name}'s video`}
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center border border-white/30" style={{ background: `${BRAND}cc` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="ml-1"><polygon points="5,3 19,12 5,21" /></svg>
          </span>
          <span className="text-white font-semibold">{item.name}</span>
          <span className="text-sm" style={{ color: '#c7d2fe' }}>{item.role}</span>
        </button>
      )}
    </div>
  );
}

export default function TestimonialsBlock({ data }: { data: TestimonialsBlockData }) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading data={data} />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {(data.items ?? []).map((item, i) =>
            item.video ? (
              <VideoCard key={i} item={item} />
            ) : (
              <figure key={i} className={`h-full p-7 flex flex-col ${CARD_CLASS}`} style={CARD_RADIUS}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={BRAND} className="mb-4 opacity-80" aria-hidden="true">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                </svg>
                <blockquote className="text-[var(--text-secondary)] text-lg leading-relaxed flex-1">
                  <CmsText text={item.quote} />
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {item.avatar && (
                    <span className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <CmsImage src={item.avatar} alt={item.name} fill className="object-cover" sizes="48px" />
                    </span>
                  )}
                  <span>
                    <span className="block font-semibold text-[var(--text-primary)]">{item.name}</span>
                    <span className="block text-sm" style={{ color: BRAND }}>{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            )
          )}
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<TestimonialsBlockData> = {
  type: 'general.testimonials',
  label: 'Testimonials',
  category: 'Lists & Cards',
  description: 'Quotes from students or clients, with optional photo or video.',
  fields: [
    ...headingFields,
    f.list('items', 'Testimonials', [
      f.text('name', 'Name'),
      f.text('role', 'Role / course'),
      f.textarea('quote', 'Quote', { rows: 4, help: 'Leave empty if you add a video.' }),
      f.image('avatar', 'Photo', 'Also used as the video cover image.'),
      f.video('video', 'Video (optional)'),
    ], {
      itemLabelKey: 'name',
      addLabel: 'Add testimonial',
      itemDefaults: { name: 'Name', role: 'Role', quote: 'What they said.', avatar: '', video: '' },
    }),
  ],
  defaults: {
    eyebrow: 'Real Stories',
    heading: 'What our learners say',
    intro: '',
    headingAlign: 'center',
    items: [
      { name: 'Student name', role: 'Course', quote: 'Learnexity helped me land my first role in tech.', avatar: '', video: '' },
      { name: 'Student name', role: 'Course', quote: 'The mentors were incredibly supportive.', avatar: '', video: '' },
      { name: 'Student name', role: 'Course', quote: 'Practical, hands-on and worth every minute.', avatar: '', video: '' },
    ],
  },
};
