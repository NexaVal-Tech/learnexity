// lib/cms/blockTypes.ts
import type { Field } from './fields';
import type { CmsData } from './types';

export type BlockCategory =
  | 'Layout & Text'
  | 'Media'
  | 'Lists & Cards'
  | 'Homepage'
  | 'About'
  | 'B2B'
  | 'Community'
  | 'Contact'
  | 'Team'
  | 'Kids'
  | 'Refer & Earn'
  | 'Legal';

export interface BlockDefinition<D extends CmsData = CmsData> {
  /** Stored in each section's `type`. Never rename a type once shipped —
   *  saved pages reference it; add a new type instead. */
  type: string;
  label: string;
  category: BlockCategory;
  description?: string;
  fields: Field[];
  /** Content used for a brand-new section and merged under saved data. */
  defaults: D;
  /** Shown in the "Add section" library. Blocks tied to one specific
   *  page's live data (e.g. the kids course list) set this to false and
   *  are only available on their own page. */
  addable?: boolean;
  /** Restrict to these page slugs (in addition to/instead of addable). */
  pages?: string[];
}
