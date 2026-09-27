// B2B page sections (pages/b2b.tsx).
import React from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { CmsIcon, CmsLink, CmsText } from "@/components/cms/ui";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";
import type { CmsLink as CmsLinkData } from "@/lib/cms/types";

const BRAND = "#4A3AFF";

function B2BStyles() {
  return (
    <style>{`
      .b2b-hero-box {
        border-radius: 2rem 0.75rem 2rem 0.75rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-elevated);
        backdrop-filter: blur(8px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.8);
      }
      .b2b-card {
        border-radius: 1.25rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-elevated);
        backdrop-filter: blur(8px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        transition: all 0.3s;
      }
      .b2b-card:hover {
        border-color: ${BRAND}44;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 24px ${BRAND}22;
        transform: translateY(-2px);
      }
      .b2b-icon-bubble {
        width: 2.75rem; height: 2.75rem; border-radius: 0.85rem;
        background-color: ${BRAND}22;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .b2b-stat-card {
        border-radius: 1.25rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-alt);
        padding: 2rem 1.5rem;
        text-align: center;
      }
      .b2b-pipeline-node {
        width: 3.25rem; height: 3.25rem; border-radius: 9999px;
        background-color: var(--surface-elevated);
        border: 1.5px solid ${BRAND}44;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .b2b-cta-btn {
        display: inline-flex; align-items: center; gap: 0.5rem;
        background-color: ${BRAND}; color: white;
        padding: 0.45rem 1.35rem;
        border-radius: 2rem 0.75rem 2rem 0.75rem;
        font-weight: 600; font-size: 0.95rem;
        transition: all 0.3s;
        box-shadow: 0 8px 24px rgba(74,58,255,0.35);
      }
      .b2b-cta-btn:hover {
        background-color: #3628e0;
        box-shadow: 0 8px 24px rgba(74,58,255,0.5);
        transform: translateY(-1px);
      }
    `}</style>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface B2BHeroData {
  badge: string;
  heading: string;
  text: string;
  tagline: string;
  image: string;
  imageAlt: string;
  button: CmsLinkData;
}

export function B2BHero({ data }: { data: B2BHeroData }) {
  return (
    <section className="relative overflow-hidden bg-black w-full pt-16 min-h-[60vh] md:min-h-[75vh]">
      <B2BStyles />
      {data.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.image} alt={data.imageAlt || ""} className="absolute inset-0 w-full h-full object-cover z-0" />
      )}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.48) 60%, rgba(0,0,0,0.68) 100%)" }}
      />
      <div className="relative z-10 max-w-7xl mx-auto flex items-center px-5 sm:px-8 py-14 md:py-0 min-h-[60vh] md:min-h-[75vh]">
        <div className="max-w-3xl">
          {data.badge && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-5"
              style={{ background: `${BRAND}33`, color: "#fff", border: `1px solid ${BRAND}88` }}
            >
              <Building2 size={13} />
              {data.badge}
            </div>
          )}
          <h1 className="text-left text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-white">
            <CmsText text={data.heading} accentColor="#b3a6ff" />
          </h1>
          {data.text && (
            <p className="mt-4 max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-200">
              <CmsText text={data.text} accentColor="#b3a6ff" />
            </p>
          )}
          {data.tagline && (
            <p className="mt-3 text-sm sm:text-base font-semibold" style={{ color: "#b3a6ff" }}>
              {data.tagline}
            </p>
          )}
          {data.button?.label && (
            <div className="flex flex-row items-start gap-4 mt-8">
              <CmsLink href={data.button.href} newTab={data.button.newTab} className="b2b-cta-btn">
                {data.button.label}
              </CmsLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Centred text ─────────────────────────────────────────────────────────────

export interface B2BTextData {
  heading: string;
  text: string;
}

export function B2BText({ data }: { data: B2BTextData }) {
  return (
    <section className="max-w-[1230px] mx-auto py-10 px-6">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          <CmsText text={data.heading} />
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          <CmsText text={data.text} />
        </p>
      </div>
    </section>
  );
}

// ─── Cards (process steps / segments / what we build) ────────────────────────

export interface B2BCardsData {
  eyebrow: string;
  heading: string;
  intro: string;
  columns: "3" | "4";
  cards: { title: string; text: string; image: string; icon: string }[];
  footnote: string;
}

export function B2BCards({ data }: { data: B2BCardsData }) {
  const hasIntro = data.eyebrow || data.intro;
  return (
    <section className="max-w-[1230px] mx-auto py-10 px-6">
      <B2BStyles />
      <div className={`text-center mb-10 ${hasIntro ? "max-w-2xl mx-auto" : ""}`}>
        {data.eyebrow && (
          <p className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: BRAND }}>
            {data.eyebrow}
          </p>
        )}
        <h2 className={`text-3xl font-bold text-[var(--text-primary)] ${hasIntro ? "mb-3" : ""}`}>
          <CmsText text={data.heading} />
        </h2>
        {data.intro && (
          <p className="text-[var(--text-secondary)]">
            <CmsText text={data.intro} />
          </p>
        )}
      </div>
      <div className={`grid ${data.columns === "4" ? "md:grid-cols-4 gap-5" : "md:grid-cols-3 gap-6"}`}>
        {(data.cards ?? []).map((card, i) => (
          <div key={i} className={`b2b-card ${card.image ? "overflow-hidden" : data.columns === "4" ? "p-6" : "p-7"}`}>
            {card.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.image} alt={card.title} className="w-full h-40 object-cover" />
            )}
            <div className={card.image ? "p-7" : ""}>
              {card.icon && (
                <div className="b2b-icon-bubble mb-4">
                  <CmsIcon value={card.icon} size={20} color={BRAND} />
                </div>
              )}
              <h3 className={`${data.columns === "4" ? "text-base" : "text-lg"} font-bold text-[var(--text-primary)] mb-2`}>
                <CmsText text={card.title} />
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <CmsText text={card.text} />
              </p>
            </div>
          </div>
        ))}
      </div>
      {data.footnote && (
        <p className="text-center text-[var(--text-secondary)] mt-10 font-semibold">
          <CmsText text={data.footnote} />
        </p>
      )}
    </section>
  );
}

// ─── Why Learnexity box with pipeline ────────────────────────────────────────

export interface B2BWhyData {
  heading: string;
  items: { title: string; text: string }[];
  middleText: string;
  pipeline: { label: string; icon: string }[];
  bottomText: string;
}

export function B2BWhy({ data }: { data: B2BWhyData }) {
  const pipeline = data.pipeline ?? [];
  return (
    <section className="max-w-[1230px] mx-auto py-10 px-6">
      <B2BStyles />
      <div className="b2b-hero-box py-10 px-6 md:px-10">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">
          <CmsText text={data.heading} />
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {(data.items ?? []).map((w, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-bold mb-1" style={{ color: BRAND }}>{w.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                <CmsText text={w.text} />
              </p>
            </div>
          ))}
        </div>
        {data.middleText && (
          <p className="text-center text-[var(--text-secondary)] mb-8">
            <CmsText text={data.middleText} />
          </p>
        )}
        {pipeline.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8">
            {pipeline.map((p, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="b2b-pipeline-node">
                    <CmsIcon value={p.icon} size={18} color={BRAND} />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{p.label}</span>
                </div>
                {i < pipeline.length - 1 && <ArrowRight size={16} className="mb-5" style={{ color: `${BRAND}66` }} />}
              </div>
            ))}
          </div>
        )}
        {data.bottomText && (
          <p className="text-center text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            <CmsText text={data.bottomText} />
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface B2BStatsData {
  heading: string;
  stats: { value: string; label: string }[];
}

export function B2BStats({ data }: { data: B2BStatsData }) {
  const stats = data.stats ?? [];
  return (
    <section className="max-w-[1230px] mx-auto py-10 px-6">
      <B2BStyles />
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          <CmsText text={data.heading} />
        </h2>
      </div>
      <div className={`grid gap-5 ${stats.length === 4 ? "sm:grid-cols-4" : stats.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {stats.map((s, i) => (
          <div key={i} className="b2b-stat-card">
            <p className="text-4xl font-bold mb-1" style={{ color: BRAND }}>{s.value}</p>
            <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ (all answers visible) ───────────────────────────────────────────────

export interface B2BFaqData {
  heading: string;
  faqs: { q: string; a: string }[];
}

export function B2BFaq({ data }: { data: B2BFaqData }) {
  return (
    <section className="max-w-[1230px] mx-auto py-10 px-6">
      <B2BStyles />
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          <CmsText text={data.heading} />
        </h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {(data.faqs ?? []).map((item, i) => (
          <div key={i} className="b2b-card p-6">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.q}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <CmsText text={item.a} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

export interface B2BCtaData {
  heading: string;
  text: string;
  button: CmsLinkData;
}

export function B2BCta({ data }: { data: B2BCtaData }) {
  return (
    <section className="max-w-[1230px] mx-auto py-14 px-6">
      <div className="rounded-[2rem] py-14 px-6 md:px-12 text-center" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #3628e0 100%)` }}>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          <CmsText text={data.heading} accentColor="#fde68a" />
        </h2>
        {data.text && (
          <p className="text-white/85 mb-8 max-w-xl mx-auto">
            <CmsText text={data.text} />
          </p>
        )}
        {data.button?.label && (
          <CmsLink
            href={data.button.href}
            newTab={data.button.newTab}
            className="inline-flex items-center gap-2 bg-white text-[#1a1040] px-7 py-3.5 rounded-2xl font-bold hover:bg-white/90 transition-colors"
          >
            {data.button.label}
          </CmsLink>
        )}
      </div>
    </section>
  );
}

// ─── Definitions ──────────────────────────────────────────────────────────────

const cardFields = [
  f.textarea("title", "Title", { rows: 1 }),
  f.textarea("text", "Text", { rows: 3 }),
  f.image("image", "Image (optional)"),
  f.icon("icon", "Icon (optional)"),
];

export const b2bBlocks: BlockDefinition[] = [
  {
    type: "b2b.hero",
    label: "B2B — photo hero",
    category: "B2B",
    fields: [
      f.text("badge", "Badge text"),
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("text", "Text", { rows: 3, help: EMPHASIS_HELP }),
      f.text("tagline", "Tagline (lilac)"),
      f.image("image", "Background photo"),
      f.text("imageAlt", "Photo description"),
      f.link("button", "Button"),
    ],
    defaults: {
      badge: "Learnexity for Business",
      heading: "Build the Skills Your Business Needs to Move Forward",
      text: "We help organizations identify workforce skill gaps, design targeted learning, and train people to perform better.",
      tagline: "Identify the Gap. Build the Skills. Strengthen the Workforce.",
      image: "/images/b2b-hero.jpg",
      imageAlt: "Team in a corporate workforce training session",
      button: { label: "Book a Consultation", href: "/consultation" },
    } satisfies B2BHeroData,
  },
  {
    type: "b2b.text",
    label: "B2B — centred text",
    category: "B2B",
    fields: [f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }), f.textarea("text", "Text", { rows: 5, help: EMPHASIS_HELP })],
    defaults: {
      heading: "Turn Your Workforce into Competitive Advantage.",
      text: "Whether you're introducing new technology, improving performance, or developing new workforce capabilities, Learnexity turns your business needs into practical training solutions. We identify the gaps, design tailored solutions, build the learning experience, and deliver the training.",
    } satisfies B2BTextData,
  },
  {
    type: "b2b.cards",
    label: "B2B — card grid",
    category: "B2B",
    description: "Used for the process steps, organization types and “what we build”.",
    fields: [
      f.text("eyebrow", "Small label (optional)"),
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("intro", "Intro (optional)", { rows: 2 }),
      f.select("columns", "Columns", [
        { value: "3", label: "3" },
        { value: "4", label: "4" },
      ]),
      f.list("cards", "Cards", cardFields, {
        itemLabelKey: "title",
        addLabel: "Add card",
        itemDefaults: { title: "New card", text: "Describe it.", image: "", icon: "" },
      }),
      f.textarea("footnote", "Text below the cards (optional)", { rows: 2 }),
    ],
    defaults: {
      eyebrow: "",
      heading: "Training Built Around Your Business",
      intro: "",
      columns: "4",
      cards: [
        { title: "Learning Consulting", text: "Identify capability gaps, define learning objectives, and align training with business priorities.", image: "", icon: "" },
        { title: "Design the Solution", text: "Create learning aligned with your goals.", image: "", icon: "" },
        { title: "Build & Deliver", text: "Train your people through practical, engaging learning experiences.", image: "", icon: "" },
        { title: "Measure & Improve", text: "Measure, refine, and strengthen the learning experience.", image: "", icon: "" },
      ],
      footnote: "No generic courses. Just learning designed for the outcome you need.",
    } satisfies B2BCardsData,
  },
  {
    type: "b2b.why",
    label: "B2B — why us (with pipeline)",
    category: "B2B",
    fields: [
      f.textarea("heading", "Heading", { rows: 2 }),
      f.list("items", "Reasons", [f.text("title", "Title"), f.textarea("text", "Text", { rows: 2 })], {
        itemLabelKey: "title",
        addLabel: "Add reason",
        max: 8,
        itemDefaults: { title: "Reason", text: "Describe it." },
      }),
      f.textarea("middleText", "Text above the pipeline", { rows: 2 }),
      f.list("pipeline", "Pipeline steps", [f.text("label", "Label"), f.icon("icon", "Icon")], {
        itemLabelKey: "label",
        addLabel: "Add step",
        max: 8,
        itemDefaults: { label: "Step", icon: "lucide:Check" },
      }),
      f.textarea("bottomText", "Text below the pipeline", { rows: 2 }),
    ],
    defaults: {
      heading: "Why Learnexity?",
      items: [
        { title: "Business-Aligned", text: "Built around your goals." },
        { title: "Practical", text: "Designed for real-world application." },
        { title: "End-to-End", text: "From learning needs to delivery." },
        { title: "Specialized", text: "Expertise across consulting, instructional design, eLearning, and training." },
      ],
      middleText: "Learnexity brings these capabilities together.",
      pipeline: [
        { label: "Assess", icon: "lucide:Search" },
        { label: "Design", icon: "lucide:PenTool" },
        { label: "Develop", icon: "lucide:Layers" },
        { label: "Deliver", icon: "lucide:Rocket" },
        { label: "Improve", icon: "lucide:TrendingUp" },
      ],
      bottomText: "You get a coordinated learning solution without having to manage every piece separately.",
    } satisfies B2BWhyData,
  },
  {
    type: "b2b.stats",
    label: "B2B — stats",
    category: "B2B",
    fields: [
      f.textarea("heading", "Heading", { rows: 1 }),
      f.list("stats", "Numbers", [f.text("value", "Number"), f.text("label", "Label")], {
        itemLabelKey: "label",
        addLabel: "Add number",
        max: 4,
        itemDefaults: { value: "10+", label: "label" },
      }),
    ],
    defaults: {
      heading: "Trusted Through Results",
      stats: [
        { value: "200+", label: "people trained" },
        { value: "38", label: "projects completed" },
        { value: "10", label: "working projects developed" },
      ],
    } satisfies B2BStatsData,
  },
  {
    type: "b2b.faq",
    label: "B2B — FAQ (answers visible)",
    category: "B2B",
    fields: [
      f.textarea("heading", "Heading", { rows: 1 }),
      f.list("faqs", "Questions", [f.text("q", "Question"), f.textarea("a", "Answer", { rows: 3 })], {
        itemLabelKey: "q",
        addLabel: "Add question",
        itemDefaults: { q: "New question?", a: "The answer." },
      }),
    ],
    defaults: {
      heading: "Frequently Asked Questions",
      faqs: [
        { q: "Do you provide training directly?", a: "Yes. We provide end-to-end learning solutions from needs assessment and instructional design to eLearning development and training delivery." },
        { q: "Can you work with our existing L&D team?", a: "Yes. We can complement your team with specialized expertise, additional capacity, or end-to-end support." },
        { q: "Can you build a training program from scratch?", a: "Yes. We can take your initiative from identifying the learning need through design, development, delivery, and improvement." },
      ],
    } satisfies B2BFaqData,
  },
  {
    type: "b2b.cta",
    label: "B2B — bottom call to action",
    category: "B2B",
    fields: [f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }), f.textarea("text", "Text", { rows: 3 }), f.link("button", "Button")],
    defaults: {
      heading: "Ready to Build Your Workforce Capability?",
      text: "Tell us what your organization needs to accomplish. We'll help you build the right learning solution.",
      button: { label: "Book a Consultation", href: "/consultation" },
    } satisfies B2BCtaData,
  },
];

/** Default data for the other two card grids on the B2B page. */
export const B2B_SEGMENTS: B2BCardsData = {
  eyebrow: "",
  heading: "For Modern Organizations",
  intro: "",
  columns: "3",
  cards: [
    { title: "Business", text: "Strengthen workforce capability, improve performance, and support organizational growth.", image: "/images/segment-business.jpg", icon: "" },
    { title: "Education", text: "Build stronger learning programs, instructional capacity, and digital learning experiences.", image: "/images/segment-education.jpg", icon: "" },
    { title: "Professional Services", text: "Develop specialized training for employees, clients, and professional development initiatives.", image: "/images/segment-professional.jpg", icon: "" },
  ],
  footnote: "",
};

export const B2B_BUILD: B2BCardsData = {
  eyebrow: "Workforce Training",
  heading: "What We Help Organizations Build",
  intro: "Develop the skills your employees need to drive results.",
  columns: "3",
  cards: [
    { title: "Digital Learning", text: "Transform traditional training into scalable, engaging digital learning experiences.", image: "", icon: "" },
    { title: "Employee Onboarding", text: "Help new employees become productive faster with structured learning pathways.", image: "", icon: "" },
    { title: "Professional Development", text: "Build targeted programs that strengthen technical, professional, and leadership capabilities.", image: "", icon: "" },
  ],
  footnote: "",
};
