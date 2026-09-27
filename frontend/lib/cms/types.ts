// lib/cms/types.ts
//
// Website CMS — shared types.
//
// Content model: a page is an ordered list of sections ("blocks"). Each
// section has a `type` (which component renders it — see
// lib/cms/components.tsx) and a `data` object whose shape is described by
// that block's field schema (lib/cms/blocks.ts). The same model powers the
// built-in pages (homepage, about, …) and pages made in the page builder.

export type CmsData = Record<string, any>;

export interface CmsSection<D extends CmsData = CmsData> {
  /** Stable id, unique within the page (used as React key + for editing). */
  id: string;
  type: string;
  hidden?: boolean;
  /** Optional id for in-page links, e.g. "faqs" → /#faqs. */
  anchor?: string;
  data: D;
}

export interface CmsSeo {
  title?: string;
  description?: string;
  og_image?: string;
}

export interface CmsPage {
  slug: string;
  title: string;
  is_system: boolean;
  is_published: boolean;
  /** Public URL path, e.g. "/" or "/about". */
  path: string;
  seo: CmsSeo;
  sections: CmsSection[];
  updated_at?: string | null;
}

export interface CmsLink {
  label: string;
  href: string;
  newTab?: boolean;
}

// ─── Globals ──────────────────────────────────────────────────────────────────

/** Which live course list (from the database) a navbar dropdown item expands into. */
export type NavCoursePanel = 'none' | 'deeptech' | 'intermediate' | 'flex' | 'free';

export interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
  coursePanel?: NavCoursePanel;
  /** Heading shown above the course list in the desktop flyout. */
  panelTitle?: string;
  hidden?: boolean;
}

export interface NavEntryData {
  kind: 'link' | 'group';
  label: string;
  /** For kind = 'link'. */
  href?: string;
  newTab?: boolean;
  /** For kind = 'group'. */
  items?: NavDropdownItem[];
  hidden?: boolean;
}

export interface NavbarData {
  logo: string;
  logoAlt: string;
  entries: NavEntryData[];
  loginLabel: string;
  loginHref: string;
  dashboardLabel: string;
  showThemeToggle: boolean;
  cta: CmsLink & { show?: boolean };
  browseAllLabel: string;
}

export interface FooterColumn {
  title: string;
  links: CmsLink[];
}

export interface FooterData {
  showCta: boolean;
  ctaHeading: string;
  ctaText: string;
  ctaPrimary: CmsLink;
  ctaSecondary: CmsLink;
  logo: string;
  copyright: string;
  columns: FooterColumn[];
  socials: { platform: string; href: string }[];
  poweredByLabel: string;
  poweredByLogo: string;
  poweredByHref: string;
  showPoweredBy: boolean;
}

export interface CmsGlobals {
  navbar: NavbarData;
  footer: FooterData;
}
