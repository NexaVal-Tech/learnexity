"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import Testimonials from "@/components/testimonials/Testimonials";
import { ArrowRight, X, BookOpen, Users } from "lucide-react";

interface ApiCourse {
  id: number;
  course_id: string;
  title: string;
  description: string;
  learnings?: { id: number; learning_point: string }[];
  [key: string]: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CACHE_KEY = "learnexity_flex_courses";
const CACHE_TTL = 1000 * 60 * 30;

const socialLinks = [
  {
    label: "Instagram", href: "#",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="#fff" stroke="none" /></svg>),
  },
  {
    label: "TikTok", href: "#",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" /></svg>),
  },
  {
    label: "X", href: "#",
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.631 5.904-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>),
  },
  {
    label: "LinkedIn", href: "#",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" fill="#fff" /></svg>),
  },
  {
    label: "Facebook", href: "#",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>),
  },
  {
    label: "YouTube", href: "#",
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="4" /><polygon points="10 8 16 12 10 16 10 8" fill="#fff" stroke="none" /></svg>),
  },
];

const ctaButtons = [
  { label: "Book a Free Consultation", href: "/consultation" },
  { label: "Join Our Community", href: "https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?mode=gi_t" },
  { label: "Explore our flexible Courses", href: "/flex" },
];

function readCache(): ApiCourse[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data as ApiCourse[];
  } catch { return null; }
}

function writeCache(data: ApiCourse[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

function CourseModal({ course, onClose }: { course: ApiCourse; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const topLearnings = (course.learnings ?? []).slice(0, 5);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backdropFilter: "blur(4px)" }}
    >
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "88vh", overflowY: "auto", position: "relative", animation: "modalSlideUp 0.22s ease" }}>
        {/* Header */}
        <div style={{ background: "#000", borderRadius: "20px 20px 0 0", padding: "28px 24px 22px", position: "relative" }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
          >
            <X size={15} />
          </button>
          <h2 style={{ color: "#fff", fontSize: "1.15rem", fontWeight: 800, lineHeight: 1.35, margin: 0, paddingRight: 40 }}>
            {course.title}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.75, marginBottom: 22 }}>
            {course.description}
          </p>

          {topLearnings.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <BookOpen size={14} color="#999" />
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>
                  What you'll learn
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topLearnings.map((l) => (
                  <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#f8f8f8", border: "1px solid #ebebeb", fontSize: "0.84rem", color: "#222", lineHeight: 1.5 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {l.learning_point}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <a
              href="/user/auth/register"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#000", color: "#fff", fontWeight: 700, fontSize: "0.9rem", padding: "16px", borderRadius: 12, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#222"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#000"; }}
            >
              Sign Up Now <ArrowRight size={16} />
            </a>

            <a
              href="https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?mode=gi_t"
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", color: "#000", fontWeight: 700, fontSize: "0.9rem", padding: "15px", borderRadius: 12, textDecoration: "none", border: "1px solid #ddd", transition: "background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              <Users size={16} /> Join Community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseListButton({ course, onClick }: { course: ApiCourse; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "#111" : "#000", color: "#fff", padding: "18px 20px", borderRadius: 12, border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700, minHeight: 72, width: "100%", textAlign: "left", cursor: "pointer", transition: "background 0.15s", gap: 12 }}
    >
      <span style={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
        {course.title}
      </span>
      <ArrowRight size={18} color="white" style={{ flexShrink: 0, opacity: 0.7 }} />
    </button>
  );
}

function CourseSkeleton() {
  return <div style={{ background: "#e8e8e8", borderRadius: 12, height: 72, animation: "pulse 1.4s ease-in-out infinite" }} />;
}

function BrandIcon({ size = 52 }: { size?: number }) {
  return <Image src="/favicon.ico" alt="Learnexity Flex" width={size} height={size} style={{ borderRadius: 12, flexShrink: 0 }} />;
}

function PurpleButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      style={{ display: "block", width: "100%", background: "#000", color: "#fff", fontSize: "0.95rem", fontWeight: 700, textAlign: "center", padding: "18px", borderRadius: 12, textDecoration: "none", marginBottom: 10, border: "1px solid #222", transition: "background 0.15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#111"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#000"; }}
    >
      {label}
    </a>
  );
}

export default function TenAlyticsLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [flexCourses, setFlexCourses] = useState<ApiCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#nav-menu-wrapper")) setMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchCourses = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) { setCoursesError(null); setCoursesLoading(true); }
    try {
      const res = await fetch(`${API_URL}/api/courses/by-track?track[]=self_paced`, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: ApiCourse[] = await res.json();
      writeCache(data);
      setFlexCourses(data);
    } catch (err: any) {
      if (!opts?.silent) setCoursesError(err?.message || "Failed to load courses.");
    } finally {
      if (!opts?.silent) setCoursesLoading(false);
    }
  };

  useEffect(() => {
    const cached = readCache();
    if (cached && cached.length > 0) {
      setFlexCourses(cached);
      setCoursesLoading(false);
      fetchCourses({ silent: true });
    } else {
      fetchCourses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "28px 24px", width: "100%" };

  const pageDescription = "Learnexity Flex provides tailored self-paced tech training, AI-focused courses, and essential soft skills development for individuals, organizations, and corporate bodies.";
  const pageUrl = "https://learnexity.org/flex";
  const ogImage = "https://learnexity.org/og-image.png";

  return (
    <>
      <Head>
        <title>Learnexity Flex</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="AI courses, tech training, generative AI, HR analytics, project management, data analytics, business analysis, AI automation, self-paced learning" />
        <meta name="author" content="Learnexity" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content="Learnexity Flex" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Learnexity Flex" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content="Learnexity Flex" />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; background: #b1b1cb; min-height: 100vh; }
        .ten-social-btn:hover { background: #111 !important; }
        .ten-tag:hover { opacity: 0.7; }
        .ten-dropdown-link:hover { background: #f9f9f9; }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.25; } }
        .course-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 600px) { .course-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {selectedCourse && <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}

      {/* NAV */}
      <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 999, width: "95%", maxWidth: 980 }}>
        <nav style={{ background: "#fff", borderRadius: 16, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.18)" : "0 2px 12px rgba(0,0,0,0.12)", transition: "box-shadow 0.2s" }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a", textDecoration: "none" }}>
            <BrandIcon size={34} />
            Learnexity flex
          </a>
          <div id="nav-menu-wrapper" style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <button onClick={() => setMenuOpen((p) => !p)} aria-label="Menu" style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a1a", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", padding: 0 }}>
              {[0,1,2].map((i) => <span key={i} style={{ display: "block", width: 16, height: 2, background: "#fff", borderRadius: 2 }} />)}
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", top: 50, right: 0, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.15)", minWidth: 200, overflow: "hidden", zIndex: 100 }}>
                {[
                  {
                    label: "Log in",
                    href: "/user/auth/login",
                    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>),
                  },
                  {
                    label: "Sign up",
                    href: "/user/auth/register",
                    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>),
                  },
                ].map((item, idx, arr) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="ten-dropdown-link"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", fontSize: "0.9rem", color: "#1a1a1a", textDecoration: "none", borderBottom: idx < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}
                  >
                    {item.icon}{item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* CONTENT */}
      <main style={{ width: "100%", maxWidth: 780, margin: "84px auto 0", display: "flex", flexDirection: "column", gap: 12, padding: "0 12px 60px" }}>

      {/* HERO */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "28px 24px",
            textAlign: "center",
          }}
        >
          {/* Eyebrow - very big font */}
          <div
            style={{
              fontSize: "1.9rem",
              fontWeight: 800,
              color: "#1a1a1a",
              lineHeight: 1.15,
              marginBottom: 10,
              letterSpacing: "-0.02em",
            }}
          >
            From Learning to Earning.
          </div>

          {/* Bold header */}
          <div
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "#1a1a1a",
              lineHeight: 1.35,
              marginBottom: 6,
            }}
          >
            Learn Tech Skills. Gain Experience. Increase Your Income.
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#444",
              marginBottom: 14,
            }}
          >
            Without leaving your current role.
          </div>

          {/* Supporting statement */}
          <p
            style={{
              fontSize: "0.9rem",
              color: "#555",
              lineHeight: 1.7,
              marginBottom: 18,
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            We help you build in-demand skills, gain real-world experience, and
            provide the support you need to confidently transition into earning
            opportunities.
          </p>

          {/* Highlight stat lines */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <div
              style={{
                background: "#000",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.92rem",
                padding: "14px 16px",
                borderRadius: 12,
                lineHeight: 1.4,
                width: "100%",
                maxWidth: 500,
              }}
            >
              Imagine earning $1,500 – $10,000+ per month in global tech
              opportunities.
            </div>

            <div
              style={{
                background: "#f3f3f3",
                color: "#1a1a1a",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #ebebeb",
                width: "100%",
                maxWidth: 500,
              }}
            >
              You can qualify for up to 50% scholarships.
            </div>
          </div>

          {/* Closing CTA line */}
          <p
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 20,
            }}
          >
            Join our community and start your journey today.
          </p>

          {/* Social Icons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
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
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
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

        {/* CTA */}
        <div style={{ ...card }}>
          {ctaButtons.map((btn) => <PurpleButton key={btn.label} label={btn.label} href={btn.href} />)}
        </div>

        {/* CAREER HUB */}
        <div style={card}>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>Join our Career Hub</div>
          <p style={{ fontSize: "0.875rem", color: "#666", lineHeight: 1.6 }}>
            Are you interested in any of our trainings? Tap a course to learn more and join your preferred community.
          </p>
        </div>

        {/* COURSE GRID */}
        <div style={{ ...card }}>
          {coursesLoading && (
            <div className="course-grid">
              {[...Array(4)].map((_, i) => <CourseSkeleton key={i} />)}
            </div>
          )}
          {coursesError && !coursesLoading && (
            <div style={{ padding: "20px", borderRadius: 12, background: "#fafafa", border: "1px solid #f0f0f0", textAlign: "center" }}>
              <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: 12 }}>Couldn't load courses right now.</p>
              <button onClick={() => fetchCourses()} style={{ padding: "10px 20px", borderRadius: 10, background: "#000", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>Try again</button>
            </div>
          )}
          {!coursesLoading && !coursesError && flexCourses.length === 0 && (
            <p style={{ fontSize: "0.875rem", color: "#888", textAlign: "center", padding: "20px 0" }}>No courses available at the moment.</p>
          )}
          {!coursesLoading && !coursesError && flexCourses.length > 0 && (
            <div className="course-grid">
              {flexCourses.map((course, idx) => (
                <CourseListButton key={course.id ?? course.course_id ?? idx} course={course} onClick={() => setSelectedCourse(course)} />
              ))}
            </div>
          )}
        </div>

        {/* TESTIMONIALS */}
        <div style={card}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>Student Success Stories</div>
            <p style={{ fontSize: "0.875rem", color: "#666", lineHeight: 1.6 }}>Hear directly from our students who transformed their careers through Learnexity.</p>
          </div>
          <Testimonials />
        </div>

        {/* FOOTER */}
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>&copy; Learnexity flex. All rights reserved.</p>
        </div>
      </main>
    </>
  );
}