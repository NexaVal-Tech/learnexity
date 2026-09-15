// pages/index.tsx
import Head from "next/head";
import Header from "@/components/Header";
import BookingWidget from "@/components/BookingWidget";
import { CheckCircle2, Compass } from "lucide-react";

const BRAND = "#4A3AFF";

const QUESTIONS = [
  "Is your technology solving the right business problems?",
  "Are you getting the value you are paying for?",
  "Is your team equipped to use it effectively?",
  "Are the risks of technology and AI being properly managed?",
];

const OUTCOMES = [
  {
    title: "Reduce unnecessary costs",
    text: "Identify inefficient processes and activities that consume resources without creating proportional value.",
  },
  {
    title: "Increase productive capacity",
    text: "Reduce repetitive work and enable your team to focus more time on customers, revenue, and higher-value responsibilities.",
  },
  {
    title: "Improve workforce productivity",
    text: "Strengthen technology adoption and employee capabilities so your organization gets more from the tools it already uses.",
  },
  {
    title: "Identify growth opportunities",
    text: "Evaluate where technology, automation, and AI can improve capacity, customer service, scalability, or revenue potential.",
  },
  {
    title: "Manage technology and AI risk",
    text: "Establish practical governance, controls, and responsible-use practices around data, technology, and AI.",
  },
];

const AREAS = [
  {
    title: "Workflow Optimization",
    text: "Improve operational efficiency by identifying and addressing unnecessary work, bottlenecks, and process inefficiencies.",
  },
  {
    title: "Technology & Workforce Enablement",
    text: "Improve technology adoption, employee capability, and the return on existing technology investments.",
  },
  {
    title: "AI & Automation Advisory",
    text: "Identify and prioritize opportunities where AI and automation can create meaningful business value.",
  },
  {
    title: "Technology Risk & Governance",
    text: "Establish practical controls and governance to manage privacy, security, compliance, and operational risks associated with technology and AI.",
  },
];

const ASSESSMENT_AREAS = [
  { label: "Operations", q: "Where are inefficient processes consuming time and resources?" },
  { label: "People", q: "Where is employee capacity being consumed by repetitive or low-value work?" },
  { label: "Technology", q: "Are your existing systems delivering the value you are paying for?" },
  { label: "Risk", q: "Are technology and AI being adopted with appropriate privacy, security, compliance, and governance controls?" },
];

export default function AdvisoryHome() {
  return (
    <>
      <Head>
        <title>Learnexity Advisory | Reduce Costs. Increase Capacity. Grow With Confidence.</title>
        <meta
          name="description"
          content="Learnexity Advisory helps growing businesses close the gap between technology investment and business value. Book a complimentary 30-minute Technology & Operations Assessment."
        />
        <link rel="canonical" href="https://advisory.learnexity.org" />
        <meta property="og:site_name" content="Learnexity Advisory" />
        <meta property="og:title" content="Learnexity Advisory — Reduce Costs. Increase Capacity. Grow With Confidence." />
        <meta
          property="og:description"
          content="We help growing businesses identify where time, productivity, and technology value are being lost, and turn that into a focused plan."
        />
      </Head>

      <Header />

      <style>{`
        .adv-section { max-width: 1230px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }
        .adv-card {
          border-radius: 1.25rem;
          border: 1px solid var(--border-subtle);
          background: white;
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
          transition: all 0.3s;
        }
        .adv-card:hover {
          border-color: ${BRAND}44;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1), 0 0 24px ${BRAND}14;
          transform: translateY(-2px);
        }
        .adv-hero-box {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid var(--border-subtle);
          background: white;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
        }
      `}</style>

      <main style={{ paddingTop: "62px" }}>
        {/* ── Hero ── */}
        <section className="max-w-screen-xl mx-auto px-6 pt-14 pb-10">
          <div className="adv-hero-box py-10 md:py-12 px-6 md:px-14 text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-5"
              style={{ background: `${BRAND}14`, color: BRAND, border: `1px solid ${BRAND}33` }}
            >
              <Compass size={13} />
              Learnexity Advisory
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold text-[var(--text-primary)] mb-4 leading-[1.1] max-w-5xl mx-auto">
              Reduce Costs. Increase Capacity. Grow With Confidence.
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-5 max-w-3xl mx-auto" style={{ color: BRAND }}>
              Turn Technology Investment into Business Value.
            </p>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-4xl mx-auto">
              Technology investment does not automatically translate into business value the
              result can be unnecessary costs, underutilized technology, and missed growth
              opportunities when it isn't aligned with the right problems, adopted by employees,
              or governed appropriately.
            </p>
            <a
              href="#assessment"
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-2xl font-bold text-white transition-all"
              style={{ background: BRAND, boxShadow: `0 8px 24px ${BRAND}55` }}
            >
              Book Your Complimentary Assessment
            </a>
          </div>
        </section>

        {/* ── The questions ── */}
        <section className="adv-section pb-16">
          <div
            className="rounded-3xl p-8 md:p-12"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border-subtle)" }}
          >
            <p className="text-sm font-bold uppercase tracking-wide mb-6 text-center" style={{ color: BRAND }}>
              The questions are straightforward
            </p>
            <div className="max-w-2xl mx-auto space-y-4">
              {QUESTIONS.map((q) => (
                <p
                  key={q}
                  className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] leading-snug pl-5"
                  style={{ borderLeft: `3px solid ${BRAND}` }}
                >
                  {q}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Helps close the gap ── */}
        <section className="adv-section pb-16">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Learnexity Advisory Helps Close the Gap.
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We work with growing businesses to identify where time, productivity, capacity, and
              technology value are being lost, then develop practical strategies to improve
              business performance.
            </p>
          </div>
          <p className="text-sm font-bold uppercase tracking-wide mb-5" style={{ color: BRAND }}>
            Our work can help you
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {OUTCOMES.map((o) => (
              <div key={o.title} className="adv-card p-7">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{o.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{o.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Four Areas of Advisory ── */}
        <section className="adv-section pb-16">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: BRAND }}>
              How we help
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Four Areas of Advisory
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {AREAS.map((a) => (
              <div key={a.title} className="adv-card p-7">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{a.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── We start with the business problem ── */}
        <section className="adv-section pb-16">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: BRAND }}>
              We do not start with technology
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              We start with the business problem.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {ASSESSMENT_AREAS.map((a) => (
              <div key={a.label} className="adv-card p-7">
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: BRAND }}>
                  {a.label}
                </p>
                <p className="text-lg font-semibold text-[var(--text-primary)] leading-snug">{a.q}</p>
              </div>
            ))}
          </div>
          <div
            className="rounded-[1.25rem] p-8 md:p-10 text-center max-w-3xl mx-auto"
            style={{ background: "#0a0a0f" }}
          >
            <p className="text-white text-lg md:text-xl leading-relaxed mb-3">
              From there, we develop a focused path forward. You may need automation, more
              effective use of existing technology, workforce training, or stronger AI governance.
            </p>
            <p className="text-white/70 leading-relaxed">
              Our role is to help you determine where the greatest business value lies and what
              should be prioritized.
            </p>
          </div>
        </section>

        {/* ── Assessment / CTA ── */}
        <section id="assessment" className="adv-section pb-24 scroll-mt-20">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Find Your Opportunity.
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-2">
              Book a complimentary 30-minute Technology & Operations Assessment to discuss where
              your business may be losing time, capacity, productivity, or technology value.
            </p>
            <p className="text-sm font-semibold" style={{ color: BRAND }}>
              Identify the opportunity. Understand the priorities. Determine the next step.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
            {["No cost", "No obligation", "30 minutes", "Monday–Friday"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <CheckCircle2 size={14} style={{ color: BRAND }} />
                {item}
              </div>
            ))}
          </div>

          <div
            className="rounded-3xl overflow-hidden max-w-3xl mx-auto"
            style={{ background: "white", border: "1px solid var(--border-subtle)", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}
          >
            <BookingWidget />
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/images/Logo.png" alt="Learnexity" width={110} height={30} className="object-contain" />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: BRAND }}>
                Advisory
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              © {new Date().getFullYear()} Learnexity. All rights reserved. ·{" "}
              <a href="https://learnexity.org" className="hover:underline" style={{ color: BRAND }}>
                learnexity.org
              </a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
