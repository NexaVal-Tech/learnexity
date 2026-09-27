"use client";

import { CmsImage, CmsText } from "@/components/cms/ui";
import { f } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";
import { useState, useRef } from "react";
import { ScrollFadeIn } from "@/components/animations/Animation";

const BRAND = "#4A3AFF";

type Testimonial = {
  name: string;
  role: string;
  type: "video" | "text" | "image";
  thumbnail: string;
  video?: string;
  text?: string;
};

export interface TestimonialsData {
  eyebrow: string;
  heading: string;
  items: Testimonial[];
}

// Older video/text testimonials that were commented out in favour of the
// designed image cards are still on disk (/videos, /thumbnails) and can be
// re-added from the admin with type "Video".
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
};

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    if (testimonial.type === "video") {
      videoRef.current?.play();
    }
  };

  const handleVideoEnd = () => {
    setPlaying(false);
  };

  const handleCardClick = () => {
    if (playing && testimonial.type === "video") {
      videoRef.current?.pause();
      setPlaying(false);
    } else if (playing && testimonial.type === "text") {
      setPlaying(false);
    }
  };

  return (
    <div
      className="flex-shrink-0 w-[340px]"
      style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem" }}
    >
      <div
        className={`relative overflow-hidden border border-[var(--border-subtle)] ${
          testimonial.type === "image" ? "bg-black" : "bg-[var(--surface-elevated)]"
        }`}
        style={{
          borderRadius: "2rem 0.75rem 2rem 0.75rem",
          aspectRatio: "9/10",
        }}
      >
        {!playing && (
          <CmsImage
            src={testimonial.thumbnail}
            alt={testimonial.name}
            fill
            className={testimonial.type === "image" ? "object-contain" : "object-cover"}
            sizes="340px"
          />
        )}

        {/* Designed quote-card images already contain the name, role and
            quote, so skip the play button / gradient / name overlay used
            for video and text testimonials. */}
        {!playing && testimonial.type !== "image" && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        )}

        {/* Video playback */}
        {testimonial.type === "video" && (
          <video
            ref={videoRef}
            src={testimonial.video}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
            preload="metadata"
            onEnded={handleVideoEnd}
            onClick={handleCardClick}
          />
        )}

        {/* Text testimonial reveal */}
        {testimonial.type === "text" && playing && (
          <div
            onClick={handleCardClick}
            className="absolute inset-0 flex flex-col justify-center px-7 py-8 cursor-pointer transition-opacity duration-300"
            style={{
              background: `linear-gradient(160deg, ${BRAND}22 0%, #0f0f0f 100%)`,
            }}
          >
            <CmsImage
              src={testimonial.thumbnail}
              alt={testimonial.name}
              fill
              className="object-cover opacity-15"
              sizes="340px"
            />
            <div className="relative z-10">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill={BRAND}
                className="mb-4 opacity-80"
              >
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
              </svg>
              <p className="text-white text-[0.95rem] leading-relaxed mb-6">
                {testimonial.text}
              </p>
              <p className="text-white font-semibold text-base">
                {testimonial.name}
              </p>
              <p className="text-sm mt-0.5" style={{ color: `${BRAND}cc` }}>
                {testimonial.role}
              </p>
            </div>
          </div>
        )}

        {!playing && testimonial.type !== "image" && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center group z-10"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center
              backdrop-blur-sm border border-white/30
              group-hover:scale-110 transition-all duration-300"
              style={{ backgroundColor: `${BRAND}cc` }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="white"
                className="ml-1"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </button>
        )}

        {!playing && testimonial.type !== "image" && (
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 z-10">
            <p className="text-white font-semibold text-base">
              {testimonial.name}
            </p>
            <p
              className="text-sm mt-0.5"
              style={{ color: `${BRAND}cc` }}
            >
              {testimonial.role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Testimonials({ data = TESTIMONIALS_DEFAULTS }: { data?: TestimonialsData }) {
  const items = (data.items ?? []).filter((t) => t.thumbnail || t.video || t.text);
  const [paused, setPaused] = useState(false);

  return (
    <section className="py-16 overflow-hidden">
      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50%));
          }
        }

        .testimonial-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: marquee 35s linear infinite;
        }

        .testimonial-track.paused {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .testimonial-track {
            animation-duration: 25s;
          }
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        <ScrollFadeIn delay={0}>
          <div className="mb-12">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: BRAND }}
            >
              {data.eyebrow}
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              <CmsText text={data.heading} />
            </h2>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1} duration={0.3}>
          <div
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <div
              className={`testimonial-track ${
                paused ? "paused" : ""
              }`}
            >
              {[...items, ...items].map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}

export const block: BlockDefinition<TestimonialsData> = {
  type: "home.testimonials",
  label: "Student transformations (scrolling)",
  category: "Homepage",
  description: "Auto-scrolling row of testimonial cards — designed images, videos or text quotes.",
  fields: [
    f.text("eyebrow", "Small label"),
    f.textarea("heading", "Heading", { rows: 2 }),
    f.list(
      "items",
      "Testimonials",
      [
        f.text("name", "Name"),
        f.text("role", "Role / course"),
        f.select("type", "Type", [
          { value: "image", label: "Designed image (name & quote are in the picture)" },
          { value: "video", label: "Video" },
          { value: "text", label: "Text quote" },
        ]),
        f.image("thumbnail", "Image / video cover"),
        { ...f.video("video", "Video"), showIf: { key: "type", equals: "video" } },
        { ...f.textarea("text", "Quote", { rows: 4 }), showIf: { key: "type", equals: "text" } },
      ],
      {
        itemLabelKey: "name",
        addLabel: "Add testimonial",
        itemDefaults: { name: "Student", role: "Course", type: "image", thumbnail: "", video: "", text: "" },
      }
    ),
  ],
  defaults: TESTIMONIALS_DEFAULTS,
};
