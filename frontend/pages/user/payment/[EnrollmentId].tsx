// pages/user/payment/[EnrollmentId].tsx

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { CourseEnrollment } from '@/lib/types';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { ScholarshipBadge } from '@/components/Scholarship/ScholarshipBadge';
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
    name: 'Group Mentorship Program',
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
  const { enrollmentId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [enrollment,       setEnrollment]       = useState<CourseEnrollment | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [processing,       setProcessing]       = useState(false);
  const [pageError,        setPageError]        = useState<string | null>(null);
  const [toastMessage,     setToastMessage]     = useState<string | null>(null);

  const [selectedTrack,    setSelectedTrack]    = useState<LearningTrack | null>(null);
  const [availableTracks,  setAvailableTracks]  = useState<LearningTrack[]>([]);
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
      setCurrency('USD');
      setPaymentGateway('stripe');
      setCurrencyDetected(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/detect-currency`
        );
        const data = await response.json();
        setCurrency(data.currency);
        setDetectedLocation(data.country);
        setPaymentGateway(data.currency === 'NGN' ? 'paystack' : 'stripe');
      } catch {
        setDetectedLocation('Unknown');
      }
    };
    detectCurrency();
  }, []);

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
    try {
      setLoading(true);
      setPageError(null);

      const response = await api.enrollment.getUserEnrollments();
      const found    = response.enrollments.find(
        (e: CourseEnrollment) => e.id === Number(enrollmentId)
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
  }, [enrollmentId, fetchCourseTrackDetails, currency, router]);

  useEffect(() => {
    if (authLoading)          return;
    if (!user)                { router.push('/user/auth/login'); return; }
    if (!router.isReady)      return;
    if (!currencyDetected)    return;

    if (!enrollmentId) {
      fetchPendingEnrollment();
    } else if (typeof enrollmentId === 'string') {
      fetchEnrollmentDetails();
    } else {
      setPageError('Invalid enrollment ID');
      setLoading(false);
    }
  }, [router.isReady, enrollmentId, user, authLoading, currencyDetected]);

  // Force one-time when scholarship active
  useEffect(() => {
    if (scholarship && !scholarship.is_used) setPaymentType('onetime');
  }, [scholarship]);

  // ── Price helpers ─────────────────────────────────────────────────────────
  const getOnetimeDiscount = (): number => {
    if (!course) return 0;
    // one_on_one track never gets a "one-time" discount — it's already per-hour
    if (selectedTrack === 'one_on_one') return 0;
    return parseFloat(currency === 'NGN' ? course.onetime_discount_ngn : course.onetime_discount_usd) || 0;
  };

  const getFullDiscountedPrice = (track: LearningTrack): number => {
    let price = trackPrices[track] || 0;
    // Skip onetime discount for hourly track
    if (track !== 'one_on_one') {
      const discountPercent = parseFloat(currency === 'NGN' ? course?.onetime_discount_ngn : course?.onetime_discount_usd) || 0;
      if (paymentType === 'onetime' && discountPercent > 0) {
        price = Math.max(0, Math.round(price * (1 - discountPercent / 100)));
      }
    }
    if (scholarship && !scholarship.is_used) {
      price = Math.max(0, Math.round(price * (1 - scholarship.discount_percentage / 100)));
    }
    return price;
  };

  const getCurrentPrice = (): number => {
    if (!selectedTrack) return 0;
    let price = trackPrices[selectedTrack] || 0;

    if (selectedTrack === 'one_on_one') {
      // hourly: no discounts, just multiply by qty
      if (scholarship && !scholarship.is_used) {
        price = Math.max(0, Math.round(price * (1 - scholarship.discount_percentage / 100)));
      }
      return price * hourlyQty;
    }

    if (paymentType === 'onetime') {
      const d = getOnetimeDiscount();
      if (d > 0) price = Math.max(0, Math.round(price * (1 - d / 100)));
    }
    if (scholarship && !scholarship.is_used) {
      price = Math.max(0, Math.round(price * (1 - scholarship.discount_percentage / 100)));
    }
    if (paymentType === 'installment') price = Math.round(price / 4);
    return price;
  };

  const getInstallmentMonthlyPrice = (): number => {
    if (!selectedTrack || selectedTrack === 'one_on_one') return 0;
    let base = trackPrices[selectedTrack] || 0;
    const d = getOnetimeDiscount();
    if (d > 0) base = Math.max(0, Math.round(base * (1 - d / 100)));
    return Math.round(base / 4);
  };

  // ── Stripe payment ────────────────────────────────────────────────────────
  const handleStripePayment = async () => {
    if (!selectedTrack)           { showToast('Please select a learning track before proceeding.'); return; }
    if (!user?.email || !enrollment) { showToast('Missing payment information. Please try again.'); return; }

    setProcessing(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const effectivePaymentType = selectedTrack === 'one_on_one' ? 'onetime' : paymentType;

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
  const handlePaystackPayment = () => {
    if (!selectedTrack)  { showToast('Please select a learning track before proceeding.'); return; }
    if (!user?.email)    { showToast('User email is required. Please log in again.'); router.push('/user/auth/login'); return; }
    if (!enrollment)     { showToast('Enrollment information missing. Please try again.'); router.push('/user/dashboard'); return; }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) { showToast('Paystack is not configured. Please contact support.'); return; }

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop)    { showToast('Paystack failed to load. Please refresh and try again.'); return; }

    setProcessing(true);

    const effectivePaymentType = selectedTrack === 'one_on_one' ? 'onetime' : paymentType;

    const handler = PaystackPop.setup({
      key:      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email:    user.email,
      amount:   Math.round(getCurrentPrice() * 100),
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

  const onetimeDiscountPercent    = getOnetimeDiscount();
  const priceAfterOnetimeDiscount = selectedTrack
    ? Math.max(0, Math.round(trackPrices[selectedTrack] * (1 - onetimeDiscountPercent / 100)))
    : 0;
  const priceAfterAllDiscounts    = selectedTrack ? getFullDiscountedPrice(selectedTrack) : 0;

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

      <div className="max-w-[1550px] mx-auto px-4 md:px-8 pt-5 mt-20 overflow-x-hidden">
        {/* CHANGE 3: back button now goes to course page */}
        <button onClick={handleBack}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors">
          ← Back
        </button>

        {/* CHANGE 4: all heading/label text is black */}
        <h1 className="text-3xl font-bold text-black mb-2">Complete Your Payment</h1>
        <p className="text-black mb-8">Select your learning track and payment method</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* STEP 1: Learning Track */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                {/* CHANGE 4: black text */}
                <h2 className="text-2xl font-bold text-black">Choose Your Learning Track</h2>
              </div>

              {availableTracks.length > 0 ? (
                <div className="space-y-4">
                  {TRACK_OPTIONS.filter(track => availableTracks.includes(track.id)).map(track => (
                    <div key={track.id} onClick={() => setSelectedTrack(track.id)}
                      className={`relative border-2 rounded-2xl p-2 cursor-pointer transition-all ${
                        selectedTrack === track.id
                          ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}>
                      {track.popular && (
                        <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            {/* CHANGE 4: track name black */}
                            <h3 className="text-xl font-bold text-black">{track.name}</h3>
                            <div className="text-right">
                              {scholarship && !scholarship.is_used ? (
                                <div>
                                  <div className="text-sm text-gray-400 line-through">
                                    {currency === 'NGN' ? '₦' : '$'}{trackPrices[track.id]?.toLocaleString()}
                                    {track.priceLabel && <span className="text-xs">{track.priceLabel}</span>}
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">
                                    {currency === 'NGN' ? '₦' : '$'}
                                    {Math.max(0, Math.round(
                                      (trackPrices[track.id] * (1 - onetimeDiscountPercent / 100))
                                      * (1 - scholarship.discount_percentage / 100)
                                    )).toLocaleString()}
                                    {track.priceLabel && <span className="text-sm font-normal text-gray-900">{track.priceLabel}</span>}
                                  </div>
                                  <div className="text-xs font-bold text-gray-600">
                                    {scholarship.discount_percentage}% scholarship
                                    {onetimeDiscountPercent > 0 && ` + ${onetimeDiscountPercent}% off`}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-2xl font-bold text-gray-900">
                                  {currency === 'NGN' ? '₦' : '$'}{trackPrices[track.id]?.toLocaleString()}
                                  {track.priceLabel && <span className="text-sm font-normal text-gray-600 ml-1">{track.priceLabel}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* CHANGE 4: track.title keeps its indigo colour, everything else black */}
                          <p className="text-sm font-semibold text-indigo-600 mb-2">{track.title}</p>
                          {/* CHANGE 2: hourly badge for one_on_one */}
                          {track.forceOnetime && (
                            <span className="inline-block text-xs font-bold text-gray-600 px-2 py-0.5 rounded-full mb-1">
                              Billed per hour · One-time
                            </span>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedTrack === track.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {selectedTrack === track.id && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-black">Loading learning tracks...</p>
                </div>
              )}
            </div>

            {/* STEP 2: Payment Method */}
            {selectedTrack && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  {/* CHANGE 4: black */}
                  <h2 className="text-2xl font-bold text-black">Choose Payment Method</h2>
                </div>

                {/* CHANGE 2: notice for hourly track */}
                {isHourlyTrack && (
                  <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                    <p>One-on-One Coaching is billed hourly. The price shown is per session hour — one-time payment only.</p>
                  </div>
                )}

                {scholarship && !scholarship.is_used && (
                  <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                    <p>Scholarship recipients must pay in full (one-time). Installments are not available.</p>
                  </div>
                )}

                {/* CHANGE 2: hide payment type selector entirely for hourly track */}
                {isHourlyTrack ? (
                  <div className="border-2 border-indigo-600 bg-indigo-50 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black mb-2">Hourly Session Payment</h3>
                        <p className="text-black text-sm mb-4">Pay per coaching hour — no long-term commitment required</p>

                        {/* Hour quantity picker */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm font-semibold text-black">Number of hours:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setHourlyQty(q => Math.max(1, q - 1))}
                              className="w-8 h-8 rounded-full border-2 border-indigo-600 text-indigo-600 font-bold text-lg flex items-center justify-center hover:bg-indigo-50 transition-colors"
                            >−</button>
                            <span className="w-8 text-center text-lg font-bold text-black">{hourlyQty}</span>
                            <button
                              onClick={() => setHourlyQty(q => Math.min(20, q + 1))}
                              className="w-8 h-8 rounded-full border-2 border-indigo-600 text-indigo-600 font-bold text-lg flex items-center justify-center hover:bg-indigo-50 transition-colors"
                            >+</button>
                          </div>
                        </div>

                        <div className="text-2xl font-bold text-green-600">
                          {currency === 'NGN' ? '₦' : '$'}{getCurrentPrice().toLocaleString()}
                          <span className="text-sm font-normal text-black ml-1">
                            ({hourlyQty} hr{hourlyQty > 1 ? 's' : ''} × {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack].toLocaleString()}/hr)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">

                    {/* One-Time Payment card */}
                    <button onClick={() => setPaymentType('onetime')}
                      className={`relative border-2 rounded-2xl p-6 text-left transition-all ${
                        paymentType === 'onetime'
                          ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}>
                      {paymentType === 'onetime' && (
                        <div className="absolute -top-3 right-6 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">SAVE MORE</div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-black mb-2">One-Time Payment</h3>
                          <p className="text-black text-sm mb-3">Pay the full amount upfront and get a discount</p>
                          <div className="space-y-1">
                            {scholarship && !scholarship.is_used ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400 line-through">
                                    {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack].toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-gray-600 bg-green-100 px-2 py-0.5 rounded">
                                    {onetimeDiscountPercent > 0 && `${onetimeDiscountPercent}% off + `}{scholarship.discount_percentage}% scholarship
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-600">
                                  {currency === 'NGN' ? '₦' : '$'}{priceAfterAllDiscounts.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-700">
                                  You save {currency === 'NGN' ? '₦' : '$'}
                                  {(trackPrices[selectedTrack] - priceAfterAllDiscounts).toLocaleString()}
                                </p>
                              </>
                            ) : onetimeDiscountPercent > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400 line-through">
                                    {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack].toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-gray-600 bg-green-100 px-2 py-0.5 rounded">
                                    {onetimeDiscountPercent}% OFF
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-600">
                                  {currency === 'NGN' ? '₦' : '$'}{priceAfterOnetimeDiscount.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-700">
                                  You save {currency === 'NGN' ? '₦' : '$'}
                                  {(trackPrices[selectedTrack] - priceAfterOnetimeDiscount).toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <div className="text-2xl font-bold text-gray-600">
                                {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack].toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentType === 'onetime' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}>
                          {paymentType === 'onetime' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Installment Payment card */}
                    {(!scholarship || scholarship.is_used) && (
                      <button onClick={() => setPaymentType('installment')}
                        className={`relative border-2 rounded-2xl p-6 text-left transition-all ${
                          paymentType === 'installment'
                            ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                        }`}>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-black mb-2">Installment Payment</h3>
                            <p className="text-black text-sm mb-3">Split payment across 4 months</p>
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              {currency === 'NGN' ? '₦' : '$'}
                              {getInstallmentMonthlyPrice().toLocaleString()}
                              <span className="text-sm font-normal text-black">/month × 4</span>
                            </div>
                            <p className="text-xs text-black bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                              Must pay on time each month to maintain access
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentType === 'installment' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                          }`}>
                            {paymentType === 'installment' && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right Column: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-2 sticky top-24">
              {/* CHANGE 4: black */}
              <h2 className="text-xl font-bold text-black mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-black">Course:</span>
                  <span className="font-semibold text-black text-right max-w-[60%]">{enrollment.course_name}</span>
                </div>
                {selectedTrack && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black">Learning Track:</span>
                    <span className="font-semibold text-black text-right max-w-[60%]">
                      {TRACK_OPTIONS.find(t => t.id === selectedTrack)?.name}
                    </span>
                  </div>
                )}
                {selectedTrack === 'one_on_one' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black">Billing:</span>
                    <span className="font-semibold text-black">Hourly · One-time</span>
                  </div>
                )}
                {paymentType === 'installment' && selectedTrack !== 'one_on_one' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black">Payment Type:</span>
                    <span className="font-semibold text-black">Installment (1 of 4)</span>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-3 mt-3 space-y-1">
                  {selectedTrack && selectedTrack !== 'one_on_one' && (onetimeDiscountPercent > 0 || (scholarship && !scholarship.is_used)) && paymentType === 'onetime' && (
                    <>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Track price:</span>
                        <span className="line-through">
                          {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack]?.toLocaleString()}
                        </span>
                      </div>
                      {onetimeDiscountPercent > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{onetimeDiscountPercent}% one-time discount:</span>
                          <span>
                            -{currency === 'NGN' ? '₦' : '$'}
                            {Math.round(trackPrices[selectedTrack] * onetimeDiscountPercent / 100).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {scholarship && !scholarship.is_used && (
                        <div className="flex justify-between text-sm text-green-600 font-semibold">
                          <span>{scholarship.discount_percentage}% scholarship:</span>
                          <span>
                            -{currency === 'NGN' ? '₦' : '$'}
                            {Math.round(priceAfterOnetimeDiscount * scholarship.discount_percentage / 100).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Replace the existing "Per Hour:" total row */}
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-black">
                      {selectedTrack === 'one_on_one'
                        ? `Total (${hourlyQty} hr${hourlyQty > 1 ? 's' : ''}):`
                        : paymentType === 'installment' ? 'Pay Now:' : 'Total:'}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {currency === 'NGN' ? '₦' : '$'}{getCurrentPrice().toLocaleString()}
                    </span>
                  </div>

                  {/* Add rate breakdown line below for hourly */}
                  {selectedTrack === 'one_on_one' && (
                    <div className="text-xs text-gray-500">
                      {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack]?.toLocaleString()}/hr × {hourlyQty} hr{hourlyQty > 1 ? 's' : ''}
                    </div>
                  )}
                  {paymentType === 'installment' && selectedTrack && selectedTrack !== 'one_on_one' && (
                    <div className="text-xs text-black">
                      Full price: {currency === 'NGN' ? '₦' : '$'}{trackPrices[selectedTrack].toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* CHANGE 4: Pay button + Scholarship CTA stacked in deep black container */}
              <div
                style={{ borderRadius: '1rem', padding: '1rem', display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '0.75rem' }}
              >
                <button onClick={handlePayment} disabled={processing || !selectedTrack}
                  className="flex-1 font-semibold py-3 px-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: '#0a0a0a', color: '#ffffff', border: '1px solid rgb(255, 255, 255)', borderRadius: '0.75rem', }}>
                    {processing ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="text-white text-sm font-bold">Processing...</span>
                      </>
                    ) : !selectedTrack ? (
                      <span className="text-white text-sm font-bold">Select a Track</span>
                    ) : (
                      <span className="text-white text-sm font-bold">
                        Pay {currency === 'NGN' ? '₦' : '$'}{getCurrentPrice().toLocaleString()}
                        {isHourlyTrack ? '/hr' : ''} · {paymentGateway === 'stripe' ? 'Stripe' : 'Paystack'}
                      </span>
                    )}
                </button>

                {!scholarship && course && (
                  <div style={{ flexShrink: 0 }}>
                    <ScholarshipBadge courseId={course.course_id} isLoggedIn={true} showCta={true} />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs text-black">
                <div className="flex items-center gap-2"><span>🔒</span><span>Secure payment with {paymentGateway === 'stripe' ? 'Stripe' : 'Paystack'}</span></div>
                <div className="flex items-center gap-2"><span>🛡️</span><span>256-bit encryption</span></div>
                <div className="flex items-center gap-2"><span>💳</span><span>Multiple payment methods</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}