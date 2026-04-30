// components/Scholarship/ScholarshipCoursePrompt.tsx
// Shown on /courses/courses when user arrives via the homepage ScholarshipBanner.
// Reads the 'scholarship_browse_courses' sessionStorage flag — shows once, then clears it.

'use client';

import { useEffect, useState } from 'react';

const BRAND = '#4A3AFF';

export default function ScholarshipCoursePrompt() {
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('scholarship_browse_courses');
    if (flag === 'true') {
      // Clear immediately so it never shows again on refresh
      sessionStorage.removeItem('scholarship_browse_courses');
      // Small delay so the page paint completes before the modal pops
      const t = setTimeout(() => setVisible(true), 320);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    setAnimOut(true);
    setTimeout(() => setVisible(false), 380);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        /* ── Backdrop ── */
        @keyframes schprompt-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes schprompt-backdrop-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .schprompt-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(6px);
          animation: schprompt-backdrop-in 0.28s ease both;
        }
        .schprompt-backdrop.out {
          animation: schprompt-backdrop-out 0.38s ease both;
        }

        /* ── Modal card ── */
        @keyframes schprompt-card-in {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes schprompt-card-out {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(16px) scale(0.97); }
        }
        .schprompt-card {
          position: relative;
          width: 100%;
          max-width: 480px;
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(74, 58, 255, 0.25);
          background: rgba(10, 10, 18, 0.98);
          box-shadow:
            0 40px 80px rgba(0, 0, 0, 0.9),
            0 0 0 1px rgba(255, 255, 255, 0.04) inset,
            0 0 60px rgba(74, 58, 255, 0.12);
          overflow: hidden;
          animation: schprompt-card-in 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .schprompt-card.out {
          animation: schprompt-card-out 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Top gradient bar */
        .schprompt-top-bar {
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, ${BRAND} 40%, #a5b4fc 70%, transparent 100%);
        }

        /* Radial glow inside card */
        .schprompt-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 200px;
          background: radial-gradient(ellipse, rgba(74,58,255,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .schprompt-body {
          position: relative;
          z-index: 1;
          padding: 2.25rem 2rem 2rem;
          text-align: center;
        }

        /* Icon ring */
        .schprompt-icon-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(74, 58, 255, 0.12);
          border: 1px solid rgba(74, 58, 255, 0.3);
          font-size: 2rem;
          position: relative;
        }
        /* Subtle pulse ring */
        .schprompt-icon-ring::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(74, 58, 255, 0.2);
          animation: schprompt-ring-pulse 2.4s ease-in-out infinite;
        }
        @keyframes schprompt-ring-pulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.08); opacity: 0.2; }
        }

        .schprompt-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 1rem;
          letter-spacing: -0.015em;
        }

        .schprompt-body-text {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.65;
          margin-bottom: 0.75rem;
        }

        /* Warning pill */
        .schprompt-warning {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin: 0.5rem auto 1.75rem;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.25);
          font-size: 0.78rem;
          font-weight: 600;
          color: #fbbf24;
          letter-spacing: 0.01em;
        }
        .schprompt-warning-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fbbf24;
          flex-shrink: 0;
          animation: schprompt-dot-blink 1.6s ease-in-out infinite;
        }
        @keyframes schprompt-dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* OK button */
        .schprompt-btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          background: ${BRAND};
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          border: none;
          cursor: pointer;
          transition: box-shadow 0.3s ease, transform 0.2s ease, background 0.2s ease;
          box-shadow: 0 8px 24px rgba(74, 58, 255, 0.4);
        }
        .schprompt-btn:hover {
          background: #3628e0;
          box-shadow: 0 12px 32px rgba(74, 58, 255, 0.6);
          transform: translateY(-2px);
        }
        .schprompt-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div
        className={`schprompt-backdrop${animOut ? ' out' : ''}`}
        onClick={handleDismiss}   /* click outside also dismisses */
      >
        <div
          className={`schprompt-card${animOut ? ' out' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top colour bar */}
          <div className="schprompt-top-bar" />

          {/* Inner glow */}
          <div className="schprompt-glow" />

          <div className="schprompt-body">
            {/* Icon */}
            <div className="schprompt-icon-ring">🎓</div>

            {/* Headline */}
            <h2 className="schprompt-title">
              Select Your Scholarship Course
            </h2>

            {/* Body copy */}
            <p className="schprompt-body-text">
              Browse the courses below and open the one you'd like to apply a
              scholarship for. Once you're on the course page, tap{' '}
              <strong style={{ color: 'rgba(255,255,255,0.85)' }}>
                "Apply for a Scholarship"
              </strong>{' '}
              to begin your 2-minute application.
            </p>

            {/* One-time warning */}
            <div className="schprompt-warning">
              <span className="schprompt-warning-dot" />
              You can only apply once — choose wisely
            </div>

            {/* CTA */}
            <button className="schprompt-btn" onClick={handleDismiss}>
              Got it, let me choose
            </button>
          </div>
        </div>
      </div>
    </>
  );
}