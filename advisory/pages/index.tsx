// pages/index.tsx
import Head from "next/head";
import Header from "@/components/Header";
import BookingWidget from "@/components/BookingWidget";
import FadeInOut from "@/components/FadeInOut";
import { ArrowUpRight } from "lucide-react";

// Palette lifted from the reference design — same operation (booking flow etc.
// is unchanged), just a different look from the previous purple/card-based UI.
const NAVY = "#05192e";
const CREAM = "#fbfaf6";
const ORANGE = "#e7a13c";
const TEAL = "#006271";
const GRAY = "#576574";

const HERO_PILLS = [
  "Workflow Optimization",
  "Technology & Workforce Enablement",
  "AI & Automation Advisory",
  "Technology Risk & Governance",
];

const QUESTIONS = [
  "Is your technology solving the right business problems?",
  "Are you getting the value you are paying for?",
  "Is your team equipped to use it effectively?",
  "Are the risks of technology and AI being properly managed?",
];

const OUTCOMES = [
  {
    n: "01",
    title: "Reduce unnecessary costs",
    text: "Identify inefficient processes and activities that consume resources without creating proportional value.",
  },
  {
    n: "02",
    title: "Increase productive capacity",
    text: "Reduce repetitive work and enable your team to focus more time on customers, revenue, and higher-value responsibilities.",
  },
  {
    n: "03",
    title: "Improve workforce productivity",
    text: "Strengthen technology adoption and employee capabilities so your organization gets more from the tools it already uses.",
  },
  {
    n: "04",
    title: "Identify growth opportunities",
    text: "Evaluate where technology, automation, and AI can improve capacity, customer service, scalability, or revenue potential.",
  },
  {
    n: "05",
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
  { label: "Risk", q: "Are technology and AI being adopted with appropriate privacy, security, and governance controls?" },
];

export default function AdvisoryHome() {
  return (
    <>
      <Head>
        <title>Learnexity Advisory | Turn Technology Into Business Value</title>
        <meta
          name="description"
          content="Learnexity Advisory helps growing businesses close the gap between technology investment and business value. Book a complimentary 30-minute Technology & Operations Assessment."
        />
        <link rel="canonical" href="https://advisory.learnexity.org" />
        <meta property="og:site_name" content="Learnexity Advisory" />
        <meta property="og:title" content="Learnexity Advisory | Turn Technology Into Business Value" />
        <meta
          property="og:description"
          content="We help growing businesses identify where time, productivity, and technology value are being lost, and turn that into a focused plan."
        />
      </Head>

      <style>{`
        .adv-section { max-width: 1230px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }
        .adv-card {
          border-radius: 0.75rem;
          border: 1px solid #05192e14;
          background: white;
          box-shadow: 0 1px 2px rgba(5,25,46,0.04), 0 10px 24px -6px rgba(5,25,46,0.10), 0 28px 56px -20px rgba(5,25,46,0.14);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .adv-card:hover {
          box-shadow: 0 2px 4px rgba(5,25,46,0.05), 0 16px 32px -8px rgba(5,25,46,0.14), 0 36px 64px -20px rgba(5,25,46,0.18);
          transform: translateY(-2px);
        }
        .adv-band-shadow {
          box-shadow: 0 -20px 40px -28px rgba(5,25,46,0.35), 0 30px 60px -20px rgba(5,25,46,0.45);
        }
        .adv-panel {
          background: #ffffff;
          border: 1px solid #05192e12;
          box-shadow: 0 2px 4px rgba(5,25,46,0.04), 0 14px 30px -10px rgba(5,25,46,0.12), 0 36px 70px -24px rgba(5,25,46,0.16);
        }
        .adv-pill {
          border-radius: 9999px;
          border: 1px solid ${CREAM}99;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
          color: ${CREAM};
          transition: all 0.25s;
        }
        .adv-pill:hover {
          background: ${CREAM};
          color: ${NAVY};
        }
        .adv-btn-primary {
          background: ${CREAM};
          color: ${NAVY};
        }
        .adv-btn-outline {
          background: rgba(0,0,0,0.35);
          border: 1px solid ${CREAM}66;
          color: ${CREAM};
        }
      `}</style>

      <main style={{ background: CREAM }}>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ background: NAVY }}>
          <img
            src="/images/hero-learnexity.jpg"
            alt="Consultant working on a laptop in a modern office lounge"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(115deg, ${NAVY}f2 15%, ${NAVY}b3 45%, ${NAVY}4d 75%)`,
            }}
          />

          <div className="relative">
            <Header />

            <div className="adv-section pt-10 pb-16 sm:pt-14 sm:pb-24">
              <h1
                className="font-semibold leading-[1.05] max-w-2xl"
                style={{ color: CREAM, fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
              >
                Improve Business Performance.
              </h1>
              <p className="mt-4 text-lg sm:text-xl max-w-lg" style={{ color: `${CREAM}cc` }}>
                Turn Technology Investment Into Measurable Business Value.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#assessment" className="adv-btn-primary inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90">
                  Book a Consultation
                </a>
                <a href="#advisory" className="adv-btn-outline inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/50">
                  How It Works
                  <ArrowUpRight size={15} />
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-2 border-t pt-5 lg:border-0 lg:pt-0" style={{ borderColor: `${CREAM}33` }}>
                {HERO_PILLS.map((p) => (
                  <a key={p} href="#advisory" className="adv-pill px-3 py-1.5 text-xs sm:text-sm">
                    {p}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem statement + questions ── */}
        <section id="advisory" className="adv-section py-16 sm:py-24 scroll-mt-6">
          <FadeInOut>
            <div className="adv-panel grid lg:grid-cols-2 gap-10 lg:gap-16 items-start rounded-2xl p-8 sm:p-12">
              <div>
                <h2 className="text-4xl sm:text-5xl font-semibold leading-tight" style={{ color: NAVY }}>
                  Technology investment does not automatically translate into business value.
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: GRAY }}>
                  Businesses invest in technology to increase productivity, reduce costs, improve
                  operations, and support growth. Yet the expected return can remain limited when
                  technology is not aligned with the right business problems, fully adopted by
                  employees, or governed appropriately.
                </p>
                <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: GRAY }}>
                  The result can be unnecessary operating costs, underutilized technology, limited
                  employee capacity, and missed opportunities for growth.
                </p>
              </div>

              <div className="adv-card p-7 sm:p-8">
                <p className="text-sm font-bold uppercase tracking-wide mb-5" style={{ color: TEAL }}>
                  The questions are straightforward
                </p>
                <ul className="space-y-4">
                  {QUESTIONS.map((q) => (
                    <li key={q} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: ORANGE }} />
                      <span className="text-base sm:text-lg font-medium leading-snug" style={{ color: NAVY }}>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeInOut>
        </section>

        {/* ── Close the gap ── */}
        <section className="adv-section pb-16 sm:pb-24">
          <FadeInOut>
            <p className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: TEAL }}>
              Close the gap
            </p>
            <h2 className="text-4xl sm:text-5xl font-semibold max-w-2xl" style={{ color: NAVY }}>
              Learnexity Advisory helps close the gap.
            </h2>
            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed" style={{ color: GRAY }}>
              We work with business leaders to identify where time, productivity, capacity, and
              technology value are being lost, then develop practical strategies to improve
              business performance. Our work can help you:
            </p>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {OUTCOMES.map((o) => (
                <div key={o.n} className="adv-card p-6">
                  <p className="text-base font-bold mb-2" style={{ color: TEAL }}>{o.n}</p>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: NAVY }}>{o.title}</h3>
                  <p className="text-base leading-relaxed" style={{ color: GRAY }}>{o.text}</p>
                </div>
              ))}
            </div>
          </FadeInOut>
        </section>

        {/* ── Four Areas of Advisory ── */}
        <section className="adv-section pb-16 sm:pb-24">
          <FadeInOut>
            <h2 className="text-4xl sm:text-5xl font-semibold mb-10" style={{ color: NAVY }}>
              Four Areas of Advisory
            </h2>
            <div className="adv-card overflow-hidden">
              <div className="grid sm:grid-cols-2">
                {AREAS.map((a, i) => (
                  <div
                    key={a.title}
                    className="p-7 sm:p-8"
                    style={{
                      borderTop: i >= 2 ? "1px solid #05192e14" : undefined,
                      borderLeft: i % 2 === 1 ? "1px solid #05192e14" : undefined,
                    }}
                  >
                    <h3 className="text-xl font-semibold mb-2" style={{ color: NAVY }}>{a.title}</h3>
                    <p className="text-base leading-relaxed" style={{ color: GRAY }}>{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeInOut>
        </section>

        {/* ── We do not start with technology ── */}
        <section className="adv-band-shadow relative py-16 sm:py-20" style={{ background: NAVY }}>
          <FadeInOut className="adv-section">
            <h2 className="text-4xl sm:text-5xl font-semibold" style={{ color: CREAM }}>
              We do not start with technology.
            </h2>
            <p className="mt-2 text-xl sm:text-2xl font-medium" style={{ color: ORANGE }}>
              We start with the business problem.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {ASSESSMENT_AREAS.map((a) => (
                <div key={a.label} className="pt-4" style={{ borderTop: `1px solid ${CREAM}33` }}>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: ORANGE }}>
                    {a.label}
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: `${CREAM}cc` }}>{a.q}</p>
                </div>
              ))}
            </div>
          </FadeInOut>
        </section>

        {/* ── Assessment / CTA ── */}
        <section id="assessment" className="adv-section py-16 sm:py-24 scroll-mt-6">
          <FadeInOut>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-semibold" style={{ color: NAVY }}>
                Find Your Opportunity.
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: GRAY }}>
                Book a complimentary <strong style={{ color: NAVY }}>30-minute Technology &amp; Operations Assessment</strong> to
                discuss where your business may be losing time, capacity, productivity, or
                technology value.
              </p>
              <p className="mt-4 text-base sm:text-lg font-semibold" style={{ color: TEAL }}>
                Identify the opportunity. Understand the priorities. Determine the next step.
              </p>
            </div>

            <div
              className="mt-10 rounded-2xl overflow-hidden max-w-3xl mx-auto"
              style={{
                background: "white",
                border: "1px solid #05192e14",
                boxShadow: "0 2px 4px rgba(5,25,46,0.05), 0 16px 32px -8px rgba(5,25,46,0.12), 0 40px 80px -24px rgba(5,25,46,0.22)",
              }}
            >
              <BookingWidget />
            </div>

            <p className="mt-6 text-center text-base" style={{ color: GRAY }}>
              No obligation. Just a focused conversation about improving business performance.
            </p>
          </FadeInOut>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t" style={{ borderColor: "#05192e14" }}>
          <div className="adv-section py-8 text-center">
            <p className="text-sm" style={{ color: GRAY }}>
              © {new Date().getFullYear()} Learnexity Advisory
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
