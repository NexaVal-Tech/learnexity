// About page sections (pages/about.tsx) — same markup/styles as the
// original hand-written page, with every text/image/link editable.
import React from "react";
import { CmsIcon, CmsLink, CmsText } from "@/components/cms/ui";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";
import type { CmsLink as CmsLinkData } from "@/lib/cms/types";

const BRAND = "#4A3AFF";

/** Shared stylesheet (duplicate <style> tags across sections are harmless). */
function AboutStyles() {
  return (
    <style>{`
      .about-card {
        border-radius: 1rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-elevated);
        backdrop-filter: blur(8px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        transition: all 0.3s;
      }
      .about-card:hover {
        border-color: ${BRAND}44;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 24px ${BRAND}22;
      }
      .about-card-rounded {
        border-radius: 1.5rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-elevated);
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        overflow: hidden;
        transition: box-shadow 0.3s;
      }
      .about-card-rounded:hover {
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 24px ${BRAND}22;
      }
      .program-pill {
        background-color: var(--surface-alt);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        border-radius: 0.75rem;
        padding: 0.25rem 0.75rem;
        font-weight: 500;
        transition: all 0.2s;
        cursor: pointer;
      }
      .program-pill:hover {
        background-color: ${BRAND}22;
        border-color: ${BRAND}66;
        color: white;
      }
      .hero-box {
        border-radius: 2rem 0.75rem 2rem 0.75rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-elevated);
        backdrop-filter: blur(8px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.8);
      }
      .cta-btn {
        display: inline-block;
        background-color: ${BRAND};
        color: white;
        padding: 0.35rem 1.25rem;
        border-radius: 9999px;
        font-weight: 600;
        transition: all 0.3s;
      }
      .cta-btn:hover {
        background-color: #3628e0;
        box-shadow: 0 0 20px ${BRAND}66;
      }
      .highlight-box {
        border-radius: 1rem;
        border: 1px solid var(--border-subtle);
        background-color: var(--surface-alt);
        backdrop-filter: blur(8px);
      }
    `}</style>
  );
}

function CtaButton({ link, className = "" }: { link?: CmsLinkData; className?: string }) {
  if (!link?.label) return null;
  return (
    <CmsLink href={link.href} newTab={link.newTab} className={`cta-btn ${className}`}>
      {link.label}
    </CmsLink>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface AboutHeroData {
  heading: string;
  text: string;
  button: CmsLinkData;
}

export function AboutHero({ data }: { data: AboutHeroData }) {
  return (
    <section className="max-w-[1230px] mx-auto mt-19 py-10 px-6">
      <AboutStyles />
      <div className="hero-box py-10 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            <CmsText text={data.heading} />
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-3xl mx-auto">
            <CmsText text={data.text} />
          </p>
          <CtaButton link={data.button} />
        </div>
      </div>
    </section>
  );
}

// ─── Text cards (Who We Are / Who We Help) ───────────────────────────────────

export interface AboutTextCardsData {
  heading: string;
  intro: string;
  introBold: boolean;
  centered: boolean;
  cards: { title: string; text: string; icon: string }[];
}

export function AboutTextCards({ data }: { data: AboutTextCardsData }) {
  return (
    <section className={`py-20 ${data.centered ? "px-3" : "px-6"}`}>
      <AboutStyles />
      <div className="max-w-[1230px] mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">
          <CmsText text={data.heading} />
        </h2>
        {data.intro && (
          <p
            className={`text-center text-[var(--text-secondary)] mx-auto ${
              data.centered ? "mb-10 max-w-2xl text-xl" : "mb-16 max-w-5xl text-lg"
            } ${data.introBold ? "font-semibold" : ""}`}
          >
            <CmsText text={data.intro} />
          </p>
        )}
        <div className={`grid md:grid-cols-3 ${data.centered ? "gap-8" : "gap-12"}`}>
          {(data.cards ?? []).map((card, i) => (
            <div key={i} className={`about-card ${data.centered ? "text-center p-8" : "p-6 text-left"}`}>
              {card.icon && (
                <span className={`mb-4 inline-flex w-12 h-12 rounded-xl items-center justify-center ${data.centered ? "mx-auto" : ""}`} style={{ backgroundColor: `${BRAND}22` }}>
                  <CmsIcon value={card.icon} size={24} color={BRAND} />
                </span>
              )}
              <h3 className={`text-xl font-bold text-[var(--text-primary)] ${data.centered ? "mb-3" : "mb-4"}`}>
                <CmsText text={card.title} />
              </h3>
              <p className="text-[var(--text-secondary)]">
                <CmsText text={card.text} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Image cards (What Makes Us Different) ───────────────────────────────────

export interface AboutImageCardsData {
  heading: string;
  intro: string;
  cards: { image: string; imageAlt: string; title: string; text: string }[];
}

export function AboutImageCards({ data }: { data: AboutImageCardsData }) {
  return (
    <section className="py-20 px-6">
      <AboutStyles />
      <div className="max-w-[1230px] mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">
          <CmsText text={data.heading} />
        </h2>
        {data.intro && (
          <p className="text-center text-[var(--text-secondary)] mb-8 text-lg">
            <CmsText text={data.intro} />
          </p>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {(data.cards ?? []).map((card, i) => (
            <div key={i} className="about-card-rounded">
              {card.image && (
                <div className="h-60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt={card.imageAlt || ""} className="w-full h-full p-4 object-contain" />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">
                  <CmsText text={card.title} />
                </h3>
                <p className="text-[var(--text-secondary)]">
                  <CmsText text={card.text} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Highlights (Why Learnexity) ─────────────────────────────────────────────

export interface AboutHighlightsData {
  heading: string;
  button: CmsLinkData;
  items: { title: string; text: string }[];
}

export function AboutHighlights({ data }: { data: AboutHighlightsData }) {
  return (
    <section className="py-4 px-6">
      <AboutStyles />
      <div className="max-w-[1230px] mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">
          <CmsText text={data.heading} />
        </h2>
        {data.button?.label && (
          <div className="flex justify-center mb-8">
            <CtaButton link={data.button} />
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-8">
          {(data.items ?? []).map((item, i) => (
            <div key={i} className="highlight-box p-8">
              <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
                <CmsText text={item.title} />
              </h3>
              <p className="text-[var(--text-secondary)] text-lg">
                <CmsText text={item.text} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pills (Explore Our Programs) ────────────────────────────────────────────

export interface AboutPillsData {
  heading: string;
  intro: string;
  pills: { label: string; href: string }[];
  button: CmsLinkData;
}

export function AboutPills({ data }: { data: AboutPillsData }) {
  return (
    <section className="py-20 px-6">
      <AboutStyles />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--text-primary)]">
          <CmsText text={data.heading} />
        </h2>
        {data.intro && (
          <p className="text-center text-[var(--text-secondary)] mb-6">
            <CmsText text={data.intro} />
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {(data.pills ?? []).map((pill, i) =>
            pill.href ? (
              <CmsLink key={i} href={pill.href} className="program-pill">
                {pill.label}
              </CmsLink>
            ) : (
              <div key={i} className="program-pill">
                {pill.label}
              </div>
            )
          )}
        </div>
        {data.button?.label && (
          <div className="text-center">
            <CtaButton link={data.button} />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Definitions ──────────────────────────────────────────────────────────────

const PROGRAMS = [
  "AI & Machine Learning", "Product Management", "Cloud Computing", "UX/UI Design", "Data Analytics",
  "Frontend Development", "Cybersecurity", "Backend Development", "Digital Marketing", "DevOps",
  "Web3 & Blockchain", "Graphic Design",
];

export const aboutBlocks: BlockDefinition[] = [
  {
    type: "about.hero",
    label: "About — intro box",
    category: "About",
    fields: [
      f.textarea("heading", "Heading", { rows: 3, help: EMPHASIS_HELP }),
      f.textarea("text", "Text", { rows: 3, help: EMPHASIS_HELP }),
      f.link("button", "Button"),
    ],
    defaults: {
      heading:
        "Learn in-demand tech skills, Gain practical experience, and Stay relevant in the world of Artificial Intelligence..",
      text: "Learnexity helps you go from learning to doing, through hands-on training, internships, real-life experience, and pathways into jobs, freelancing, and entrepreneurship.",
      button: { label: "Start your journey", href: "/user/auth/register" },
    } satisfies AboutHeroData,
  },
  {
    type: "about.textCards",
    label: "About — heading + text cards",
    category: "About",
    description: "Used for “Who We Are” and “Who We Help”.",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("intro", "Intro", { rows: 3, help: EMPHASIS_HELP }),
      f.bool("introBold", "Bold intro text"),
      f.bool("centered", "Centred cards"),
      f.list("cards", "Cards", [f.textarea("title", "Title", { rows: 1 }), f.textarea("text", "Text", { rows: 4 }), f.icon("icon", "Icon (optional)")], {
        itemLabelKey: "title",
        addLabel: "Add card",
        itemDefaults: { title: "New card", text: "Describe it.", icon: "" },
      }),
    ],
    defaults: {
      heading: "Who We Are",
      intro:
        "Learnexity is a tech career launch platform built to bridge the gap between learning and real opportunity. We empower learners with skills, experience, and pathways into jobs, freelancing, or entrepreneurship.",
      introBold: true,
      centered: false,
      cards: [
        {
          title: "Our Mission",
          text: "Our promise is that every decision we make from curriculum to mentorship to projects is designed to maximize your readiness for the modern technology workforce. Our success is measured by the long-term success of our learners.",
          icon: "",
        },
        {
          title: "Our Mision",
          text: "Our mission is to identify high-potential professionals, help them develop future-relevant skills, provide practical experience, and connect qualified individuals with global opportunity networks. We are building professionals who are ready to contribute to the technologies shaping the future.",
          icon: "",
        },
        {
          title: "Our Guiding Belief",
          text: "Learning alone is no longer enough. Knowledge becomes valuable when it can be applied to real problems, demonstrated through practical work, and continuously adapted as technology evolves. That belief shapes everything we build.",
          icon: "",
        },
      ],
    } satisfies AboutTextCardsData,
  },
  {
    type: "about.imageCards",
    label: "About — image cards",
    category: "About",
    description: "Used for “What Makes Us Different”.",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("intro", "Intro", { rows: 4, help: EMPHASIS_HELP }),
      f.list("cards", "Cards", [f.image("image", "Image"), f.text("imageAlt", "Image description"), f.textarea("title", "Title", { rows: 1 }), f.textarea("text", "Text", { rows: 3 })], {
        itemLabelKey: "title",
        addLabel: "Add card",
        itemDefaults: { image: "", imageAlt: "", title: "New card", text: "Describe it." },
      }),
    ],
    defaults: {
      heading: "What Makes Us Different",
      intro:
        "We do not chase every trend. We focus on areas that form the foundation of the modern AI economy. Every program is selected because it supports how organizations build, deploy, secure, and scale intelligent systems. We would rather build deep capability than offer dozens of disconnected courses.",
      cards: [
        { image: "/images/about-1.png", imageAlt: "about image", title: "Team-based real projects", text: "Collaborate with peers on real-world projects that build both technical and teamwork skills." },
        { image: "/images/about-2.png", imageAlt: "about image", title: "Portfolio-building challenges", text: "Complete projects that showcase your skills and add real value to your portfolio." },
        { image: "/images/about-3.png", imageAlt: "about image", title: "Industry mentorship", text: "Learn from tech professionals who provide guidance, feedback, and industry insights." },
      ],
    } satisfies AboutImageCardsData,
  },
  {
    type: "about.highlights",
    label: "About — highlight boxes",
    category: "About",
    description: "Used for “Why Learnexity”.",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.link("button", "Button (optional)"),
      f.list("items", "Boxes", [f.textarea("title", "Title", { rows: 1 }), f.textarea("text", "Text", { rows: 3 })], {
        itemLabelKey: "title",
        addLabel: "Add box",
        itemDefaults: { title: "New highlight", text: "Describe it." },
      }),
    ],
    defaults: {
      heading: "Why Learnexity",
      button: { label: "Watch How It Works - Discover Why Learnexity Is For You", href: "/user/auth/login" },
      items: [
        { title: "Hands-on Project Experience", text: "Work on real projects that teach both technical skills and professional practices like version control and collaboration." },
        { title: "Career Launch Programs", text: "Training by the Global Community for Jobs and Digital Marketing. We don't just prepare you, we connect you to opportunities." },
      ],
    } satisfies AboutHighlightsData,
  },
  {
    type: "about.pills",
    label: "About — program pills",
    category: "About",
    description: "Used for “Explore Our Programs”.",
    fields: [
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("intro", "Intro", { rows: 2 }),
      f.list("pills", "Pills", [f.text("label", "Text"), f.url("href", "Link (optional)")], {
        itemLabelKey: "label",
        addLabel: "Add pill",
        itemDefaults: { label: "New program", href: "" },
      }),
      f.link("button", "Button"),
    ],
    defaults: {
      heading: "Explore Our Programs",
      intro: "Comprehensive hands-on training programs designed to launch your tech career.",
      pills: PROGRAMS.map((label) => ({ label, href: "" })),
      button: { label: "View All Courses", href: "/courses/courses" },
    } satisfies AboutPillsData,
  },
];

/** The About page's "Who We Help" section uses the same block type as "Who We Are". */
export const ABOUT_WHO_WE_HELP: AboutTextCardsData = {
  heading: "Who We Help",
  intro: "Our platform is designed to support diverse learners at every stage of their tech journey.",
  introBold: false,
  centered: true,
  cards: [
    { title: "Career Switchers", text: "Professionals switching jobs from other industries seeking structured learning and job-ready skills.", icon: "" },
    { title: "Aspiring Tech Professionals", text: "Early-career individuals looking to break into the tech industry with hands-on experience.", icon: "" },
    { title: "Recent Graduates", text: "New graduates who are looking to gain practical, work-ready skills to start their tech career.", icon: "" },
    { title: "Self-Taught Individuals", text: "Autodidacts who have learned coding on their own and want to formalize their skills and real-world experience.", icon: "" },
    { title: "Women & Underrepresented Groups", text: "Individuals from underrepresented backgrounds seeking inclusive learning programs, mentorship, and community.", icon: "" },
    { title: "Learners in Emerging Regions", text: "Providing access to world-class tech education and opportunities to learners in Africa and beyond.", icon: "" },
  ],
};
