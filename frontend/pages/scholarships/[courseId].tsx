// pages/scholarships/[courseId].tsx
// CHANGE 5: Simplified to 4 questions with new scoring rules

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/layouts/AppLayout';
import { useCmsGlobals } from '@/contexts/CmsGlobalsContext';
import { fillCopy } from '@/lib/cms/globalDefaults';

const BRAND = '#4A3AFF';

// ─── Question definitions (CHANGE 5: 4 questions only) ──────────────────────
// Q1: weekly_hours
// Q2: is_student
// Q3: is_employed + salary_range (conditional)
// Q4: country

const WEEKLY_HOURS_OPTIONS = [
  { value: '1_3',     label: '1–3 hrs/week',  sub: 'Light pace' },
  { value: '4_6',     label: '4–6 hrs/week',  sub: 'Steady progress' },
  { value: '7_10',    label: '7–10 hrs/week', sub: 'Strong focus' },
  { value: '10_plus', label: '10+ hrs/week',  sub: 'Full immersion' },
];

const SALARY_RANGE_OPTIONS = [
  { value: 'under_100',  label: 'Under ₦100,000 / $100 per month' },
  { value: '100_200',    label: '₦100,000–₦200,000 / $100–$200 per month' },
  { value: 'above_200',  label: 'Above ₦200,000 / $200 per month' },
];

type AnswerMap = Record<string, string>;

// ─── Progress bar ─────────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: i < current ? BRAND : 'var(--border-subtle)' }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({
  scholarship,
  courseName,
  onContinue,
}: {
  scholarship: any;
  courseName: string;
  onContinue: () => void;
}) {
  // Single-award model: every scholarship = pay only the registration fee.
  const copy = useCmsGlobals().scholarship;

  return (
    <div className="text-center py-8 px-4">
      <div
        className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center text-5xl"
        style={{
          background: `${BRAND}1f`,
          border: `2px solid ${BRAND}66`,
          animation: 'pop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        🎓
      </div>

      <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: BRAND }}>{copy.awardBadge}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">{copy.awardHeading}</h2>

      <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
        {fillCopy(copy.awardMessage, { course: courseName })}
      </p>

      <button
        onClick={onContinue}
        className="px-8 py-4 font-bold text-white transition-all"
        style={{
          borderRadius: '2rem 0.75rem 2rem 0.75rem',
          background: BRAND,
          boxShadow: `0 8px 28px ${BRAND}55`,
        }}
      >
        {copy.awardButton}
      </button>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Shared radio option ──────────────────────────────────────────────────────
function RadioOption({
  value,
  label,
  sub,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  sub?: string;
  selected: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <div
      className={`s-option flex items-center gap-4 p-4 ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{
          borderColor: selected ? BRAND : 'var(--border-strong)',
          background: selected ? BRAND : 'transparent',
        }}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ScholarshipPage() {
  const router = useRouter();
  const { courseId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const copy = useCmsGlobals().scholarship;

  // CHANGE 5: 4 steps (0=intro, 1-4=questions, 5=result)
  const TOTAL_STEPS = 4;
  // The intro screen was removed — the application starts at question 1.
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [eligibility, setEligibility] = useState<any>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      if (courseId) sessionStorage.setItem('scholarship_course_redirect', courseId as string);
      router.push('/user/auth/login');
    }
  }, [authLoading, user, courseId]);

  // ── Eligibility check ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady || !courseId || !user) return;
    checkEligibility();
  }, [router.isReady, courseId, user]);

  const checkEligibility = useCallback(async () => {
    try {
      setEligibilityLoading(true);
      const data = await api.get(`/api/scholarships/eligibility/${courseId}`);
      setEligibility(data);

      if (data.existing_application) {
        setResult(data.existing_application);
        setStep(TOTAL_STEPS + 1);
      }
    } catch {
      setEligibility({ eligible: false, reason: 'error' });
    } finally {
      setEligibilityLoading(false);
    }
  }, [courseId]);

  // ── Can proceed check per step ────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!answers.weekly_hours;
      case 2: return !!answers.is_student;
      case 3:
        if (!answers.is_employed) return false;
        if (answers.is_employed === 'yes' && !answers.salary_range) return false;
        return true;
      case 4: return !!answers.country?.trim();
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        weekly_hours:    answers.weekly_hours,
        is_student:      answers.is_student,
        is_employed:     answers.is_employed,
        salary_range:    answers.is_employed === 'yes' ? answers.salary_range : 'not_employed',
        country:         answers.country,
      };

      const data = await api.post(`/api/scholarships/apply/${courseId}`, payload);
      setResult(data.scholarship);
      setStep(TOTAL_STEPS + 1);
    } catch (err: any) {
      if (err.response?.data?.scholarship) {
        setResult(err.response.data.scholarship);
        setStep(TOTAL_STEPS + 1);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || eligibilityLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin"
              style={{ borderColor: `${BRAND}44`, borderTopColor: BRAND }}
            />
            <p className="text-gray-500 text-sm">Loading…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Not eligible ──────────────────────────────────────────────────────────
  if (eligibility && !eligibility.eligible && !eligibility.existing_application) {
    const reasons: Record<string, string> = {
      already_applied: copy.alreadyAppliedMessage,
      scholarship_already_used: copy.alreadyUsedMessage,
      course_not_found: 'This course could not be found.',
      error: 'An error occurred while checking your eligibility.',
    };

    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--page-bg)' }}>
          <div
            className="max-w-md w-full text-center p-8 rounded-3xl"
            style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-3">Not Eligible</h2>
            <p className="text-gray-400 mb-6">{reasons[eligibility.reason] || 'You are not eligible for a scholarship at this time.'}</p>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="px-6 py-3 font-semibold text-white"
              style={{ borderRadius: '2rem 0.75rem 2rem 0.75rem', background: BRAND }}
            >
              Back to Course
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const courseName = eligibility?.course_name || result?.course_name || 'this course';

  return (
    <AppLayout>
      <style>{`
        .scholarship-root { background: var(--page-bg); min-height: 100vh; }

        .s-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid var(--border-subtle);
          background: var(--surface);
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.8), 0 0 60px ${BRAND}0a;
        }

        .s-option {
          border-radius: 1.25rem 0.5rem 1.25rem 0.5rem;
          border: 2px solid var(--border-subtle);
          background: var(--surface-alt);
          cursor: pointer;
          transition: all 0.25s;
        }
        .s-option:hover {
          border-color: ${BRAND}55;
          background: ${BRAND}0a;
          transform: translateY(-1px);
        }
        .s-option.selected {
          border-color: ${BRAND};
          background: ${BRAND}15;
          box-shadow: 0 0 20px ${BRAND}22, inset 0 0 20px ${BRAND}08;
        }

        .s-input {
          background: var(--surface-alt);
          border: 2px solid var(--border-subtle);
          border-radius: 1rem 0.5rem 1rem 0.5rem;
          color: var(--text-secondary);
          transition: border-color 0.25s, box-shadow 0.25s;
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.9rem;
          outline: none;
          font-family: inherit;
        }
        .s-input::placeholder { color: var(--text-muted); }
        .s-input:focus {
          border-color: ${BRAND}88;
          box-shadow: 0 0 0 3px ${BRAND}15;
        }

        .s-btn-primary {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          background: ${BRAND};
          color: #fff;
          font-weight: 700;
          padding: 0.875rem 2.5rem;
          transition: box-shadow 0.3s, transform 0.2s, opacity 0.2s;
          cursor: pointer;
        }
        .s-btn-primary:hover:not(:disabled) {
          box-shadow: 0 8px 28px ${BRAND}55;
          transform: translateY(-2px);
        }
        .s-btn-primary:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }

        .s-btn-ghost {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-weight: 500;
          padding: 0.875rem 1.5rem;
          transition: border-color 0.2s, color 0.2s;
          cursor: pointer;
        }
        .s-btn-ghost:hover { border-color: var(--border-strong); color: var(--text-primary); }

        .slide-in {
          animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand-line {
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, ${BRAND}, transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .conditional-in {
          animation: slideIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <div className="scholarship-root flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-2xl">

          {/* ── STEP 1: Weekly hours ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="s-card p-8 md:p-10 slide-in" key="step1">
              <StepBar current={1} total={TOTAL_STEPS} />
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: BRAND }}>
                {copy.applicationLabel} · {courseName} — Question 1 of {TOTAL_STEPS}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
                How many hours per week can you dedicate to this course?
              </h2>
              <p className="text-sm text-gray-500 mb-6">Be realistic — consistency matters more than ambition.</p>

              <div className="space-y-3 mb-8">
                {WEEKLY_HOURS_OPTIONS.map(opt => (
                  <RadioOption
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    sub={opt.sub}
                    selected={answers.weekly_hours === opt.value}
                    onSelect={v => setAnswers(a => ({ ...a, weekly_hours: v }))}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-4">
                <button className="s-btn-ghost" onClick={() => router.push(`/courses/${courseId}`)}>Cancel</button>
                <button className="s-btn-primary" onClick={handleNext} disabled={!canProceed()}>Next</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Are you a student? ────────────────────────────────── */}
          {step === 2 && (
            <div className="s-card p-8 md:p-10 slide-in" key="step2">
              <StepBar current={2} total={TOTAL_STEPS} />
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: BRAND }}>
                {copy.applicationLabel} — Question 2 of {TOTAL_STEPS}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
                Are you currently a student?
              </h2>
              <p className="text-sm text-gray-500 mb-6">Full-time or part-time student at any level counts.</p>

              <div className="space-y-3 mb-8">
                <RadioOption
                  value="yes"
                  label="Yes, I am a student"
                  sub="Full-time or part-time"
                  selected={answers.is_student === 'yes'}
                  onSelect={v => setAnswers(a => ({ ...a, is_student: v }))}
                />
                <RadioOption
                  value="no"
                  label="No, I am not a student"
                  selected={answers.is_student === 'no'}
                  onSelect={v => setAnswers(a => ({ ...a, is_student: v }))}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button className="s-btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="s-btn-primary" onClick={handleNext} disabled={!canProceed()}>Next</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Employment + salary ───────────────────────────────── */}
          {step === 3 && (
            <div className="s-card p-8 md:p-10 slide-in" key="step3">
              <StepBar current={3} total={TOTAL_STEPS} />
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: BRAND }}>
                {copy.applicationLabel} — Question 3 of {TOTAL_STEPS}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
                Are you currently employed?
              </h2>
              <p className="text-sm text-gray-500 mb-6">Be honest — this helps us assess financial need accurately.</p>

              <div className="space-y-3 mb-4">
                <RadioOption
                  value="no"
                  label="No, I am not employed"
                  selected={answers.is_employed === 'no'}
                  onSelect={v => setAnswers(a => ({ ...a, is_employed: v, salary_range: undefined as any }))}
                />
                <RadioOption
                  value="yes"
                  label="Yes, I am employed"
                  selected={answers.is_employed === 'yes'}
                  onSelect={v => setAnswers(a => ({ ...a, is_employed: v }))}
                />
              </div>

              {/* Conditional salary range */}
              {answers.is_employed === 'yes' && (
                <div className="conditional-in mt-4 mb-6">
                  <p className="text-sm font-semibold text-gray-300 mb-3">What is your monthly income range?</p>
                  <div className="space-y-3">
                    {SALARY_RANGE_OPTIONS.map(opt => (
                      <RadioOption
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        selected={answers.salary_range === opt.value}
                        onSelect={v => setAnswers(a => ({ ...a, salary_range: v }))}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 mt-6">
                <button className="s-btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button className="s-btn-primary" onClick={handleNext} disabled={!canProceed()}>Next</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Country ────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="s-card p-8 md:p-10 slide-in" key="step4">
              <StepBar current={4} total={TOTAL_STEPS} />
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: BRAND }}>
                {copy.applicationLabel} — Question 4 of {TOTAL_STEPS}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
                Which country are you from?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Used to confirm your eligibility.
              </p>

              <input
                className="s-input mb-8"
                placeholder="e.g. Nigeria, Ghana, Kenya, United Kingdom…"
                value={answers.country || ''}
                onChange={e => setAnswers(a => ({ ...a, country: e.target.value }))}
              />

              <div className="flex items-center justify-between gap-4">
                <button className="s-btn-ghost" onClick={() => setStep(3)}>Back</button>
                <button
                  className="s-btn-primary flex items-center gap-2"
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Reviewing…
                    </>
                  ) : (
                    copy.submitButton
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── RESULT ─────────────────────────────────────────────────────── */}
          {step === TOTAL_STEPS + 1 && result && (
            <div className="s-card p-8 md:p-10 slide-in">
              <ResultCard
                scholarship={result}
                courseName={courseName}
                onContinue={async () => {
                  if (result.status === 'approved') {
                    try {
                      const response = await api.enrollment.getUserEnrollments();
                      const pending = response.enrollments
                        .filter((e: any) => e.payment_status === 'pending' && e.course_id === courseId)
                        .sort((a: any, b: any) =>
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        )[0];

                      if (pending?.id) {
                        router.push(`/user/payment/${pending.id}`);
                        return;
                      }

                      // No enrollment yet — create one now (at the
                      // registration-fee price, since the scholarship is
                      // already approved) instead of dead-ending on the
                      // course page. Mirrors ScreeningOnboardingModal's fix.
                      // The payment-start page enrolls on the course's own
                      // track (right registration-fee category) and opens checkout.
                      router.push(`/user/payment/start?course=${encodeURIComponent(courseId as string)}`);
                    } catch {
                      router.push(`/user/payment/start?course=${encodeURIComponent(courseId as string)}`);
                    }
                  } else {
                    router.push(`/courses/${courseId}`);
                  }
                }}
              />
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}