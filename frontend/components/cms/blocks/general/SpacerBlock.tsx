// Vertical spacing, optionally with a divider line.
import React from 'react';
import { f } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

export interface SpacerBlockData { size: 'sm' | 'md' | 'lg'; line: boolean }

const SIZES = { sm: 'py-4', md: 'py-10', lg: 'py-20' };

export default function SpacerBlock({ data }: { data: SpacerBlockData }) {
  return (
    <div className={SIZES[data.size] ?? SIZES.md} aria-hidden="true">
      {data.line && <hr className="max-w-screen-xl mx-auto border-0 border-t border-[var(--border-subtle)]" />}
    </div>
  );
}

export const block: BlockDefinition<SpacerBlockData> = {
  type: 'general.spacer',
  label: 'Spacer / divider',
  category: 'Layout & Text',
  fields: [
    f.select('size', 'Space', [
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
    ]),
    f.bool('line', 'Show a divider line'),
  ],
  defaults: { size: 'md', line: false },
};
