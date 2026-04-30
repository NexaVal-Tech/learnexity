// components/Scholarship/ScholarshipBanner.tsx
// Homepage marketing section — promotes scholarship programme, no image, no auth needed.
// Mirrors ProbStatement structure: same wrapper/card shell, CSS-in-JSX, brand identity.
//
// FLOW:
//  • Not logged in  → saves 'scholarship_browse_courses' flag → /user/auth/register
//  • Logged in      → goes straight to /courses/courses to pick a course

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
      // Tell AuthContext: after login/register, send the user to the courses
      // page so they can pick which course to apply a scholarship for.
      sessionStorage.setItem('scholarship_browse_courses', 'true');
      router.push('/user/auth/register');
    } else {
      // Already logged in — go straight to courses listing
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

        /* ── Card shell ── */
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

        /* Subtle radial glow top-left */
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

        /* Decorative floating circles */
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

        /* ── Left content ── */
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

        /* Mirrors .prob-headline: text-4xl font-semibold */
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

        /* Mirrors .prob-body */
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
        .schb-body-line.accent  { color: #ffffff; font-weight: 600; }
        .schb-body-line.highlight { color: #c7d2fe; font-weight: 600; }

        /* Tier pills */
        .schb-tiers {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .schb-tier-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          background: rgba(74, 58, 255, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(74, 58, 255, 0.3);
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        /* ── Right: big discount badge ── */
        .schb-right {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .schb-badge {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${BRAND} 0%, #7c6dff 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 60px rgba(74,58,255,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset;
          animation: schb-pulse 3s ease-in-out infinite;
        }
        .schb-badge-pct {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .schb-badge-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 0.2rem;
        }

        /* CTA button — mirrors .prob-cta-btn */
        .schb-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: ${BRAND};
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          padding: 0.85rem 1.75rem;
          border-radius: 2rem 0.5rem 2rem 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.01em;
          box-shadow: 0 8px 24px rgba(74,58,255,0.35);
        }
        .schb-cta-btn:hover {
          background-color: #3628e0;
          box-shadow: 0 0 28px rgba(74,58,255,0.55);
          transform: translateY(-2px);
        }
        .schb-cta-btn svg {
          transition: transform 0.2s ease;
        }
        .schb-cta-btn:hover svg {
          transform: translateX(3px);
        }

        /* Social proof note */
        .schb-social-note {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          text-align: center;
          max-width: 180px;
          line-height: 1.4;
        }

        @keyframes schb-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(74,58,255,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset; }
          50%       { box-shadow: 0 0 70px rgba(74,58,255,0.65), 0 0 0 1px rgba(255,255,255,0.12) inset; }
        }

        @media (max-width: 768px) {
          .schb-card {
            padding: 2.5rem 1.5rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 2rem;
          }
          .schb-right {
            align-self: center;
            width: 100%;
          }
          .schb-badge {
            width: 130px;
            height: 130px;
          }
          .schb-badge-pct { font-size: 2rem; }
        }

        @media (max-width: 480px) {
          .schb-headline { font-size: 1.875rem; }
          .schb-body-line { font-size: 1rem; }
          .schb-card { padding: 2rem 1.25rem; }
        }
      `}</style>

      <div className="schb-wrapper">
        <div className="schb-card">

          {/* decorative blobs */}
          <div className="schb-deco schb-deco-1" />
          <div className="schb-deco schb-deco-2" />

          {/* ── Left panel ── */}
          <div className="schb-left">
            <div className="schb-accent-bar" />

            <h2 className="schb-headline">
              Can't Afford the Full Price?<br />
              <em>Scholarships Are Available.</em>
            </h2>

            <div className="schb-body">
              <p className="schb-body-line accent">We believe cost should never be a barrier to learning.</p>
              <p className="schb-body-line">
                Learnexity offers need based scholarships across all courses, covering up to 50% of tuition.
              </p>
              <p className="schb-body-line highlight">Takes 2 minutes. Instant decision.</p>
              <p className="schb-body-line">
                No essays, no waitlists. Just answer a few questions and get your result right away.
              </p>
            </div>

            {/* Tier pills */}
            <div className="schb-tiers">
              {[
                { label: '50% Half Scholarship' },
                { label: '25% Partial Discount' },
              ].map(({ label}) => (
                <span key={label} className="schb-tier-pill">{label}</span>
              ))}
            </div>

            <div onClick={handleApply}>
              <PrimaryButton2 label="Apply for a Scholarship" />
            </div>
          </div>

          {/* ── Right panel: big discount badge + CTA note ── */}
          <div className="schb-right">
            <div className="schb-badge">
              <span className="schb-badge-pct">50%</span>
              <span className="schb-badge-label">Off Available</span>
            </div>
            <p className="schb-social-note">
              Hundreds of students have already received scholarships
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}