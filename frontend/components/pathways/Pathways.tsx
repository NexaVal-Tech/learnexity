"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeUpOnScroll } from "../animations/Animation";
import { CmsText, CmsLink } from "@/components/cms/ui";
import { CmsButton, buttonFields, type CmsButtonData } from "@/components/cms/CmsButton";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

export interface PathwayCard {
  number: string;
  title: string;
  description: string;
  gradient: boolean;
  /** Where the card goes when clicked (set in the CMS). Empty = not clickable. */
  href?: string;
  /** Text at the bottom of the card, e.g. "Learn more". */
  linkLabel?: string;
  newTab?: boolean;
}

export interface PathwaysData {
  heading: string;
  intro: string;
  button: CmsButtonData;
  cards: PathwayCard[];
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
      href: "/courses/courses",
      linkLabel: "Learn more",
    },
    {
      number: "[ 02 ]",
      title: "Self-Paced Learning",
      description:
        "Learn at your own pace with expert-led content on your schedule. Perfect for busy professionals who need flexibility to fit learning into their lives.",
      gradient: false,
      href: "/flex",
      linkLabel: "Learn more",
    },
    {
      number: "[ 03 ]",
      title: "One-on-One Mentorship",
      description:
        "Get direct training and mentorship from our experts in private, focused sessions tailored specifically to your goals, plus access to our course library and remote opportunities.",
      gradient: false,
      href: "/courses/courses",
      linkLabel: "Learn more",
    },
  ],
};

const RADIUS = "2rem 0.75rem 2rem 0.75rem";
const GRADIENT = "linear-gradient(163.36deg, #5B1EF6 -33.94%, #F59E0B 18.93%, #5B1EF6 48.37%, #DE492B 97.22%)";

function CardBody({ card }: { card: PathwayCard }) {
  const g = card.gradient;
  return (
    <>
      <div className="mb-6">
        <span className={`text-sm font-mono ${g ? "text-orange-200" : ""}`} style={g ? undefined : { color: `${BRAND}99` }}>
          {card.number}
        </span>
      </div>
      <h3 className={`text-2xl font-semibold mb-4 sub-component-headers ${g ? "" : "text-[var(--text-primary)]"}`}>
        <CmsText text={card.title} accentColor={g ? "#fde68a" : undefined} />
      </h3>
      <p className={`text-xl leading-relaxed flex-1 ${g ? "text-white/90" : "text-[var(--text-secondary)]"}`}>
        <CmsText text={card.description} accentColor={g ? "#fde68a" : undefined} />
      </p>
      {card.href && (
        <span
          className="mt-8 inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all"
          style={{ color: g ? "#fff" : BRAND }}
        >
          {card.linkLabel || "Learn more"} <ArrowRight size={18} />
        </span>
      )}
    </>
  );
}

export default function Pathways({ data = PATHWAYS_DEFAULTS }: { data?: PathwaysData }) {
  const cards = data.cards ?? [];
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Enable/disable the arrows depending on the scroll position.
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, cards.length]);

  /** Move by one card. */
  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = 16;
    const step = first ? first.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrowClass =
    "w-11 h-11 flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] transition-all duration-300 hover:border-[#4A3AFF] hover:text-[#4A3AFF] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[var(--border-subtle)] disabled:hover:text-[var(--text-primary)]";

  return (
    <section className="pt-2 py-20">
      <style>{`
        .pathway-card { border-radius: ${RADIUS}; }
        .pathway-card.is-link:hover {
          border-color: ${BRAND}66 !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px ${BRAND}33 !important;
        }
        .pathway-track { scrollbar-width: none; -ms-overflow-style: none; }
        .pathway-track::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        <FadeUpOnScroll>
          {/* Header */}
          <div className="mb-10 flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-center lg:justify-between">
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

        {/* Arrows */}
        {cards.length > 1 && (
          <div className="flex md:hidden justify-end gap-3 mb-5">
            <button type="button" aria-label="Previous pathway" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={arrowClass} style={{ borderRadius: RADIUS }}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" aria-label="Next pathway" onClick={() => scrollByCard(1)} disabled={!canNext} className={arrowClass} style={{ borderRadius: RADIUS }}>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Cards: on mobile one row that swipes left and right; from md up the original grid */}
        <FadeUpOnScroll>
          <div
            ref={trackRef}
            className={`pathway-track flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-1 px-1 md:grid md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 ${
              cards.length === 2 ? "lg:grid-cols-2" : cards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {cards.map((card, index) => {
              const clickable = !!card.href;
              const cls = `group snap-start flex-none w-[85%] sm:w-[70%] md:w-auto flex flex-col p-5 sm:p-8 min-h-[22rem] md:min-h-0 transition-all duration-300 ${
                card.gradient
                  ? "text-white"
                  : "pathway-card border border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-sm shadow-lg shadow-black/40"
              } ${clickable ? "is-link cursor-pointer hover:-translate-y-2" : ""}`;
              const style = card.gradient ? { background: GRADIENT, borderRadius: RADIUS } : undefined;
              return clickable ? (
                <CmsLink key={index} href={card.href} newTab={card.newTab} className={cls} style={style} aria-label={card.title}>
                  <CardBody card={card} />
                </CmsLink>
              ) : (
                <div key={index} className={cls} style={style}>
                  <CardBody card={card} />
                </div>
              );
            })}
          </div>
        </FadeUpOnScroll>
      </div>
    </section>
  );
}

export const block: BlockDefinition<PathwaysData> = {
  type: "home.pathways",
  label: "Our pathways",
  category: "Homepage",
  description: "Heading with a button, then numbered pathway cards in a row that scrolls left and right. Each card can link to a page.",
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
        f.url("href", "Card link", "Where the card goes when clicked, e.g. /flex or a full https:// URL. Leave empty to make the card not clickable."),
        f.text("linkLabel", "Link text", { help: "Shown at the bottom of the card, e.g. Learn more." }),
        f.bool("newTab", "Open the link in a new tab"),
      ],
      {
        itemLabelKey: "title",
        addLabel: "Add pathway",
        max: 6,
        itemDefaults: { number: "[ 04 ]", title: "New pathway", description: "Describe it.", gradient: false, href: "", linkLabel: "Learn more", newTab: false },
      }
    ),
  ],
  defaults: PATHWAYS_DEFAULTS,
};
