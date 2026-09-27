import React from "react";
import { CmsText } from "@/components/cms/ui";
import { CmsButton, buttonFields, type CmsButtonData } from "@/components/cms/CmsButton";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";

const BRAND = "#4A3AFF";

export interface ProbStatementData {
  backgroundImage: string;
  heading: string;
  lines: { text: string; style: "normal" | "accent" | "highlight" }[];
  button: CmsButtonData;
}

export const PROB_STATEMENT_DEFAULTS: ProbStatementData = {
  backgroundImage: "/images/nnamdi.png",
  heading: "Not all skills create equal opportunities.",
  lines: [
    { text: "Many spend valuable time and money learning technical skills and earning certificate,", style: "accent" },
    { text: "only to struggle to monetize them, especially with today's rapid AI advancements.", style: "normal" },
    {
      text: "That's why Learnexity offers highly selective, future-proof pathways designed to help you master the high-value infrastructure layers that remain valuable as AI transforms the workplace.",
      style: "normal",
    },
  ],
  button: { label: "Enroll Now", href: "/user/auth/register", style: "primary" },
};

export default function ProbStatement({ data = PROB_STATEMENT_DEFAULTS }: { data?: ProbStatementData }) {
  return (
    <section style={{ padding: "4rem 1rem", background: "transparent" }}>
      <style>{`
        .prob-wrapper {
          max-width: 1230px;
          margin: 0 auto;
        }

        .prob-card {
          border-radius: 1.25rem;
          overflow: hidden;
          position: relative;
          min-height: 720px;
          display: flex;
          align-items: stretch;
        }

        .prob-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          z-index: 0;
        }

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

        /* Matches component-headers: text-4xl font-semibold text-white */
        .prob-headline {
          font-size: 2.25rem; /* text-4xl */
          font-weight: 600;   /* font-semibold */
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.015em;
          margin-bottom: 1.5rem;
        }

        .prob-headline em {
          font-style: normal;
          color: #a5b4fc;
        }

        /* Matches: text-xl text-gray-400 leading-relaxed */
        .prob-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 2rem;
        }

        .prob-body-line {
          font-size: 1.25rem; /* text-xl */
          color: #9ca3af;     /* text-gray-400 */
          line-height: 1.625; /* leading-relaxed */
        }

        /* White emphasis — matches card h3 text-white */
        .prob-body-line.accent {
          color: #ffffff;
          font-weight: 600;
        }

        /* Brand tint emphasis */
        .prob-body-line.highlight {
          color: #c7d2fe;
          font-weight: 600;
        }

        /* CTA button — unchanged structure, font aligned to text-sm */
        .prob-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: ${BRAND};
          color: white;
          font-weight: 700;
          font-size: 0.875rem; /* text-sm */
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

        .prob-accent-bar {
          width: 48px;
          height: 3px;
          background: ${BRAND};
          border-radius: 2px;
          margin-bottom: 1.25rem;
        }

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
        }

        @media (max-width: 480px) {
          .prob-panel-left {
            padding: 2rem 1.25rem;
          }
          /* On mobile, step down one size: text-3xl */
          .prob-headline {
            font-size: 1.875rem;
          }
          /* Body steps down to text-lg on mobile */
          .prob-body-line {
            font-size: 1.125rem;
          }
        }
      `}</style>

      <div className="prob-wrapper">
        <div className="prob-card">

          {data.backgroundImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.backgroundImage} alt="" className="prob-bg-img" aria-hidden="true" />
          )}
          <div className="prob-overlay" />

          <div className="prob-panel-left">
            <div className="prob-accent-bar" />

            {/* component-headers equivalent */}
            <h2 className="prob-headline">
              <CmsText text={data.heading} accentColor="#a5b4fc" />
            </h2>

            <div className="prob-body">
              {(data.lines ?? []).map((line, i) => (
                <p key={i} className={`prob-body-line ${line.style === "accent" ? "accent" : line.style === "highlight" ? "highlight" : ""}`}>
                  <CmsText text={line.text} accentColor="#c7d2fe" />
                </p>
              ))}
            </div>

            <CmsButton button={data.button} className="w-fit" />

          </div>
        </div>
      </div>
    </section>
  );
}

export const block: BlockDefinition<ProbStatementData> = {
  type: "home.problemStatement",
  label: "Problem statement panel",
  category: "Homepage",
  description: "Large photo panel with a headline, supporting lines and a button.",
  fields: [
    f.image("backgroundImage", "Background photo"),
    f.textarea("heading", "Headline", { rows: 2, help: EMPHASIS_HELP }),
    f.list(
      "lines",
      "Paragraphs",
      [
        f.textarea("text", "Text", { rows: 3 }),
        f.select("style", "Style", [
          { value: "normal", label: "Normal (grey)" },
          { value: "accent", label: "Bold white" },
          { value: "highlight", label: "Bold lilac" },
        ]),
      ],
      { itemLabelKey: "text", addLabel: "Add paragraph", itemDefaults: { text: "New paragraph", style: "normal" } }
    ),
    f.group("button", "Button", buttonFields),
  ],
  defaults: PROB_STATEMENT_DEFAULTS,
};
