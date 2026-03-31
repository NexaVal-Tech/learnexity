import React from "react";
import Link from "next/link";

const BRAND = "#4A3AFF";

export default function ProbStatement() {
  return (
    <section style={{ padding: "4rem 1rem", background: "transparent" }}>
      <style>{`
        .prob-wrapper {
          max-width: 1230px;
          margin: 0 auto;
        }

        /* ── Main card: full-bleed image background ── */
        .prob-card {
          border-radius: 1.25rem;
          overflow: hidden;
          position: relative;
          min-height: 720px;
          display: flex;
          align-items: stretch;
        }

        /* Background image — swap src when ready */
        .prob-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          z-index: 0;
        }

        /* Placeholder shown while no image is set */
        .prob-bg-placeholder {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: linear-gradient(135deg, #0d1b45 0%, #1a3a7a 40%, #2a1a6e 70%, #0d1b45 100%);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 3rem;
        }
        .prob-bg-placeholder-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.25;
        }
        .prob-bg-placeholder-hint svg {
          color: white;
        }
        .prob-bg-placeholder-hint span {
          font-size: 0.72rem;
          color: white;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Dark gradient overlay — left side stronger, fades right */
        .prob-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            to right,
            rgba(6, 10, 30, 0.92) 0%,
            rgba(6, 10, 30, 0.82) 30%,
            rgba(6, 10, 30, 0.45) 60%,
            rgba(6, 10, 30, 0.1) 100%
          );
          pointer-events: none;
        }

        /* Text panel — left side, transparent, above overlay */
        .prob-panel-left {
          position: relative;
          z-index: 2;
          width: 55%;
          max-width: 560px;
          padding: 3.5rem 3rem 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
        }

        /* Headline */
        .prob-headline {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.15;
          letter-spacing: -0.025em;
          margin-bottom: 1.5rem;
        }

        .prob-headline em {
          font-style: normal;
          color: #a5b4fc;
        }

        /* Body lines */
        .prob-body {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-bottom: 2rem;
        }

        .prob-body-line {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.55;
        }

        .prob-body-line.accent {
          color: rgba(255,255,255,0.95);
          font-weight: 600;
        }

        .prob-body-line.highlight {
          color: #c7d2fe;
          font-weight: 700;
          font-size: 0.95rem;
        }

        /* CTA button */
        .prob-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: ${BRAND};
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.85rem 1.75rem;
          border-radius: 2rem 0.5rem 2rem 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          width: fit-content;
          letter-spacing: 0.01em;
          text-decoration: none;
        }
        .prob-cta-btn:hover {
          background-color: #3628e0;
          box-shadow: 0 0 28px rgba(74,58,255,0.5);
          transform: translateY(-2px);
        }
        .prob-cta-btn svg {
          transition: transform 0.2s ease;
        }
        .prob-cta-btn:hover svg {
          transform: translateX(3px);
        }

        /* Divider accent above headline */
        .prob-accent-bar {
          width: 48px;
          height: 3px;
          background: ${BRAND};
          border-radius: 2px;
          margin-bottom: 1.25rem;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .prob-card {
            min-height: unset;
            flex-direction: column;
          }
          .prob-overlay {
            background: linear-gradient(
              to bottom,
              rgba(6, 10, 30, 0.96) 0%,
              rgba(6, 10, 30, 0.88) 55%,
              rgba(6, 10, 30, 0.4) 100%
            );
          }
          .prob-panel-left {
            width: 100%;
            max-width: 100%;
            padding: 2.5rem 1.5rem;
            min-height: 520px;
          }
          .prob-bg-placeholder {
            padding-right: 0;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .prob-panel-left {
            padding: 2rem 1.25rem;
          }
          .prob-headline {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="prob-wrapper">
        <div className="prob-card">

          {/* ── BACKGROUND IMAGE ──*/}
          <img src="/images/nnamdi.png" alt="" className="prob-bg-img" aria-hidden="true" />

          {/* Dark gradient overlay */}
          <div className="prob-overlay" />

          {/* Text panel */}
          <div className="prob-panel-left">

            <div className="prob-accent-bar" />

            <h2 className="prob-headline">
              Worried You'll Learn Tech…<br />
              But Still <em>Not Get Hired?</em>
            </h2>

            <div className="prob-body">
              <p className="prob-body-line accent">Most programs teach skills.</p>
              <p className="prob-body-line">Employers hire people who can prove real work.</p>
              <p className="prob-body-line highlight">Learnexity closes that gap.</p>
              <p className="prob-body-line">
                We help you become hire-ready with real experience, not just knowledge.
              </p>
              <p className="prob-body-line">Built to fit your life, without leaving your job.</p>
              <p className="prob-body-line accent">
                This isn't about learning more. It's about getting hired.
              </p>
            </div>

            <Link href="/user/auth/register" className="prob-cta-btn">
              Start Your Free Consultation
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}