"use client";
import React from "react";
import { CmsText, CmsImage } from "@/components/cms/ui";
import { CmsButtons, buttonsField, type CmsButtonData } from "@/components/cms/CmsButton";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

export interface HomeHeroData {
  /** Pill shown above the heading on mobile ("The Digital Economy is Changing"). */
  badge: string;
  heading: string;
  subheading: string;
  backgroundVideo: string;
  backgroundImage: string;
  buttons: CmsButtonData[];
}

export const HOME_HERO_DEFAULTS: HomeHeroData = {
  badge: "The Digital Economy is Changing",
  heading: "Are Your Skills Still Valuable?",
  subheading: "Build specialised skills that increase your chances of landing a high paying remote role.",
  backgroundVideo: "/videos/landing_video.mp4",
  backgroundImage: "",
  buttons: [
    { label: "Sign Up", href: "/user/auth/register", style: "primary" },
    { label: "Explore courses", href: "/courses/courses", style: "light" },
  ],
};

const trimEnd = (t: string) => t.replace(/[\s.!?:]+$/, "");

/**
 * Work out the pill text, the mobile heading and the desktop heading.
 * Desktop keeps the original two-line headline ("…Changing.\nAre Your
 * Skills…"); mobile shows the first line as a pill above the rest.
 * Also handles content saved before the Badge field existed, where both
 * lines live in the heading.
 */
export function heroText(data: Pick<HomeHeroData, "badge" | "heading">) {
  const heading = (data.heading ?? "").trim();
  const badge = (data.badge ?? "").trim();
  const nl = heading.indexOf("\n");
  const first = nl >= 0 ? heading.slice(0, nl).trim() : "";
  const rest = nl >= 0 ? heading.slice(nl + 1).trim() : heading;

  if (badge) {
    // Heading still starts with the badge line (older content) → don't repeat it.
    if (first && trimEnd(first).toLowerCase() === trimEnd(badge).toLowerCase()) {
      return { badge: trimEnd(badge), mobile: rest, desktop: heading };
    }
    const desktop = heading ? `${/[.!?:]$/.test(badge) ? badge : `${badge}.`}\n${heading}` : badge;
    return { badge: trimEnd(badge), mobile: heading, desktop };
  }
  if (first) return { badge: trimEnd(first), mobile: rest, desktop: heading };
  return { badge: "", mobile: heading, desktop: heading };
}

export default function Hero({ data = HOME_HERO_DEFAULTS }: { data?: HomeHeroData }) {
  const text = heroText(data);
  return (
    <section
      className="relative overflow-hidden bg-black w-full pt-16 min-h-[60vh] md:min-h-[80vh]"
    >
      {/* Background video (or image, if no video is set) */}
      {data.backgroundVideo ? (
        <video
          key={data.backgroundVideo}
          className="absolute inset-0 w-full h-[750px] md:h-[750px] lg:h-[600px] object-cover z-0"
          src={data.backgroundVideo}
          poster={data.backgroundImage || undefined}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : data.backgroundImage ? (
        <CmsImage src={data.backgroundImage} alt="" fill priority className="object-cover z-0" sizes="100vw" />
      ) : null}

      {/* Overlay */}
      <div className="absolute inset-0 z-[1]" style={{background:"linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)",}} />

      <div className="relative z-10 max-w-7xl mx-auto flex items-center px-5 sm:px-8 min-h-[60vh] md:min-h-[80vh]">
        <div className="max-w-5xl">
          {/* Pill + heading on every screen size. The pill stays small on
              mobile and is shown large on bigger screens. */}
          {text.badge && (
            <div className="inline-flex items-center px-4 py-2 md:px-8 md:py-3 lg:px-12 lg:py-4 mb-5 md:mb-7 rounded-full bg-slate-800/60 border border-slate-600/70 text-sm md:text-xl lg:text-[1.75rem] lg:tracking-wide font-medium text-indigo-100 backdrop-blur-sm">
              <span className="flex h-2 w-2 md:h-3 md:w-3 rounded-full mr-2 md:mr-3 lg:mr-4 animate-pulse flex-shrink-0" style={{ background: "#8b7cff" }} />
              <CmsText text={text.badge} accentColor="#a5b4fc" />
            </div>
          )}
          <h1 className="text-left text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
            <CmsText text={text.mobile} accentColor="#a5b4fc" />
          </h1>

          {/* Subheading */}
          <p className="mt-4 max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-200">
            <CmsText text={data.subheading} accentColor="#a5b4fc" />
          </p>

          {/* Buttons */}
          <CmsButtons buttons={data.buttons} nowrap className="items-start mt-10" />
        </div>
      </div>
    </section>
  );
}

export const block: BlockDefinition<HomeHeroData> = {
  type: "home.hero",
  label: "Homepage hero",
  category: "Homepage",
  description: "Full-width video banner with headline and two buttons.",
  fields: [
    f.text("badge", "Badge text", { help: "Pill shown above the headline (e.g. The Digital Economy is Changing). Leave empty to hide it." }),
    f.textarea("heading", "Headline", { rows: 3, help: EMPHASIS_HELP }),
    f.textarea("subheading", "Subheading", { rows: 3, help: EMPHASIS_HELP }),
    f.video("backgroundVideo", "Background video", "Plays muted on a loop. Leave empty to use the image below instead."),
    f.image("backgroundImage", "Background image", "Shown while the video loads, or on its own if there's no video."),
    buttonsField("buttons", "Buttons", 3),
  ],
  defaults: HOME_HERO_DEFAULTS,
};
