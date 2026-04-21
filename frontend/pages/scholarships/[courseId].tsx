'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/layouts/AppLayout';

const BRAND = '#4A3AFF';

// ─── Question definitions ────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'experience_level',
    step: 1,
    label: 'Your Current Level',
    question: 'How would you honestly describe your current level in this field?',
    hint: 'Be honest, beginners are just as eligible as those with some exposure.',
    type: 'select' as const,
    options: [
      { value: 'complete_beginner', label: 'Complete Beginner', sub: "I'm starting from zero" },
      { value: 'some_exposure', label: 'Some Exposure', sub: "I've tried a few things but lack structure" },
      { value: 'intermediate', label: 'Intermediate', sub: "I know the basics but need to go deeper" },
      { value: 'advanced', label: 'Advanced', sub: "I'm experienced but want structured mastery" },
    ],
  },
  {
    id: 'learning_attempts',
    step: 2,
    label: 'Proof of Effort',
    question: 'What have you tried so far to learn this skill?',
    hint: "Share links, resources you've used, projects attempted, or videos you've watched. Specifics matter more than perfection.",
    type: 'textarea' as const,
    placeholder:
      "E.g. I watched 4 hours of free YouTube tutorials on Python, tried building a simple calculator but got stuck on functions. I've also read through the W3Schools intro but felt I needed more structured guidance...",
    minWords: 30,
  },
  {
    id: 'weekly_hours',
    step: 3,
    label: 'Your Commitment',
    question: 'How many hours per week can you realistically dedicate to this course?',
    hint: 'Be realistic, commitment consistency matters more than ambition.',
    type: 'select' as const,
    options: [
      { value: '1_3', label: '1–3 hrs/week', sub: 'Light pace' },
      { value: '4_6', label: '4–6 hrs/week', sub: 'Steady progress' },
      { value: '7_10', label: '7–10 hrs/week', sub: 'Strong focus' },
      { value: '10_plus', label: '10+ hrs/week', sub: 'Full immersion' },
    ],
  },
  {
    id: 'completion_obstacle',
    step: 4,
    label: 'Potential Obstacles',
    question: 'What might realistically stop you from completing this course and how will you handle it?',
    hint: 'Self-aware answers score higher than "nothing will stop me." We want to understand your resilience.',
    type: 'textarea' as const,
    placeholder:
      'E.g. My biggest obstacle is irregular internet access. To handle this, I plan to download materials in advance and study offline during weekends when I have more stable access...',
    minWords: 20,
  },
  {
    id: 'financial_context',
    step: 5,
    label: 'Financial Context',
    question: "Why is the full course fee difficult for you right now, and if you received a 25% discount instead of full scholarship, could you cover the rest?",
    hint: "Be specific and honest. This is the most important question. Mentioning actual numbers or circumstances strengthens your application significantly.",
    type: 'textarea' as const,
    placeholder:
      "E.g. I'm currently a fresh graduate earning ₦80,000/month supporting myself and contributing to household expenses. The full fee represents nearly 2 months of savings. If given a 50% discount, I could manage the balance within 3 weeks...",
    minWords: 30,
  },
  {
    id: 'outcome_plan',
    step: 6,
    label: 'Your 3-Month Plan',
    question: 'What specific outcome will you achieve with this skill in the next 3 months after completing the course?',
    hint: 'Vague answers like "get a job" score low. Specific, actionable plans score high.',
    type: 'textarea' as const,
    placeholder:
      'E.g. Within 3 months, I plan to build and deploy 2 client projects using the skills learned, pitch to at least 5 local businesses in Port Harcourt for freelance work, and apply to 3 remote junior developer roles with a portfolio...',
    minWords: 30,
  },
];

type AnswerMap = Record<string, string>;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{
              background: i < current ? BRAND : 'rgba(255,255,255,0.1)',
            }}
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
  const approved = scholarship.status === 'approved';
  const discount = scholarship.discount_percentage;

  return (
    <div className="text-center py-8 px-4">
      {/* Animated icon */}
      <div
        className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center text-5xl"
        style={{
          background: approved ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.1)',
          border: `2px solid ${approved ? 'rgba(22,163,74,0.4)' : 'rgba(239,68,68,0.3)'}`,
          animation: 'pop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {approved ? '🎓' : '💙'}
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">
        {approved ? `You got a ${discount}% Scholarship!` : 'Application Reviewed'}
      </h2>

      <p className="text-gray-400 mb-2 max-w-md mx-auto leading-relaxed">
        {approved
          ? `Congratulations — your scholarship has been applied to ${courseName}. This discount is tied exclusively to your account and this course.`
          : "We reviewed your application carefully. You didn't qualify this time, but the course is still open to you at the standard price."}
      </p>

      {approved && (
        <div
          className="mx-auto mt-6 mb-6 inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
          style={{
            background: 'rgba(22,163,74,0.12)',
            border: '1px solid rgba(22,163,74,0.3)',
          }}
        >
          <span className="text-green-400 text-2xl font-black">{discount}% OFF</span>
          <span className="text-green-300 text-sm">applied automatically at checkout</span>
        </div>
      )}

      <div
        className="mx-auto mt-2 mb-8 max-w-sm p-4 rounded-xl text-sm text-left"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Review notes</p>
        <p className="text-gray-300">{scholarship.review_notes}</p>
      </div>

      <button
        onClick={onContinue}
        className="px-8 py-4 font-bold text-white transition-all"
        style={{
          borderRadius: '2rem 0.75rem 2rem 0.75rem',
          background: BRAND,
          boxShadow: `0 8px 28px ${BRAND}55`,
        }}
      >
        {approved ? 'Continue to Payment →' : 'View Course'}
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ScholarshipPage() {
  const router = useRouter();
  const { courseId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(0);          // 0 = intro, 1–6 = questions, 7 = result
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [eligibility, setEligibility] = useState<any>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const currentQuestion = QUESTIONS[step - 1];
  const totalSteps = QUESTIONS.length;

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
      console.log('ELIGIBILITY RESPONSE:', data);
      setEligibility(data);

      // If already applied, skip to result
      if (data.existing_application) {
        setResult(data.existing_application);
        setStep(totalSteps + 1);
      }
    } catch {
      setEligibility({ eligible: false, reason: 'error' });
    } finally {
      setEligibilityLoading(false);
    }
  }, [courseId]);

  // ── Answer handling ───────────────────────────────────────────────────────
  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (currentQuestion?.type === 'textarea') {
      setWordCounts((prev) => ({ ...prev, [id]: countWords(value) }));
    }
  };

  const canProceed = (): boolean => {
    if (!currentQuestion) return false;
    const val = answers[currentQuestion.id] || '';
    if (!val.trim()) return false;
    if (currentQuestion.type === 'textarea' && currentQuestion.minWords) {
      return countWords(val) >= currentQuestion.minWords;
    }
    return true;
  };

  const handleNext = () => {
    setTouched((prev) => ({ ...prev, [currentQuestion.id]: true }));
    if (!canProceed()) return;
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await api.post(`/api/scholarships/apply/${courseId}`, answers);
      // ↑ data is already { message, scholarship }
      setResult(data.scholarship);
      setStep(totalSteps + 1);
    } catch (err: any) {
      if (err.response?.data?.scholarship) {
        setResult(err.response.data.scholarship);
        setStep(totalSteps + 1);
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
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
      already_applied: 'You have already submitted a scholarship application for this course.',
      scholarship_already_used: 'You have already used your scholarship on another course. Scholarships are single-use and non-transferable.',
      course_not_found: 'This course could not be found.',
      error: 'An error occurred while checking your eligibility.',
    };

    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#090909' }}>
          <div
            className="max-w-md w-full text-center p-8 rounded-3xl"
            style={{ background: 'rgba(15,15,15,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
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
        .scholarship-root { background: #090909; min-height: 100vh; }

        .s-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(12,12,12,0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.8), 0 0 60px ${BRAND}0a;
        }

        .s-option {
          border-radius: 1.25rem 0.5rem 1.25rem 0.5rem;
          border: 2px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
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

        .s-textarea {
          background: rgba(255,255,255,0.04);
          border: 2px solid rgba(255,255,255,0.08);
          border-radius: 1rem 0.5rem 1rem 0.5rem;
          color: #e5e7eb;
          resize: vertical;
          min-height: 140px;
          transition: border-color 0.25s, box-shadow 0.25s;
          width: 100%;
          padding: 1rem;
          font-size: 0.9rem;
          line-height: 1.7;
          outline: none;
          font-family: inherit;
        }
        .s-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .s-textarea:focus {
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
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          padding: 0.875rem 1.5rem;
          transition: border-color 0.2s, color 0.2s;
          cursor: pointer;
        }
        .s-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.8); }

        .word-counter {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .slide-in {
          animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Shimmer on brand line */
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
      `}</style>

      <div className="scholarship-root flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-2xl">

          {/* ── INTRO ──────────────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="s-card p-10 slide-in">
              <div className="brand-line mb-8" />

              <div className="flex items-center gap-3 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold" style={{ color: BRAND }}>
                    Scholarship Application
                  </p>
                  <h1 className="text-2xl font-bold text-white">{courseName}</h1>
                </div>
              </div>

              <p className="text-gray-400 leading-relaxed mb-6">
                Our scholarship program exists to remove financial barriers for determined learners. Applications are assessed automatically based on commitment, context, and effort, not just financial need.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: '', text: 'Decision in under 2 minutes, fully automated' },
                  { icon: '', text: 'Tied to your account and this course only, non-transferable' },
                  { icon: '', text: '6 focused questions, no essays, no tasks' },
                  // { icon: '🇳🇬', text: 'Nigerian applicants receive a location support bonus' },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <div
                className="p-4 rounded-xl mb-8 text-sm"
                style={{ background: `${BRAND}10`, border: `1px solid ${BRAND}25` }}
              >
                <p className="font-semibold mb-1" style={{ color: BRAND }}>Possible outcomes</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { pct: '100%', label: 'Full scholarship', score: '75–100 pts' },
                    { pct: '50%', label: 'Half scholarship', score: '55–74 pts' },
                    { pct: '25%', label: 'Partial support', score: '35–54 pts' },
                  ].map((tier) => (
                    <div key={tier.pct} className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <p className="text-xl font-black text-white">{tier.pct}</p>
                      <p className="text-xs text-gray-400">{tier.label}</p>
                      <p className="text-xs mt-1" style={{ color: BRAND }}>{tier.score}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(1)} className="s-btn-primary w-full text-center">
                Begin Application
              </button>
            </div>
          )}

          {/* ── QUESTIONS 1–6 ──────────────────────────────────────────────── */}
          {step >= 1 && step <= totalSteps && currentQuestion && (
            <div className="s-card p-8 md:p-10 slide-in" key={step}>
              <StepBar current={step} total={totalSteps} />

              {/* Step header */}
              <div className="mb-2">
                <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: BRAND }}>
                  Question {step} of {totalSteps} — {currentQuestion.label}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Hint */}
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{currentQuestion.hint}</p>

              {/* Select type */}
              {currentQuestion.type === 'select' && (
                <div className="space-y-3 mb-8">
                  {currentQuestion.options!.map((opt) => (
                    <div
                      key={opt.value}
                      className={`s-option flex items-center gap-4 p-4 ${
                        answers[currentQuestion.id] === opt.value ? 'selected' : ''
                      }`}
                      onClick={() => setAnswer(currentQuestion.id, opt.value)}
                    >
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: answers[currentQuestion.id] === opt.value ? BRAND : 'rgba(255,255,255,0.2)',
                          background: answers[currentQuestion.id] === opt.value ? BRAND : 'transparent',
                        }}
                      >
                        {answers[currentQuestion.id] === opt.value && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{opt.label}</p>
                        {'sub' in opt && <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea type */}
              {currentQuestion.type === 'textarea' && (
                <div className="mb-8">
                  <textarea
                    className="s-textarea"
                    placeholder={currentQuestion.placeholder}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, [currentQuestion.id]: true }))}
                    rows={6}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      {touched[currentQuestion.id] &&
                        currentQuestion.minWords &&
                        (wordCounts[currentQuestion.id] || 0) < currentQuestion.minWords && (
                          <p className="text-red-400 text-xs">
                            Please write at least {currentQuestion.minWords} words
                          </p>
                        )}
                    </div>
                    <p
                      className="word-counter"
                      style={{
                        color:
                          (wordCounts[currentQuestion.id] || 0) >= (currentQuestion.minWords || 0)
                            ? '#22c55e'
                            : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {wordCounts[currentQuestion.id] || 0} words
                      {currentQuestion.minWords
                        ? ` / ${currentQuestion.minWords} min`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button className="s-btn-ghost" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </button>
                ) : (
                  <button className="s-btn-ghost" onClick={() => setStep(0)}>
                    Intro
                  </button>
                )}

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
                  ) : step === totalSteps ? (
                    'Submit Application'
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── RESULT ─────────────────────────────────────────────────────── */}
          {step === totalSteps + 1 && result && (
            <div className="s-card p-8 md:p-10 slide-in">
              <ResultCard
                scholarship={result}
                courseName={courseName}
                onContinue={() => {
                  if (result.status === 'approved') {
                    // Go directly to enrollment/payment
                    router.push(`/courses/${courseId}`);
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