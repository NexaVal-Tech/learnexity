// lib/cms/pages.ts
//
// Built-in pages: their public path, default SEO, and default section list
// (what each page showed before the CMS). Keep the slugs in sync with
// CmsPage::SYSTEM_PAGES in server/app/Models/CmsPage.php.
//
// A default section without `data` uses its block's own defaults (see
// lib/cms/blocks.ts), which were extracted from the original page.
import type { CmsSeo } from "./types";
import { ABOUT_WHO_WE_HELP } from "@/components/cms/blocks/about";
import { B2B_BUILD, B2B_SEGMENTS } from "@/components/cms/blocks/b2b";
import { PRIVACY_POLICY_HTML, REFUND_POLICY_HTML, TERMS_OF_SERVICE_HTML } from "./defaults/legal";

export interface DefaultSection {
  type: string;
  data?: Record<string, unknown>;
  anchor?: string;
}

export interface SystemPageDef {
  slug: string;
  title: string;
  path: string;
  seo: CmsSeo;
  sections: DefaultSection[];
}

export const SYSTEM_PAGE_DEFS: SystemPageDef[] = [
  {
    slug: "home",
    title: "Homepage",
    path: "/",
    seo: {
      title: "Learnexity — Learn In-Demand Tech Skills & Launch Your Career",
      description:
        "Learnexity helps you go from learning to doing — through hands-on training, internships, and real pathways into jobs, freelancing, and entrepreneurship in tech.",
    },
    sections: [
      { type: "home.hero" },
      { type: "home.experience" },
      { type: "home.problemStatement" },
      { type: "home.courses", anchor: "courses" },
      { type: "home.method" },
      { type: "home.pathways" },
      { type: "home.partners" },
      { type: "home.testimonials" },
      { type: "home.scholarshipBanner", anchor: "scholarships" },
      { type: "home.faqs", anchor: "faqs" },
    ],
  },
  {
    slug: "about",
    title: "About Us",
    path: "/about",
    seo: {
      title: "About Us — Who we are, And What Makes us Different",
      description:
        "Learn about Learnexity's mission to empower tech learners in Africa and beyond with hands-on training, mentorship, and real career pathways.",
    },
    sections: [
      { type: "about.hero" },
      { type: "about.textCards" },
      { type: "about.imageCards" },
      { type: "about.textCards", data: ABOUT_WHO_WE_HELP as unknown as Record<string, unknown> },
      { type: "about.highlights" },
      { type: "about.pills" },
    ],
  },
  {
    slug: "b2b",
    title: "B2B",
    path: "/b2b",
    seo: {
      title: "Learnexity for Business — Workforce Training & Learning Solutions",
      description:
        "Learnexity helps organizations identify workforce skill gaps, design targeted learning, and train people to perform better — from consulting to eLearning to delivery.",
    },
    sections: [
      { type: "b2b.hero" },
      { type: "b2b.text" },
      { type: "b2b.cards" },
      { type: "b2b.why" },
      { type: "b2b.stats" },
      { type: "b2b.cards", data: B2B_SEGMENTS as unknown as Record<string, unknown> },
      { type: "b2b.cards", data: B2B_BUILD as unknown as Record<string, unknown> },
      { type: "b2b.faq" },
      { type: "b2b.cta" },
    ],
  },
  {
    slug: "community",
    title: "Community",
    path: "/community",
    seo: {
      title: "Join Our Community",
      description: "Learn about the Learnexity Innovation Hub and be a part of the fastext growing community.",
    },
    sections: [{ type: "community.hero" }, { type: "community.features" }],
  },
  {
    slug: "contact",
    title: "Contact Us",
    path: "/contact",
    seo: {
      title: "Contact us - Choose any prefered method to reach out to us",
      description: "Choose any prefered method to reach out to us.",
    },
    sections: [{ type: "general.courseTicker" }, { type: "contact.main" }, { type: "contact.hours" }, { type: "contact.socials" }],
  },
  {
    slug: "our-team",
    title: "Meet Our Team",
    path: "/our-team",
    seo: {
      title: "Our Team - Learnexity",
      description: "Meet the passionate team behind Learnexity, dedicated to revolutionizing education through technology.",
    },
    sections: [{ type: "team.hero" }, { type: "team.members" }],
  },
  {
    slug: "kids",
    title: "Kids",
    path: "/kids",
    seo: {
      title: "Kids Digital Skills Program — Learnexity",
      description: "A 3-month guided program where kids 10–17 design, build, and create digital skills with expert mentorship.",
    },
    sections: [
      { type: "kids.hero" },
      { type: "kids.tracks" },
      { type: "kids.resume" },
      { type: "kids.outcomes" },
      { type: "kids.cta" },
      { type: "kids.problem" },
      { type: "kids.structure" },
      { type: "kids.sessionFormats" },
      { type: "kids.experience" },
    ],
  },
  {
    slug: "refer-earn",
    title: "Refer & Earn",
    path: "/refer&earn",
    seo: {
      title: "Refer & Earn — Learnexity",
      description: "Share your referral link and earn 10% of what every person who signs up through your link pays.",
    },
    sections: [{ type: "refer.hero" }, { type: "refer.steps" }],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    path: "/privacy-policy",
    seo: { title: "Privacy Policy — Learnexity", description: "How Learnexity collects, uses, and protects your personal information." },
    sections: [
      {
        type: "legal.document",
        data: {
          title: "Privacy Policy",
          intro: "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.",
          lastUpdated: "November 30, 2024",
          showToc: false,
          bodyHtml: PRIVACY_POLICY_HTML,
        },
      },
    ],
  },
  {
    slug: "terms-of-services",
    title: "Terms of Service",
    path: "/terms-of-services",
    seo: { title: "Terms of Service — Learnexity", description: "The terms that govern your use of Learnexity's courses and services." },
    sections: [
      {
        type: "legal.document",
        data: {
          title: "Terms of Service",
          intro: "",
          lastUpdated: "November 30, 2024",
          showToc: true,
          bodyHtml: TERMS_OF_SERVICE_HTML,
        },
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    path: "/refund-policy",
    seo: { title: "Refund Policy — Learnexity", description: "Eligibility requirements, timelines, and procedures for requesting refunds." },
    sections: [
      {
        type: "legal.document",
        data: {
          title: "Refund Policy",
          intro:
            "Learnexity wants you to be confident in your learning investment. This policy outlines eligibility requirements, timelines, and procedures for requesting refunds.",
          lastUpdated: "November 19, 2025",
          showToc: false,
          bodyHtml: REFUND_POLICY_HTML,
        },
      },
    ],
  },
];

export const SYSTEM_PAGES: Record<string, SystemPageDef> = Object.fromEntries(SYSTEM_PAGE_DEFS.map((p) => [p.slug, p]));
