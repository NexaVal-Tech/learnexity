// components/Scholarship/ScholarshipStatus.tsx
// A richer standalone component using your brand identity

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

const BRAND = '#4A3AFF';

interface Scholarship {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  discount_percentage: number;
  is_used: boolean;
  course_id: string;
  course_name: string;
  review_notes: string;
  total_score?: number;
}

interface Props {
  courseId: string;
  courseName?: string;
  isLoggedIn: boolean;
  /** 'badge' = compact inline, 'card' = full info card */
  variant?: 'badge' | 'card';
  showCta?: boolean;
  onScholarshipLoaded?: (scholarship: Scholarship | null) => void;
}

export function ScholarshipStatus({
  courseId,
  courseName,
  isLoggedIn,
  variant = 'badge',
  showCta = true,
  onScholarshipLoaded,
}: Props) {
  const router = useRouter();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    fetchState();
  }, [courseId, isLoggedIn]);

  const fetchState = async () => {
    try {
      const schData = await api.get(`/api/scholarships/course/${courseId}`);
      if (schData.scholarship) {
        setScholarship(schData.scholarship);
        onScholarshipLoaded?.(schData.scholarship);
        setLoading(false);
        return;
      }
      const elData = await api.get(`/api/scholarships/eligibility/${courseId}`);
      setEligibility(elData);
      onScholarshipLoaded?.(null);
    } catch {
      onScholarshipLoaded?.(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    sessionStorage.setItem('scholarship_course_redirect', courseId);
    if (!isLoggedIn) {
      router.push('/user/auth/register');
    } else {
      router.push(`/scholarships/${courseId}`);
    }
  };

  if (loading) {
    return variant === 'card' ? (
      <div style={{
        borderRadius: '2rem 0.75rem 2rem 0.75rem',
        border: `1px solid rgba(255,255,255,0.08)`,
        background: 'rgba(15,15,15,0.9)',
        padding: '1.5rem',
        animation: 'pulse 2s infinite',
      }}>
        <div style={{ height: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', width: '60%', marginBottom: '0.5rem' }} />
        <div style={{ height: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '999px', width: '80%' }} />
      </div>
    ) : null;
  }

  // ── Approved & active ─────────────────────────────────────────────────────
  if (scholarship?.status === 'approved' && !scholarship.is_used) {
    if (variant === 'card') {
      return (
        <div style={{
          borderRadius: '2rem 0.75rem 2rem 0.75rem',
          border: '1px solid rgba(22,163,74,0.35)',
          background: 'rgba(22,163,74,0.08)',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <div>
              <p style={{ fontWeight: 700, color: '#4ade80', fontSize: '1rem' }}>
                {scholarship.discount_percentage}% Scholarship Active
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(74,222,128,0.7)', marginTop: '0.1rem' }}>
                Applies automatically at checkout
              </p>
            </div>
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(22,163,74,0.2)',
              border: '1px solid rgba(22,163,74,0.4)',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '1.1rem',
              fontWeight: 900,
              color: '#4ade80',
            }}>
              {scholarship.discount_percentage}% OFF
            </div>
          </div>
          {scholarship.review_notes && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              "{scholarship.review_notes}"
            </p>
          )}
        </div>
      );
    }

    // badge variant
    return (
      <div style={{
        borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem',
        border: '1px solid rgba(22,163,74,0.3)',
        background: 'rgba(22,163,74,0.1)',
        padding: '0.6rem 1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span>🎓</span>
        <div>
          <p style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.85rem' }}>
            {scholarship.discount_percentage}% Scholarship Approved
          </p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(74,222,128,0.7)' }}>
            Applied at checkout automatically
          </p>
        </div>
      </div>
    );
  }

  // ── Already used ──────────────────────────────────────────────────────────
  if (scholarship?.is_used) {
    return (
      <div style={{
        borderRadius: '1rem 0.5rem 1rem 0.5rem',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
        padding: '0.5rem 0.75rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          ✓ Scholarship already redeemed on a previous course
        </span>
      </div>
    );
  }

  // ── Rejected ──────────────────────────────────────────────────────────────
  if (scholarship?.status === 'rejected') {
    if (variant === 'card') {
      return (
        <div style={{
          borderRadius: '2rem 0.75rem 2rem 0.75rem',
          border: '1px solid rgba(239,68,68,0.2)',
          background: 'rgba(239,68,68,0.06)',
          padding: '1.25rem',
        }}>
          <p style={{ fontWeight: 600, color: 'rgba(248,113,113,0.9)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            💙 Scholarship Not Awarded
          </p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            {scholarship.review_notes || 'Your application did not meet the minimum criteria this time.'}
          </p>
        </div>
      );
    }
    return (
      <div style={{
        borderRadius: '1rem 0.5rem 1rem 0.5rem',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
        padding: '0.5rem 0.75rem',
        display: 'inline-flex',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
          Scholarship not awarded for this course
        </span>
      </div>
    );
  }

  // ── CTA ───────────────────────────────────────────────────────────────────
  if (showCta && (eligibility?.eligible || !isLoggedIn)) {
    if (variant === 'card') {
      return (
        <div style={{
          borderRadius: '2rem 0.75rem 2rem 0.75rem',
          border: `1px dashed ${BRAND}44`,
          background: `${BRAND}08`,
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
                Can't afford the full price?
              </p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Apply for a scholarship — takes 2 minutes, instant automated decision.
                Up to 100% discount available.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {['100% Full', '50% Half', '25% Partial'].map((t) => (
                  <span key={t} style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    background: `${BRAND}20`,
                    color: BRAND,
                    border: `1px solid ${BRAND}33`,
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <button
              onClick={handleApply}
              style={{
                borderRadius: '2rem 0.75rem 2rem 0.75rem',
                background: BRAND,
                color: '#fff',
                fontWeight: 700,
                padding: '0.65rem 1.5rem',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: `0 8px 24px ${BRAND}44`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Apply Now →
            </button>
          </div>
        </div>
      );
    }

    // badge CTA
    return (
      <button
        onClick={handleApply}
        style={{
          borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem',
          border: `1px dashed ${BRAND}55`,
          background: `${BRAND}08`,
          color: '#ffffff',
          padding: '0.65rem 1rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.25s',
        }}
      >
        <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Can't afford the full price?</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.15rem' }}>
          Apply for a scholarship · 2 min · instant decision
        </p>
      </button>
    );
  }

  return null;
}