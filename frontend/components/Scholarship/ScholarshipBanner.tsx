// components/Scholarship/ScholarshipBanner.tsx
'use client';

import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton2 } from '@/components/button/Button';

const BRAND = '#4A3AFF';

export default function ScholarshipBanner() {
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
            rgba(6, 10, 30, 0.95) 40%,
            rgba(6, 10, 30, 0.98) 100%
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
          color: #ffffff;
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
          color: #9ca3af;
          line-height: 1.625;
        }
        .schb-body-line.accent { color: #ffffff; font-weight: 600; }
        .schb-body-line.highlight { color: #c7d2fe; font-weight: 600; }

        /* ── Right: logo image (large screens only) ── */
        .schb-right {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
          display: none; /* hidden by default (mobile) */
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .schb-logo-wrap {
          background: rgba(255, 255, 255, 0.06);
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
          height: auto;
          /* Invert dark logo to white so it reads on dark card */
          filter: brightness(0) invert(1);
          display: block;
        }

        /* Show only on large screens */
        @media (min-width: 1024px) {
          .schb-right {
            display: flex;
          }
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
              Can't Afford the Full Price?<br />
              <em>Scholarships And Installment Payments Are Available.</em>
            </h2>

            <div className="schb-body">
              <p className="text-lg schb-body-line accent">We believe cost should never be a barrier to learning.</p>
              <p className="text-lg schb-body-line">
                Learnexity offers need based scholarships across all courses, covering up to 75% of tuition.
              </p>
            </div>

            <div onClick={handleApply}>
              <PrimaryButton2 label="Apply for a Scholarship" />
            </div>
          </div>

          {/* ── Right panel: logo, large screens only ── */}
          <div className="schb-right">
            <div className="schb-logo-wrap">
              <img
                src="/images/logo.png"
                alt="Learnexity"
                className="schb-logo-img"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}