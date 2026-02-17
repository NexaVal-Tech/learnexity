"use client";

import { useState, useEffect } from "react";

type Particle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
};

export default function AnimatedHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Animation content slides
  const slides = [
    {
      title: "Launch Your Tech Career",
      subtitle: "With Learnexity",
      description: "Real-world projects. Expert mentorship. Job-ready skills.",
    },
    {
      title: "Real Projects",
      subtitle: "Real Results",
      description:
        "Build portfolio-worthy projects that employers actually care about.",
    },
    {
      title: "1-on-1 Mentorship",
      subtitle: "Industry Professionals",
      description: "Learn directly from experts guiding your growth.",
    },
    {
      title: "Career Support",
      subtitle: "End-to-End",
      description: "CV reviews, interview prep, and job application strategy.",
    },
    {
      title: "Ready to Transform?",
      subtitle: "Your Career Awaits",
      description: "Join hundreds of students building real tech careers.",
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Generate particles ONLY on client after mount
  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${15 + Math.random() * 10}s`,
    }));

    setParticles(generated);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/landing_video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5D00FF]/50 via-[#7B2EFF]/40 to-black/70" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={p}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl w-full px-6 text-center">
        <div className="relative min-h-[400px] flex items-center justify-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${
                index === currentSlide
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-8 pointer-events-none"
              }`}
            >
              {/* Subtitle */}
              <div
                className={`transform transition-all duration-700 delay-100 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <p className="text-lg md:text-xl font-semibold text-white/90 tracking-widest uppercase mb-4">
                  {slide.subtitle}
                </p>
              </div>

              {/* Title */}
              <div
                className={`transform transition-all duration-700 delay-300 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 text-white">
                  <span className="inline-block bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                    {slide.title}
                  </span>
                </h1>
              </div>

              {/* Description */}
              <div
                className={`transform transition-all duration-700 delay-500 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <p className="text-lg md:text-2xl text-white/80 mb-10 max-w-3xl">
                  {slide.description}
                </p>
              </div>

              {/* Buttons */}
              <div
                className={`transform transition-all duration-700 delay-700 flex flex-col sm:flex-row gap-4 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <a
                  href="/user/auth/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-lg text-white bg-gradient-to-r from-[#5D00FF] to-[#7B2EFF] rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                >
                  <span className="relative z-10">Enroll Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7B2EFF] to-[#5D00FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>

                <a
                  href="/courses/courses"
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-lg text-white border-2 border-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#5D00FF]"
                >
                  <span className="relative z-10">Explore Courses</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="mt-8 flex justify-center gap-3">
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => setCurrentSlide(dotIndex)}
              className={`transition-all duration-500 rounded-full ${
                dotIndex === currentSlide
                  ? "w-12 h-3 bg-white"
                  : "w-3 h-3 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Pulsing Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative w-[800px] h-[800px]">
          <div className="absolute inset-0 border-2 border-purple-400/20 rounded-full animate-ping-slow" />
          <div className="absolute inset-0 border-2 border-purple-400/10 rounded-full animate-ping-slower" />
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes ping-slower {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-ping-slower {
          animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite 1s;
        }
      `}</style>
    </section>
  );
}
