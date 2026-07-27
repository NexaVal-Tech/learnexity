'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { X, GraduationCap, ArrowRight } from 'lucide-react';
import { api, Course, OnboardingStatus } from '@/lib/api';

const BRAND = '#4A3AFF';

interface Props {
  status: OnboardingStatus;
  userName?: string;
  onClose: () => void;
}

export function ScreeningOnboardingModal({ status, userName, onClose }: Props) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);

  const hasIntended = !!status.intended_course;
  const isApproved = status.screening_status === 'approved' && !!status.scholarship && !status.scholarship.is_used;

  // Escape to close — same "come back later" behaviour as the X button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const goToPayment = () => {
    if (status.pending_enrollment_id) {
      router.push(`/user/payment/${status.pending_enrollment_id}`);
    } else if (status.intended_course) {
      router.push(`/courses/${status.intended_course.course_id}`);
    } else {
      router.push('/courses/courses');
    }
  };

  const openPicker = async () => {
    setShowPicker(true);
    if (courses.length > 0) return;
    setLoadingCourses(true);
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch {
      // picker will just show "no courses found" below
    } finally {
      setLoadingCourses(false);
    }
  };

  const startScreeningFor = async (courseId: string) => {
    setSelecting(courseId);
    try {
      await api.onboarding.setIntendedCourse(courseId);
      router.push(`/scholarships/${courseId}`);
    } finally {
      setSelecting(null);
    }
  };

  const handleTakeScreening = () => {
    if (hasIntended && status.intended_course) {
      router.push(`/scholarships/${status.intended_course.course_id}`);
    } else {
      openPicker();
    }
  };

  return (
    <div
      className="som-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="som-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        .som-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.72); z-index: 80;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: somFade 0.2s ease both;
        }
        @keyframes somFade { from { opacity: 0; } to { opacity: 1; } }
        .som-card {
          width: 100%; max-width: 30rem;
          background: #0c0c0e; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          padding: 2rem; position: relative;
          animation: somPop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes somPop { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .som-close {
          position: absolute; top: 1.1rem; right: 1.1rem; color: rgba(255,255,255,0.4);
          background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 999px;
          transition: color 0.2s, background 0.2s;
        }
        .som-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .som-icon {
          width: 3rem; height: 3rem; border-radius: 1rem 0.4rem 1rem 0.4rem;
          background: ${BRAND}22; display: flex; align-items: center; justify-content: center;
          color: ${BRAND}; margin-bottom: 1.25rem;
        }
        .som-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; line-height: 1.3; }
        .som-sub { font-size: 0.9rem; color: rgba(255,255,255,0.55); line-height: 1.55; margin-bottom: 1.75rem; }
        .som-btn-primary {
          width: 100%; background: ${BRAND}; color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 0.85rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: box-shadow 0.25s, transform 0.2s;
        }
        .som-btn-primary:hover { box-shadow: 0 8px 28px ${BRAND}55; transform: translateY(-1px); }
        .som-btn-ghost {
          width: 100%; margin-top: 0.6rem; background: transparent; color: rgba(255,255,255,0.7);
          font-weight: 600; font-size: 0.85rem; padding: 0.75rem 1rem;
          border-radius: 2rem 0.75rem 2rem 0.75rem; border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .som-btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); }
        .som-btn-primary:focus-visible, .som-btn-ghost:focus-visible,
        .som-close:focus-visible, .som-course-row:focus-visible {
          outline: 2px solid ${BRAND}; outline-offset: 2px;
        }
        .som-picker { margin-top: 0.25rem; max-height: 14rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
        .som-course-row {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          width: 100%; padding: 0.75rem 0.9rem; border-radius: 1rem 0.4rem 1rem 0.4rem;
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
          cursor: pointer; text-align: left; color: #fff; font-size: 0.85rem; font-weight: 600;
          transition: border-color 0.2s, background 0.2s;
        }
        .som-course-row:hover { border-color: ${BRAND}66; background: ${BRAND}0f; }
        .som-course-row:disabled { opacity: 0.5; cursor: not-allowed; }
        .som-badge {
          display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700;
          color: #4ade80; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
          padding: 0.3rem 0.7rem; border-radius: 999px; margin-bottom: 1rem;
        }
        .som-empty { font-size: 0.85rem; color: rgba(255,255,255,0.4); text-align: center; padding: 1.5rem 0; }
      `}</style>

      <div className="som-card">
        <button type="button" className="som-close" onClick={onClose} aria-label="Close — I'll do this later">
          <X size={18} aria-hidden="true" />
        </button>

        {isApproved ? (
          <>
            <span className="som-badge">🎉 You qualified for a scholarship</span>
            <h2 id="som-title" className="som-title">
              {userName ? `Nice one, ${userName}!` : 'Nice one!'} You're almost in.
            </h2>
            <p className="som-sub">
              You've been approved
              {status.scholarship?.discount_percentage ? ` for a ${status.scholarship.discount_percentage}% scholarship` : ''} on{' '}
              <strong style={{ color: '#fff' }}>
                {status.intended_course?.title || status.scholarship?.course_name}
              </strong>
              . Secure your spot by paying the small registration fee instead of the full course price.
            </p>
            <button type="button" className="som-btn-primary" onClick={goToPayment}>
              Proceed to Payment <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        ) : showPicker ? (
          <>
            <h2 id="som-title" className="som-title">Which course are you screening for?</h2>
            <p className="som-sub">Scholarship screening applies to one course only — pick the one you want to enroll in.</p>
            <div className="som-picker">
              {loadingCourses ? (
                <p className="som-empty">Loading courses…</p>
              ) : courses.length === 0 ? (
                <p className="som-empty">No courses available right now.</p>
              ) : (
                courses.map((c) => {
                  const cid = String(c.course_id ?? c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="som-course-row"
                      disabled={selecting !== null}
                      onClick={() => startScreeningFor(cid)}
                    >
                      <span>{c.title}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  );
                })
              )}
            </div>
            <button type="button" className="som-btn-ghost" onClick={() => setShowPicker(false)}>
              Back
            </button>
          </>
        ) : (
          <>
            <h2 id="som-title" className="som-title">
              Welcome{userName ? `, ${userName}` : ''} 
            </h2>
            <p className="som-sub">
              Take a quick screening to see if you qualify for full tuition support
              {hasIntended && status.intended_course ? (
                <> on <strong style={{ color: '#fff' }}>{status.intended_course.title}</strong></>
              ) : null}.
            </p>
            <button type="button" className="som-btn-primary" onClick={goToPayment}>
              {hasIntended ? 'Proceed to Payment' : 'Browse Courses'} <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" className="som-btn-ghost" onClick={handleTakeScreening}>
              Take Screening Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}