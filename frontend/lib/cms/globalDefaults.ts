// lib/cms/globalDefaults.ts
//
// Default navbar + footer content — exactly what was hard-coded in
// components/navbar/Navbar.tsx and components/footer/Footer.tsx before the
// CMS. Used until an admin saves their own version, and as the base that
// saved data is merged over (so fields added later always have a value).
import type { CmsGlobals, FooterData, NavbarData } from './types';

export const NAVBAR_DEFAULTS: NavbarData = {
  logo: '/images/Logo.png',
  logoAlt: 'Learnexity',
  entries: [
    { kind: 'link', label: 'Home', href: '/' },
    {
      kind: 'group',
      label: 'Courses',
      items: [
        { label: 'Deep Tech Programs', href: '/courses/courses', description: 'Group mentorship & one-on-one coaching', coursePanel: 'deeptech', panelTitle: 'Mentorship Courses' },
        { label: 'Career Accelerator Programs', href: '/intermediate', description: 'For learners past the basics', coursePanel: 'intermediate', panelTitle: 'Career Accelerator Courses' },
        { label: 'Flexible Programs', href: '/flex', description: 'Self-paced programmes', coursePanel: 'flex', panelTitle: 'Self-Paced Courses' },
        { label: 'Free Programs', href: '/free-courses', description: 'Enroll and get full access, no payment', coursePanel: 'free', panelTitle: 'Free Courses' },
      ],
    },
    { kind: 'link', label: 'B2B', href: '/b2b' },
    {
      kind: 'group',
      label: 'Learn More',
      items: [
        { label: 'About Us', href: '/about', description: 'Our story and mission', coursePanel: 'none' },
        { label: 'Contact Us', href: '/contact', description: 'Get in touch', coursePanel: 'none' },
        { label: 'Meet our Team', href: '/our-team', description: 'Get in touch', coursePanel: 'none' },
      ],
    },
    { kind: 'link', label: 'Community', href: '/community' },
    { kind: 'link', label: 'Refer & Earn', href: '/refer&earn' },
  ],
  loginLabel: 'Log in',
  loginHref: '/user/auth/login',
  dashboardLabel: 'Dashboard',
  showThemeToggle: true,
  cta: { label: 'Book a consultation', href: '/consultation', show: true },
  browseAllLabel: 'Browse all',
};

export const FOOTER_DEFAULTS: FooterData = {
  showCta: true,
  ctaHeading: 'Ready to Transform Your Career?',
  ctaText: 'Choose your path and secure your spot in the next cohort starting soon',
  ctaPrimary: { label: 'Explore Courses', href: '/courses/courses' },
  ctaSecondary: { label: 'Book Free Consultation', href: '/consultation' },
  logo: '',
  copyright: '© 2025 Learnexity. All rights reserved.',
  columns: [
    {
      title: 'Quick Links',
      links: [
        { label: 'Course Catalog', href: '/courses/courses' },
        { label: 'About Us', href: '/about' },
        { label: 'Community', href: '/community' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Services', href: '/terms-of-services' },
        { label: 'Refund Policy', href: '/refund-policy' },
      ],
    },
    {
      title: 'Contact Us',
      links: [
        { label: 'info@learnexity.org', href: 'mailto:info@learnexity.org' },
        { label: '+1 (276) 252-8415', href: 'tel:+12762528415' },
      ],
    },
  ],
  socials: [],
  poweredByLabel: 'Powered by',
  poweredByLogo: '/images/logo.svg',
  poweredByHref: 'https://nexavaluable.com',
  showPoweredBy: true,
};

export const GLOBAL_DEFAULTS: CmsGlobals = {
  navbar: NAVBAR_DEFAULTS,
  footer: FOOTER_DEFAULTS,
};

/** Merge saved global data over its defaults (top-level keys). */
export function mergeGlobals(saved: Partial<Record<keyof CmsGlobals, any>> | null | undefined): CmsGlobals {
  return {
    navbar: { ...NAVBAR_DEFAULTS, ...(saved?.navbar ?? {}) },
    footer: { ...FOOTER_DEFAULTS, ...(saved?.footer ?? {}) },
  };
}
