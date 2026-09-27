// lib/cms/blocks.ts
//
// Registry of every CMS block type: label, category, editable fields and
// default content. Used by the admin editor and by getStaticProps (to merge
// defaults under saved data) — never imported by public page components, so
// schemas and long default texts stay out of the browser bundle for
// visitors. The components themselves are mapped in lib/cms/components.tsx.
import type { BlockDefinition } from "./blockTypes";

import { block as generalHero } from "@/components/cms/blocks/general/HeroBlock";
import { block as generalRichText } from "@/components/cms/blocks/general/RichTextBlock";
import { block as generalImageText } from "@/components/cms/blocks/general/ImageTextBlock";
import { block as generalCards } from "@/components/cms/blocks/general/CardsBlock";
import { block as generalStats } from "@/components/cms/blocks/general/StatsBlock";
import { block as generalFaq } from "@/components/cms/blocks/general/FaqBlock";
import { block as generalCta } from "@/components/cms/blocks/general/CtaBlock";
import { block as generalLogos } from "@/components/cms/blocks/general/LogosBlock";
import { block as generalTestimonials } from "@/components/cms/blocks/general/TestimonialsBlock";
import { block as generalVideo } from "@/components/cms/blocks/general/VideoBlock";
import { block as generalTeam } from "@/components/cms/blocks/general/TeamBlock";
import { block as generalGallery } from "@/components/cms/blocks/general/GalleryBlock";
import { block as generalSpacer } from "@/components/cms/blocks/general/SpacerBlock";
import { block as generalEmbed } from "@/components/cms/blocks/general/EmbedBlock";

import { block as homeHero } from "@/components/hero/Hero";
import { block as homeExperience } from "@/components/experience/Experience";
import { block as homeProblem } from "@/components/probstatement/ProbStatement";
import { block as homeCourses } from "@/components/courses/Courses";
import { block as homeMethod } from "@/components/method/Method";
import { block as homePathways } from "@/components/pathways/Pathways";
import { block as homePartners } from "@/components/techcompany/TechCompany";
import { block as homeTestimonials } from "@/components/testimonials/Testimonials";
import { block as homeScholarship } from "@/components/Scholarship/ScholarshipBanner";
import { block as homeFaqs } from "@/components/FAQs/FAQs";

import { aboutBlocks } from "@/components/cms/blocks/about";
import { b2bBlocks } from "@/components/cms/blocks/b2b";
import { communityBlocks } from "@/components/cms/blocks/community";
import { contactBlocks } from "@/components/cms/blocks/contact";
import { teamBlocks } from "@/components/cms/blocks/team";
import { kidsBlocks } from "@/components/cms/blocks/kids";
import { referBlocks } from "@/components/cms/blocks/refer";
import { legalBlocks } from "@/components/cms/blocks/legal";

const ALL: BlockDefinition[] = [
  // Page builder
  generalHero, generalRichText, generalImageText, generalCards, generalStats, generalFaq, generalCta,
  generalLogos, generalTestimonials, generalVideo, generalTeam, generalGallery, generalSpacer, generalEmbed,
  // Homepage
  homeHero, homeExperience, homeProblem, homeCourses, homeMethod, homePathways, homePartners,
  homeTestimonials, homeScholarship, homeFaqs,
  // Other pages
  ...aboutBlocks, ...b2bBlocks, ...communityBlocks, ...contactBlocks, ...teamBlocks,
  ...kidsBlocks, ...referBlocks, ...legalBlocks,
] as BlockDefinition[];

export const BLOCKS: Record<string, BlockDefinition> = Object.fromEntries(ALL.map((b) => [b.type, b]));

if (process.env.NODE_ENV !== "production" && Object.keys(BLOCKS).length !== ALL.length) {
  throw new Error("Two CMS blocks share the same type — block types must be unique.");
}

export const BLOCK_CATEGORY_ORDER = [
  "Layout & Text", "Media", "Lists & Cards", "Homepage", "About", "B2B", "Community",
  "Contact", "Team", "Kids", "Refer & Earn", "Legal",
] as const;

/** Blocks an admin may add to the given page from the section library. */
export function blocksAddableTo(pageSlug: string): BlockDefinition[] {
  return ALL.filter((b) => {
    if (b.pages && !b.pages.includes(pageSlug)) return false;
    if (b.addable === false) return !!b.pages?.includes(pageSlug);
    return true;
  });
}

export function getBlock(type: string): BlockDefinition | undefined {
  return BLOCKS[type];
}
