"use client";

// Student transformations: a row of story cards — student photo, social
// links ("LinkedIn"), "Read story ↗", company logo and a stat on the photo,
// and a card with name, course and Now / Before roles. Every extra only
// appears when it's filled in. Swipe / drag or use the arrows to scroll.
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Play, X } from "lucide-react";
import { CmsImage, CmsLink, CmsText, SOCIAL_ICONS } from "@/components/cms/ui";
import { f } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";
import { ScrollFadeIn } from "@/components/animations/Animation";
import { CarouselArrows, useCarousel } from "@/components/ui/CarouselArrows";

const BRAND = "#4A3AFF";
const RADIUS = "2rem 0.75rem 2rem 0.75rem";
const INNER_RADIUS = "1.25rem 0.5rem 1.25rem 0.5rem";

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  website: "Website",
};

type Social = { platform: string; url: string };

type Testimonial = {
  /** card = photo + info card (new design); video = same, with a play button; image = a designed picture shown on its own. */
  type: "card" | "video" | "image" | "text";
  name: string;
  /** Course line, e.g. "AI & Machine Learning Graduate". */
  role: string;
  /** Student photo (or the designed picture / video cover). */
  thumbnail: string;
  video?: string;
  text?: string;
  nowRole?: string;
  beforeRole?: string;
  companyLogo?: string;
  statValue?: string;
  statLabel?: string;
  socials?: Social[];
  storyUrl?: string;
};

export interface TestimonialsData {
  eyebrow: string;
  heading: string;
  items: Testimonial[];
  ctaLabel?: string;
  ctaHref?: string;
}

// The original testimonials are designed images (name and quote are part
// of the picture), so they stay "image" cards. New ones default to "card".
export const TESTIMONIALS_DEFAULTS: TestimonialsData = {
  eyebrow: "Real Stories",
  heading: "Student Transformations",
  items: [
    { name: "Benedict", role: "Video Editor", type: "image", thumbnail: "/images/testimonial-image-1.jpeg" },
    { name: "Lilian Anekwe", role: "Cybersecurity", type: "image", thumbnail: "/images/testimonial-image-6.jpeg" },
    { name: "Ogechi", role: "Product Management", type: "video", video: "/videos/product-manager-review.mp4", thumbnail: "/thumbnails/thumbnail-1.png" },
    { name: "Lilian", role: "AI Automation", type: "image", thumbnail: "/images/testimonial-image-3.jpeg" },
    { name: "Daniel Ugwusiani", role: "UI/Ux Designer", type: "image", thumbnail: "/images/testimonial-image-4.jpeg" },
    { name: "Mercy Aleke", role: "Digital Marketing", type: "image", thumbnail: "/images/testimonial-image-2.jpeg" },
    { name: "Amadineze Christain Chinonso", role: "Digital Marketing", type: "image", thumbnail: "/images/testimonial-image-5.jpeg" },
  ],
  ctaLabel: "See students' achievements",
  ctaHref: "",
};

const CARD_W = "w-[82vw] max-w-[20rem] sm:w-[22rem] sm:max-w-none lg:w-[26rem]";
// One height for every card, sized so the heading, cards and buttons fit on
// one screen.
const CARD_H = "clamp(21rem, 54vh, 25rem)";

/** "in LinkedIn" style labels on the photo. */
function SocialLinks({ socials }: { socials: Social[] }) {
  if (!socials.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {socials.map((s, i) => {
        const key = (s.platform || "website").toLowerCase();
        const Icon = SOCIAL_ICONS[key] ?? SOCIAL_ICONS.website;
        return (
          <CmsLink
            key={i}
            href={s.url}
            newTab
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/95 hover:text-white drop-shadow"
            aria-label={SOCIAL_LABELS[key] ?? "Profile"}
          >
            <span className="w-5 h-5 rounded-[4px] bg-white/90 text-gray-900 flex items-center justify-center">
              <Icon size={12} strokeWidth={2.5} />
            </span>
            {SOCIAL_LABELS[key] ?? "Profile"}
          </CmsLink>
        );
      })}
    </div>
  );
}

/** Name, course and Now / Before roles. */
function InfoCard({ t }: { t: Testimonial }) {
  const hasRoles = t.nowRole || t.beforeRole;
  return (
    <div className="bg-[var(--surface)] text-[var(--text-primary)] p-3.5 sm:p-4 shadow-lg" style={{ borderRadius: INNER_RADIUS }}>
      <h3 className="text-xl sm:text-2xl font-semibold leading-tight">{t.name}</h3>
      {t.role && <p className="text-sm text-[var(--text-muted)] mt-0.5">{t.role}</p>}

      {t.text && <p className="mt-2 text-sm text-[var(--text-secondary)] leading-snug line-clamp-2">&ldquo;{t.text}&rdquo;</p>}

      {hasRoles && (
        <div className={`mt-3 grid gap-3 ${t.nowRole && t.beforeRole ? "grid-cols-[1.6fr_1fr]" : "grid-cols-1"}`}>
          {t.nowRole && (
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)] mb-1">Now</p>
              <p className="text-base sm:text-lg font-medium leading-snug line-clamp-2">{t.nowRole}</p>
            </div>
          )}
          {t.beforeRole && (
            <div className={`min-w-0 ${t.nowRole ? "border-l border-[var(--border-strong)] pl-4" : ""}`}>
              <p className="text-xs text-[var(--text-muted)] mb-1">Before</p>
              <p className="text-sm text-[var(--text-secondary)] leading-snug line-clamp-2">{t.beforeRole}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StoryCard({ t }: { t: Testimonial }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const socials = (t.socials ?? []).filter((s) => s && s.url);
  const isVideo = !!t.video && (t.type === "video" || t.type === "card");

  // A designed picture that already contains the name and quote.
  if (t.type === "image") {
    return (
      <div className={`snap-start flex-shrink-0 ${CARD_W}`}>
        <div className="relative overflow-hidden bg-black border border-[var(--border-subtle)]" style={{ borderRadius: RADIUS, height: CARD_H }}>
          {t.thumbnail && <CmsImage src={t.thumbnail} alt={t.name} fill className="object-contain" sizes="(min-width:1024px) 26rem, 82vw" />}
          {(socials.length > 0 || t.storyUrl) && (
            <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between gap-3 bg-gradient-to-b from-black/50 to-transparent">
              <SocialLinks socials={socials} />
              {t.storyUrl && <ReadStory href={t.storyUrl} />}
            </div>
          )}
        </div>
      </div>
    );
  }

  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };
  const stop = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  return (
    <div className={`snap-start flex-shrink-0 ${CARD_W}`}>
      <div
        className="relative overflow-hidden h-full flex flex-col border border-[var(--border-subtle)] bg-gradient-to-b from-gray-500 to-gray-700"
        style={{ borderRadius: RADIUS, height: CARD_H }}
      >
        {/* Photo */}
        {t.thumbnail && (
          <CmsImage src={t.thumbnail} alt={t.name} fill className="object-cover object-top" sizes="(min-width:1024px) 26rem, 82vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45 pointer-events-none" />

        {/* Video (plays over the whole card) */}
        {isVideo && playing && (
          <div className="absolute inset-0 z-30 bg-black">
            <video ref={videoRef} src={t.video} className="w-full h-full object-cover" controls playsInline preload="none" onEnded={stop} />
            <button
              type="button"
              onClick={stop}
              aria-label="Close video"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Top row: socials + read story */}
        <div className="relative z-10 p-3.5 sm:p-4 flex items-start justify-between gap-3">
          <SocialLinks socials={socials} />
          {t.storyUrl && <ReadStory href={t.storyUrl} />}
        </div>

        {/* Play button */}
        {isVideo && !playing && (
          <button type="button" onClick={play} aria-label={`Play ${t.name}'s video`} className="relative z-10 mx-auto my-auto group">
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm group-hover:scale-110 transition"
              style={{ background: `${BRAND}cc` }}
            >
              <Play size={24} fill="white" className="text-white ml-1" />
            </span>
          </button>
        )}

        {/* Bottom of the photo: company logo + stat, then the info card */}
        <div className="relative z-10 mt-auto">
          {(t.companyLogo || t.statValue) && (
            <div className="px-3.5 sm:px-4 pb-2 flex items-end justify-between gap-4">
              {t.companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.companyLogo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-6 sm:h-8 w-auto max-w-[45%] object-contain object-left drop-shadow"
                />
              ) : (
                <span />
              )}
              {t.statValue && (
                <div className="text-right text-white drop-shadow">
                  <p className="text-3xl sm:text-4xl font-light leading-none tracking-tight">{t.statValue}</p>
                  {t.statLabel && <p className="text-xs sm:text-sm mt-1">{t.statLabel}</p>}
                </div>
              )}
            </div>
          )}
          <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
            <InfoCard t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadStory({ href }: { href: string }) {
  return (
    <CmsLink
      href={href}
      newTab
      className="inline-flex items-center gap-1 text-sm font-semibold text-white/95 hover:text-white whitespace-nowrap drop-shadow"
    >
      Read story <ArrowUpRight size={16} />
    </CmsLink>
  );
}

export default function Testimonials({ data = TESTIMONIALS_DEFAULTS }: { data?: TestimonialsData }) {
  const items = (data.items ?? [])
    .map((t) => ({ ...t, type: (t.type as string) === "text" ? "card" : t.type || "card" } as Testimonial))
    .filter((t) => t.thumbnail || t.video || t.text || t.name);
  const { ref, canPrev, canNext, scrollByCard, dragHandlers } = useCarousel<HTMLDivElement>([items.length]);

  return (
    <section className="py-10 md:py-12 overflow-hidden">
      <style>{`
        .tst-track { scrollbar-width: none; -ms-overflow-style: none; }
        .tst-track::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        <ScrollFadeIn delay={0}>
          <div className="mb-6">
            {data.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: BRAND }}>
                {data.eyebrow}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)]">
              <CmsText text={data.heading} />
            </h2>
          </div>
        </ScrollFadeIn>

        <div
          ref={ref}
          className="tst-track flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 cursor-grab active:cursor-grabbing select-none"
          {...dragHandlers}
        >
          {items.map((t, i) => (
            <StoryCard key={i} t={t} />
          ))}
        </div>

        {(data.ctaLabel && data.ctaHref) || canPrev || canNext ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {data.ctaLabel && data.ctaHref ? (
              <CmsLink
                href={data.ctaHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--text-primary)] text-[var(--text-primary)] font-semibold hover:border-[#4A3AFF] hover:text-[#4A3AFF] hover:gap-3 transition-all"
              >
                {data.ctaLabel} <ArrowRight size={18} />
              </CmsLink>
            ) : (
              <span />
            )}
            <CarouselArrows
              canPrev={canPrev}
              canNext={canNext}
              onPrev={() => scrollByCard(-1)}
              onNext={() => scrollByCard(1)}
              label="story"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export const block: BlockDefinition<TestimonialsData> = {
  type: "home.testimonials",
  label: "Student transformations",
  category: "Homepage",
  description: "Row of student story cards (photo, socials, read story, company logo, stat, Now / Before). Visitors swipe or use the arrows.",
  fields: [
    f.text("eyebrow", "Small label"),
    f.textarea("heading", "Heading", { rows: 2 }),
    f.list(
      "items",
      "Testimonials",
      [
        f.select("type", "Card style", [
          { value: "card", label: "Story card (photo + details)" },
          { value: "video", label: "Story card with video" },
          { value: "image", label: "Designed image (name & quote are in the picture)" },
        ]),
        f.image("thumbnail", "Student photo", "Portrait photo works best. For a video card this is the cover."),
        f.text("name", "Name"),
        f.text("role", "Course line", { help: "e.g. AI & Machine Learning Graduate" }),
        { ...f.text("nowRole", "Now (current role)", { help: "e.g. Senior Data Analyst at Citibank. Leave empty to hide." }), showIf: { key: "type", equals: ["card", "video"] } },
        { ...f.text("beforeRole", "Before (previous role)", { help: "Leave empty to hide." }), showIf: { key: "type", equals: ["card", "video"] } },
        { ...f.textarea("text", "Short quote (optional)", { rows: 3 }), showIf: { key: "type", equals: ["card", "video"] } },
        { ...f.image("companyLogo", "Company logo (optional)", "A white/transparent logo looks best on the photo."), showIf: { key: "type", equals: ["card", "video"] } },
        { ...f.text("statValue", "Stat (optional)", { help: "e.g. +86%" }), showIf: { key: "type", equals: ["card", "video"] } },
        { ...f.text("statLabel", "Stat label", { help: "e.g. salary increase" }), showIf: { key: "type", equals: ["card", "video"] } },
        { ...f.video("video", "Video"), showIf: { key: "type", equals: "video" } },
        f.list(
          "socials",
          "Social links",
          [
            f.select("platform", "Platform", [
              { value: "linkedin", label: "LinkedIn" },
              { value: "x", label: "X (Twitter)" },
              { value: "instagram", label: "Instagram" },
              { value: "facebook", label: "Facebook" },
              { value: "youtube", label: "YouTube" },
              { value: "website", label: "Website" },
            ]),
            f.url("url", "Profile link"),
          ],
          { itemLabelKey: "platform", addLabel: "Add social link", max: 4, itemDefaults: { platform: "linkedin", url: "" } }
        ),
        f.url("storyUrl", "Read story link (optional)", "Shows “Read story ↗” on the card when filled in."),
      ],
      {
        itemLabelKey: "name",
        addLabel: "Add testimonial",
        itemDefaults: {
          type: "card", name: "Student", role: "Course Graduate", thumbnail: "", nowRole: "", beforeRole: "", text: "",
          companyLogo: "", statValue: "", statLabel: "", video: "", socials: [], storyUrl: "",
        },
      }
    ),
    f.text("ctaLabel", "Button text", { help: "e.g. See students' achievements" }),
    f.url("ctaHref", "Button link", "Leave empty to hide the button."),
  ],
  defaults: TESTIMONIALS_DEFAULTS,
};
