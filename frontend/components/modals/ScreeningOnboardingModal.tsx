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
  const [payingNow, setPayingNow] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

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

  // status.intended_course can legitimately be missing in edge cases even
  // when a scholarship exists (e.g. an older backend response cached
  // client-side). A scholarship is permanently tied to exactly one
  // course, so fall back to its course_id rather than losing the target
  // course entirely and dead-ending on the courses list.
  const targetCourseId = status.intended_course?.course_id || status.scholarship?.course_id;
  const targetIsDeepTech = !!status.intended_course?.is_deep_tech;

  const enrollAndPay = async (learningTrack: 'self_paced' | 'group_mentorship') => {
    if (!targetCourseId) return;
    setEnrollError(null);
    setPayingNow(true);
    try {
      const res = await api.enrollment.enroll(targetCourseId, learningTrack, 'onetime');
      router.push(`/user/payment/${res.enrollment_id}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Something went wrong creating your enrollment. Please try again.';

      // "Already enrolled" (409) still carries an enrollment_id we can pay
      // against — treat it as success rather than a dead-end error.
      const existingId = err?.response?.data?.enrollment_id;
      if (existingId) {
        router.push(`/user/payment/${existingId}`);
        return;
      }

      setEnrollError(message);
    } finally {
      setPayingNow(false);
    }
  };

  const goToPayment = async () => {
    if (status.pending_enrollment_id) {
      router.push(`/user/payment/${status.pending_enrollment_id}`);
      return;
    }

    // Approved for a scholarship but no enrollment exists yet — being
    // "awarded" never auto-creates one, so without this the button had
    // nowhere real to send the person and fell back to browsing courses.
    // Create the registration-fee enrollment now and go straight to
    // payment for it, instead of dumping them back on the course page.
    //
    // Use the course's real track (deep-tech vs flexible) so pricing is
    // correct — the deep-tech readiness screening itself now happens on
    // the payment page, not here, so every enrollment path funnels through
    // one consistent screening point.
    if (isApproved && targetCourseId) {
      await enrollAndPay(targetIsDeepTech ? 'group_mentorship' : 'self_paced');
      return;
    }

    if (targetCourseId) {
      router.push(`/courses/${targetCourseId}`);
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
          position: fixed; inset: 0; background: var(--overlay); z-index: 80;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
          animation: somFade 0.2s ease both;
        }
        @keyframes somFade { from { opacity: 0; } to { opacity: 1; } }
        .som-card {
          width: 100%; max-width: 30rem;
          background: var(--surface-elevated); border: 1px solid var(--border-subtle);
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          padding: 2rem; position: relative;
          animation: somPop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes somPop { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .som-close {
          position: absolute; top: 1.1rem; right: 1.1rem; color: var(--text-muted);
          background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 999px;
          transition: color 0.2s, background 0.2s;
        }
        .som-close:hover { color: var(--text-primary); background: var(--border-subtle); }
        .som-icon {
          width: 3rem; height: 3rem; border-radius: 1rem 0.4rem 1rem 0.4rem;
          background: ${BRAND}22; display: flex; align-items: center; justify-content: center;
          color: ${BRAND}; margin-bottom: 1.25rem;
        }
        .som-title { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.3; }
        .som-sub { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.75rem; }
        .som-btn-primary {
          width: 100%; background: ${BRAND}; color: #fff; font-weight: 700; font-size: 0.9rem;
          padding: 0.85rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: box-shadow 0.25s, transform 0.2s;
        }
        .som-btn-primary:hover { box-shadow: 0 8px 28px ${BRAND}55; transform: translateY(-1px); }
        .som-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .som-btn-ghost {
          width: 100%; margin-top: 0.6rem; background: transparent; color: var(--text-secondary);
          font-weight: 600; font-size: 0.85rem; padding: 0.75rem 1rem;
          border-radius: 2rem 0.75rem 2rem 0.75rem; border: 1px solid var(--border-subtle);
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .som-btn-ghost:hover { background: var(--surface-alt); border-color: var(--border-strong); }
        .som-btn-primary:focus-visible, .som-btn-ghost:focus-visible,
        .som-close:focus-visible, .som-course-row:focus-visible {
          outline: 2px solid ${BRAND}; outline-offset: 2px;
        }
        .som-picker { margin-top: 0.25rem; max-height: 14rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
        .som-course-row {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          width: 100%; padding: 0.75rem 0.9rem; border-radius: 1rem 0.4rem 1rem 0.4rem;
          border: 1px solid var(--border-subtle); background: var(--surface-alt);
          cursor: pointer; text-align: left; color: var(--text-primary); font-size: 0.85rem; font-weight: 600;
          transition: border-color 0.2s, background 0.2s;
        }
        .som-course-row:hover { border-color: ${BRAND}66; background: ${BRAND}0f; }
        .som-course-row:disabled { opacity: 0.5; cursor: not-allowed; }
        .som-badge {
          display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700;
          color: #4ade80; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3);
          padding: 0.3rem 0.7rem; border-radius: 999px; margin-bottom: 1rem;
        }
        .som-empty { font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0; }
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
              {(() => {
                const pct = Number(status.scholarship?.discount_percentage) || 0;
                const isFullTuition = pct >= 100;
                return isFullTuition ? (
                  <>
                    You've been awarded a full-tuition scholarship on{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {status.intended_course?.title || status.scholarship?.course_name}
                    </strong>
                    . Secure your spot by paying just the registration fee instead of the full course price.
                  </>
                ) : (
                  <>
                    You've been awarded a {pct}% scholarship on{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {status.intended_course?.title || status.scholarship?.course_name}
                    </strong>
                    . The discount is applied automatically — pick your track and payment plan as normal.
                  </>
                );
              })()}
            </p>
            <button type="button" className="som-btn-primary" onClick={goToPayment} disabled={payingNow}>
              {payingNow ? 'Preparing payment…' : 'Proceed to Payment'} <ArrowRight size={16} aria-hidden="true" />
            </button>
            {enrollError && (
              <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>
                {enrollError}
              </p>
            )}
          </>
        ) : showPicker ? (
          <>
            <h2 id="som-title" className="som-title">Which course are you applying for full tuition on?</h2>
            <p className="som-sub">Full-tuition applications apply to one course only — pick the one you want to enroll in.</p>
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
        ) : hasIntended && status.intended_course ? (
          <>
            <h2 id="som-title" className="som-title">
              {userName ? `Welcome, ${userName}.` : 'Welcome.'} One quick step first.
            </h2>
            <p className="som-sub">
              Before you pay full price for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{status.intended_course.title}</strong>, take a
              two-minute application to see if you qualify for full tuition. No commitment
              — you can always pay in full instead.
            </p>
            <button type="button" className="som-btn-primary" onClick={handleTakeScreening}>
              Apply for Full Tuition <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" className="som-btn-ghost" onClick={goToPayment}>
              Skip — pay full price
            </button>
          </>
        ) : (
          <>
            <h2 id="som-title" className="som-title">
              Welcome{userName ? `, ${userName}` : ''}.
            </h2>
            <p className="som-sub">
              Apply to see if you qualify for full tuition on any course.
            </p>
            <button type="button" className="som-btn-primary" onClick={handleTakeScreening}>
              Apply for Full Tuition <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" className="som-btn-ghost" onClick={goToPayment}>
              Browse Courses Instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}