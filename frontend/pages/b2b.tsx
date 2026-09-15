// pages/b2b.tsx

import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Briefcase,
  ClipboardList,
  PenTool,
  Rocket,
  BarChart3,
  ArrowRight,
  Users,
  Award,
  Layers,
  Search,
  TrendingUp,
} from "lucide-react";

const BRAND = "#4A3AFF";

const PROCESS_STEPS = [
  {
    icon: ClipboardList,
    title: "Learning Consulting",
    text: "Identify capability gaps, define learning objectives, and align training with business priorities.",
  },
  {
    icon: PenTool,
    title: "Design the Solution",
    text: "Create learning aligned with your goals.",
  },
  {
    icon: Rocket,
    title: "Build & Deliver",
    text: "Train your people through practical, engaging learning experiences.",
  },
  {
    icon: BarChart3,
    title: "Measure & Improve",
    text: "Measure, refine, and strengthen the learning experience.",
  },
];

const WHY_LEARNEXITY = [
  { title: "Business-Aligned", text: "Built around your goals." },
  { title: "Practical", text: "Designed for real-world application." },
  { title: "End-to-End", text: "From learning needs to delivery." },
  { title: "Specialized", text: "Expertise across consulting, instructional design, eLearning, and training." },
];

const PIPELINE = [
  { label: "Assess", icon: Search },
  { label: "Design", icon: PenTool },
  { label: "Develop", icon: Layers },
  { label: "Deliver", icon: Rocket },
  { label: "Improve", icon: TrendingUp },
];

const STATS = [
  { n: "200+", label: "people trained" },
  { n: "38", label: "projects completed" },
  { n: "10", label: "working projects developed" },
];

const SEGMENTS = [
  {
    icon: Building2,
    title: "Business",
    text: "Strengthen workforce capability, improve performance, and support organizational growth.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    text: "Build stronger learning programs, instructional capacity, and digital learning experiences.",
  },
  {
    icon: Briefcase,
    title: "Professional Services",
    text: "Develop specialized training for employees, clients, and professional development initiatives.",
  },
];

const BUILD_CARDS = [
  {
    icon: Layers,
    title: "Digital Learning",
    text: "Transform traditional training into scalable, engaging digital learning experiences.",
  },
  {
    icon: Users,
    title: "Employee Onboarding",
    text: "Help new employees become productive faster with structured learning pathways.",
  },
  {
    icon: Award,
    title: "Professional Development",
    text: "Build targeted programs that strengthen technical, professional, and leadership capabilities.",
  },
];

const FAQS = [
  {
    q: "Do you provide training directly?",
    a: "Yes. We provide end-to-end learning solutions from needs assessment and instructional design to eLearning development and training delivery.",
  },
  {
    q: "Can you work with our existing L&D team?",
    a: "Yes. We can complement your team with specialized expertise, additional capacity, or end-to-end support.",
  },
  {
    q: "Can you build a training program from scratch?",
    a: "Yes. We can take your initiative from identifying the learning need through design, development, delivery, and improvement.",
  },
];

function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 260" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <circle cx="250" cy="140" r="120" fill={`${BRAND}0d`} />
      <circle cx="250" cy="140" r="88" fill={`${BRAND}0a`} />

      {/* ascending bars */}
      {[
        { x: 80, h: 40, o: 0.25 },
        { x: 150, h: 65, o: 0.4 },
        { x: 220, h: 95, o: 0.55 },
        { x: 290, h: 125, o: 0.75 },
        { x: 360, h: 155, o: 1 },
      ].map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={210 - b.h}
          width="42"
          height={b.h}
          rx="8"
          fill={BRAND}
          opacity={b.o}
        />
      ))}

      {/* baseline */}
      <line x1="60" y1="210" x2="440" y2="210" stroke="var(--border-subtle)" strokeWidth="1.5" />

      {/* ascending dashed trend line */}
      <polyline
        points="101,180 171,155 241,125 311,95 381,55"
        fill="none"
        stroke={BRAND}
        strokeWidth="3"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />

      {/* node dots along trend line */}
      {[
        [101, 180],
        [171, 155],
        [241, 125],
        [311, 95],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="5" fill="white" stroke={BRAND} strokeWidth="2.5" />
      ))}

      {/* badge at the peak */}
      <circle cx="381" cy="55" r="20" fill="white" stroke={BRAND} strokeWidth="3" />
      <path
        d="M371 55 L378 62 L392 46"
        fill="none"
        stroke={BRAND}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function B2B() {
  return (
    <>
      <Head>
        <title>Learnexity for Business — Workforce Training & Learning Solutions</title>
        <meta
          name="description"
          content="Learnexity helps organizations identify workforce skill gaps, design targeted learning, and train people to perform better — from consulting to eLearning to delivery."
        />
        <link rel="canonical" href="https://learnexity.org/b2b" />
      </Head>

      <AppLayout>
        <style>{`
          .b2b-hero-box {
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            border: 1px solid var(--border-subtle);
            background-color: var(--surface-elevated);
            backdrop-filter: blur(8px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          }
          .b2b-card {
            border-radius: 1.25rem;
            border: 1px solid var(--border-subtle);
            background-color: var(--surface-elevated);
            backdrop-filter: blur(8px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            transition: all 0.3s;
          }
          .b2b-card:hover {
            border-color: ${BRAND}44;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 24px ${BRAND}22;
            transform: translateY(-2px);
          }
          .b2b-icon-bubble {
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 0.85rem;
            background-color: ${BRAND}22;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .b2b-stat-card {
            border-radius: 1.25rem;
            border: 1px solid var(--border-subtle);
            background-color: var(--surface-alt);
            padding: 2rem 1.5rem;
            text-align: center;
          }
          .b2b-pipeline-node {
            width: 3.25rem;
            height: 3.25rem;
            border-radius: 9999px;
            background-color: var(--surface-elevated);
            border: 1.5px solid ${BRAND}44;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .b2b-cta-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: ${BRAND};
            color: white;
            padding: 0.45rem 1.35rem;
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s;
            box-shadow: 0 8px 24px rgba(74,58,255,0.35);
          }
          .b2b-cta-btn:hover {
            background-color: #3628e0;
            box-shadow: 0 8px 24px rgba(74,58,255,0.5);
            transform: translateY(-1px);
          }
          .b2b-vertical-label {
            writing-mode: vertical-rl;
            letter-spacing: 0.2em;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
          }
        `}</style>

        {/* ── Hero ── */}
        <section className="max-w-[1230px] mx-auto mt-19 py-2 px-6">
          <div className="b2b-hero-box py-8 px-6 md:py-1 md:px-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
              <div className="text-center md:text-left">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4"
                  style={{ background: `${BRAND}1a`, color: BRAND, border: `1px solid ${BRAND}44` }}
                >
                  <Building2 size={13} />
                  Learnexity for Business
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4 leading-[1.1]">
                  Build the Skills Your Business Needs to Move Forward
                </h1>
                <p className="text-lg text-[var(--text-secondary)] mb-3 max-w-xl mx-auto md:mx-0">
                  We help organizations identify workforce skill gaps, design targeted learning,
                  and train people to perform better.
                </p>
                <p className="text-sm font-semibold mb-6" style={{ color: BRAND }}>
                  Identify the Gap. Build the Skills. Strengthen the Workforce.
                </p>
                <Link href="/consultation" className="b2b-cta-btn">
                  Talk to Learnexity
                </Link>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex-1">
                  <HeroIllustration />
                </div>
                <div className="py-6">
                  <span className="b2b-vertical-label">
                    Learnexity Learning Consulting · Instructional Design · eLearning · Training
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Turn your workforce into competitive advantage ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Turn Your Workforce into Competitive Advantage.
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Whether you're introducing new technology, improving performance, or developing new
              workforce capabilities, Learnexity turns your business needs into practical training
              solutions. We identify the gaps, design tailored solutions, build the learning
              experience, and deliver the training.
            </p>
          </div>
        </section>

        {/* ── Training built around your business ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              Training Built Around Your Business
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {PROCESS_STEPS.map((s) => (
              <div key={s.title} className="b2b-card p-6">
                <div className="b2b-icon-bubble mb-4">
                  <s.icon size={20} style={{ color: BRAND }} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[var(--text-secondary)] mt-10 font-semibold">
            No generic courses. Just learning designed for the outcome you need.
          </p>
        </section>

        {/* ── Why Learnexity ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="b2b-hero-box py-10 px-6 md:px-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">
              Why Learnexity?
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {WHY_LEARNEXITY.map((w) => (
                <div key={w.title} className="text-center">
                  <p className="text-lg font-bold mb-1" style={{ color: BRAND }}>
                    {w.title}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{w.text}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[var(--text-secondary)] mb-8">
              Learnexity brings these capabilities together.
            </p>

            {/* Pipeline */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8">
              {PIPELINE.map((p, i) => (
                <div key={p.label} className="flex items-center gap-2 md:gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <div className="b2b-pipeline-node">
                      <p.icon size={18} style={{ color: BRAND }} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{p.label}</span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight size={16} className="mb-5" style={{ color: `${BRAND}66` }} />
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              You get a coordinated learning solution without having to manage every piece
              separately.
            </p>
          </div>
        </section>

        {/* ── Trusted through results ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Trusted Through Results</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {STATS.map((s) => (
              <div key={s.label} className="b2b-stat-card">
                <p className="text-4xl font-bold mb-1" style={{ color: BRAND }}>
                  {s.n}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── For modern organizations ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">For Modern Organizations</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SEGMENTS.map((s) => (
              <div key={s.title} className="b2b-card p-7">
                <div className="b2b-icon-bubble mb-4">
                  <s.icon size={20} style={{ color: BRAND }} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What we help organizations build ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: BRAND }}>
              Workforce Training
            </p>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              What We Help Organizations Build
            </h2>
            <p className="text-[var(--text-secondary)]">
              Develop the skills your employees need to drive results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BUILD_CARDS.map((b) => (
              <div key={b.title} className="b2b-card p-7">
                <div className="b2b-icon-bubble mb-4">
                  <b.icon size={20} style={{ color: BRAND }} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{b.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-[1230px] mx-auto py-10 px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="b2b-card p-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{f.q}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="max-w-[1230px] mx-auto py-14 px-6">
          <div
            className="rounded-[2rem] py-14 px-6 md:px-12 text-center"
            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #3628e0 100%)` }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Your Workforce Capability?
            </h2>
            <p className="text-white/85 mb-8 max-w-xl mx-auto">
              Tell us what your organization needs to accomplish. We'll help you build the right
              learning solution.
            </p>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 bg-white text-[#1a1040] px-7 py-3.5 rounded-2xl font-bold hover:bg-white/90 transition-colors"
            >
              Talk to Learnexity
            </Link>
          </div>
        </section>

        <Footer />
      </AppLayout>
    </>
  );
}
