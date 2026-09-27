// lib/cms/components.tsx
//
// Block type → React component. Every component is loaded with
// next/dynamic, so a page only downloads the code for the sections it
// actually uses, while still being fully server-rendered (Next preloads
// the chunks a pre-rendered page needs).
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type BlockComponent = ComponentType<{ data: any }>;

// NOTE: each entry must call dynamic() with an inline `() => import("…")`
// — Next's compiler looks for that exact shape to register the chunk for
// server-side preloading. Wrapping it in a helper would silently break
// hydration of pre-rendered sections.

export const BLOCK_COMPONENTS: Record<string, BlockComponent> = {
  // Page builder
  "general.hero": dynamic(() => import("@/components/cms/blocks/general/HeroBlock").then((m) => m.default)),
  "general.richText": dynamic(() => import("@/components/cms/blocks/general/RichTextBlock").then((m) => m.default)),
  "general.imageText": dynamic(() => import("@/components/cms/blocks/general/ImageTextBlock").then((m) => m.default)),
  "general.cards": dynamic(() => import("@/components/cms/blocks/general/CardsBlock").then((m) => m.default)),
  "general.stats": dynamic(() => import("@/components/cms/blocks/general/StatsBlock").then((m) => m.default)),
  "general.faq": dynamic(() => import("@/components/cms/blocks/general/FaqBlock").then((m) => m.default)),
  "general.cta": dynamic(() => import("@/components/cms/blocks/general/CtaBlock").then((m) => m.default)),
  "general.logos": dynamic(() => import("@/components/cms/blocks/general/LogosBlock").then((m) => m.default)),
  "general.testimonials": dynamic(() => import("@/components/cms/blocks/general/TestimonialsBlock").then((m) => m.default)),
  "general.video": dynamic(() => import("@/components/cms/blocks/general/VideoBlock").then((m) => m.default)),
  "general.team": dynamic(() => import("@/components/cms/blocks/general/TeamBlock").then((m) => m.default)),
  "general.gallery": dynamic(() => import("@/components/cms/blocks/general/GalleryBlock").then((m) => m.default)),
  "general.spacer": dynamic(() => import("@/components/cms/blocks/general/SpacerBlock").then((m) => m.default)),
  "general.embed": dynamic(() => import("@/components/cms/blocks/general/EmbedBlock").then((m) => m.default)),
  "general.courseTicker": dynamic(() => import("@/components/cms/blocks/contact").then((m) => m.CourseTicker as BlockComponent)),

  // Homepage
  "home.hero": dynamic(() => import("@/components/hero/Hero").then((m) => m.default as BlockComponent)),
  "home.experience": dynamic(() => import("@/components/experience/Experience").then((m) => m.default as BlockComponent)),
  "home.problemStatement": dynamic(() => import("@/components/probstatement/ProbStatement").then((m) => m.default as BlockComponent)),
  "home.courses": dynamic(() => import("@/components/courses/Courses").then((m) => m.default as BlockComponent)),
  "home.method": dynamic(() => import("@/components/method/Method").then((m) => m.default as BlockComponent)),
  "home.pathways": dynamic(() => import("@/components/pathways/Pathways").then((m) => m.default as BlockComponent)),
  "home.partners": dynamic(() => import("@/components/techcompany/TechCompany").then((m) => m.default as BlockComponent)),
  "home.testimonials": dynamic(() => import("@/components/testimonials/Testimonials").then((m) => m.default as BlockComponent)),
  "home.scholarshipBanner": dynamic(() => import("@/components/Scholarship/ScholarshipBanner").then((m) => m.default as BlockComponent)),
  "home.faqs": dynamic(() => import("@/components/FAQs/FAQs").then((m) => m.default as BlockComponent)),

  // About
  "about.hero": dynamic(() => import("@/components/cms/blocks/about").then((m) => m.AboutHero as BlockComponent)),
  "about.textCards": dynamic(() => import("@/components/cms/blocks/about").then((m) => m.AboutTextCards as BlockComponent)),
  "about.imageCards": dynamic(() => import("@/components/cms/blocks/about").then((m) => m.AboutImageCards as BlockComponent)),
  "about.highlights": dynamic(() => import("@/components/cms/blocks/about").then((m) => m.AboutHighlights as BlockComponent)),
  "about.pills": dynamic(() => import("@/components/cms/blocks/about").then((m) => m.AboutPills as BlockComponent)),

  // B2B
  "b2b.hero": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BHero as BlockComponent)),
  "b2b.text": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BText as BlockComponent)),
  "b2b.cards": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BCards as BlockComponent)),
  "b2b.why": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BWhy as BlockComponent)),
  "b2b.stats": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BStats as BlockComponent)),
  "b2b.faq": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BFaq as BlockComponent)),
  "b2b.cta": dynamic(() => import("@/components/cms/blocks/b2b").then((m) => m.B2BCta as BlockComponent)),

  // Community
  "community.hero": dynamic(() => import("@/components/cms/blocks/community").then((m) => m.CommunityHero as BlockComponent)),
  "community.features": dynamic(() => import("@/components/cms/blocks/community").then((m) => m.CommunityFeatures as BlockComponent)),

  // Contact
  "contact.main": dynamic(() => import("@/components/cms/blocks/contact").then((m) => m.ContactMain as BlockComponent)),
  "contact.hours": dynamic(() => import("@/components/cms/blocks/contact").then((m) => m.ContactHours as BlockComponent)),
  "contact.socials": dynamic(() => import("@/components/cms/blocks/contact").then((m) => m.ContactSocials as BlockComponent)),

  // Team
  "team.hero": dynamic(() => import("@/components/cms/blocks/team").then((m) => m.TeamHero as BlockComponent)),
  "team.members": dynamic(() => import("@/components/cms/blocks/team").then((m) => m.TeamMembers as BlockComponent)),

  // Kids
  "kids.hero": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsHero as BlockComponent)),
  "kids.tracks": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsTracks as BlockComponent)),
  "kids.resume": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsResume as BlockComponent)),
  "kids.outcomes": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsOutcomes as BlockComponent)),
  "kids.cta": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsCta as BlockComponent)),
  "kids.problem": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsProblem as BlockComponent)),
  "kids.structure": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsStructure as BlockComponent)),
  "kids.sessionFormats": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsSessionFormats as BlockComponent)),
  "kids.experience": dynamic(() => import("@/components/cms/blocks/kids").then((m) => m.KidsExperience as BlockComponent)),

  // Refer & Earn
  "refer.hero": dynamic(() => import("@/components/cms/blocks/refer").then((m) => m.ReferHero as BlockComponent)),
  "refer.steps": dynamic(() => import("@/components/cms/blocks/refer").then((m) => m.ReferSteps as BlockComponent)),

  // Legal
  "legal.document": dynamic(() => import("@/components/cms/blocks/legal").then((m) => m.LegalDocument as BlockComponent)),
};
