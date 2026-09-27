// Refer & Earn landing sections (pages/refer&earn.tsx). The sign-up/log-in
// form and referral dashboard stay in the page itself; these are the
// marketing sections visitors see before signing up.
import React, { createContext, useContext } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { CmsText } from "@/components/cms/ui";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

/** Provided by the Refer & Earn page: switches to the sign-up form. */
export const ReferLandingContext = createContext<{ onGetStarted: () => void }>({ onGetStarted: () => {} });

export function ReferStyles() {
  return (
    <style>{`
      @keyframes reEnter {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes reShimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .re-enter { animation: reEnter 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      .re-card {
        border-radius: 2rem 0.75rem 2rem 0.75rem;
        border: 1px solid var(--border-subtle);
        background: var(--surface);
        backdrop-filter: blur(20px);
        box-shadow: 0 32px 80px rgba(0,0,0,0.7);
      }
      .re-btn {
        background: ${BRAND};
        color: white;
        font-weight: 700;
        padding: 0.8rem 1.75rem;
        border-radius: 2rem 0.5rem 2rem 0.5rem;
        font-size: 0.9rem;
        letter-spacing: 0.02em;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        border: none;
      }
      .re-btn:hover:not(:disabled) {
        background: #3628e0;
        box-shadow: 0 0 32px ${BRAND}55;
        transform: translateY(-2px);
      }
      .re-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .re-btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-subtle);
        color: var(--text-secondary);
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem 0.5rem 2rem 0.5rem;
        font-size: 0.875rem;
        transition: all 0.25s ease;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .re-btn-outline:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
        background: var(--surface-alt);
      }
      .re-input {
        background: transparent;
        border: none;
        border-bottom: 1.5px solid var(--border-strong);
        width: 100%;
        padding: 0.5rem 0;
        color: var(--text-primary);
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.25s;
        caret-color: ${BRAND};
      }
      .re-input::placeholder { color: var(--text-muted); font-size: 0.875rem; }
      .re-input:focus { border-bottom-color: ${BRAND}; }
      .re-input:disabled { opacity: 0.4; }
      .re-label {
        font-size: 0.68rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-muted);
        display: block;
        margin-bottom: 0.3rem;
      }
      .re-stat-card {
        border-radius: 1.5rem 0.5rem 1.5rem 0.5rem;
        border: 1px solid var(--border-subtle);
        background: var(--surface-elevated);
        padding: 1.5rem;
        backdrop-filter: blur(12px);
      }
      .re-link-box {
        background: rgba(74,58,255,0.08);
        border: 1px solid rgba(74,58,255,0.25);
        border-radius: 1rem 0.4rem 1rem 0.4rem;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-family: monospace;
        font-size: 0.85rem;
        color: var(--text-secondary);
        word-break: break-all;
      }
      .re-copy-btn {
        flex-shrink: 0;
        background: ${BRAND};
        color: white;
        border: none;
        border-radius: 0.6rem;
        padding: 0.5rem 0.9rem;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
      .re-copy-btn:hover { background: #3628e0; }
      .re-social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: 1rem 0.35rem 1rem 0.35rem;
        background: var(--surface-alt);
        color: var(--text-secondary);
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      .re-social-btn:hover { background: var(--surface-alt); color: var(--text-primary); }
      .re-divider {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0;
      }
      .re-divider::before, .re-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-subtle);
      }
      .re-divider span { font-size: 0.72rem; color: var(--text-muted); letter-spacing: 0.08em; }
      .re-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .re-badge-pending  { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.25); }
      .re-badge-completed { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
      .re-badge-failed   { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
      .re-accent { color: #a5b4fc; }
      .re-pulse {
        animation: rePulse 2s ease-in-out infinite;
      }
      @keyframes rePulse {
        0%,100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  );
}


// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface ReferHeroData {
  badge: string;
  heading: string;
  text: string;
  buttonLabel: string;
}

export function ReferHero({ data }: { data: ReferHeroData }) {
  const { onGetStarted } = useContext(ReferLandingContext);
  return (
    <section className="px-4 pt-28 pb-10 re-enter">
      <ReferStyles />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="text-center mb-6">
          {data.badge && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(74,58,255,0.12)", border: "1px solid rgba(74,58,255,0.3)",
              borderRadius: "999px", padding: "0.35rem 1rem", marginBottom: "1.5rem",
            }}>
              <Zap size={13} style={{ color: BRAND }} />
              <span style={{ fontSize: "0.75rem", color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.06em" }}>
                {data.badge}
              </span>
            </div>
          )}

          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
            <CmsText text={data.heading} accentClassName="re-accent" />
          </h1>
          {data.text && (
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto 2.5rem" }}>
              <CmsText text={data.text} />
            </p>
          )}
          {data.buttonLabel && (
            <button className="re-btn" onClick={onGetStarted} style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>
              {data.buttonLabel} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

export interface ReferStepsData {
  steps: { title: string; desc: string }[];
}

export function ReferSteps({ data }: { data: ReferStepsData }) {
  return (
    <section className="px-4 pt-6 pb-20 re-enter">
      <ReferStyles />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "1.25rem" }}>
          {(data.steps ?? []).map((s, i) => (
            <div key={i} className="re-card" style={{ padding: "1.75rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", color: BRAND, fontWeight: 700, marginBottom: "0.75rem" }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{s.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                <CmsText text={s.desc} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Definitions ──────────────────────────────────────────────────────────────

const REFER = ["refer-earn"];

export const referBlocks: BlockDefinition[] = [
  {
    type: "refer.hero",
    label: "Refer & Earn — hero",
    category: "Refer & Earn",
    pages: REFER,
    addable: false,
    description: "The button opens the referrer sign-up form.",
    fields: [
      f.text("badge", "Badge"),
      f.textarea("heading", "Heading", { rows: 2, help: EMPHASIS_HELP }),
      f.textarea("text", "Text", { rows: 3 }),
      f.text("buttonLabel", "Button text"),
    ],
    defaults: {
      badge: "REFERRAL PROGRAM",
      heading: "Share Learnexity.\n**Earn 10%** per referral.",
      text: "No course enrollment needed. Get your unique link, share it, and earn for every person who signs up through it.",
      buttonLabel: "Get My Referral Link",
    } satisfies ReferHeroData,
  },
  {
    type: "refer.steps",
    label: "Refer & Earn — how it works",
    category: "Refer & Earn",
    pages: REFER,
    fields: [
      f.list("steps", "Steps", [f.text("title", "Title"), f.textarea("desc", "Text", { rows: 2 })], {
        itemLabelKey: "title",
        addLabel: "Add step",
        max: 6,
        itemDefaults: { title: "Step", desc: "Describe it." },
      }),
    ],
    defaults: {
      steps: [
        { title: "Sign Up", desc: "Enter your email and create a password — takes 30 seconds." },
        { title: "Get Your Link", desc: "Instantly receive your unique referral link to share anywhere." },
        { title: "Share & Earn", desc: "Every person who registers through your link and pays for a course earns you 10% of what they pay." },
      ],
    } satisfies ReferStepsData,
  },
];
