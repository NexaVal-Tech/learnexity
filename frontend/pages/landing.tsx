"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Testimonials from "@/components/testimonials/Testimonials";
import { ArrowRight } from "lucide-react";

// ── TYPES ──────────────────────────────────────────────────────────────────

interface Course {
  title: string;
  desc: string;
  badge: string;
  color: "purple" | "indigo" | "violet" | "blue" | "teal";
  link: string;
}

interface CommunityLink {
  label: string;
  href: string;
}

// ── DATA ──────────────────────────────────────────────────────────────────

const socialLinks = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.631 5.904-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" fill="#fff" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="4" />
        <polygon points="10 8 16 12 10 16 10 8" fill="#fff" stroke="none" />
      </svg>
    ),
  },
];

const ctaButtons = [
  { label: "Book a Free Consultation", href: "https://learnexity.org/consultation" },
  { label: "Join Our Community", href: "https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?s=cl&p=i&mlu=3&amv=2" },
  { label: "Explore our flexible Courses", href: "https://learnexity.org/flex" },
];

const communityLinks: CommunityLink[] = [
  { label: "Generative AI in Data Analytics Community", href: "#" },
  { label: "AI Automation Engineering Community", href: "#" },
  { label: "Generative AI in Business Analysis Community", href: "#" },
  { label: "Generative AI in Project Management Community", href: "#" },
  { label: "Generative AI in HR Analytics Community", href: "#" },
];

const courses: Course[] = [
  {
    title: "Generative AI in HR Analytics",
    badge: "60% Discount · Special Offer",
    color: "purple",
    desc: "Automate HR data cleaning, reporting, and workforce analytics using AI-driven tools. Generate SQL queries and Python code from natural language prompts for HR databases.",
    link: "#",
  },
  {
    title: "AI in Project Management",
    badge: "60% Discount · Special Offer",
    color: "indigo",
    desc: "Master cutting-edge AI tools for strategic project planning, scheduling, and delivery. Use Generative AI to instantly create project charters, timelines, and risk registers.",
    link: "#",
  },
  {
    title: "Generative AI in Data Analytics",
    badge: "60% Discount · Special Offer",
    color: "violet",
    desc: "Transform your data analysis skills with AI-powered tools and techniques. Automate complex data workflows and derive actionable insights using the latest generative AI models.",
    link: "#",
  },
  {
    title: "AI Automation Engineering",
    badge: "60% Discount · Special Offer",
    color: "blue",
    desc: "Build intelligent automation pipelines and systems using modern AI tools. Design, implement, and deploy AI-powered workflows that dramatically improve team productivity.",
    link: "#",
  },
  {
    title: "Generative AI in Business Analysis",
    badge: "60% Discount · Special Offer",
    color: "teal",
    desc: "Leverage AI to enhance business analysis workflows, stakeholder reporting, and strategic decision-making using prompt engineering and AI-driven research tools.",
    link: "#",
  },
];

// ── COLOR MAP ─────────────────────────────────────────────────────────────

const courseBannerGradients: Record<Course["color"], string> = {
  purple: "linear-gradient(135deg, #4a1d96, #7c5cbf)",
  indigo: "linear-gradient(135deg, #312e81, #6366f1)",
  violet: "linear-gradient(135deg, #6b21a8, #a855f7)",
  blue:   "linear-gradient(135deg, #1e3a5f, #3b82f6)",
  teal:   "linear-gradient(135deg, #134e4a, #14b8a6)",
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────

function BrandIcon({ size = 52 }: { size?: number }) {
  return (
    <Image
      src="/favicon.ico"
      alt="Learnexity Flex"
      width={size}
      height={size}
      style={{
        borderRadius: 12,
        flexShrink: 0,
      }}
    />
  );
}

function PurpleButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        width: "100%",
        background: "#000",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: 700,
        textAlign: "center",
        padding: "18px",
        borderRadius: 12,
        textDecoration: "none",
        marginBottom: 10,
        border: "1px solid #222",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#111";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#000";
      }}
    >
      {label}
    </a>
  );
}

function CommunityButton({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      style={{
        background: "#000",
        color: "#fff",
        padding: "18px",
        borderRadius: 12,
        textDecoration: "none",
        border: "1px solid #222",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: 700,
        minHeight: 72,
        transition: "all .2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#111";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#000";
      }}
    >
      <span>{label}</span>

      <ArrowRight
        size={20}
        color="white"
      />
    </a>
  );
}

function CourseCard({ course }: { course: Course }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 260,
        flexShrink: 0,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        background: "#fff",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: hovered ? "0 6px 24px rgba(107,70,193,0.15)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Banner */}
      <div
        style={{
          height: 130,
          background: courseBannerGradients[course.color],
          display: "flex",
          alignItems: "flex-end",
          padding: "14px 16px",
        }}
      >
        <span
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          {course.badge}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 16px" }}>
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "#1a1a1a",
            marginBottom: 6,
            letterSpacing: "-0.2px",
          }}
        >
          {course.title}
        </div>
        <p
          style={{
            fontSize: "0.84rem",
            color: "#666",
            lineHeight: 1.65,
            marginBottom: 14,
          }}
        >
          {course.desc}
        </p>
        <a
          href={course.link}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#6b46c1",
            textDecoration: "none",
          }}
        >
          View Course ↗
        </a>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function TenAlyticsLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#nav-menu-wrapper")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 24px",
    width: "100%",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', sans-serif;
          background: #b1b1cb;
          min-height: 100vh;
        }
        .ten-social-btn:hover {
            background: #111 !important;
          }
        .ten-tag:hover { opacity: 0.7; }
        .ten-dropdown-link:hover { background: #f9f9f9; }

        /* ── Marquee ── */
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: marqueeScroll 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-fade-left {
          pointer-events: none;
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(to right, #fff, transparent);
          z-index: 2;
        }
        .marquee-fade-right {
          pointer-events: none;
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 60px;
          background: linear-gradient(to left, #fff, transparent);
          z-index: 2;
        }
      `}</style>

      {/* ── TOP NAV — floats with gap from top, all four corners rounded ── */}
      <div
        style={{
          position: "fixed",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          width: "95%",
          maxWidth: 980,
        }}
      >
        <nav
          style={{
            background: "#fff",
            borderRadius: 16,          // all four corners rounded
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            boxShadow: scrolled
              ? "0 4px 20px rgba(0,0,0,0.18)"
              : "0 2px 12px rgba(0,0,0,0.12)",
            transition: "box-shadow 0.2s",
          }}
        >
          {/* Brand */}
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1a1a1a",
              textDecoration: "none",
            }}
          >
            <BrandIcon size={34} />
            Learnexity flex
          </a>

          {/* Actions */}
          <div
            id="nav-menu-wrapper"
            style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}
          >
            <a
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#fff",
                background: "#1a1a1a",
                borderRadius: 50,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
              Share
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Menu"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#1a1a1a",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: 16,
                    height: 2,
                    background: "#fff",
                    borderRadius: 2,
                  }}
                />
              ))}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 50,
                  right: 0,
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                  minWidth: 200,
                  overflow: "hidden",
                  zIndex: 100,
                }}
              >
                {[
                  {
                    label: "Log in",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                    ),
                    color: "#1a1a1a",
                  },
                  {
                    label: "Sign up",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    ),
                    color: "#1a1a1a",
                  },
                ].map((item, idx, arr) => (
                  <a
                    key={item.label}
                    href="#"
                    className="ten-dropdown-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 18px",
                      fontSize: "0.9rem",
                      color: item.color,
                      textDecoration: "none",
                      borderBottom: idx < arr.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── PAGE CONTENT ── */}
      <main
        style={{
          width: "100%",
          maxWidth: 780,
          margin: "84px auto 0",   // enough space for the floating nav + 12px gap
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "0 12px 60px",
        }}
      >
        {/* ── HERO CARD ── */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden" }}>

          {/* Card body */}
          <div style={{ padding: "28px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <BrandIcon size={52} />
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1a1a1a" }}>
                Learnexity Flex
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7, marginBottom: 20 }}>
              Learnexity Flex provides tailored self paced tech training, AI-focused courses, and essential
              soft skills development for individuals, organizations, and corporate bodies. We&apos;re
              committed to empowering professionals to stay relevant and thrive in the evolving
              landscape of technology and AI.
            </p>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="ten-social-btn"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#000",
                    border: "1px solid #222",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Business", "Education", "Tech"].map((tag) => (
                <a
                  key={tag}
                  href="#"
                  className="ten-tag"
                 style={{
                    fontSize: "0.82rem",
                    color: "#fff",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div style={{ ...card }}>
          {ctaButtons.map((btn) => (
            <PurpleButton key={btn.label} label={btn.label} href={btn.href} />
          ))}
        </div>

        {/* ── COMMUNITY HEADER ── */}
        <div style={card}>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>
            Join our Career Hub
          </div>
          <p style={{ fontSize: "0.875rem", color: "#666", lineHeight: 1.6 }}>
            Are you interested in any of our trainings? Then join your preferred community.
          </p>
        </div>

        {/* ── COMMUNITY BUTTONS ── */}
        <div
          style={{
            ...card,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 12,
          }}
        >
          {communityLinks.map((c) => (
            <CommunityButton
              key={c.label}
              label={c.label}
              href={c.href}
            />
          ))}
        </div>

        {/* ── COURSES MARQUEE ── */}
        {/* ── TESTIMONIALS ── */}
        <div style={card}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#1a1a1a",
                marginBottom: 6,
              }}
            >
              Student Success Stories
            </div>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#666",
                lineHeight: 1.6,
              }}
            >
              Hear directly from our students who transformed their careers through
              Learnexity.
            </p>
          </div>

          <Testimonials />
        </div>

        {/* ── FOOTER ── */}
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
            &copy; Learnexity flex. All rights reserved.
          </p>
        </div>
      </main>
    </>
  );
}