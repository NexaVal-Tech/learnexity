'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { CourseEnrollment } from '@/lib/types';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { usePaystack, PaystackResponse } from '@/hooks/usePaystack';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Learning track type definitions
type LearningTrack = 'one_on_one' | 'group_mentorship' | 'self_paced';

interface TrackOption {
  id: LearningTrack;
  name: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  popular?: boolean;
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

const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'one_on_one',
    name: 'One-on-One Coaching',
    title: 'Our most personalized learning experience',
    description:
      "You'll work directly with an instructor in private, focused sessions tailored to your goals. Expect clear direction, accelerated progress, and increased confidence as you build mastery in your chosen path.",
    features: [
      'Private 1-on-1 sessions with instructor',
      'Personalized learning path',
      'Flexible scheduling',
      'Direct feedback and mentorship',
      'Accelerated progress tracking',
    ],
    icon: '👤',
  },
  {
    id: 'group_mentorship',
    name: 'Group Mentorship Program',
    title: 'A collaborative, community-powered learning experience',
    description:
      "You'll get full access to all courses and meet weekly with an instructor for reviews, discussions, and live Q&A sessions. This track is perfect if you learn best through shared experiences, peer support, and guided accountability.",
    features: [
      'Full access to all course materials',
      'Weekly live sessions with instructor',
      'Peer learning and discussions',
      'Community support network',
      'Group Q&A sessions',
    ],
    icon: '👥',
    popular: true,
  },
  {
    id: 'self_paced',
    name: 'Self-Paced Learning + Community Support',
    title: 'Maximum flexibility without losing the guidance you need',
    description:
      "Learn on your own schedule with full course access, and get support from our active community and team whenever you need help. You'll still join build sessions, participate in discussions, and take part in soft-skills development activities.",
    features: [
      'Learn at your own pace',
      'Full course material access',
      'Community forum support',
      'Build sessions and workshops',
      'Soft-skills development activities',
    ],
    icon: '📚',
  },
];

// ---------------------------------------------------------------------------
// Reliable redirect helper — works on Hostinger VPS behind Nginx for BOTH
// Paystack (popup-based) and Stripe (full-page redirect back from Stripe).
//
// Why not router.push?
//   • After a Paystack popup closes, the Next.js router can lose its internal
//     state in production builds, causing silent no-ops or wrong navigations.
//   • After Stripe redirects back from its hosted page, the browser history
//     stack is already in an unusual state; router.push can land on the wrong
//     entry.
//
// Why window.location.replace with an absolute URL?
//   • An absolute URL (https://yourdomain.com/user/dashboard) is never
//     misinterpreted by Nginx rewrite rules, unlike bare relative paths.
//   • .replace() clears the payment page from history so the user can't
//     accidentally hit Back and re-submit.
// ---------------------------------------------------------------------------
const redirectToDashboard = (queryParams: string): void => {
  if (typeof window === 'undefined') return;
  const absoluteUrl = `${window.location.origin}/user/dashboard${queryParams}`;
  window.location.replace(absoluteUrl);
};

export default function PaymentPage() {
  const router = useRouter();
  const { enrollmentId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Learning track selection state
  const [selectedTrack, setSelectedTrack] = useState<LearningTrack | null>(null);
  const [availableTracks, setAvailableTracks] = useState<LearningTrack[]>([]);
  const [trackPrices, setTrackPrices] = useState<Record<LearningTrack, number>>({
    one_on_one: 0,
    group_mentorship: 0,
    self_paced: 0,
  });

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [scholarshipLoading, setScholarshipLoading] = useState(false);

  const [paymentType, setPaymentType] = useState<'onetime' | 'installment'>('onetime');
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [currencyDetected, setCurrencyDetected] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'paystack'>('paystack');

  // ─── Currency / gateway detection ──────────────────────────────────────────
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/detect-currency`
        );
        const data = await response.json();

        setCurrency(data.currency);
        setDetectedLocation(data.country);
        setCurrencyDetected(true);

        if (data.currency === 'NGN') {
          setPaymentGateway('paystack');
        } else {
          setPaymentGateway('stripe');
        }
      } catch {
        // Default to Stripe/USD on detection failure
        setCurrency('USD');
        setPaymentGateway('stripe');
        setDetectedLocation('Unknown');
        setCurrencyDetected(true);
      }
    };

    detectCurrency();
  }, []);


  const fetchScholarship = useCallback(async (courseSlug: string) => {
    try {
      setScholarshipLoading(true);
      // api.get already returns the parsed data in your setup
      const data = await api.get(`/api/scholarships/course/${courseSlug}`);
      if (data?.scholarship?.status === 'approved' && !data.scholarship.is_used) {
        setScholarship(data.scholarship);
      }
    } catch {
      // non-critical
    } finally {
      setScholarshipLoading(false);
    }
  }, []);

  // ─── Course track + pricing ─────────────────────────────────────────────────
  const fetchCourseTrackDetails = useCallback(
    async (courseId: number) => {
      try {
        const courseData = await api.courses.getById(courseId);
        setCourse(courseData);

        // fetching scholarship if avalaible
        if (courseData.course_id) {
          await fetchScholarship(courseData.course_id);
        }

        const tracks: LearningTrack[] = [];
        const prices: Record<LearningTrack, number> = {
          one_on_one: 0,
          group_mentorship: 0,
          self_paced: 0,
        };

        if (courseData.offers_one_on_one) {
          tracks.push('one_on_one');
          const priceValue =
            currency === 'NGN'
              ? courseData.one_on_one_price_ngn
              : courseData.one_on_one_price_usd;
          prices.one_on_one = priceValue ? parseFloat(priceValue.toString()) : 0;
        }

        if (courseData.offers_group_mentorship) {
          tracks.push('group_mentorship');
          const priceValue =
            currency === 'NGN'
              ? courseData.group_mentorship_price_ngn
              : courseData.group_mentorship_price_usd;
          prices.group_mentorship = priceValue ? parseFloat(priceValue.toString()) : 0;
        }

        if (courseData.offers_self_paced) {
          tracks.push('self_paced');
          const priceValue =
            currency === 'NGN'
              ? courseData.self_paced_price_ngn
              : courseData.self_paced_price_usd;
          prices.self_paced = priceValue ? parseFloat(priceValue.toString()) : 0;
        }

        if (tracks.length === 0) {
          setError('This course has no learning tracks configured. Please contact support.');
          setAvailableTracks([]);
          setTrackPrices(prices);
          return;
        }

        const hasValidPrice = tracks.some((t) => prices[t] > 0);
        if (!hasValidPrice) {
          setError(
            `Course pricing is not configured for ${currency}. Please contact support or try a different payment region.`
          );
        }

        setAvailableTracks(tracks);
        setTrackPrices(prices);

        if (tracks.length === 1) {
          setSelectedTrack(tracks[0]);
        }
      } catch {
        setError('Failed to load course pricing. Please refresh the page.');
      }
    },
    [currency]
  );

  // ─── Pending enrollment fallback ────────────────────────────────────────────
  const fetchPendingEnrollment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.enrollment.getUserEnrollments();
      const pendingEnrollments = response.enrollments.filter(
        (e: CourseEnrollment) => e.payment_status === 'pending'
      );

      if (pendingEnrollments.length === 0) {
        setError('No pending enrollment found');
        alert('No pending enrollment found. Please enroll in a course first.');
        router.push('/user/dashboard');
        return;
      }

      const recentPending = [...pendingEnrollments].sort(
        (a: CourseEnrollment, b: CourseEnrollment) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];

      router.replace(`/user/payment/${recentPending.id}`, undefined, { shallow: true });

      setEnrollment(recentPending);
      await fetchCourseTrackDetails(recentPending.course_id);
    } catch {
      setError('Failed to load payment details');
      alert('Failed to load payment details. Please try again.');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchCourseTrackDetails, router]);

  // ─── Enrollment details ─────────────────────────────────────────────────────
  const fetchEnrollmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.enrollment.getUserEnrollments();
      const found = response.enrollments.find(
        (e: CourseEnrollment) => e.id === Number(enrollmentId)
      );

      if (!found) {
        setError('Enrollment not found');
        alert('Enrollment not found. Please try enrolling again.');
        router.push('/user/dashboard');
        return;
      }

      if (found.payment_status === 'completed') {
        alert('This course is already paid for!');
        router.push('/user/dashboard?tab=your-course');
        return;
      }

      setEnrollment(found);
      await fetchCourseTrackDetails(found.course_id);
    } catch {
      setError('Failed to load payment details');
      alert('Failed to load payment details. Please check console for details.');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, fetchCourseTrackDetails, router]);

  // ─── Main gate effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/user/auth/login'); return; }
    if (!router.isReady) return;
    if (!currencyDetected) return;

    if (!enrollmentId) {
      fetchPendingEnrollment();
      return;
    }

    if (typeof enrollmentId === 'string') {
      fetchEnrollmentDetails();
    } else {
      setError('Invalid enrollment ID');
      setLoading(false);
    }
  }, [router.isReady, enrollmentId, user, currencyDetected, authLoading]);

  // Force one-time payment when scholarship is active
  useEffect(() => {
    if (scholarship && !scholarship.is_used) {
      setPaymentType('onetime');
    }
  }, [scholarship]);

  // Replace your scholarship fetch — make it parallel, not nested
  useEffect(() => {
    if (enrollment && currencyDetected) {
      fetchCourseTrackDetails(enrollment.course_id);
    }
  }, [currency, currencyDetected, enrollment?.id]);

  // Separate effect for scholarship
  useEffect(() => {
    if (enrollment?.course_id) {
      fetchScholarship(enrollment.course_slug); // pass course_id slug
    }
  }, [enrollment?.course_id]);

  // ─── Price calculation ──────────────────────────────────────────────────────
  const getCurrentPrice = (): number => {
    if (!selectedTrack) return 0;
  
    let price = trackPrices[selectedTrack] || 0;
  
    // Apply one-time discount first
    if (paymentType === 'onetime' && course) {
      const discountPercent =
        parseFloat(currency === 'NGN' ? course.onetime_discount_ngn : course.onetime_discount_usd) || 0;
      if (discountPercent > 0) {
        price = Math.max(0, Math.round(price * (1 - discountPercent / 100)));
      }
    }
  
    // Apply scholarship discount AFTER standard discount
    if (scholarship && !scholarship.is_used) {
      price = Math.max(0, Math.round(price * (1 - scholarship.discount_percentage / 100)));
    }
  
    if (paymentType === 'installment') {
      price = Math.round(price / 4);
    }
  
    return price;
  };


  // ─── Stripe payment ─────────────────────────────────────────────────────────
  // Stripe redirects the user away to its hosted checkout page, then redirects
  // them BACK to a success/cancel URL you configure in your backend. That return
  // URL must also be an absolute URL — set it in your Django view like:
  //
  //   success_url = f"{settings.FRONTEND_URL}/user/dashboard?tab=your-course&payment=success"
  //   cancel_url  = f"{settings.FRONTEND_URL}/user/payment/{enrollment_id}"
  //
  // FRONTEND_URL should be "https://yourdomain.com" in your production .env.
  // The redirect below just sends the user to Stripe; the return is handled by
  // Stripe itself using the URLs you set in your backend session creation.
  const handleStripePayment = async () => {
    if (!selectedTrack) {
      alert('Please select a learning track before proceeding with payment.');
      return;
    }

    if (!user?.email || !enrollment) {
      alert('Missing payment information. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            enrollment_id: enrollment.id,
            course_id: enrollment.course_id,
            course_name: enrollment.course_name,
            learning_track: selectedTrack,
            payment_type: paymentType,
            currency: 'usd',
            user_email: user.email,
            user_name: user.name,
            scholarship_id: scholarship?.id ?? null,
          }),
        }
      );

      const session: StripeCheckoutSession = await response.json();

      if (session.error) throw new Error(session.error);

      if (session.url) {
        // ✅ FIX: Use window.location.replace instead of window.location.href.
        // On Hostinger VPS + Nginx, .href can get intercepted mid-redirect by
        // the proxy before the browser fully changes context, especially for
        // cross-origin Stripe URLs. .replace() is more atomic and bypasses
        // that race condition. It also clears the payment page from history so
        // the user can't accidentally hit Back and re-submit after returning.
        window.location.replace(session.url);
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (err: any) {
      alert('Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  // ─── Paystack handlers ──────────────────────────────────────────────────────
  const onSuccess = async (response: PaystackResponse) => {
    setProcessing(true);

    try {
      // Give the webhook a moment to fire before we check
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const enrollmentsResponse = await api.enrollment.getUserEnrollments();
      const updatedEnrollment = enrollmentsResponse.enrollments.find(
        (e: CourseEnrollment) => e.id === enrollment!.id
      );

      if (updatedEnrollment?.payment_status === 'completed') {
        // Webhook already processed — go straight to dashboard
        alert(
          `Payment successful! Welcome to ${enrollment!.course_name}. Check your email for confirmation.`
        );
        redirectToDashboard('?tab=your-course&payment=success');
        return;
      }

      // Webhook hasn't fired yet — update manually then redirect
      await api.post(`/api/courses/enrollments/${enrollment!.id}/payment`, {
        payment_status: 'completed',
        transaction_id: response.reference,
        learning_track: selectedTrack!,
        scholarship_id: scholarship?.id ?? null,
      });

      alert(
        `Payment successful! Welcome to ${enrollment!.course_name}. Check your email for confirmation.`
      );
      redirectToDashboard('?tab=your-course&payment=success');
    } catch {
      // Payment was received but verification failed — still redirect gracefully
      alert(
        `Payment received! Reference: ${response.reference}\n\nYou'll receive a confirmation email shortly. Redirecting to your dashboard...`
      );
      redirectToDashboard('?tab=your-course&payment=pending');
    }
    // Note: no finally block here — we never want to unset `processing` because
    // redirectToDashboard is already navigating away. Unsetting it would cause a
    // flicker where the payment button re-enables for a split second.
  };

  const onClose = () => {
    setProcessing(false);
  };

  const paystackConfig =
    enrollment && user && selectedTrack
      ? {
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          email: user.email,
          amount: Math.round(getCurrentPrice() * 100),
          ref: `PAY-${crypto.randomUUID().replace(/-/g, '').substring(0, 20).toUpperCase()}`,
          currency: currency === 'NGN' ? 'NGN' : 'USD',
          metadata: {
            enrollment_id: enrollment.id,
            course_id: enrollment.course_id,
            course_name: enrollment.course_name,
            user_id: user.id,
            learning_track: selectedTrack,
            payment_type: paymentType,
            currency: currency,
            scholarship_id: scholarship?.id ?? null,
            custom_fields: [
              {
                display_name: 'Course Name',
                variable_name: 'course_name',
                value: enrollment.course_name,
              },
              {
                display_name: 'User Name',
                variable_name: 'user_name',
                value: user.name,
              },
              {
                display_name: 'Learning Track',
                variable_name: 'learning_track',
                value: TRACK_OPTIONS.find((t) => t.id === selectedTrack)?.name || selectedTrack,
              },
              {
                display_name: 'Payment Type',
                variable_name: 'payment_type',
                value: paymentType === 'onetime' ? 'One-Time Payment' : 'Installment (1 of 4)',
              },
            ],
          },
          onSuccess,
          onClose,
        }
      : null;

  const { initializePayment } = usePaystack(paystackConfig || ({} as any));

  const handlePaystackPayment = () => {
    if (!selectedTrack) {
      alert('Please select a learning track before proceeding with payment.');
      return;
    }
    if (!paystackConfig) {
      alert('Payment configuration error. Please try again.');
      return;
    }
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      alert('Paystack is not configured. Please contact support.');
      return;
    }
    if (!user?.email) {
      alert('User email is required for payment. Please log in again.');
      router.push('/user/auth/login');
      return;
    }
    if (!enrollment) {
      alert('Enrollment information missing. Please try again.');
      router.push('/user/dashboard');
      return;
    }

    try {
      initializePayment();
    } catch {
      alert('Failed to open payment window. Please try again.');
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentGateway === 'stripe') {
      handleStripePayment();
    } else {
      handlePaystackPayment();
    }
  };

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (authLoading || !currencyDetected || loading) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <p className="text-gray-600">
              {authLoading
                ? 'Loading...'
                : !currencyDetected
                ? 'Detecting your location...'
                : 'Loading payment details...'}
            </p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error || !enrollment) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Enrollment not found'}
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your enrollment details. Please try again.
            </p>
          </div>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <UserDashboardLayout>
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-gray-600">
              Please wait while we confirm your payment and redirect you to your dashboard.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[1550px] mx-auto p-4 md:p-8 pt-24 mt-20">
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
        <p className="text-gray-600 mb-8">Select your learning track and payment method</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* STEP 1: Learning Track */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Learning Track</h2>
              </div>

              {availableTracks.length > 0 ? (
                <div className="space-y-4">
                  {TRACK_OPTIONS.filter((track) => availableTracks.includes(track.id)).map(
                    (track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                          selectedTrack === track.id
                            ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >
                        {track.popular && (
                          <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            MOST POPULAR
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{track.icon}</div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{track.name}</h3>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-600">
                                  {currency === 'NGN' ? '₦' : '$'}
                                  {trackPrices[track.id]?.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <p className="text-sm font-semibold text-indigo-600 mb-2">
                              {track.title}
                            </p>
                            <p className="text-gray-600 text-sm mb-4">{track.description}</p>

                            <div className="space-y-2">
                              {track.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-green-600 mt-0.5">✓</span>
                                  <span className="text-gray-700">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedTrack === track.id
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedTrack === track.id && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-gray-600">Loading learning tracks...</p>
                </div>
              )}
            </div>

            {/* STEP 2: Payment Method */}
            {selectedTrack && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Payment Method</h2>
                </div>

                    {/* Scholarship notice */}
                {scholarship && !scholarship.is_used && (
                  <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                    <span>🎓</span>
                    <p>Scholarship recipients must pay in full (one-time). Installments are not available.</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* One-Time Payment */}
                  <button
                    onClick={() => setPaymentType('onetime')}
                    className={`relative border-2 rounded-2xl p-6 text-left transition-all ${
                      paymentType === 'onetime'
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {paymentType === 'onetime' && (
                      <div className="absolute -top-3 right-6 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SAVE MORE
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">💰</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">One-Time Payment</h3>
                        <p className="text-gray-600 text-sm mb-3">
                          Pay the full amount upfront and get a discount
                        </p>

                        {(() => {
                          const originalPrice = trackPrices[selectedTrack] || 0;
                          const discountPercent =
                            parseFloat(
                              currency === 'NGN'
                                ? course?.onetime_discount_ngn
                                : course?.onetime_discount_usd
                            ) || 0;
                          const savings = Math.round(originalPrice * (discountPercent / 100));
                          const finalPrice = Math.max(0, originalPrice - savings);

                          return (
                            <div className="space-y-1">
                              {discountPercent > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    {currency === 'NGN' ? '₦' : '$'}
                                    {originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                    {discountPercent}% OFF
                                  </span>
                                </div>
                              )}
                              <div className="text-2xl font-bold text-green-600">
                                {currency === 'NGN' ? '₦' : '$'}
                                {finalPrice.toLocaleString()}
                              </div>
                              {discountPercent > 0 && (
                                <p className="text-xs text-green-700">
                                  You save {currency === 'NGN' ? '₦' : '$'}
                                  {savings.toLocaleString()}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          paymentType === 'onetime'
                            ? 'border-indigo-600 bg-indigo-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {paymentType === 'onetime' && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Installment Payment */}
                  {(!scholarship || scholarship.is_used) && (
                    <button
                      onClick={() => setPaymentType('installment')}
                      className={`relative border-2 rounded-2xl p-6 text-left transition-all ${
                        paymentType === 'installment'
                          ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">📅</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Installment Payment
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">Split payment across 4 months</p>
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {currency === 'NGN' ? '₦' : ''}
                            {selectedTrack && trackPrices[selectedTrack]
                              ? Math.round(trackPrices[selectedTrack] / 4).toLocaleString()
                              : '0'}
                            <span className="text-sm font-normal text-gray-600">/month × 4</span>
                          </div>
                          <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                            ⚠️ Must pay on time each month to maintain access
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentType === 'installment'
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {paymentType === 'installment' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                    {enrollment.course_name}
                  </span>
                </div>

                {selectedTrack && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Learning Track:</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                      {TRACK_OPTIONS.find((t) => t.id === selectedTrack)?.name}
                    </span>
                  </div>
                )}

                {paymentType === 'installment' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-semibold text-gray-900">Installment (1 of 4)</span>
                  </div>
                )}

                {scholarship && !scholarship.is_used && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-2">
                    <span className="text-green-600 text-lg">🎓</span>
                    <div>
                      <p className="text-xs font-bold text-green-700">Scholarship Applied</p>
                      <p className="text-xs text-green-600">{scholarship.discount_percentage}% discount active</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {paymentType === 'installment' ? 'Pay Now:' : 'Total:'}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {currency === 'NGN' ? '₦' : ''}
                      {getCurrentPrice().toLocaleString()}
                    </span>
                  </div>
                  {paymentType === 'installment' && (
                    <div className="text-xs text-gray-600 mt-1">
                      Full price: {currency === 'NGN' ? '₦' : ''}
                      {selectedTrack ? trackPrices[selectedTrack].toLocaleString() : '0'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
                <p className="font-semibold mb-1">✓ Lifetime Access</p>
                <p>Get unlimited access to all course materials</p>
              </div>

              {detectedLocation && (
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                    <span>{paymentGateway === 'stripe' ? '💳' : '🇳🇬'}</span>
                    <span className="font-medium">
                      Payment via {paymentGateway === 'stripe' ? 'Stripe' : 'Paystack'}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || !selectedTrack}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : !selectedTrack ? (
                  <span>Select a Track</span>
                ) : (
                  <>
                    <span>
                      Pay {currency === 'NGN' ? '₦' : ''}
                      {getCurrentPrice().toLocaleString()}
                    </span>
                    <span className="text-xs opacity-75">
                      via {paymentGateway === 'stripe' ? 'Stripe' : 'Paystack'}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure payment with {paymentGateway === 'stripe' ? 'Stripe' : 'Paystack'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💳</span>
                  <span>Multiple payment methods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}