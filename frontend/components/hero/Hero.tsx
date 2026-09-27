"use client";
import React from "react";
import { CmsText, CmsImage } from "@/components/cms/ui";
import { CmsButtons, buttonsField, type CmsButtonData } from "@/components/cms/CmsButton";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

export interface HomeHeroData {
  heading: string;
  subheading: string;
  backgroundVideo: string;
  backgroundImage: string;
  buttons: CmsButtonData[];
}

export const HOME_HERO_DEFAULTS: HomeHeroData = {
  heading: "The Digital Economy is Changing.\nAre Your Skills Still Valuable?",
  subheading: "Build specialised skills that increase your chances of landing a high paying remote role.",
  backgroundVideo: "/videos/landing_video.mp4",
  backgroundImage: "",
  buttons: [
    { label: "Sign Up", href: "/user/auth/register", style: "primary" },
    { label: "Explore courses", href: "/courses/courses", style: "light" },
  ],
};

export default function Hero({ data = HOME_HERO_DEFAULTS }: { data?: HomeHeroData }) {
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
          {/* Heading */}
          <h1 className="text-left text-5xl sm:text-5xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            <CmsText text={data.heading} accentColor="#a5b4fc" />
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
    f.textarea("heading", "Headline", { rows: 3, help: EMPHASIS_HELP }),
    f.textarea("subheading", "Subheading", { rows: 3, help: EMPHASIS_HELP }),
    f.video("backgroundVideo", "Background video", "Plays muted on a loop. Leave empty to use the image below instead."),
    f.image("backgroundImage", "Background image", "Shown while the video loads, or on its own if there's no video."),
    buttonsField("buttons", "Buttons", 3),
  ],
  defaults: HOME_HERO_DEFAULTS,
};
