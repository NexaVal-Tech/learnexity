// ─── FILE: components/scholarship/ScholarshipBadge.tsx ───────────────────────
// Drop this into your components folder and use it on:
//   1. pages/courses/[id].tsx — under the price display
//   2. pages/user/payment/[enrollmentId].tsx — in the order summary

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
  review_notes: string;
}

interface Props {
  courseId: string;       // the slug, e.g. "web-development-bootcamp"
  isLoggedIn: boolean;
  /** If true, show the "Apply for Scholarship" CTA. False = just show active badge. */
  showCta?: boolean;
}

export function ScholarshipBadge({ courseId, isLoggedIn, showCta = true }: Props) {
  const router = useRouter();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetchState();
  }, [courseId, isLoggedIn]);

  const fetchState = async () => {
    try {
      const schData = await api.get(`/api/scholarships/course/${courseId}`);
      // schData is already { scholarship: ... }
      if (schData.scholarship) {
        setScholarship(schData.scholarship);
        setLoading(false);
        return;
      }

      const elData = await api.get(`/api/scholarships/eligibility/${courseId}`);
      // elData is already { eligible, reason, course_name }
      setEligibility(elData);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  // ── Active approved scholarship (not yet used) ────────────────────────────
  if (scholarship?.status === 'approved' && !scholarship.is_used) {
    return (
      <div
        className=" items-center gap-3 px-4 py-4 rounded-2xl text-sm"
        style={{
          background: 'rgba(22,163,74,0.1)',
          border: '1px solid rgba(22,163,74,0.3)',
          borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem',
        }}
      >
        <div>
          <p className="font-bold text-green-400">{scholarship.discount_percentage}% Scholarship Approved</p>
          <p className="text-green-600 text-xs">Applied automatically at checkout</p>
        </div>
      </div>
    );
  }

  // ── Already used ──────────────────────────────────────────────────────────
  if (scholarship?.is_used) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-2 text-xs text-gray-500"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1rem 0.5rem 1rem 0.5rem',
        }}
      >
        <span>Scholarship already redeemed</span>
      </div>
    );
  }

  // ── Rejected application ──────────────────────────────────────────────────
  if (scholarship?.status === 'rejected') {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-2 text-xs text-gray-500"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1rem 0.5rem 1rem 0.5rem',
        }}
      >
        <span>Scholarship not awarded for this course</span>
      </div>
    );
  }

  // ── CTA: eligible, hasn't applied ─────────────────────────────────────────
  if (showCta && eligibility?.eligible) {
    return (
      <button
        onClick={() => router.push(`/scholarships/${courseId}`)}
        className="group inline-flex items-center gap-3 px-4 py-3 transition-all"
        style={{
          borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem',
          border: `1px dashed ${BRAND}55`,
          background: `${BRAND}08`,
          color: "rgb(255, 255, 255)",
        }}
      >
        <div className="text-left">
          <p className="font-bold text-sm">Can't afford the full price?</p>
          <p className="text-xs opacity-70">Apply for a scholarship, 2 min, instant decision</p>
        </div>
        
      </button>
    );
  }

  // ── Not logged in + showCta ────────────────────────────────────────────────
  if (showCta && !isLoggedIn) {
    return (
      <button
        onClick={() => {
          sessionStorage.setItem('scholarship_course_redirect', courseId);
          router.push('/user/auth/register');
        }}
        className="items-center gap-2 px-4 py-3 lg:py-6 text-sm transition-all lg:ml-6"
          style={{
            borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem',
            border: `1px dashed ${BRAND}44`,
            background: `${BRAND}06`,
            color: '#ffffff',
          }}
      >
        <span>Need financial support? Apply for a scholarship</span>
      </button>
    );
  }

  return null;
}