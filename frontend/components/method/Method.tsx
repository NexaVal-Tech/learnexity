"use client";

import { ScrollFadeIn } from "@/components/animations/Animation";
import { CmsIcon, CmsText } from "@/components/cms/ui";
import { CmsButton, buttonFields, type CmsButtonData } from "@/components/cms/CmsButton";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

export interface MethodData {
  heading: string;
  intro: string;
  /** Button under the intro (moved here from "Our Pathways"). Empty label = hidden. */
  button?: CmsButtonData;
  cards: { title: string; description: string; icon: string }[];
}

export const METHOD_DEFAULTS: MethodData = {
  heading: "Why Choose Learnexity",
  intro: "We help you move from learning, ** to earning, ** to real opportunity, without quitting your job.",
  button: { label: "Sign Up", href: "/user/auth/register", style: "primary" },
  cards: [
    { title: "Turn Your Skills Into Income", description: "We do not just teach tech skills; we help you start earning with them.", icon: "" },
    { title: "Get Job Placement", description: "Get matched with our local and international partners for your dream job.", icon: "" },
    { title: "Gain Real-World Internship Experience", description: "We provide the hands-on experience employers are looking for.", icon: "" },
    {
      title: "Job Support:",
      description:
        "We help you with resume reviews, LinkedIn optimization, interview preparation, and access to remote and global job opportunities.",
      icon: "",
    },
  ],
};

export default function Method({ data = METHOD_DEFAULTS }: { data?: MethodData }) {
  const cards = data.cards ?? [];
  return (
    <section className="py-16">
      <style>{`
        .method-card:hover {
          border-color: ${BRAND}66 !important;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 30px ${BRAND}33 !important;
        }
        .header-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
        .method-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        {/* Header */}
        <ScrollFadeIn delay={0}>
          <div
            className="header-box max-w-3xl mx-auto text-center mb-10 px-10 py-6
              border border-[var(--border-subtle)]
              bg-[var(--surface-elevated)] backdrop-blur-sm
              shadow-2xl shadow-black/80"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-[var(--text-primary)] mb-4">
              <CmsText text={data.heading} />
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              <CmsText text={data.intro} />
            </p>
            {data.button?.label && data.button?.href && (
              <div className="mt-6 flex justify-center">
                <CmsButton button={data.button} />
              </div>
            )}
          </div>
        </ScrollFadeIn>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${cards.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {cards.map((card, index) => (
            <ScrollFadeIn key={index} delay={index * 0.15} duration={0.3}>
              <div
                className="h-full method-card flex flex-col items-center text-center px-6 py-8
                  border border-[var(--border-subtle)]
                  bg-[var(--surface-elevated)] backdrop-blur-sm
                  shadow-2xl shadow-black/80
                  hover:-translate-y-2
                  cursor-pointer transition-all duration-300
                  min-h-[280px]"
              >
                {card.icon && (
                  <span className="mb-4">
                    <CmsIcon value={card.icon} size={36} color={BRAND} />
                  </span>
                )}
                <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
                  <CmsText text={card.title} />
                </h3>
                <p className="text-[var(--text-secondary)] text-xl">
                  <CmsText text={card.description} />
                </p>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export const block: BlockDefinition<MethodData> = {
  type: "home.method",
  label: "Why choose us",
  category: "Homepage",
  description: "Header card plus a row of benefit cards.",
  fields: [
    f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
    f.textarea("intro", "Intro", { rows: 3, help: EMPHASIS_HELP }),
    f.group("button", "Button (leave the text empty to hide it)", buttonFields),
    f.list(
      "cards",
      "Cards",
      [f.textarea("title", "Title", { rows: 2 }), f.textarea("description", "Description", { rows: 3 }), f.icon("icon", "Icon (optional)")],
      { itemLabelKey: "title", addLabel: "Add card", max: 8, itemDefaults: { title: "New benefit", description: "Describe it.", icon: "" } }
    ),
  ],
  defaults: METHOD_DEFAULTS,
};
