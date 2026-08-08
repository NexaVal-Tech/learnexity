// pages/user/payment/[enrollmentId].tsx
//
// NOTE: this file was previously named [EnrollmentId].tsx (capital E). Next.js
// derives the router.query key from the exact bracket text in the filename,
// and that key is case-sensitive — so router.query.enrollmentId (used
// throughout this file) was ALWAYS undefined, no matter what was actually in
// the URL. That silently broke the "load the specific enrollment from the
// URL" path below and made the page always fall back to
// fetchPendingEnrollment() (whichever pending enrollment happens to be most
// recently created across ALL the user's courses) — which is why purchasing
// course B could land you looking at course A. Renaming the file to match
// the lowercase query key fixes it for real; no code changes were needed
// once the filename matched.

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { CourseEnrollment } from '@/lib/types';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { ScholarshipBadge } from '@/components/Scholarship/ScholarshipBadge';
import { DeepTechScreeningModal, DeepTechScreeningAnswers } from '@/components/modals/DeepTechScreeningModal';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type LearningTrack = 'one_on_one' | 'group_mentorship' | 'self_paced';

interface TrackOption {
  id: LearningTrack;
  name: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  popular?: boolean;
  /** If true, this track is always billed as one-time (no installment option) */
  forceOnetime?: boolean;
  /** Label override shown next to the price, e.g. "/ hour" */
  priceLabel?: string;
}

interface StripeCheckoutSession {
  id?: string;
  url?: string;
  error?: string;
}

interface Scholarship {
  id: number;
  course_id: string;
  course_name: string;
  status: 'pending' | 'approved' | 'rejected';
  discount_percentage: number;
  is_used: boolean;
  total_score: number;
  review_notes: string;
}

// ── CHANGE 1 & 2: updated track labels + one_on_one is hourly / forced onetime ──
const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'self_paced',
    name: 'Flexible (Self-Paced) + Weekly Review',
    title: 'Maximum flexibility without losing the guidance you need',
    description: 'Learn on your own schedule with full course access, and get support from our active community and team whenever you need help.',
    features: ['Learn at your own pace', 'Full course material access', 'Weekly group review sessions'],
    icon: '📚',
  },
  {
    id: 'group_mentorship',
    name: 'Live Classes',
    title: 'A collaborative, community-powered learning experience',
    description: "You'll get full access to all courses and meet weekly with an instructor for reviews, discussions, and live Q&A sessions.",
    features: ['Full access to all course materials', 'Weekly live sessions with instructor', 'Peer learning and discussions'],
    icon: '👥',
    popular: true,
  },
  {
    id: 'one_on_one',
    name: 'One-on-One Coaching',
    title: 'Our most personalized learning experience',
    description: "You'll work directly with an instructor in private, focused sessions tailored to your goals.",
    features: ['Private 1-on-1 sessions with instructor', 'Personalized learning path', 'Direct feedback and mentorship'],
    icon: '👤',
    // CHANGE 2: one_on_one is hourly, always one-time
    forceOnetime: true,
    priceLabel: '/ hr',
  },
];

// ── Inline toast ─────────────────────────────────────────────────────────────
function PaymentToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '5.5rem', right: '1rem', zIndex: 60,
      maxWidth: '22rem', width: '90%',
      background: '#dc2626', color: '#fff',
      borderRadius: '0.75rem', padding: '0.875rem 1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      animation: 'toastIn 0.3s ease both',
    }}>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
      <span style={{ fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, opacity: 0.7 }}>✕</button>
    </div>
  );
}

export default function PaymentPage() {
  const router       = useRouter();
  const { nrollmentId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [enrollment,       setEnrollment]       = useState<CourseEnrollment | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [processing,       setProcessing]       = useState(false);
  const [pageError,        setPageError]        = useState<string | null>(null);
  const [toastMessage,     setToastMessage]     = useState<string | null>(null);

  const [selectedTrack,    setSelectedTrack]    = useState<LearningTrack | null>(null);
  const [availableTracks,  setAvailableTracks]  = useState<LearningTrack[]>([]);
  // Compact "select your learning track" selector on the payment page —
  // collapsed by default, expands into the list of available tracks when
  // clicked, and collapses back once one is chosen.
  const [trackPickerOpen,  setTrackPickerOpen]  = useState(false);
  const [trackPrices,      setTrackPrices]      = useState<Record<LearningTrack, number>>({
    one_on_one: 0, group_mentorship: 0, self_paced: 0,
  });

  const [hourlyQty, setHourlyQty] = useState<number>(1);

  const [scholarship,        setScholarship]        = useState<Scholarship | null>(null);
  const [scholarshipLoading, setScholarshipLoading] = useState(false);
  const scholarshipFetchedFor = useRef<string | null>(null);

  const [paymentType,      setPaymentType]      = useState<'onetime' | 'installment'>('onetime');
  const [currency,         setCurrency]         = useState<'USD' | 'NGN'>('USD');
  const [currencyDetected, setCurrencyDetected] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [course,           setCourse]           = useState<any>(null);
  const [paymentGateway,   setPaymentGateway]   = useState<'stripe' | 'paystack'>('paystack');

  // CHANGE 3: store the course slug so "Back" can return to the course page
  const [courseSlug, setCourseSlug] = useState<string | null>(null);

  // ── Deep-tech readiness screening ──────────────────────────────────────
  // Every enrollment path (courses list, scholarship approval, dashboard
  // modal) lands here before payment, so this is the one consistent place
  // it's asked — rather than gating it separately at each entry point.
  // Soft gate: never blocks payment, just records the answers.
  const [showDeepTechScreening, setShowDeepTechScreening] = useState(false);
  const [screeningSubmitting, setScreeningSubmitting] = useState(false);
  const screeningPromptedTrackRef = useRef<string | null>(null);

  const showToast = useCallback((msg: string) => setToastMessage(msg), []);

  // CHANGE 2: whenever a track is selected, force onetime if it's one_on_one
  useEffect(() => {
    const trackDef = TRACK_OPTIONS.find(t => t.id === selectedTrack);
    if (trackDef?.forceOnetime) {
      setPaymentType('onetime');
      setHourlyQty(1); // reset when switching to hourly track
    }
  }, [selectedTrack]);

  // ── Currency / gateway detection ──────────────────────────────────────────
  useEffect(() => {
    const detectCurrency = async () => {
      // ❌ Remove these two lines — don't pre-set before detection
      // setCurrency('USD');
      // setPaymentGateway('stripe');
      // setCurrencyDetected(true);  <-- especially not this

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/detect-currency`
        );
        const data = await response.json();
        setCurrency(data.currency);
        setDetectedLocation(data.country);
        setPaymentGateway(data.currency === 'NGN' ? 'paystack' : 'stripe');
      } catch {
        // Detection failed — fall back to USD
        setCurrency('USD');
        setPaymentGateway('stripe');
        setDetectedLocation('Unknown');
      } finally {
        setCurrencyDetected(true); // ✅ Only set true AFTER detection completes
      }
    };

    detectCurrency();
  }, []);

  // ── Keep the enrollment's price in sync with the server whenever the
  // learner changes track/payment type. The enroll() endpoint is the single
  // source of truth for pricing (App\Services\PricingService on the
  // backend) — it forces the flat registration fee for an approved,
  // unused scholarship (no discount stacking, no installments), or the
  // normal track price + one-time discount otherwise. We never compute
  // the amount actually charged on the client anymore; we only display
  // whatever this sync returns.
  const [syncingPrice, setSyncingPrice] = useState(false);
  const pricingSyncKey = useRef<string | null>(null);

  const syncPricing = useCallback(async (track: LearningTrack, type: 'onetime' | 'installment', force = false) => {
    if (!enrollment) return;
    const key = `${enrollment.course_id}-${track}-${type}`;
    if (!force && pricingSyncKey.current === key) return;
    pricingSyncKey.current = key;

    setSyncingPrice(true);
    try {
      const res = await api.enrollment.enroll(String(enrollment.course_id), track, type);
      setEnrollment(prev => (prev ? {
        ...prev,
        total_amount: res.total_amount ?? prev.total_amount,
        installment_amount: res.installment_amount ?? prev.installment_amount,
        total_installments: res.total_installments ?? prev.total_installments,
        currency: res.currency ?? prev.currency,
        payment_type: res.payment_type ?? prev.payment_type,
        is_registration_fee: res.is_registration_fee ?? prev.is_registration_fee,
      } : prev));
    } catch {
      // non-critical — keep last known price; re-synced again on the next
      // change or right before payment is initiated
    } finally {
      setSyncingPrice(false);
    }
  }, [enrollment?.course_id]);

  useEffect(() => {
    if (!selectedTrack || !enrollment) return;
    const effectiveType = selectedTrack === 'one_on_one' ? 'onetime' : paymentType;
    syncPricing(selectedTrack, effectiveType);
  }, [selectedTrack, paymentType, enrollment?.course_id]);

  // Prompt the deep-tech screening once per track selection when a
  // mentorship track is chosen and this enrollment hasn't been screened yet.
  useEffect(() => {
    if (!selectedTrack || !enrollment) return;
    const isDeepTechTrack = selectedTrack === 'one_on_one' || selectedTrack === 'group_mentorship';
    if (!isDeepTechTrack) return;
    if (enrollment.deep_tech_screening_passed !== null && enrollment.deep_tech_screening_passed !== undefined) return;
    if (screeningPromptedTrackRef.current === selectedTrack) return;

    screeningPromptedTrackRef.current = selectedTrack;
    setShowDeepTechScreening(true);
  }, [selectedTrack, enrollment?.deep_tech_screening_passed]);

  const handleScreeningContinue = async (answers: DeepTechScreeningAnswers) => {
    if (!enrollment) return;
    setScreeningSubmitting(true);
    try {
      const res = await api.enrollment.submitDeepTechScreening(enrollment.id, answers);
      setEnrollment(prev => (prev ? { ...prev, deep_tech_screening_passed: res.deep_tech_screening_passed } : prev));
    } catch {
      // Soft gate — don't block the user from paying even if this fails to
      // save; just leave it unscreened rather than surfacing a hard error.
    } finally {
      setScreeningSubmitting(false);
      setShowDeepTechScreening(false);
    }
  };

  // ── Fetch scholarship ─────────────────────────────────────────────────────
  const fetchScholarship = useCallback(async (slug: string) => {
    if (!slug) return;
    if (scholarshipFetchedFor.current === slug) return;
    scholarshipFetchedFor.current = slug;

    try {
      setScholarshipLoading(true);
      const data = await api.get(`/api/scholarships/course/${slug}`);
      if (data?.scholarship?.status === 'approved' && !data.scholarship.is_used) {
        setScholarship(data.scholarship);
      } else {
        setScholarship(null);
      }
    } catch {
      // non-critical
    } finally {
      setScholarshipLoading(false);
    }
  }, []);

  const getTrackPrice = (
    courseData: Record<string, any>,
    track: LearningTrack,
    curr: 'USD' | 'NGN'
  ): number => {
    const fieldMap: Record<LearningTrack, { ngn: string; usd: string }> = {
      one_on_one:       { ngn: 'one_on_one_price_ngn',       usd: 'one_on_one_price_usd' },
      group_mentorship: { ngn: 'group_mentorship_price_ngn', usd: 'group_mentorship_price_usd' },
      self_paced:       { ngn: 'self_paced_price_ngn',       usd: 'self_paced_price_usd' },
    };
    const field = curr === 'NGN' ? fieldMap[track].ngn : fieldMap[track].usd;
    return parseFloat(courseData[field] ?? 0);
  };

  const courseTrackFetchKey = useRef<string | null>(null);

  const fetchCourseTrackDetails = useCallback(
    async (courseId: number, curr: 'USD' | 'NGN') => {
      const key = `${courseId}-${curr}`;
      if (courseTrackFetchKey.current === key) return;
      courseTrackFetchKey.current = key;

      try {
        const courseData = await api.courses.getById(courseId);
        setCourse(courseData);

        // CHANGE 3: capture the course slug for the Back button
        if (courseData.course_id) {
          setCourseSlug(courseData.course_id);
          fetchScholarship(courseData.course_id);
        }

        const tracks: LearningTrack[] = [];
        const prices: Record<LearningTrack, number> = {
          one_on_one: 0, group_mentorship: 0, self_paced: 0,
        };

        if (courseData.offers_one_on_one)       { tracks.push('one_on_one');       prices.one_on_one       = getTrackPrice(courseData, 'one_on_one',       curr); }
        if (courseData.offers_group_mentorship)  { tracks.push('group_mentorship'); prices.group_mentorship = getTrackPrice(courseData, 'group_mentorship', curr); }
        if (courseData.offers_self_paced)        { tracks.push('self_paced');       prices.self_paced       = getTrackPrice(courseData, 'self_paced',       curr); }

        if (tracks.length === 0) {
          setPageError('This course has no learning tracks configured. Please contact support.');
          setAvailableTracks([]);
          setTrackPrices(prices);
          return;
        }

        const hasValidPrice = tracks.some(t => prices[t] > 0);
        if (!hasValidPrice) {
          setPageError(`Course pricing is not configured for ${curr}. Please contact support.`);
        }

        setAvailableTracks(tracks);
        setTrackPrices(prices);
        if (tracks.length === 1) setSelectedTrack(tracks[0]);

      } catch {
        setPageError('Failed to load course pricing. Please refresh the page.');
      }
    },
    [fetchScholarship]
  );

  useEffect(() => {
    if (!enrollment || !currencyDetected) return;
    courseTrackFetchKey.current = null;
    fetchCourseTrackDetails(enrollment.course_id, currency);
  }, [currency]);

  const fetchPendingEnrollment = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);

      const response        = await api.enrollment.getUserEnrollments();
      const pendingEnrollments = response.enrollments.filter(
        (e: CourseEnrollment) => e.payment_status === 'pending'
      );

      if (pendingEnrollments.length === 0) {
        showToast('No pending enrollment found. Please enroll in a course first.');
        router.push('/user/dashboard');
        return;
      }

      const recentPending = [...pendingEnrollments].sort(
        (a: CourseEnrollment, b: CourseEnrollment) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];

      router.replace(`/user/payment/${recentPending.id}`, undefined, { shallow: true });
      setEnrollment(recentPending);
      await fetchCourseTrackDetails(recentPending.course_id, currency);
    } catch {
      setPageError('Failed to load payment details');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchCourseTrackDetails, currency, router]);

  const fetchEnrollmentDetails = useCallback(async () => {
    const id = router.query.enrollmentId; // ← read fresh from router
    if (!id || typeof id !== 'string') return;

    try {
      setLoading(true);
      setPageError(null);

      const response = await api.enrollment.getUserEnrollments();
      const found = response.enrollments.find(
        (e: CourseEnrollment) => e.id === Number(id) // ← use fresh id
      );

      if (!found) {
        setPageError('Enrollment not found');
        router.push('/user/dashboard');
        return;
      }

      if (found.payment_status === 'completed') {
        showToast('This course is already paid for!');
        router.push('/user/dashboard?tab=your-course');
        return;
      }

      setEnrollment(found);
      await fetchCourseTrackDetails(found.course_id, currency);
    } catch {
      setPageError('Failed to load payment details. Please refresh the page.');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchCourseTrackDetails, currency, router]);

  useEffect(() => {
    if (authLoading)       return;
    if (!user)             { router.push('/user/auth/login'); return; }
    if (!router.isReady)   return;
    if (!currencyDetected) return;

    // ✅ Don't trust enrollmentId until router.isReady AND it's a non-empty string
    const id = router.query.enrollmentId;

    if (!id || typeof id !== 'string') {
      // Only fall back to fetchPendingEnrollment if the URL
      // genuinely has no enrollmentId segment (e.g. /user/payment)
      // NOT when the param just hasn't hydrated yet
      if (router.isReady && !id) {
        fetchPendingEnrollment();
      }
      return;
    }

    fetchEnrollmentDetails();
  }, [router.isReady, router.query.enrollmentId, user, authLoading, currencyDetected]);

  // Full-tuition scholarship: one flat registration fee, always paid in
  // full, no installments, no other discount — this is the single flag
  // the whole page branches on. Sourced from the synced enrollment record
  // (server truth) once available, falling back to the scholarship lookup
  // before the first sync completes so the UI doesn't flash the wrong state.
  const isRegistrationFee = enrollment?.is_registration_fee ??
    (!!scholarship && !scholarship.is_used && Number(scholarship.discount_percentage) >= 100);

  // Partial scholarship (e.g. 50% off) — normal payment flow still applies
  // (track selection, installments), just at a discounted price. Sourced the
  // same way as isRegistrationFee: server truth once synced, scholarship
  // lookup as a fallback before the first sync.
  const isPartialScholarship = enrollment
    ? (!enrollment.is_registration_fee && !!scholarship && !scholarship.is_used && Number(scholarship.discount_percentage) > 0 && Number(scholarship.discount_percentage) < 100)
    : (!!scholarship && !scholarship.is_used && Number(scholarship.discount_percentage) > 0 && Number(scholarship.discount_percentage) < 100);

  // Force one-time when a scholarship applies — installments aren't offered.
  useEffect(() => {
    if (isRegistrationFee) setPaymentType('onetime');
  }, [isRegistrationFee]);

  // ── Price helpers ─────────────────────────────────────────────────────────
  // The amount actually charged always comes from the enrollment record,
  // which the server (PricingService) computes and syncPricing() keeps
  // fresh. trackPrices/onetime-discount below are used only to render the
  // "original price" strikethrough for non-scholarship learners — never to
  // compute what gets charged.
  const getOnetimeDiscount = (): number => {
    if (!course || isRegistrationFee) return 0;
    // A scholarship discount never stacks with the course's own one-time
    // discount — the scholarship percentage is the only discount applied.
    if (isPartialScholarship) return 0;
    // one_on_one track never gets a "one-time" discount — it's already per-hour
    if (selectedTrack === 'one_on_one') return 0;
    return parseFloat(currency === 'NGN' ? course.onetime_discount_ngn : course.onetime_discount_usd) || 0;
  };

  const getCurrentPrice = (): number => {
    if (!selectedTrack || !enrollment) return 0;

    if (isRegistrationFee) {
      // Flat fee regardless of track or hour count.
      return enrollment.total_amount ?? 0;
    }

    if (selectedTrack === 'one_on_one') {
      return (enrollment.total_amount ?? 0) * hourlyQty;
    }

    if (paymentType === 'installment') {
      return enrollment.installment_amount ?? 0;
    }

    return enrollment.total_amount ?? 0;
  };

  const getInstallmentMonthlyPrice = (): number => {
    if (!selectedTrack || selectedTrack === 'one_on_one' || isRegistrationFee) return 0;
    return enrollment?.installment_amount ?? 0;
  };

  // ── Stripe payment ────────────────────────────────────────────────────────
  const handleStripePayment = async () => {
    if (!selectedTrack)           { showToast('Please select a learning track before proceeding.'); return; }
    if (!user?.email || !enrollment) { showToast('Missing payment information. Please try again.'); return; }

    setProcessing(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const effectivePaymentType = isRegistrationFee ? 'onetime' : (selectedTrack === 'one_on_one' ? 'onetime' : paymentType);

      // Force a fresh price sync right before charging — Stripe recalculates
      // server-side from this same enrollment anyway (belt and suspenders),
      // but this keeps the record itself current too.
      await syncPricing(selectedTrack, effectivePaymentType, true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            enrollment_id:  enrollment.id,
            course_id:      enrollment.course_id,
            course_name:    enrollment.course_name,
            learning_track: selectedTrack,
            payment_type:   effectivePaymentType,
            currency:       'usd',
            user_email:     user.email,
            user_name:      user.name,
            scholarship_id: scholarship?.id ?? null,
            hours: selectedTrack === 'one_on_one' ? hourlyQty : 1,
          }),
        }
      );

      const session: StripeCheckoutSession = await response.json();
      if (session.error) throw new Error(session.error);
      if (session.url)   { window.location.replace(session.url); return; }
      throw new Error('No checkout URL received from server');
    } catch (err: any) {
      showToast('Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  // ── Paystack payment ──────────────────────────────────────────────────────
  const handlePaystackPayment = async () => {
    if (!selectedTrack)  { showToast('Please select a learning track before proceeding.'); return; }
    if (!user?.email)    { showToast('User email is required. Please log in again.'); router.push('/user/auth/login'); return; }
    if (!enrollment)     { showToast('Enrollment information missing. Please try again.'); router.push('/user/dashboard'); return; }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) { showToast('Paystack is not configured. Please contact support.'); return; }

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop)    { showToast('Paystack failed to load. Please refresh and try again.'); return; }

    setProcessing(true);

    const effectivePaymentType = isRegistrationFee ? 'onetime' : (selectedTrack === 'one_on_one' ? 'onetime' : paymentType);

    // Force a fresh price sync right before charging so the amount handed
    // to the Paystack widget is never a stale client-side number — this is
    // the actual value the enrollment record says is owed, straight from
    // PricingService on the backend.
    await syncPricing(selectedTrack, effectivePaymentType, true);
    const amountToCharge = getCurrentPrice();

    if (!amountToCharge || amountToCharge <= 0) {
      showToast('Could not confirm the payment amount. Please refresh and try again.');
      setProcessing(false);
      return;
    }

    const handler = PaystackPop.setup({
      key:      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email:    user.email,
      amount:   Math.round(amountToCharge * 100),
      ref:      `PAY-${crypto.randomUUID().replace(/-/g, '').substring(0, 20).toUpperCase()}`,
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      metadata: {
        enrollment_id:  enrollment.id,
        course_id:      enrollment.course_id,
        course_name:    enrollment.course_name,
        user_id:        user.id,
        learning_track: selectedTrack,
        payment_type:   effectivePaymentType,
        currency:       currency,
        scholarship_id: scholarship?.id ?? null,
        custom_fields: [
          { display_name: 'Course Name',    variable_name: 'course_name',    value: enrollment.course_name },
          { display_name: 'User Name',      variable_name: 'user_name',      value: user.name },
          { display_name: 'Learning Track', variable_name: 'learning_track', value: TRACK_OPTIONS.find(t => t.id === selectedTrack)?.name || selectedTrack },
          { display_name: 'Payment Type',   variable_name: 'payment_type',   value: effectivePaymentType === 'onetime' ? 'One-Time Payment' : 'Installment (1 of 4)' },
        ],
      },
      callback: (response: any) => {
        api.post(
          `/api/courses/enrollments/${enrollment.id}/verify-payment`,
          { reference: response.reference }
        ).catch((err: any) => console.error('verify-payment failed:', err));

        window.location.replace(
          `${window.location.origin}/user/dashboard?tab=your-course&payment=success`
        );
      },
      onClose: () => setProcessing(false),
    });

    handler.openIframe();
  };

  const handlePayment = () => {
    paymentGateway === 'stripe' ? handleStripePayment() : handlePaystackPayment();
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (authLoading || !currencyDetected || loading) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4" />
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (pageError || !enrollment) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{pageError || 'Enrollment not found'}</h2>
          <p className="text-gray-600 mb-6">We couldn't load your enrollment details. Please try again.</p>
          <button onClick={() => router.push('/user/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  const onetimeDiscountPercent = getOnetimeDiscount();

  // CHANGE 3: Back goes to course page if slug known, else browser back
  const handleBack = () => {
    if (courseSlug) {
      router.push(`/courses/${courseSlug}`);
    } else {
      router.back();
    }
  };

  // Helper to get the track option definition
  const selectedTrackDef = TRACK_OPTIONS.find(t => t.id === selectedTrack);
  const isHourlyTrack = selectedTrackDef?.forceOnetime && selectedTrackDef?.priceLabel;

  const trackPrice = (id: LearningTrack) =>
    isRegistrationFee ? (enrollment?.total_amount ?? 0) : trackPrices[id];

  return (
    <UserDashboardLayout>
      {toastMessage && (
        <PaymentToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-8 mt-16 pb-10 overflow-x-hidden">
        <button onClick={handleBack}
          className="mb-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors">
          ← Back
        </button>

        {/* learning track     mmm */}
        <h1 className="text-lg font-bold text-black mb-4">Complete Your Payment</h1>

        {/* ── Single compact Order Summary card — everything lives here ── */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-black uppercase tracking-wide">Order Summary</h2>

          {/* Course */}
          <div className="flex justify-between items-start text-sm border-b border-gray-200 pb-3">
            <span className="text-gray-500">Course</span>
            <span className="font-semibold text-black text-right max-w-[65%]">{enrollment.course_name}</span>
          </div>

          {/* Scholarship / registration-fee notice — right under Course, before everything else */}
          {isRegistrationFee && (
            <div className="space-y-2 border-b border-gray-200 pb-3">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 leading-snug">
                You've been awarded a full-tuition scholarship — you only pay the registration fee below, in one payment. Installments and course pricing don't apply.
              </div>
              <div className="border border-green-200 bg-green-50 rounded-lg px-3 py-2">
                <p className="text-xs font-bold text-black">Registration Fee Payment</p>
                <p className="text-xs text-gray-600 mb-1">One payment secures your spot — no discounts or installments apply.</p>
                <p className="text-base font-bold text-green-700">
                  {currency === 'NGN' ? '₦' : '$'}{(enrollment?.total_amount ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Partial scholarship notice — normal payment flow still applies, just discounted */}
          {isPartialScholarship && (
            <div className="border-b border-gray-200 pb-3">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800 leading-snug">
                You've been awarded a {Number(scholarship?.discount_percentage) || 0}% scholarship — it's applied automatically to the price below. Pick your learning track and payment plan as normal.
              </div>
            </div>
          )}

          {/* ── Learning Track: collapsed selector → expands to a compact list ── */}
          <div className="border-b border-gray-200 pb-3">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Learning Track</span>
              {selectedTrack && availableTracks.length > 1 && (
                <button
                  onClick={() => setTrackPickerOpen(o => !o)}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  {trackPickerOpen ? 'Close' : 'Change'}
                </button>
              )}
            </div>

            {selectedTrack && !trackPickerOpen ? (
              <div className="flex justify-between items-center">
                <span className="font-semibold text-black text-sm">{selectedTrackDef?.name}</span>
                <span className="font-semibold text-indigo-600 text-sm">
                  {currency === 'NGN' ? '₦' : '$'}{trackPrice(selectedTrack)?.toLocaleString()}
                  {selectedTrackDef?.priceLabel}
                </span>
              </div>
            ) : availableTracks.length === 0 ? (
              <p className="text-xs text-gray-400">Loading learning tracks...</p>
            ) : (
              <button
                onClick={() => setTrackPickerOpen(true)}
                className="w-full flex justify-between items-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                Select your learning track
                <ArrowIcon />
              </button>
            )}

            {trackPickerOpen && (
              <div className="mt-2 space-y-1.5">
                {TRACK_OPTIONS.filter(t => availableTracks.includes(t.id)).map(track => (
                  <button
                    key={track.id}
                    onClick={() => { setSelectedTrack(track.id); setTrackPickerOpen(false); }}
                    className={`w-full flex justify-between items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors border ${
                      selectedTrack === track.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="font-semibold text-black block truncate">
                        {track.name}
                        {track.popular && <span className="ml-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">POPULAR</span>}
                      </span>
                    </span>
                    <span className="font-semibold text-indigo-600 flex-shrink-0 text-xs">
                      {currency === 'NGN' ? '₦' : '$'}{trackPrice(track.id)?.toLocaleString()}{track.priceLabel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hourly quantity — compact inline stepper, one_on_one only */}
          {selectedTrack === 'one_on_one' && !trackPickerOpen && (
            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
              <span className="text-gray-500">Hours</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHourlyQty(q => Math.max(1, q - 1))}
                  className="w-6 h-6 rounded-full border border-indigo-300 text-indigo-600 font-bold text-sm flex items-center justify-center hover:bg-indigo-50"
                >−</button>
                <span className="w-5 text-center font-semibold text-black">{hourlyQty}</span>
                <button
                  onClick={() => setHourlyQty(q => Math.min(20, q + 1))}
                  className="w-6 h-6 rounded-full border border-indigo-300 text-indigo-600 font-bold text-sm flex items-center justify-center hover:bg-indigo-50"
                >+</button>
              </div>
            </div>
          )}

          {/* ── Payment Method: one-line segmented toggle ── */}
          {selectedTrack && !isRegistrationFee && !isHourlyTrack && !trackPickerOpen && (
            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3">
              <span className="text-gray-500">Payment Method</span>
              <div className="flex bg-gray-200 rounded-full p-0.5">
                <button
                  onClick={() => setPaymentType('onetime')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    paymentType === 'onetime' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setPaymentType('installment')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    paymentType === 'installment' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Installments
                </button>
              </div>
            </div>
          )}

          {/* Hourly notice */}
          {!isRegistrationFee && isHourlyTrack && !trackPickerOpen && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Billed per hour, one-time payment only.
            </p>
          )}

          {/* Installment note */}
          {paymentType === 'installment' && selectedTrack && selectedTrack !== 'one_on_one' && !isRegistrationFee && !trackPickerOpen && (
            <p className="text-xs text-black bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              Split into 4 monthly payments · must pay on time to keep access.
            </p>
          )}

          {/* ── Price breakdown ── */}
          {!trackPickerOpen && (
            <div className="space-y-1 pt-1">
              {!isRegistrationFee && selectedTrack && selectedTrack !== 'one_on_one' && onetimeDiscountPercent > 0 && paymentType === 'onetime' && (
                <>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Track price</span>
                    <span className="line-through">
                      {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack]?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600">
                    <span>{onetimeDiscountPercent}% one-time discount</span>
                    <span>
                      -{currency === 'NGN' ? '₦' : '$'}
                      {Math.round(trackPrices[selectedTrack] * onetimeDiscountPercent / 100).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              {isPartialScholarship && selectedTrack && selectedTrack !== 'one_on_one' && (
                <>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Track price</span>
                    <span className="line-through">
                      {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack]?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600">
                    <span>{scholarship?.discount_percentage}% scholarship discount</span>
                    <span>
                      -{currency === 'NGN' ? '₦' : '$'}
                      {Math.round(trackPrices[selectedTrack] * (Number(scholarship?.discount_percentage) || 0) / 100).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              {selectedTrack === 'one_on_one' && (
                <div className="text-xs text-gray-500">
                  {isPartialScholarship ? (
                    <>
                      <span className="line-through mr-1">{currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack]?.toLocaleString()}</span>
                      <span className="text-green-600 font-semibold">
                        {currency === 'NGN' ? '₦' : '$'}{Math.round(trackPrices[selectedTrack] * (1 - (Number(scholarship?.discount_percentage) || 0) / 100)).toLocaleString()}/hr
                      </span>
                      {' '}× {hourlyQty} hr{hourlyQty > 1 ? 's' : ''} ({scholarship?.discount_percentage}% scholarship)
                    </>
                  ) : (
                    <>{currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack]?.toLocaleString()}/hr × {hourlyQty} hr{hourlyQty > 1 ? 's' : ''}</>
                  )}
                </div>
              )}

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-black">
                  {selectedTrack === 'one_on_one'
                    ? `Total (${hourlyQty} hr${hourlyQty > 1 ? 's' : ''})`
                    : paymentType === 'installment' ? 'Pay Now' : 'Total'}
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {currency === 'NGN' ? '₦' : '$'}{getCurrentPrice().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* ── Pay button + Scholarship CTA ── */}
          {!trackPickerOpen && (
            <div className="flex items-stretch gap-2 pt-1">
              <button onClick={handlePayment} disabled={processing || !selectedTrack}
                className="flex-1 font-semibold py-2.5 px-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#0a0a0a] text-white border border-white/10">
                  {processing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="text-sm font-bold">Processing...</span>
                    </>
                  ) : !selectedTrack ? (
                    <span className="text-sm font-bold">Select a Track</span>
                  ) : (
                    <span className="text-sm font-bold">
                      Pay {currency === 'NGN' ? '₦' : '$'}{getCurrentPrice().toLocaleString()}
                      {isHourlyTrack ? '/hr' : ''} · {paymentGateway === 'stripe' ? 'Stripe' : 'Paystack'}
                    </span>
                  )}
              </button>

              {!isRegistrationFee && course && (
                <div className="flex-shrink-0">
                  <ScholarshipBadge courseId={course.course_id} isLoggedIn={true} showCta={true} />
                </div>
              )}
            </div>
          )}

          {!trackPickerOpen && (
            <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 pt-1">
              <span>🔒 Secure payment</span>
              <span>·</span>
              <span>🛡️ 256-bit encryption</span>
            </div>
          )}
        </div>
      </div>

      {showDeepTechScreening && enrollment && (
        <DeepTechScreeningModal
          courseTitle={enrollment.course_name}
          submitting={screeningSubmitting}
          onContinue={handleScreeningContinue}
          onCancel={() => setShowDeepTechScreening(false)}
        />
      )}
    </UserDashboardLayout>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}