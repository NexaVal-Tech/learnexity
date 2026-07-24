"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ScrollFadeIn } from "@/components/animations/Animation";

const BRAND = "#4A3AFF";

type Testimonial = {
  name: string;
  role: string;
  type: "video" | "text";
  thumbnail: string;
  video?: string;
  text?: string;
};

const data: Testimonial[] = [
  {
    name: "Benedict",
    role: "Video Editor",
    type: "video",
    video: "/videos/testimobial-1.mp4",
    thumbnail: "/thumbnails/thumbnail-3.png",
  },
  {
    name: "Diane Johnson",
    role: "Data Analytics",
    type: "text",
    thumbnail: "/thumbnails/images.png",
    text: "Coming Soon.",
  },
  {
    name: "Lilian Anekwe",
    role: "Cybersecurity",
    type: "video",
    video: "/videos/testimony.mp4",
    thumbnail: "/thumbnails/lilian-thumbnail.png",
  },
  {
    name: "Ogechi",
    role: "Product Management",
    type: "video",
    video: "/videos/product-manager-review.mp4",
    thumbnail: "/thumbnails/thumbnail-1.png",
  },
  {
    name: "Ross Micheal",
    role: "Frontend Development",
    type: "text",
    thumbnail: "/thumbnails/images-2.png",
    text: "Coming Soon.",
  },
  {
    name: "Lilian",
    role: "AI Automation",
    type: "video",
    video: "/videos/testimonial-video.mp4",
    thumbnail: "/thumbnails/thumbnail-2.png",
  },
  {
    name: "Daniel Ugwusiani",
    role: "UI/Ux Designer",
    type: "video",
    video: "/videos/testimonial-vid-5.mp4",
    thumbnail: "/thumbnails/thumbnail-6.png",
  },
  {
    name: "Mercy Aleke",
    role: "Digital Marketing",
    type: "video",
    video: "/videos/testimonial-vid-6.mp4",
    thumbnail: "/thumbnails/thumbnail-5.png",
  },
  {
    name: "james williams",
    role: "Cloud Computing",
    type: "text",
    thumbnail: "/thumbnails/images-3.png",
    text: "Coming Soon.",
  },
  {
    name: "Amadineze Christain Chinonso",
    role: "Digital Marketing",
    type: "video",
    video: "/videos/testimonial-vid-7.mp4",
    thumbnail: "/thumbnails/thumbnail-7.png",
  },

];

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
        className="relative overflow-hidden border border-white/10 bg-[#0f0f0f]"
        style={{
          borderRadius: "2rem 0.75rem 2rem 0.75rem",
          aspectRatio: "9/10",
        }}
      >
        {!playing && (
          <Image
            src={testimonial.thumbnail}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="340px"
          />
        )}

        {!playing && (
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
            <Image
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

        {!playing && (
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

        {!playing && (
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

export default function Testimonials() {
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
              Real Stories
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Student Transformations
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
              {[...data, ...data].map((testimonial, index) => (
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