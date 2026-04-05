"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ScrollFadeIn } from "@/components/animations/Animation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    video: "/videos/testimonial-5.mp4",
    thumbnail: "/thumbnails/thumbnail-4.png",
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
      className="flex-shrink-0 w-[340px] flex flex-col"
      style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem" }}
    >
      {/* Video container */}
      <div
        className="relative overflow-hidden border border-white/10 bg-[#0f0f0f]"
        style={{
          borderRadius: "2rem 0.75rem 2rem 0.75rem",
          aspectRatio: "9/10",
        }}
      >
        {/* Thumbnail overlay */}
        {!playing && (
          <Image
            src={testimonial.thumbnail}
            alt={testimonial.name}
            fill
            className="absolute inset-0 object-cover"
            sizes="340px"
          />
        )}

        {/* Dark gradient overlay */}
        {!playing && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        )}

        {/* Video element */}
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

        {/* Play button */}
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
              {/* Play triangle */}
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

        {/* Name tag pinned to bottom */}
        {!playing && (
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 z-10">
            <p className="text-white font-semibold text-base">{testimonial.name}</p>
            <p className="text-sm mt-0.5" style={{ color: `${BRAND}cc` }}>
              {testimonial.role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const visibleCount = 3; // cards visible at once on desktop
  const maxSlide = data.length - 1;

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  };

  return (
    <section className="py-16 overflow-hidden">
      <style>{`
        .nav-btn:hover {
          background-color: ${BRAND} !important;
          border-color: ${BRAND} !important;
        }
      `}</style>

      <div className="max-w-screen-xl mx-auto px-6">
        {/* Header */}
        <ScrollFadeIn delay={0}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: BRAND }}>
                Real Stories
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Student Transformations
              </h2>
            </div>

            {/* Navigation arrows */}
            <div className="hidden md:flex gap-3">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="nav-btn w-11 h-11 rounded-full border border-white/20
                  flex items-center justify-center
                  bg-white/5 text-white
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === maxSlide}
                className="nav-btn w-11 h-11 rounded-full border border-white/20
                  flex items-center justify-center
                  bg-white/5 text-white
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </ScrollFadeIn>

        {/* Cards track */}
        <ScrollFadeIn delay={0.1} duration={0.3}>
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 356}px)` }}
            >
              {data.map((testimonial, index) => (
                <VideoCard key={index} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </ScrollFadeIn>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {data.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: currentSlide === i ? "2rem" : "0.5rem",
                backgroundColor: currentSlide === i ? BRAND : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}