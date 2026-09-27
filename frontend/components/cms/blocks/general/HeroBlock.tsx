// General hero — full-width banner with image/video/colour background.
import React from 'react';
import { CmsText, CmsImage } from '@/components/cms/ui';
import { CmsButtons, buttonsField, type CmsButtonData } from '@/components/cms/CmsButton';
import { f, EMPHASIS_HELP } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface HeroBlockData {
  eyebrow: string;
  heading: string;
  subheading: string;
  background: 'image' | 'video' | 'gradient' | 'none';
  image: string;
  video: string;
  overlay: number;
  align: 'left' | 'center';
  height: 'small' | 'medium' | 'large';
  buttons: CmsButtonData[];
}

const HEIGHTS = { small: 'min-h-[45vh]', medium: 'min-h-[60vh]', large: 'min-h-[60vh] md:min-h-[85vh]' };

export default function HeroBlock({ data }: { data: HeroBlockData }) {
  const hasMedia = data.background === 'image' || data.background === 'video';
  const dark = data.background !== 'none';
  const overlay = Math.min(Math.max(Number(data.overlay ?? 60), 0), 95) / 100;

  return (
    <section
      className={`relative overflow-hidden w-full pt-16 pb-16 flex items-center ${HEIGHTS[data.height] ?? HEIGHTS.medium}`}
      style={
        data.background === 'gradient'
          ? { background: 'linear-gradient(135deg, #1a1446 0%, #4A3AFF 55%, #7a70ff 100%)' }
          : data.background === 'none'
          ? undefined
          : { background: '#000' }
      }
    >
      {data.background === 'image' && data.image && (
        <CmsImage src={data.image} alt="" fill priority className="object-cover z-0" sizes="100vw" />
      )}
      {data.background === 'video' && data.video && (
        <video className="absolute inset-0 w-full h-full object-cover z-0" src={data.video} autoPlay loop muted playsInline />
      )}
      {hasMedia && <div className="absolute inset-0 z-[1]" style={{ background: `rgba(0,0,0,${overlay})` }} />}

      <div
        className={`relative z-10 max-w-7xl w-full mx-auto px-5 sm:px-8 ${
          data.align === 'center' ? 'text-center flex flex-col items-center' : ''
        }`}
      >
        {data.eyebrow && (
          <p className={`text-sm font-semibold uppercase tracking-widest mb-4 ${dark ? 'text-indigo-200' : 'text-[#4A3AFF]'}`}>
            {data.eyebrow}
          </p>
        )}
        <h1
          className={`max-w-5xl text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight ${
            dark ? 'text-white' : 'text-[var(--text-primary)]'
          }`}
        >
          <CmsText text={data.heading} accentColor={dark ? '#a5b4fc' : '#4A3AFF'} />
        </h1>
        {data.subheading && (
          <p
            className={`mt-5 max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed ${
              dark ? 'text-gray-200' : 'text-[var(--text-secondary)]'
            }`}
          >
            <CmsText text={data.subheading} accentColor={dark ? '#a5b4fc' : '#4A3AFF'} />
          </p>
        )}
        <CmsButtons buttons={data.buttons} className={`mt-10 ${data.align === 'center' ? 'justify-center' : ''}`} />
      </div>
    </section>
  );
}

export const block: BlockDefinition<HeroBlockData> = {
  type: 'general.hero',
  label: 'Hero banner',
  category: 'Layout & Text',
  description: 'Large heading with background image, video or gradient and buttons.',
  fields: [
    f.text('eyebrow', 'Small label above heading'),
    f.textarea('heading', 'Heading', { rows: 2, help: EMPHASIS_HELP }),
    f.textarea('subheading', 'Subheading', { rows: 3, help: EMPHASIS_HELP }),
    f.select('background', 'Background', [
      { value: 'image', label: 'Image' },
      { value: 'video', label: 'Video' },
      { value: 'gradient', label: 'Brand gradient' },
      { value: 'none', label: 'None (page background)' },
    ]),
    { ...f.image('image', 'Background image'), showIf: { key: 'background', equals: 'image' } },
    { ...f.video('video', 'Background video', 'MP4 or WebM. It plays muted and loops.'), showIf: { key: 'background', equals: 'video' } },
    { ...f.number('overlay', 'Darken background (%)', { min: 0, max: 95, step: 5 }), showIf: { key: 'background', equals: ['image', 'video'] } },
    f.select('align', 'Text alignment', [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Centre' },
    ]),
    f.select('height', 'Height', [
      { value: 'small', label: 'Short' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Tall' },
    ]),
    buttonsField(),
  ],
  defaults: {
    eyebrow: '',
    heading: 'Your headline goes **here**',
    subheading: 'A short supporting sentence that explains the value of this page.',
    background: 'gradient',
    image: '',
    video: '',
    overlay: 60,
    align: 'left',
    height: 'medium',
    buttons: [{ label: 'Get started', href: '/user/auth/register', style: 'light' }],
  },
};
