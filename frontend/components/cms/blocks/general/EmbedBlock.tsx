// Embedded YouTube / Vimeo video, Google Map or Calendly — only these
// providers, and the iframe URL is rebuilt from the parsed id/host, so an
// admin can't embed an arbitrary third-party page.
import React from 'react';
import { SectionHeading, headingFields, Container, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface EmbedBlockData extends HeadingData {
  url: string;
  height: number;
}

export function toEmbedUrl(raw: string): { src: string; kind: 'video' | 'frame' } | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : '') || (u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : '');
    return id && /^[\w-]{6,20}$/.test(id) ? { src: `https://www.youtube-nocookie.com/embed/${id}`, kind: 'video' } : null;
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    return /^[\w-]{6,20}$/.test(id) ? { src: `https://www.youtube-nocookie.com/embed/${id}`, kind: 'video' } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean).pop() ?? '';
    return /^\d+$/.test(id) ? { src: `https://player.vimeo.com/video/${id}`, kind: 'video' } : null;
  }
  if ((host === 'google.com' || host === 'maps.google.com') && u.pathname.startsWith('/maps')) {
    return { src: u.toString(), kind: 'frame' };
  }
  if (host === 'calendly.com') {
    return { src: u.toString(), kind: 'frame' };
  }
  return null;
}

export default function EmbedBlock({ data }: { data: EmbedBlockData }) {
  const embed = data.url ? toEmbedUrl(data.url) : null;
  if (!embed) return null;
  return (
    <section className="py-14">
      <Container narrow>
        <SectionHeading data={data} />
        <div className="overflow-hidden border border-[var(--border-subtle)]" style={{ borderRadius: '2rem 0.75rem 2rem 0.75rem' }}>
          {embed.kind === 'video' ? (
            <div className="relative w-full aspect-video">
              <iframe src={embed.src} className="absolute inset-0 w-full h-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" title={data.heading || 'Video'} />
            </div>
          ) : (
            <iframe src={embed.src} className="w-full block" style={{ height: Math.min(Math.max(Number(data.height) || 500, 200), 1200) }} loading="lazy" title={data.heading || 'Embedded content'} />
          )}
        </div>
      </Container>
    </section>
  );
}

export const block: BlockDefinition<EmbedBlockData> = {
  type: 'general.embed',
  label: 'Embed (YouTube, Vimeo, Map, Calendly)',
  category: 'Media',
  fields: [
    ...headingFields,
    f.url('url', 'Link', 'Paste a YouTube, Vimeo, Google Maps embed or Calendly link.'),
    { ...f.number('height', 'Height in pixels (maps & Calendly)', { min: 200, max: 1200, step: 50 }) },
  ],
  defaults: { eyebrow: '', heading: '', intro: '', headingAlign: 'center', url: '', height: 600 },
};
