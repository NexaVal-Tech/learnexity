// Grid of people.
import React from 'react';
import { CmsImage, CmsLink, CmsText, BRAND } from '@/components/cms/ui';
import { ScrollFadeIn } from '@/components/animations/Animation';
import { SectionHeading, headingFields, Container, CARD_CLASS, CARD_RADIUS, COLUMN_CLASSES, columnsField, type HeadingData } from './shared';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
  bio: string;
  linkedin: string;
}

export interface TeamBlockData extends HeadingData {
  columns: '2' | '3' | '4';
  members: TeamMember[];
}

export default function TeamBlock({ data }: { data: TeamBlockData }) {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading data={data} />
        <div className={`grid gap-6 ${COLUMN_CLASSES[data.columns] ?? COLUMN_CLASSES['4']}`}>
          {(data.members ?? []).map((m, i) => (
            <ScrollFadeIn key={i} delay={(i % 4) * 0.08}>
              <div className={`h-full overflow-hidden flex flex-col ${CARD_CLASS}`} style={CARD_RADIUS}>
                <div className="relative w-full aspect-square bg-[var(--surface-alt)]">
                  {m.photo && <CmsImage src={m.photo} alt={m.name} fill className="object-cover object-top" sizes="(min-width: 1024px) 25vw, 50vw" />}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{m.name}</h3>
                  <p className="text-sm font-medium" style={{ color: BRAND }}>{m.role}</p>
                  {m.bio && (
                    <p className="mt-3 text-[var(--text-secondary)] text-sm leading-relaxed">
                      <CmsText text={m.bio} />
                    </p>
                  )}
                  {m.linkedin && (
                    <CmsLink href={m.linkedin} newTab className="mt-auto pt-4 text-sm font-semibold" style={{ color: BRAND }}>
                      LinkedIn →
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

export const teamMemberFields = [
  f.text('name', 'Name'),
  f.text('role', 'Role'),
  f.image('photo', 'Photo', 'Square photos look best.'),
  f.textarea('bio', 'Short bio', { rows: 3 }),
  f.url('linkedin', 'LinkedIn URL'),
];

export const block: BlockDefinition<TeamBlockData> = {
  type: 'general.team',
  label: 'Team grid',
  category: 'Lists & Cards',
  fields: [
    ...headingFields,
    columnsField(),
    f.list('members', 'People', teamMemberFields, {
      itemLabelKey: 'name',
      addLabel: 'Add person',
      itemDefaults: { name: 'Full name', role: 'Role', photo: '', bio: '', linkedin: '' },
    }),
  ],
  defaults: {
    eyebrow: '',
    heading: 'Meet the team',
    intro: '',
    headingAlign: 'center',
    columns: '4',
    members: [{ name: 'Full name', role: 'Role', photo: '', bio: '', linkedin: '' }],
  },
};
