// components/Scholarship/ScholarshipBanner.tsx
'use client';

import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton2 } from '@/components/button/Button';
import { CmsText } from '@/components/cms/ui';
import { f, EMPHASIS_HELP } from '@/lib/cms/fields';
import type { BlockDefinition } from '@/lib/cms/blockTypes';

const BRAND = '#4A3AFF';

export interface ScholarshipBannerData {
  heading: string;
  lines: { text: string; style: 'normal' | 'accent' | 'highlight' }[];
  buttonLabel: string;
  image: string;
  imageAlt: string;
  /** Turn the image white in dark mode (for a dark logo). Unset = only for the default Learnexity logo. */
  whiteInDark?: boolean;
}

const DEFAULT_LOGO = '/images/learnexity-image.jpeg';

export const SCHOLARSHIP_BANNER_DEFAULTS: ScholarshipBannerData = {
  heading: "Can't Afford the Full Price?\n**Scholarships And Installment Payments Are Available.**",
  lines: [
    { text: 'We believe cost should never be a barrier to learning.', style: 'accent' },
    {
      text: 'Learnexity offers need-based scholarships across all courses — awarded students pay only a flat registration fee.',
      style: 'normal',
    },
  ],
  buttonLabel: 'Apply for a Scholarship',
  image: DEFAULT_LOGO,
  imageAlt: 'Learnexity',
};

export default function ScholarshipBanner({ data = SCHOLARSHIP_BANNER_DEFAULTS }: { data?: ScholarshipBannerData }) {
  const router = useRouter();
  const { user } = useAuth();

  const handleApply = () => {
    if (!user) {
      sessionStorage.setItem('scholarship_browse_courses', 'true');
      router.push('/user/auth/register');
    } else {
      router.push('/courses/courses');
    }
  };

  return (
    <section style={{ padding: '4rem 1rem', background: 'transparent' }}>
      <style>{`
        .schb-wrapper {
          max-width: 1230px;
          margin: 0 auto;
        }

        .schb-card {
          border-radius: 1.25rem;
          overflow: hidden;
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(74, 58, 255, 0.12) 0%,
            var(--surface-alt) 40%,
            var(--surface-alt) 100%
          );
          border: 1px solid rgba(74, 58, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2.5rem;
          padding: 3.5rem 3rem;
          flex-wrap: wrap;
        }

        .schb-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 55% 60% at 0% 50%,
            rgba(74, 58, 255, 0.18) 0%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 0;
        }

        .schb-deco {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .schb-deco-1 {
          width: 260px;
          height: 260px;
          top: -80px;
          right: 120px;
          background: radial-gradient(circle, rgba(74,58,255,0.14) 0%, transparent 70%);
        }
        .schb-deco-2 {
          width: 140px;
          height: 140px;
          bottom: -40px;
          right: 60px;
          background: radial-gradient(circle, rgba(165,180,252,0.1) 0%, transparent 70%);
        }

        .schb-left {
          position: relative;
          z-index: 2;
          flex: 1 1 420px;
          max-width: 620px;
        }

        .schb-accent-bar {
          width: 48px;
          height: 3px;
          background: ${BRAND};
          border-radius: 2px;
          margin-bottom: 1.25rem;
        }

        .schb-headline {
          font-size: 2.25rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
          letter-spacing: -0.015em;
          margin-bottom: 1.5rem;
        }
        .schb-headline em {
          font-style: normal;
          color: #a5b4fc;
        }

        .schb-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 2rem;
        }
        .schb-body-line {
          font-size: 1.125rem;
          color: var(--text-secondary);
          line-height: 1.625;
        }
        .schb-body-line.accent { color: var(--text-primary); font-weight: 600; }
        .schb-body-line.highlight { color: #7a70ff; font-weight: 600; }

        /* ── Right: logo image (large screens only) ── */
        .schb-right {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .schb-logo-wrap {
          background: var(--surface);
          border: 1px solid rgba(74, 58, 255, 0.25);
          border-radius: 1.25rem;
          padding: 2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          box-shadow:
            0 0 40px rgba(74, 58, 255, 0.15),
            0 0 0 1px rgba(255,255,255,0.04) inset;
          animation: schb-pulse 3s ease-in-out infinite;
        }

        .schb-logo-img {
          width: 220px;
          max-width: 100%;
          height: auto;
          max-height: 260px;
          object-fit: contain;
          display: block;
        }
        /* Turn the dark default logo white on the dark-theme card. Only for
           the logo — applying it to an uploaded photo turned the whole
           picture into a white block, so a new image looked like it hadn't
           changed. */
        [data-theme="dark"] .schb-logo-img.is-white-in-dark {
          filter: brightness(0) invert(1);
        }

        .schb-right { display: flex; width: 100%; justify-content: flex-start; }
        @media (min-width: 769px) {
          .schb-right { width: auto; justify-content: center; }
        }

        @keyframes schb-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(74,58,255,0.2), 0 0 0 1px rgba(255,255,255,0.04) inset; }
          50%       { box-shadow: 0 0 55px rgba(74,58,255,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset; }
        }

        @media (max-width: 768px) {
          .schb-card {
            padding: 2.5rem 1.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .schb-logo-wrap { padding: 1.25rem 1.5rem; }
          .schb-logo-img { width: 160px; }
        }

        @media (max-width: 480px) {
          .schb-headline { font-size: 1.875rem; }
          .schb-body-line { font-size: 1rem; }
          .schb-card { padding: 2rem 1.25rem; }
        }
      `}</style>

      <div className="schb-wrapper">
        <div className="schb-card">

          <div className="schb-deco schb-deco-1" />
          <div className="schb-deco schb-deco-2" />

          {/* ── Left panel ── */}
          <div className="schb-left">
            <div className="schb-accent-bar" />

            <h2 className="schb-headline">
              <CmsText text={data.heading} accentColor="#a5b4fc" />
            </h2>

            <div className="schb-body">
              {(data.lines ?? []).map((line, i) => (
                <p
                  key={i}
                  className={`text-lg schb-body-line ${line.style === 'accent' ? 'accent' : line.style === 'highlight' ? 'highlight' : ''}`}
                >
                  <CmsText text={line.text} accentColor="#7a70ff" />
                </p>
              ))}
            </div>

            <div onClick={handleApply}>
              {/* Signed-out visitors go to sign-up (and are sent on to the
                  course list afterwards); signed-in students go straight to
                  the course list, where they apply per course. */}
              <PrimaryButton2 label={data.buttonLabel || 'Apply for a Scholarship'} />
            </div>
          </div>

          {/* ── Right panel: image (beside the text; below it on mobile) ── */}
          {data.image && (
            <div className="schb-right">
              <div className="schb-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={data.image /* remount when the image changes */}
                  src={data.image}
                  alt={data.imageAlt || ''}
                  loading="lazy"
                  decoding="async"
                  className={`schb-logo-img ${(data.whiteInDark ?? data.image === DEFAULT_LOGO) ? 'is-white-in-dark' : ''}`}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

export const block: BlockDefinition<ScholarshipBannerData> = {
  type: 'home.scholarshipBanner',
  label: 'Scholarship banner',
  category: 'Homepage',
  description: 'Highlighted card promoting scholarships. The button always leads to sign-up / the course list.',
  fields: [
    f.textarea('heading', 'Headline', { rows: 3, help: EMPHASIS_HELP }),
    f.list(
      'lines',
      'Paragraphs',
      [
        f.textarea('text', 'Text', { rows: 3 }),
        f.select('style', 'Style', [
          { value: 'normal', label: 'Normal' },
          { value: 'accent', label: 'Bold' },
          { value: 'highlight', label: 'Bold purple' },
        ]),
      ],
      { itemLabelKey: 'text', addLabel: 'Add paragraph', itemDefaults: { text: 'New paragraph', style: 'normal' } }
    ),
    f.text('buttonLabel', 'Button text'),
    f.image('image', 'Side image'),
    f.text('imageAlt', 'Image description'),
    f.bool('whiteInDark', 'Show the image white in dark mode (only for a dark logo)'),
  ],
  defaults: SCHOLARSHIP_BANNER_DEFAULTS,
};
