"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ScrollFadeIn } from "@/components/animations/Animation";

const BRAND = "#4A3AFF";

const data = [
  {
    name: "Benedict",
    role: "Video Editor",
    video: "/videos/testimobial-1.mp4",
    thumbnail: "/thumbnails/thumbnail-3.png",
  },
  {
    name: "Lilian Anekwe",
    role: "Cybersecurity",
    video: "/videos/testimony.mp4",
    thumbnail: "/thumbnails/lilian-thumbnail.png",
  },
  {
    name: "Ogechi",
    role: "Product Management",
    video: "/videos/product-manager-review.mp4",
    thumbnail: "/thumbnails/thumbnail-1.png",
  },
  {
    name: "Lilian",
    role: "AI Automation",
    video: "/videos/testimonial-video.mp4",
    thumbnail: "/thumbnails/thumbnail-2.png",
  },
  {
    name: "Daniel Ugwusiani",
    role: "UI/Ux Designer",
    video: "/videos/testimonial-vid-5.mp4",
    thumbnail: "/thumbnails/thumbnail-6.png",
  },
  {
    name: "Mercy Aleke",
    role: "Digital Marketing",
    video: "/videos/testimonial-vid-6.mp4",
    thumbnail: "/thumbnails/thumbnail-5.png",
  },
  {
    name: "Amadineze Christain Chinonso",
    role: "Digital Marketing",
    video: "/videos/testimonial-vid-7.mp4",
    thumbnail: "/thumbnails/thumbnail-7.png",
  },
];

function VideoCard({ testimonial }: { testimonial: typeof data[0] }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  const handleVideoEnd = () => {
    setPlaying(false);
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

        <video
          ref={videoRef}
          src={testimonial.video}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          preload="metadata"
          onEnded={handleVideoEnd}
          onClick={() => {
            if (playing) {
              videoRef.current?.pause();
              setPlaying(false);
            }
          }}
        />

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
                <VideoCard
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