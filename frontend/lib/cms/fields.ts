// lib/cms/fields.ts
//
// Field schema for CMS blocks. Each block declares the fields an admin can
// edit; the admin editor renders its form entirely from this schema (see
// components/admin/cms/FieldEditor.tsx), so adding a new block never needs
// bespoke admin UI.
//
// Conventions the backend relies on (server/app/Services/CmsContentSanitizer.php):
//   - Rich-text field keys MUST be named "html" or end in "Html"
//     (e.g. bodyHtml) — only those values keep their HTML tags; they're
//     sanitized with an allowlist on save.

export interface FieldCondition {
  /** Key of a sibling field in the same object. */
  key: string;
  equals: unknown | unknown[];
}

interface FieldBase {
  key: string;
  label: string;
  help?: string;
  /** Only show this field when a sibling field has a given value. */
  showIf?: FieldCondition;
}

export type Field =
  | (FieldBase & { type: 'text'; placeholder?: string; maxLength?: number })
  | (FieldBase & { type: 'textarea'; rows?: number; placeholder?: string })
  | (FieldBase & { type: 'richtext' })
  | (FieldBase & { type: 'image' })
  | (FieldBase & { type: 'video' })
  | (FieldBase & { type: 'url'; placeholder?: string })
  | (FieldBase & { type: 'link' })
  | (FieldBase & { type: 'number'; min?: number; max?: number; step?: number })
  | (FieldBase & { type: 'boolean' })
  | (FieldBase & { type: 'select'; options: { value: string; label: string }[] })
  | (FieldBase & { type: 'color' })
  | (FieldBase & { type: 'icon' })
  | (FieldBase & {
      type: 'list';
      fields: Field[];
      /** Key of the item field used as each row's title in the editor. */
      itemLabelKey?: string;
      addLabel?: string;
      /** Template for newly added items. */
      itemDefaults?: Record<string, unknown>;
      min?: number;
      max?: number;
    })
  | (FieldBase & { type: 'group'; fields: Field[] });

export type FieldType = Field['type'];

/** Help text reused by every text field that supports inline emphasis. */
export const EMPHASIS_HELP =
  'Wrap words in **double asterisks** to highlight them in the brand colour. Press Enter for a line break.';

// ─── Tiny builders — keep block schemas short and readable ─────────────────────

export const f = {
  text: (key: string, label: string, extra: Partial<Extract<Field, { type: 'text' }>> = {}): Field => ({ type: 'text', key, label, ...extra }),
  textarea: (key: string, label: string, extra: Partial<Extract<Field, { type: 'textarea' }>> = {}): Field => ({ type: 'textarea', key, label, ...extra }),
  rich: (key: string, label: string, help?: string): Field => {
    if (key !== 'html' && !key.endsWith('Html')) {
      // Fail loudly in development — a mis-named rich-text key would have
      // its HTML silently escaped by the backend sanitizer.
      throw new Error(`CMS rich-text field "${key}" must be named "html" or end in "Html".`);
    }
    return { type: 'richtext', key, label, help };
  },
  image: (key: string, label: string, help?: string): Field => ({ type: 'image', key, label, help }),
  video: (key: string, label: string, help?: string): Field => ({ type: 'video', key, label, help }),
  url: (key: string, label: string, help?: string): Field => ({ type: 'url', key, label, help }),
  link: (key: string, label: string, help?: string): Field => ({ type: 'link', key, label, help }),
  number: (key: string, label: string, extra: Partial<Extract<Field, { type: 'number' }>> = {}): Field => ({ type: 'number', key, label, ...extra }),
  bool: (key: string, label: string, help?: string): Field => ({ type: 'boolean', key, label, help }),
  select: (key: string, label: string, options: { value: string; label: string }[], help?: string): Field => ({ type: 'select', key, label, options, help }),
  color: (key: string, label: string, help?: string): Field => ({ type: 'color', key, label, help }),
  icon: (key: string, label: string, help?: string): Field => ({ type: 'icon', key, label, help }),
  list: (
    key: string,
    label: string,
    fields: Field[],
    extra: Partial<Extract<Field, { type: 'list' }>> = {}
  ): Field => ({ type: 'list', key, label, fields, ...extra }),
  group: (key: string, label: string, fields: Field[], help?: string): Field => ({ type: 'group', key, label, fields, help }),
};

export function isFieldVisible(field: Field, value: Record<string, any> | undefined): boolean {
  if (!field.showIf) return true;
  const actual = value?.[field.showIf.key];
  const expected = field.showIf.equals;
  return Array.isArray(expected) ? expected.includes(actual) : actual === expected;
}
