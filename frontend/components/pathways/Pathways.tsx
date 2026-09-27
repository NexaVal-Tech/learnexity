"use client";

import { ScrollFadeIn, FadeUpOnScroll } from "../animations/Animation";
import { CmsText } from "@/components/cms/ui";
import { CmsButton, buttonFields, type CmsButtonData } from "@/components/cms/CmsButton";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

export interface PathwaysData {
  heading: string;
  intro: string;
  button: CmsButtonData;
  cards: { number: string; title: string; description: string; gradient: boolean }[];
}

export const PATHWAYS_DEFAULTS: PathwaysData = {
  heading: "Our Pathways",
  intro: "Flexible delivery designed to suit your needs, plus access to remote opportunities,\ncommunity support, and job search assistance.",
  button: { label: "Sign Up", href: "/user/auth/register", style: "primary" },
  cards: [
    {
      number: "[ 01 ]",
      title: "Live Classes with Expert Mentors",
      description: "Weekly sessions with expert mentors, plus access to our course library and remote opportunities.",
      gradient: true,
    },
    {
      number: "[ 02 ]",
      title: "Self-Paced Learning",
      description:
        "Learn at your own pace with expert-led content on your schedule. Perfect for busy professionals who need flexibility to fit learning into their lives.",
      gradient: false,
    },
    {
      number: "[ 03 ]",
      title: "One-on-One Mentorship",
      description:
        "Get direct training and mentorship from our experts in private, focused sessions tailored specifically to your goals, plus access to our course library and remote opportunities.",
      gradient: false,
    },
  ],
};

export default function Pathways({ data = PATHWAYS_DEFAULTS }: { data?: PathwaysData }) {
  const cards = data.cards ?? [];
  return (
    <section className="pt-2 py-20">
      <style>{`
        .pathway-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 30px ${BRAND}33 !important;
        }
        .pathway-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        <FadeUpOnScroll>
          {/* Header */}
          <div className="mb-16 flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-4xl font-semibold text-[var(--text-primary)] mb-4 component-headers">
                <CmsText text={data.heading} />
              </h2>
              <p className="w-full text-xl text-[var(--text-secondary)] text-center md:text-left">
                <CmsText text={data.intro} />
              </p>
            </div>
            <div className="flex justify-center md:justify-start lg:justify-end">
              <CmsButton button={data.button} />
            </div>
          </div>
        </FadeUpOnScroll>

        <div className={`grid gap-4 ${cards.length === 2 ? "lg:grid-cols-2" : cards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {cards.map((card, index) =>
            card.gradient ? (
              <ScrollFadeIn key={index} delay={index * 0.15} duration={0.3}>
                <div
                  className="relative overflow-hidden p-8 h-100"
                  style={{
                    background:
                      "linear-gradient(163.36deg, #5B1EF6 -33.94%, #F59E0B 18.93%, #5B1EF6 48.37%, #DE492B 97.22%)",
                    color: "white",
                    borderRadius: "2rem 0.75rem 2rem 0.75rem",
                  }}
                >
                  <div className="mb-6">
                    <span className="text-orange-200 text-sm font-mono">{card.number}</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-6 sub-component-headers">
                    <CmsText text={card.title} accentColor="#fde68a" />
                  </h3>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    <CmsText text={card.description} accentColor="#fde68a" />
                  </p>
                </div>
              </ScrollFadeIn>
            ) : (
              <ScrollFadeIn key={index} delay={index * 0.15} duration={0.3}>
                <div
                  className="pathway-card p-5 sm:p-8 h-full
                    border border-[var(--border-subtle)]
                    bg-[var(--surface-elevated)] backdrop-blur-sm
                    shadow-lg shadow-black/40
                    hover:-translate-y-2
                    cursor-pointer transition-all duration-300"
                >
                  <div className="mb-6">
                    <span className="text-sm font-mono" style={{ color: `${BRAND}99` }}>
                      {card.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 sub-component-headers">
                    <CmsText text={card.title} />
                  </h3>
                  <p className="text-xl text-[var(--text-secondary)] mb-8 leading-relaxed">
                    <CmsText text={card.description} />
                  </p>
                </div>
              </ScrollFadeIn>
            )
          )}
        </div>
      </div>
    </section>
  );
}

export const block: BlockDefinition<PathwaysData> = {
  type: "home.pathways",
  label: "Our pathways",
  category: "Homepage",
  description: "Heading with a button, then numbered pathway cards (first can be the gradient card).",
  fields: [
    f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
    f.textarea("intro", "Intro", { rows: 3, help: EMPHASIS_HELP }),
    f.group("button", "Button", buttonFields),
    f.list(
      "cards",
      "Pathway cards",
      [
        f.text("number", "Number label (e.g. [ 01 ])"),
        f.textarea("title", "Title", { rows: 2 }),
        f.textarea("description", "Description", { rows: 4 }),
        f.bool("gradient", "Use the colourful gradient style"),
      ],
      {
        itemLabelKey: "title",
        addLabel: "Add pathway",
        max: 6,
        itemDefaults: { number: "[ 04 ]", title: "New pathway", description: "Describe it.", gradient: false },
      }
    ),
  ],
  defaults: PATHWAYS_DEFAULTS,
};
