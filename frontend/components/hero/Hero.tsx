"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Courses from "../headercourses/HeaderCourse";
import { PrimaryButton, SignUpButton2 } from "../button/Button";

const BRAND = "#4A3AFF";

const slides = [
  { title: "Welcome To Learnexity", accent: "Learnexity" },
  {
    title: "Are you experiencing",
    bullets: ["Fragmented learning", "Limited practical experience", "Difficulty getting hired"],
  },
  {
    title: "At Learnexity, we help you land your dream roles",
    subtitle: "Providing hands-on experience, mentorship, internships and career guidance",
    accent: "dream roles",
  },
  { title: "Learners Gain", bullets: ["Real skills", "Portfolio", "Career guidance"] },
  { title: "Mentorship keeps everything aligned", accent: "aligned" },
  { title: "Your growth matters", accent: "growth" },
  { title: "Welcome to the future of learning", subtitle: "Join us", accent: "future" },
];

const DURATION = 3800;

function AnimatedTitle({ title, accent, animKey }: { title: string; accent?: string; animKey: number }) {
  const words = title.split(" ");
  return (
    // font-semibold to match Method.tsx h2 style; no serif font-family override
    <h1 className="hero-title font-semibold leading-tight mb-5">
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, "");
        const isAccent =
          accent &&
          clean.includes(accent.toLowerCase().split(" ")[0].replace(/[^a-z]/g, ""));
        return (
          <span
            key={`${animKey}-${i}`}
            className="inline-block mr-[0.22em] word-reveal"
            style={{
              animationDelay: `${i * 75}ms`,
              color: isAccent ? BRAND : "white",
              textShadow: isAccent ? `0 0 40px ${BRAND}99, 0 0 80px ${BRAND}44` : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </h1>
  );
}

function AnimatedBullets({ bullets, animKey }: { bullets: string[]; animKey: number }) {
  return (
    <ul className="space-y-4 mt-3 text-left max-w-md mx-auto lg:mx-0">
      {bullets.map((b, i) => (
        <li
          key={`${animKey}-b-${i}`}
          // text-xl matching Method's feature body text scale
          className="flex items-center gap-3 text-lg sm:text-xl text-white/90 bullet-reveal"
          style={{ animationDelay: `${200 + i * 120}ms` }}
        >
          <span
            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white text-sm font-semibold shrink-0"
            style={{ background: BRAND, boxShadow: `0 0 14px ${BRAND}88` }}
          >
            {i + 1}
          </span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number; pulse: number }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 42; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2.2 + 0.4, vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.45 - 0.1, alpha: Math.random() * 0.5 + 0.1, pulse: Math.random() * Math.PI * 2 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
        const a = p.alpha + Math.sin(p.pulse) * 0.15;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,58,255,${a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[2] pointer-events-none" />;
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const goTo = useCallback((i: number) => {
    setTransitioning(true);
    setTimeout(() => { setIndex(i); setAnimKey((k) => k + 1); setProgress(0); setTransitioning(false); }, 400);
  }, []);

  const next = useCallback(() => { goTo((index + 1) % slides.length); }, [index, goTo]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, DURATION);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next]);

  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    progressRef.current = setInterval(() => { setProgress((p) => Math.min(p + 100 / (DURATION / 50), 100)); }, 50);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [index]);

  const slide = slides[index];

  return (
    <section className="relative pt-16 md:pt-20 min-h-screen overflow-hidden bg-black">
      {/* Video */}
      <video className="absolute inset-0 w-full h-full object-cover object-right z-0" src="/videos/landing_video.mp4" autoPlay loop muted playsInline />

      {/* Overlays */}
      <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.6) 100%)" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] z-[1] pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${BRAND}22 0%, transparent 70%)`, filter: "blur(40px)" }} />

      <Particles />

      {/* Scanlines */}
      <div className="absolute inset-0 z-[3] pointer-events-none opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)" }} />

      {/* Top nav */}
      <div className="relative z-20">
        <Courses variant="white" />
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 flex items-center min-h-[calc(100vh-5rem)] px-5 sm:px-8 md:px-12 lg:px-16 py-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* ── LEFT / TOP: Animated text section ── */}
          <div
            className="flex-1 w-full text-center lg:text-left"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "translateY(18px) scale(0.97)" : "translateY(0) scale(1)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {/* Counter */}
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-5">
              <span className="text-xs font-semibold tracking-[0.22em] uppercase text-white/35">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            {/* Accent line */}
            <div className="flex justify-center lg:justify-start mb-4 sm:mb-5">
              <div className="h-[3px] rounded-full accent-line" style={{ background: `linear-gradient(to right, transparent, ${BRAND}, transparent)` }} />
            </div>

            <AnimatedTitle title={slide.title} accent={slide.accent} animKey={animKey} />

            {slide.subtitle && (
              // text-xl to match Method's description paragraph size
              <p
                className="text-xl text-white/80 mb-5 leading-relaxed subtitle-reveal"
                style={{ animationDelay: `${slide.title.split(" ").length * 75 + 100}ms` }}
              >
                {slide.subtitle}
              </p>
            )}

            {slide.bullets && <AnimatedBullets bullets={slide.bullets} animKey={animKey} />}

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-7 sm:mt-8 cta-reveal"
              style={{ animationDelay: `${slide.title.split(" ").length * 75 + 300}ms` }}
            >
              <SignUpButton2 />
              <PrimaryButton />
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-7 sm:mt-8">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative overflow-hidden rounded-full transition-all duration-300 focus:outline-none"
                  style={{ width: i === index ? "2rem" : "0.5rem", height: "0.5rem", background: i === index ? BRAND : "rgba(255,255,255,0.22)", boxShadow: i === index ? `0 0 10px ${BRAND}99` : undefined }}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {i === index && (
                    <span className="absolute inset-0 origin-left rounded-full" style={{ background: "rgba(255,255,255,0.35)", transform: `scaleX(${progress / 100})`, transition: "transform 0.05s linear" }} />
                  )}
                </button>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
              <button onClick={() => goTo((index - 1 + slides.length) % slides.length)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/55 hover:border-white/60 hover:text-white transition-all duration-200 active:scale-95" aria-label="Previous slide">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={() => goTo((index + 1) % slides.length)} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/55 hover:border-white/60 hover:text-white transition-all duration-200 active:scale-95" aria-label="Next slide">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes wordReveal {
          from { opacity: 0; transform: translateY(24px) skewY(3deg); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0) skewY(0deg); filter: blur(0); }
        }
        .word-reveal {
          opacity: 0;
          animation: wordReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes subtitleReveal {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .subtitle-reveal {
          opacity: 0;
          animation: subtitleReveal 0.5s ease forwards;
        }

        @keyframes bulletReveal {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .bullet-reveal {
          opacity: 0;
          animation: bulletReveal 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes accentLine {
          from { width: 0; opacity: 0; }
          to   { width: 130px; opacity: 1; }
        }
        .accent-line {
          width: 0; opacity: 0;
          animation: accentLine 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes ctaReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cta-reveal {
          opacity: 0;
          animation: ctaReveal 0.5s ease forwards;
        }

        /* ── TYPOGRAPHY: matches Method.tsx ──
           - font-semibold weight (600)
           - No serif / Georgia override
           - Tailwind default sans-serif stack
           - Size scales from 2rem → 4rem matching Method's text-4xl md:text-5xl pattern
        */
        .hero-title {
          font-size: clamp(2rem, 5.5vw, 4rem);
          letter-spacing: -0.01em;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: clamp(1.75rem, 8vw, 2.6rem);
          }
        }
      `}</style>
    </section>
  );
}