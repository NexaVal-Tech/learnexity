// Row of partner/client logos ("Trusted by").
import React from 'react';
import { CmsImage, CmsLink } from '@/components/cms/ui';
import { SectionHeading, headingFields, Container, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface LogoItem { name: string; logo: string; href: string }

export interface LogosBlockData extends HeadingData {
  logos: LogoItem[];
  marquee: boolean;
  grayscale: boolean;
}

function LogoTile({ item, grayscale }: { item: LogoItem; grayscale: boolean }) {
  const tile = (
    <div className="flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-elevated)] rounded-xl px-5 py-4 min-w-[120px] h-20 flex-shrink-0 transition-all duration-300 hover:border-[#4A3AFF66]">
      {item.logo ? (
        <CmsImage
          src={item.logo}
          alt={`${item.name} logo`}
          width={120}
          height={44}
          className={`object-contain max-h-11 w-auto ${grayscale ? 'grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition' : ''}`}
        />
      ) : (
        <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
      )}
    </div>
  );
  return item.href ? <CmsLink href={item.href} newTab>{tile}</CmsLink> : tile;
}

export default function LogosBlock({ data }: { data: LogosBlockData }) {
  const logos = (data.logos ?? []).filter((l) => l.logo || l.name);
  return (
    <section className="py-12 overflow-hidden">
      <style>{`@keyframes cms-logos-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <Container>
        <SectionHeading data={data} />
        {data.marquee ? (
          <div className="overflow-hidden">
            <div className="flex items-center gap-6 w-max" style={{ animation: 'cms-logos-marquee 25s linear infinite' }}>
              {[...logos, ...logos].map((l, i) => <LogoTile key={i} item={l} grayscale={data.grayscale} />)}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {logos.map((l, i) => <LogoTile key={i} item={l} grayscale={data.grayscale} />)}
          </div>
        )}
      </Container>
    </section>
  );
}

export const logoItemFields = [
  f.text('name', 'Company name'),
  f.image('logo', 'Logo', 'PNG or SVG with a transparent background works best.'),
  f.url('href', 'Link (optional)'),
];

export const block: BlockDefinition<LogosBlockData> = {
  type: 'general.logos',
  label: 'Logo strip',
  category: 'Media',
  description: 'Partner, client or "as seen in" logos.',
  fields: [
    ...headingFields,
    f.bool('marquee', 'Scroll the logos continuously'),
    f.bool('grayscale', 'Show logos in grey until hovered'),
    f.list('logos', 'Logos', logoItemFields, {
      itemLabelKey: 'name',
      addLabel: 'Add logo',
      itemDefaults: { name: 'Company', logo: '', href: '' },
    }),
  ],
  defaults: {
    eyebrow: '',
    heading: 'Trusted By',
    intro: '',
    headingAlign: 'center',
    marquee: false,
    grayscale: false,
    logos: [
      { name: 'Microsoft', logo: '/partners/microsoft.png', href: '' },
      { name: 'Google Cloud', logo: '/partners/google.png', href: '' },
      { name: 'Cisco', logo: '/partners/cisco.png', href: '' },
    ],
  },
};
