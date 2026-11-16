// pages/scholarships/[courseId].tsx
//
// Scholarship application — reviewed MANUALLY by the Learnexity team.
//   - The course (and its pathway) is shown at the top with "Change course",
//     which opens the Pathway → Course picker.
//   - Every question must be answered (no skipping):
//     1 hours per week, 2 student, 3 employment (+ income if employed),
//     4 current location — their real location (detected from their
//     connection) is offered as a one-tap choice, or they pick a country.
//     5–6 written answers, at least 30 words each.
//   - Questions 5–6 are written answers: why we should give you the
//     scholarship, and your long-term goal — at least 30 words each.
//   - After submitting, a confirmation stays on screen until "Close" is
//     clicked, with "Chat with Learnexity" (WhatsApp) and a reminder to
//     check email for our response.
// Text only — no icons or emoji.

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/layouts/AppLayout';
import { useCmsGlobals } from '@/contexts/CmsGlobalsContext';
import { fillCopy } from '@/lib/cms/globalDefaults';
import ScholarshipCoursePicker, { PATHWAY_LABEL } from '@/components/Scholarship/ScholarshipCoursePicker';
import { isPathwayKey, type PathwayKey } from '@/components/catalog/pathways';
import { COUNTRIES } from '@/lib/countries';

const BRAND = '#4A3AFF';
const WHATSAPP_URL = 'https://wa.me/12762528415';
const MIN_WORDS = 30;
const MAX_CHARS = 4000;

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

// Same rule as the server: a word must contain a letter.
const WORD_RE = new RegExp("[\\p{L}][\\p{L}\\p{M}'’-]*", 'gu');
const countWords = (t: string) => (t.match(WORD_RE) || []).length;

// ─── Progress bar ─────────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8" aria-label={`Question ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full transition-all duration-500"
          style={{ background: i < current ? BRAND : 'var(--border-subtle)' }}
        />
      ))}
    </div>
  );
}

// ─── Radio option ─────────────────────────────────────────────────────────────
function RadioOption({ value, label, sub, selected, onSelect }: {
  value: string; label: string; sub?: string; selected: boolean; onSelect: (v: string) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`s-option flex w-full items-center gap-4 p-4 text-left ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      <span
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: selected ? BRAND : 'var(--border-strong)' }}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full" style={{ background: BRAND }} />}
      </span>
      <span>
        <span className="block font-semibold text-[var(--text-primary)] text-sm">{label}</span>
        {sub && <span className="block text-xs text-[var(--text-muted)] mt-0.5">{sub}</span>}
      </span>
    </button>
  );
}

// ─── Essay question ───────────────────────────────────────────────────────────
function EssayField({ value, onChange, placeholder, error }: {
  value: string; onChange: (v: string) => void; placeholder: string; error?: string | null;
}) {
  const words = countWords(value);
  const ok = words >= MIN_WORDS;
  return (
    <div className="mb-6">
      <textarea
        className="s-input"
        rows={8}
        maxLength={MAX_CHARS}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ resize: 'vertical', minHeight: '11rem', lineHeight: 1.6 }}
      />
      <div className="flex items-center justify-between mt-2 text-xs">
        <span style={{ color: ok ? BRAND : 'var(--text-muted)', fontWeight: 600 }}>
          {ok ? `${words} words` : `${words} / ${MIN_WORDS} words minimum`}
        </span>
        <span className="text-[var(--text-muted)]">{value.length} / {MAX_CHARS}</span>
      </div>
      {error && <p className="mt-2 text-sm" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ScholarshipPage() {
  const router = useRouter();
  const { courseId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const copy = useCmsGlobals().scholarship;

  const TOTAL_STEPS = 6;
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [eligibility, setEligibility] = useState<any>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [changing, setChanging] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      if (courseId) sessionStorage.setItem('scholarship_course_redirect', courseId as string);
      router.push('/user/auth/login');
    }
  }, [authLoading, user, courseId]);

  const checkEligibility = useCallback(async () => {
    try {
      setEligibilityLoading(true);
      const data = await api.get(`/api/scholarships/eligibility/${courseId}`);
      setEligibility(data);
      setResult(data.existing_application ?? null);
    } catch {
      setEligibility({ eligible: false, reason: 'error' });
    } finally {
      setEligibilityLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!router.isReady || !courseId || !user) return;
    // New course chosen → start the form fresh.
    setStep(1); setAnswers({}); setResult(null); setSubmitError(null); setFieldErrors({});
    checkEligibility();
  }, [router.isReady, courseId, user?.id]);

  // Lock scroll while the success message is open.
  useEffect(() => {
    if (!showSuccess) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showSuccess]);

  const pathway: PathwayKey | null = isPathwayKey(router.query.pathway) ? (router.query.pathway as PathwayKey)
    : isPathwayKey(eligibility?.pathway) ? eligibility.pathway : null;

  const pickCourse = async (id: string, p: PathwayKey) => {
    if (id === courseId) { setChanging(false); return; }
    setOpening(id);
    try { await api.onboarding.setIntendedCourse(id); } catch { /* not critical */ }
    await router.replace(`/scholarships/${encodeURIComponent(id)}?pathway=${p}`);
    setOpening(null);
    setChanging(false);
  };

  // Every question must be answered before moving on.
  const stepDone = (n: number): boolean => {
    switch (n) {
      case 1: return !!answers.weekly_hours;
      case 2: return !!answers.is_student;
      case 3: return answers.is_employed === 'no' || (answers.is_employed === 'yes' && !!answers.salary_range);
      case 4: return !!answers.current_location?.trim();
      case 5: return countWords(answers.why_scholarship || '') >= MIN_WORDS;
      case 6: return countWords(answers.long_term_goal || '') >= MIN_WORDS;
      default: return false;
    }
  };

  const essayError = (key: 'why_scholarship' | 'long_term_goal') => {
    const n = countWords(answers[key] || '');
    return n >= MIN_WORDS ? null : `Please write at least ${MIN_WORDS} words (you have ${n}).`;
  };

  const handleNext = () => {
    if (!stepDone(step)) return;
    if (step === 5 && essayError('why_scholarship')) { setFieldErrors({ why_scholarship: essayError('why_scholarship')! }); return; }
    if (step === 6) { handleSubmit(); return; }
    setFieldErrors({});
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const handleSubmit = async () => {
    const firstMissing = [1, 2, 3, 4, 5, 6].find((n) => !stepDone(n));
    if (firstMissing && firstMissing < 5) { setStep(firstMissing); return; }
    const e1 = essayError('why_scholarship');
    const e2 = essayError('long_term_goal');
    if (e1 || e2) {
      setFieldErrors({ ...(e1 ? { why_scholarship: e1 } : {}), ...(e2 ? { long_term_goal: e2 } : {}) });
      if (e1) setStep(5);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: Record<string, string> = {
        why_scholarship: answers.why_scholarship.trim(),
        long_term_goal: answers.long_term_goal.trim(),
      };
      payload.weekly_hours = answers.weekly_hours;
      payload.is_student = answers.is_student;
      payload.is_employed = answers.is_employed;
      payload.salary_range = answers.is_employed === 'yes' ? answers.salary_range : 'not_employed';
      payload.current_location = (answers.current_location || '').trim();

      const data = await api.post(`/api/scholarships/apply/${courseId}`, payload);
      setResult(data.scholarship);
      setShowSuccess(true);
    } catch (err: any) {
      const res = err?.response?.data;
      if (res?.errors) {
        const fe: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, v]: any) => { fe[k] = Array.isArray(v) ? v[0] : String(v); });
        setFieldErrors(fe);
        const order: [string, number][] = [['weekly_hours', 1], ['is_student', 2], ['is_employed', 3], ['salary_range', 3], ['current_location', 4], ['why_scholarship', 5], ['long_term_goal', 6]];
        const hit = order.find(([k]) => fe[k]);
        if (hit) setStep(hit[1]);
        const msg = order.map(([k]) => fe[k]).find(Boolean);
        if (msg && hit && hit[1] <= 4) setSubmitError(msg);
      } else if (res?.scholarship) {
        setResult(res.scholarship);
      } else {
        setSubmitError(res?.message || 'We could not submit your application. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goPayment = async () => {
    try {
      const response = await api.enrollment.getUserEnrollments();
      const pending = response.enrollments
        .filter((e: any) => e.payment_status === 'pending' && e.course_id === courseId)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      if (pending?.id) { router.push(`/user/payment/${pending.id}`); return; }
    } catch { /* fall through */ }
    router.push(`/user/payment/start?course=${encodeURIComponent(courseId as string)}`);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || eligibilityLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin" style={{ borderColor: `${BRAND}44`, borderTopColor: BRAND }} />
            <p className="text-[var(--text-muted)] text-sm">Loading…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const courseName = eligibility?.course_name || result?.course_name || 'this course';
  const blocked = eligibility && !eligibility.eligible && !result;

  return (
    <AppLayout>
      <style>{`
        .scholarship-root { background: var(--page-bg); min-height: 100vh; }
        .s-card { border-radius: 2rem 0.75rem 2rem 0.75rem; border: 1px solid var(--border-subtle); background: var(--surface); box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 60px ${BRAND}0a; }
        .s-option { border-radius: 1.25rem 0.5rem 1.25rem 0.5rem; border: 2px solid var(--border-subtle); background: var(--surface-alt); cursor: pointer; transition: all 0.25s; }
        .s-option:hover { border-color: ${BRAND}55; background: ${BRAND}0a; }
        .s-option.selected { border-color: ${BRAND}; background: ${BRAND}15; }
        .s-input { background: var(--surface-alt); border: 2px solid var(--border-subtle); border-radius: 1rem 0.5rem 1rem 0.5rem; color: var(--text-primary); transition: border-color 0.25s, box-shadow 0.25s; width: 100%; padding: 0.875rem 1rem; font-size: 1rem; outline: none; font-family: inherit; }
        .s-input::placeholder { color: var(--text-muted); }
        .s-input:focus { border-color: ${BRAND}88; box-shadow: 0 0 0 3px ${BRAND}15; }
        .s-btn-primary { border-radius: 2rem 0.75rem 2rem 0.75rem; background: ${BRAND}; color: #fff; font-weight: 700; padding: 0.875rem 2rem; min-height: 48px; transition: box-shadow 0.3s, opacity 0.2s; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; }
        .s-btn-primary:hover:not(:disabled) { box-shadow: 0 8px 28px ${BRAND}55; }
        .s-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .s-btn-ghost { border-radius: 2rem 0.75rem 2rem 0.75rem; border: 1px solid var(--border-subtle); color: var(--text-secondary); font-weight: 600; padding: 0.875rem 1.5rem; min-height: 48px; transition: border-color 0.2s, color 0.2s; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; text-align: center; }
        .s-btn-ghost:hover { border-color: var(--border-strong); color: var(--text-primary); }
        .s-link { color: ${BRAND}; font-weight: 700; font-size: 0.85rem; cursor: pointer; background: none; border: 0; padding: 0.25rem 0; }
        .slide-in { animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .s-eyebrow { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; color: ${BRAND}; margin-bottom: 0.35rem; }
        .s-title { font-size: 1.35rem; line-height: 1.35; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
        @media (min-width: 768px) { .s-title { font-size: 1.6rem; } }
        .s-sub { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.55; }
        .s-nav { display: flex; flex-direction: column-reverse; gap: 0.75rem; }
        @media (min-width: 560px) { .s-nav { flex-direction: row; justify-content: space-between; align-items: center; } }
        .s-modal-back { position: fixed; inset: 0; z-index: 90; background: rgba(5,5,12,.75); display: flex; align-items: flex-end; justify-content: center; }
        @media (min-width: 640px) { .s-modal-back { align-items: center; padding: 1.5rem; } }
        .s-modal { width: 100%; max-width: 32rem; max-height: 100dvh; overflow-y: auto; background: var(--surface-elevated); border: 1px solid var(--border-subtle); border-radius: 1.5rem 1.5rem 0 0; padding: 2rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom)); box-shadow: 0 30px 80px rgba(0,0,0,.6); animation: slideIn .3s cubic-bezier(.22,1,.36,1) both; }
        @media (min-width: 640px) { .s-modal { border-radius: 2rem 0.75rem 2rem 0.75rem; padding: 2.25rem; } }
      `}</style>

      <div className="scholarship-root flex items-start md:items-center justify-center pt-24 pb-16 px-4 sm:px-6">
        <div className="w-full max-w-2xl">

          {/* ── Course being applied for ─────────────────────────────────── */}
          <div className="s-card px-5 py-4 mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                Applying for{pathway ? ` · ${PATHWAY_LABEL[pathway]}` : ''}
              </p>
              <p className="font-semibold text-[var(--text-primary)] truncate">{courseName}</p>
            </div>
            {!(result && result.status === 'pending') && (
              <button type="button" className="s-link" onClick={() => setChanging((v) => !v)}>
                {changing ? 'Keep this course' : 'Change course'}
              </button>
            )}
          </div>

          {changing && (
            <div className="s-card p-5 md:p-6 mb-4 slide-in">
              <ScholarshipCoursePicker
                initialPathway={pathway}
                selectedCourseId={courseId as string}
                busyCourseId={opening}
                onPick={(id, p) => pickCourse(id, p)}
              />
            </div>
          )}

          {/* ── Already applied / not eligible ───────────────────────────── */}
          {blocked && (
            <div className="s-card p-8 md:p-10 slide-in text-center">
              <h2 className="s-title">
                {eligibility.reason === 'already_applied' ? 'You already have an open application' : 'You can’t apply for this course right now'}
              </h2>
              <p className="s-sub max-w-md mx-auto">
                {eligibility.reason === 'already_applied'
                  ? `${copy.alreadyAppliedMessage}${eligibility.open_course_name ? ` (Open application: ${eligibility.open_course_name}.)` : ''}`
                  : eligibility.reason === 'scholarship_already_used'
                  ? copy.alreadyUsedMessage
                  : eligibility.reason === 'course_not_found'
                  ? 'This course could not be found.'
                  : 'Something went wrong while checking your application. Please try again.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {eligibility.open_course_id && (
                  <button className="s-btn-primary" onClick={() => router.push(`/scholarships/${encodeURIComponent(eligibility.open_course_id)}`)}>
                    View my application
                  </button>
                )}
                <a className="s-btn-ghost" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Chat with Learnexity</a>
              </div>
            </div>
          )}

          {/* ── Existing application status ──────────────────────────────── */}
          {result && !showSuccess && (
            <div className="s-card p-8 md:p-10 slide-in text-center">
              {result.status === 'approved' && !result.is_used ? (
                <>
                  <p className="s-eyebrow">{copy.awardBadge}</p>
                  <h2 className="s-title">{copy.awardHeading}</h2>
                  <p className="s-sub max-w-md mx-auto">{fillCopy(copy.awardMessage, { course: courseName })}</p>
                  <button className="s-btn-primary" onClick={goPayment}>{copy.awardButton}</button>
                </>
              ) : (
                <>
                  <p className="s-eyebrow">Application under review</p>
                  <h2 className="s-title">We’ve received your scholarship application</h2>
                  <p className="s-sub max-w-md mx-auto">
                    Our team is reviewing your application for {courseName}. Please keep checking your email
                    (including spam) for our response. You can still enroll at the normal price if you don’t want to wait.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a className="s-btn-primary" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Chat with Learnexity</a>
                    <button className="s-btn-ghost" onClick={goPayment}>Pay full price instead</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── The application form ─────────────────────────────────────── */}
          {eligibility?.eligible && !result && (
            <div className="s-card p-6 sm:p-8 md:p-10 slide-in" key={`step${step}`}>
              <StepBar current={step} total={TOTAL_STEPS} />
              {eligibility.previous_status === 'rejected' && step === 1 && (
                <p className="text-sm mb-5 px-4 py-3" style={{ borderRadius: '1rem 0.4rem 1rem 0.4rem', background: `${BRAND}12`, border: `1px solid ${BRAND}33`, color: 'var(--text-primary)' }}>
                  Your previous application for this course wasn’t successful. You’re welcome to apply again — tell us more this time.
                </p>
              )}
              <p className="s-eyebrow">{copy.applicationLabel} — Question {step} of {TOTAL_STEPS}</p>

              {step === 1 && (
                <>
                  <h2 className="s-title">How many hours per week can you dedicate to this course?</h2>
                  <p className="s-sub">Be realistic — consistency matters more than ambition.</p>
                  <div className="space-y-3 mb-8" role="radiogroup">
                    {WEEKLY_HOURS_OPTIONS.map((o) => (
                      <RadioOption key={o.value} value={o.value} label={o.label} sub={o.sub} selected={answers.weekly_hours === o.value} onSelect={(v) => setAnswers((a) => ({ ...a, weekly_hours: v }))} />
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="s-title">Are you currently a student?</h2>
                  <p className="s-sub">Full-time or part-time student at any level counts.</p>
                  <div className="space-y-3 mb-8" role="radiogroup">
                    <RadioOption value="yes" label="Yes, I am a student" sub="Full-time or part-time" selected={answers.is_student === 'yes'} onSelect={(v) => setAnswers((a) => ({ ...a, is_student: v }))} />
                    <RadioOption value="no" label="No, I am not a student" selected={answers.is_student === 'no'} onSelect={(v) => setAnswers((a) => ({ ...a, is_student: v }))} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="s-title">Are you currently employed?</h2>
                  <p className="s-sub">This helps us understand your situation.</p>
                  <div className="space-y-3 mb-4" role="radiogroup">
                    <RadioOption value="no" label="No, I am not employed" selected={answers.is_employed === 'no'} onSelect={(v) => setAnswers((a) => ({ ...a, is_employed: v, salary_range: '' }))} />
                    <RadioOption value="yes" label="Yes, I am employed" selected={answers.is_employed === 'yes'} onSelect={(v) => setAnswers((a) => ({ ...a, is_employed: v }))} />
                  </div>
                  {answers.is_employed === 'yes' && (
                    <div className="mt-4 mb-6 slide-in">
                      <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">What is your monthly income range?</p>
                      <div className="space-y-3" role="radiogroup">
                        {SALARY_RANGE_OPTIONS.map((o) => (
                          <RadioOption key={o.value} value={o.value} label={o.label} selected={answers.salary_range === o.value} onSelect={(v) => setAnswers((a) => ({ ...a, salary_range: v }))} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mb-4" />
                </>
              )}

              {step === 4 && (() => {
                const det = eligibility?.detected_location as { country: string; city?: string | null } | null;
                const detLabel = det ? (det.city ? `${det.city}, ${det.country}` : det.country) : null;
                const chosen = answers.current_location || '';
                const usingDetected = !!detLabel && chosen === detLabel;
                return (
                  <>
                    <h2 className="s-title">What is your current location?</h2>
                    <p className="s-sub">Where you are living right now.</p>
                    <div className="space-y-3 mb-4" role="radiogroup">
                      {detLabel && (
                        <RadioOption
                          value={detLabel}
                          label={detLabel}
                          sub="Your location, detected from your internet connection"
                          selected={usingDetected}
                          onSelect={(v) => setAnswers((a) => ({ ...a, current_location: v }))}
                        />
                      )}
                    </div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2" htmlFor="s-country">
                      {detLabel ? 'Somewhere else? Choose your country' : 'Choose your country'}
                    </label>
                    <select
                      id="s-country"
                      className="s-input mb-2"
                      value={!usingDetected && COUNTRIES.includes(chosen) ? chosen : ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, current_location: e.target.value }))}
                    >
                      <option value="">Select a country…</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {fieldErrors.current_location && <p className="mt-2 text-sm" style={{ color: '#f87171' }}>{fieldErrors.current_location}</p>}
                    <div className="mb-6" />
                  </>
                );
              })()}

              {step === 5 && (
                <>
                  <h2 className="s-title">Why should we give you this scholarship?</h2>
                  <p className="s-sub">Tell us about your situation, what this course means to you and how you will make the most of it. At least {MIN_WORDS} words.</p>
                  <EssayField
                    value={answers.why_scholarship || ''}
                    onChange={(v) => setAnswers((a) => ({ ...a, why_scholarship: v }))}
                    placeholder="Write your answer here…"
                    error={fieldErrors.why_scholarship}
                  />
                </>
              )}

              {step === 6 && (
                <>
                  <h2 className="s-title">What is your long-term goal after graduation?</h2>
                  <p className="s-sub">Where do you see yourself, and how will this course help you get there? At least {MIN_WORDS} words.</p>
                  <EssayField
                    value={answers.long_term_goal || ''}
                    onChange={(v) => setAnswers((a) => ({ ...a, long_term_goal: v }))}
                    placeholder="Write your answer here…"
                    error={fieldErrors.long_term_goal}
                  />
                </>
              )}

              {submitError && <p className="mb-4 text-sm" style={{ color: '#f87171' }}>{submitError}</p>}

              <div className="s-nav">
                <button
                  type="button"
                  className="s-btn-ghost"
                  onClick={() => (step === 1 ? router.push(`/courses/${courseId}`) : setStep((s) => s - 1))}
                >
                  {step === 1 ? 'Cancel' : 'Back'}
                </button>
                <button
                  type="button"
                  className="s-btn-primary"
                  onClick={handleNext}
                  disabled={submitting || !stepDone(step)}
                >
                  {step === 6 ? (submitting ? 'Submitting…' : copy.submitButton) : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Success message: stays until "Close" is clicked ─────────────── */}
      {showSuccess && (
        <div className="s-modal-back" role="dialog" aria-modal="true" aria-labelledby="s-ok-title">
          <div className="s-modal text-center">
            <p className="s-eyebrow">Application submitted</p>
            <h2 id="s-ok-title" className="s-title">Thank you — your scholarship application has been received</h2>
            <p className="s-sub">
              Our team will review your application for <strong className="text-[var(--text-primary)]">{courseName}</strong> and
              send you a response by email. Please keep checking your email (including your spam folder) for a response from us.
            </p>
            <div className="flex flex-col gap-3">
              <a className="s-btn-primary w-full" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Chat with Learnexity</a>
              <button type="button" className="s-btn-ghost w-full" onClick={() => setShowSuccess(false)} autoFocus>Close</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
