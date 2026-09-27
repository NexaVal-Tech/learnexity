"use client";

import { ScrollFadeIn, FadeUpOnScroll } from "@/components/animations/Animation";
import { CmsIcon, CmsImage, CmsText } from "@/components/cms/ui";
import { f } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

/** Inline SVG as an <img>-safe data URI (used for the original custom icons). */
const svgIcon = (markup: string) => `data:image/svg+xml,${encodeURIComponent(markup)}`;

export interface ExperienceCard {
  title: string;
  large: boolean;
  icon: string;
  logos: { name: string; logo: string }[];
  logosJoiner: string;
}

export interface ExperienceData {
  cards: ExperienceCard[];
}

export const EXPERIENCE_DEFAULTS: ExperienceData = {
  cards: [
    {
      title: "Delivered In Partnership With",
      large: true,
      icon: "",
      logos: [
        { name: "Cisco", logo: "/partners/cisco.png" },
        { name: "Microsoft", logo: "/partners/microsoft.png" },
      ],
      logosJoiner: "and",
    },
    {
      title: "Led By Industry Experts",
      large: false,
      icon: svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A3AFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>'
      ),
      logos: [],
      logosJoiner: "",
    },
    {
      title: "Collaborating With Global Partners",
      large: false,
      icon: svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A3AFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
      ),
      logos: [],
      logosJoiner: "",
    },
  ],
};

export default function Experience({ data = EXPERIENCE_DEFAULTS }: { data?: ExperienceData }) {
  const cards = data.cards ?? [];
  return (
    <FadeUpOnScroll>
      <section className="py-4">
        <style>{`
          .experience-card:hover {
            border-color: ${BRAND}66 !important;
            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 30px ${BRAND}33 !important;
          }
          /* These cards used to borrow ".prob-headline" from the Problem
             Statement section's stylesheet (their own .experience-label rule
             was never rendered), so that's the look reproduced here — now
             self-contained, so hiding/reordering that section can't change
             these cards. */
          .experience-label {
            font-size: 2.25rem;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.2;
            letter-spacing: -0.015em;
            margin-bottom: 1.5rem;
            text-align: center;
          }
          @media (max-width: 480px) {
            .experience-label { font-size: 1.875rem; }
          }
        `}</style>

        <div className="max-w-screen-xl mx-auto px-6">
          <div className={`grid grid-cols-1 gap-6 ${cards.length >= 3 ? "sm:grid-cols-3" : cards.length === 2 ? "sm:grid-cols-2" : ""}`}>
            {cards.map((card, index) => (
              <ScrollFadeIn key={index} delay={index * 0.15}>
                <div
                  className="experience-card group flex flex-col items-center justify-center text-center px-8 py-10
                    rounded-xl rounded-tr-4xl
                    border border-white/10
                    bg-[#0f0f0f]/90 backdrop-blur-sm
                    shadow-lg shadow-black/40
                    hover:-translate-y-2
                    cursor-pointer transition-all duration-300 min-h-[200px]"
                >
                  <span className="mb-5">
                    <CmsIcon value={card.icon} size={28} color={BRAND} strokeWidth={1.8} />
                  </span>

                  <span className="experience-label">
                    {card.logos?.length ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className={card.large ? "text-3xl" : undefined}>
                          <CmsText text={card.title} />
                        </span>
                        <div className="flex items-center gap-4">
                          {card.logos.map((logo, i) => (
                            <span key={i} className="flex items-center gap-4">
                              {i > 0 && card.logosJoiner && (
                                <span className="text-white font-semibold text-sm">{card.logosJoiner}</span>
                              )}
                              <CmsImage
                                src={logo.logo}
                                alt={logo.name}
                                width={i === 0 ? 70 : 100}
                                height={30}
                                className="object-contain"
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className={card.large ? "text-3xl" : undefined}>
                        <CmsText text={card.title} />
                      </span>
                    )}
                  </span>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>
    </FadeUpOnScroll>
  );
}

export const block: BlockDefinition<ExperienceData> = {
  type: "home.experience",
  label: "Homepage highlights strip",
  category: "Homepage",
  description: "Three dark cards under the hero (partners, experts, global partners).",
  fields: [
    f.list(
      "cards",
      "Cards",
      [
        f.textarea("title", "Text", { rows: 2 }),
        f.bool("large", "Large text"),
        f.icon("icon", "Icon", "Leave empty if the card shows logos instead."),
        f.list("logos", "Logos (optional)", [f.text("name", "Company name"), f.image("logo", "Logo")], {
          itemLabelKey: "name",
          addLabel: "Add logo",
          max: 4,
          itemDefaults: { name: "Company", logo: "" },
        }),
        f.text("logosJoiner", 'Word between logos (e.g. "and")'),
      ],
      {
        itemLabelKey: "title",
        addLabel: "Add card",
        max: 6,
        itemDefaults: { title: "New highlight", large: false, icon: "lucide:Star", logos: [], logosJoiner: "" },
      }
    ),
  ],
  defaults: EXPERIENCE_DEFAULTS,
};
