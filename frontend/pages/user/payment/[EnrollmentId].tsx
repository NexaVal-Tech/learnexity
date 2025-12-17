import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api, CourseEnrollment } from '@/lib/api';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { usePaystack, PaystackResponse } from '@/hooks/usePaystack';

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

const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'one_on_one',
    name: 'One-on-One Coaching',
    title: 'Our most personalized learning experience',
    description: "You'll work directly with an instructor in private, focused sessions tailored to your goals. Expect clear direction, accelerated progress, and increased confidence as you build mastery in your chosen path.",
    features: [
      'Private 1-on-1 sessions with instructor',
      'Personalized learning path',
      'Flexible scheduling',
      'Direct feedback and mentorship',
      'Accelerated progress tracking'
    ],
    icon: '👤',
    popular: true
  },
  {
    id: 'group_mentorship',
    name: 'Group Mentorship Program',
    title: 'A collaborative, community-powered learning experience',
    description: "You'll get full access to all courses and meet weekly with an instructor for reviews, discussions, and live Q&A sessions. This track is perfect if you learn best through shared experiences, peer support, and guided accountability.",
    features: [
      'Full access to all course materials',
      'Weekly live sessions with instructor',
      'Peer learning and discussions',
      'Community support network',
      'Group Q&A sessions'
    ],
    icon: '👥'
  },
  {
    id: 'self_paced',
    name: 'Self-Paced Learning + Community Support',
    title: 'Maximum flexibility without losing the guidance you need',
    description: "Learn on your own schedule with full course access, and get support from our active community and team whenever you need help. You'll still join build sessions, participate in discussions, and take part in soft-skills development activities.",
    features: [
      'Learn at your own pace',
      'Full course material access',
      'Community forum support',
      'Build sessions and workshops',
      'Soft-skills development activities'
    ],
    icon: '📚'
  }
];

export default function PaymentPage() {
  const router = useRouter();
  const { enrollmentId } = router.query;
  const { user } = useAuth();

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
    self_paced: 0
  });

  useEffect(() => {
    console.log('🔍 Debug Info:', {
      enrollmentId,
      enrollmentIdType: typeof enrollmentId,
      userId: user?.id,
      userEmail: user?.email,
      enrollment,
      loading,
      routerReady: router.isReady,
      selectedTrack,
      availableTracks,
      routerQuery: router.query
    });
  }, [enrollmentId, user, enrollment, loading, router.isReady, selectedTrack, availableTracks, router.query]);

  useEffect(() => {
    if (!user) {
      console.log('❌ No user, redirecting to login');
      router.push('/user/auth/login');
      return;
    }

    if (!router.isReady) {
      console.log('⏳ Router not ready yet...');
      return;
    }

    // Check if enrollmentId exists and is valid
    if (!enrollmentId) {
      console.log('⚠️ No enrollmentId in URL, checking for pending enrollment...');
      // Try to find a pending enrollment for the user
      fetchPendingEnrollment();
      return;
    }

    if (typeof enrollmentId === 'string') {
      console.log('✅ Fetching enrollment details for ID:', enrollmentId);
      fetchEnrollmentDetails();
    } else {
      console.log('⚠️ Invalid enrollmentId type:', typeof enrollmentId);
      setError('Invalid enrollment ID');
      setLoading(false);
    }
  }, [router.isReady, enrollmentId, user]);

  const fetchPendingEnrollment = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Looking for pending enrollments...');
      
      const response = await api.enrollment.getUserEnrollments();
      console.log('📦 Received enrollments:', response.enrollments);
      
      // Find the most recent pending enrollment
      const pendingEnrollments = response.enrollments.filter(
        (e: CourseEnrollment) => e.payment_status === 'pending'
      );

      if (pendingEnrollments.length === 0) {
        console.log('❌ No pending enrollments found');
        setError('No pending enrollment found');
        alert('No pending enrollment found. Please enroll in a course first.');
        router.push('/user/dashboard');
        return;
      }

      // Get the most recent pending enrollment
      const recentPending = pendingEnrollments.sort((a: CourseEnrollment, b: CourseEnrollment) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];

      console.log('✅ Found pending enrollment:', recentPending);
      
      // Update URL with the enrollment ID
      router.replace(`/user/payment/${recentPending.id}`, undefined, { shallow: true });
      
      setEnrollment(recentPending);
      await fetchCourseTrackDetails(recentPending.course_id);
      
    } catch (error: any) {
      console.error('💥 Failed to fetch pending enrollment:', error);
      setError('Failed to load payment details');
      alert('Failed to load payment details. Please try again.');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching enrollments from API...');
      
      const response = await api.enrollment.getUserEnrollments();
      console.log('📦 Received enrollments:', response.enrollments);
      
      const found = response.enrollments.find(
        (e: CourseEnrollment) => e.id === Number(enrollmentId)
      );

      console.log('🔎 Found enrollment:', found);

      if (!found) {
        console.error('❌ Enrollment not found in list');
        setError('Enrollment not found');
        alert('Enrollment not found. Please try enrolling again.');
        router.push('/user/dashboard');
        return;
      }

      if (found.payment_status === 'completed') {
        console.log('✅ Already paid');
        alert('This course is already paid for!');
        router.push('/user/dashboard?tab=your-course');
        return;
      }

      setEnrollment(found);
      
      // Fetch course details to get available learning tracks
      await fetchCourseTrackDetails(found.course_id);
      
      console.log('✅ Enrollment set successfully');
    } catch (error: any) {
      console.error('💥 Failed to fetch enrollment:', error);
      setError('Failed to load payment details');
      alert('Failed to load payment details. Please check console for details.');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseTrackDetails = async (courseId: number) => {
    try {
      console.log('📚 Fetching course details for ID:', courseId);
      // Fetch course details from your API
      const course = await api.courses.getById(courseId);

      console.log('📚 Course details:', course);

      // Extract available tracks and their prices
      const tracks: LearningTrack[] = [];
      const prices: Record<LearningTrack, number> = {
        one_on_one: 0,
        group_mentorship: 0,
        self_paced: 0
      };

      if (course.offers_one_on_one) {
        tracks.push('one_on_one');
        prices.one_on_one = course.one_on_one_price || course.price;
      }
      if (course.offers_group_mentorship) {
        tracks.push('group_mentorship');
        prices.group_mentorship = course.group_mentorship_price || course.price * 0.7;
      }
      if (course.offers_self_paced) {
        tracks.push('self_paced');
        prices.self_paced = course.self_paced_price || course.price * 0.5;
      }

      // If no tracks are specified, default to self-paced
      if (tracks.length === 0) {
        console.log('⚠️ No tracks specified, defaulting to self-paced');
        tracks.push('self_paced');
        prices.self_paced = course.price;
      }

      setAvailableTracks(tracks);
      setTrackPrices(prices);

      // Auto-select if only one track is available
      if (tracks.length === 1) {
        console.log('✅ Auto-selecting only available track:', tracks[0]);
        setSelectedTrack(tracks[0]);
      }

      console.log('✅ Available tracks:', tracks, 'Prices:', prices);
    } catch (error) {
      console.error('💥 Failed to fetch course track details:', error);
      // Fallback to self-paced if API fails
      console.log('⚠️ Falling back to default self-paced track');
      setAvailableTracks(['self_paced']);
      setTrackPrices({
        one_on_one: enrollment?.course_price || 0,
        group_mentorship: enrollment?.course_price || 0,
        self_paced: enrollment?.course_price || 0
      });
      setSelectedTrack('self_paced');
    }
  };

  const getCurrentPrice = (): number => {
    if (!selectedTrack) return enrollment?.course_price || 0;
    return trackPrices[selectedTrack] || enrollment?.course_price || 0;
  };

// Replace the onSuccess function in your [EnrollmentId].tsx

const onSuccess = async (response: PaystackResponse) => {
  console.log('✅ Payment successful:', response);
  
  // IMPORTANT: Set processing BEFORE any async operations
  setProcessing(true);

  try {
    // Wait a bit for webhook to process
    console.log('⏳ Waiting for webhook to process...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Increased to 3 seconds

    console.log('🔍 Verifying payment with backend...');
    
    // Fetch updated enrollments
    const enrollmentsResponse = await api.enrollment.getUserEnrollments();
    const updatedEnrollment = enrollmentsResponse.enrollments.find(
      (e: CourseEnrollment) => e.id === enrollment!.id
    );

    console.log('📦 Updated enrollment:', updatedEnrollment);

    if (updatedEnrollment?.payment_status === 'completed') {
      console.log('✅ Webhook already processed payment');
      
      // Show success message
      alert(`Payment successful! Welcome to ${enrollment!.course_name}. Check your email for confirmation.`);
      
      // Redirect to dashboard
      await router.push('/user/dashboard?tab=your-course&payment=success');
      return;
    }

    // If webhook hasn't processed yet, update manually
    console.log('⏳ Webhook not processed yet, updating manually...');
    
    const updateResult = await api.enrollment.updatePayment(
      enrollment!.id,
      'completed',
      response.reference,
      selectedTrack! // Pass selected track to backend
    );

    console.log('✅ Manual update successful:', updateResult);

    // Show success message
    alert(`Payment successful! Welcome to ${enrollment!.course_name}. Check your email for confirmation.`);
    
    // Redirect to dashboard
    await router.push('/user/dashboard?tab=your-course&payment=success');

  } catch (error: any) {
    console.error('❌ Failed to verify payment:', error);
    
    // Even if verification fails, payment was successful
    // Show success message and redirect
    alert(`Payment received! Reference: ${response.reference}\n\nYou'll receive a confirmation email shortly. Redirecting to your dashboard...`);
    
    // Still redirect even on error
    await router.push('/user/dashboard?tab=your-course&payment=pending');
  } finally {
    // Don't set processing to false here - let the redirect handle it
    console.log('🏁 Payment processing complete');
  }
};

const onClose = () => {
  console.log('❌ Payment popup closed by user');
  setProcessing(false); // Only set to false if user closes modal
};

  const paystackConfig = enrollment && user && selectedTrack ? {
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    email: user.email,
    amount: Math.round(getCurrentPrice() * 100),
    ref: `ENR-${enrollment.id}-${selectedTrack}-${Date.now()}`,
    currency: 'NGN',
    metadata: {
      enrollment_id: enrollment.id,
      course_id: enrollment.course_id,
      course_name: enrollment.course_name,
      user_id: user.id,
      learning_track: selectedTrack,
      custom_fields: [
        {
          display_name: "Course Name",
          variable_name: "course_name",
          value: enrollment.course_name
        },
        {
          display_name: "User Name",
          variable_name: "user_name",
          value: user.name
        },
        {
          display_name: "Learning Track",
          variable_name: "learning_track",
          value: TRACK_OPTIONS.find(t => t.id === selectedTrack)?.name || selectedTrack
        }
      ]
    },
    onSuccess,
    onClose
  } : null;

  const { initializePayment } = usePaystack(paystackConfig || {} as any);

// Replace the handlePaystackPayment function in your [EnrollmentId].tsx

const handlePaystackPayment = () => {
  console.log('🚀 Payment button clicked');

  // Validation checks
  if (!selectedTrack) {
    alert('Please select a learning track before proceeding with payment.');
    return;
  }

  if (!paystackConfig) {
    console.error('❌ Payment configuration missing');
    alert('Payment configuration error. Please try again.');
    return;
  }

  if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    console.error('❌ Paystack public key missing');
    alert('Paystack is not configured. Please contact support.');
    return;
  }

  if (!user?.email) {
    console.error('❌ User email missing');
    alert('User email is required for payment. Please log in again.');
    router.push('/user/auth/login');
    return;
  }

  if (!enrollment) {
    console.error('❌ Enrollment missing');
    alert('Enrollment information missing. Please try again.');
    router.push('/user/dashboard');
    return;
  }

  // Log payment config (without sensitive data)
  console.log('💳 Initializing Paystack payment', {
    email: user.email,
    amount: paystackConfig.amount,
    enrollmentId: enrollment.id,
    courseId: enrollment.course_id,
    learningTrack: selectedTrack,
    reference: paystackConfig.ref,
  });

  try {
    // Initialize payment
    initializePayment();
    
    console.log('✅ Payment popup should be opening...');
  } catch (error) {
    console.error('❌ Failed to initialize payment:', error);
    alert('Failed to open payment window. Please try again.');
    setProcessing(false);
  }
};

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

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

  return (
    <UserDashboardLayout>
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing Payment...
            </h3>
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
        <p className="text-gray-600 mb-8">Choose your learning track and proceed with payment</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Learning Tracks */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Learning Track</h2>
            
            {availableTracks.length > 0 ? (
              <div className="space-y-4">
                {TRACK_OPTIONS.filter(track => availableTracks.includes(track.id)).map((track) => (
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
                              ₦{trackPrices[track.id].toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm font-semibold text-indigo-600 mb-2">{track.title}</p>
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
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedTrack === track.id
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedTrack === track.id && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                <p className="text-gray-600">Loading learning tracks...</p>
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
                      {TRACK_OPTIONS.find(t => t.id === selectedTrack)?.name}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">
                    ₦{getCurrentPrice().toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ₦{getCurrentPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
                <p className="font-semibold mb-1">✓ Lifetime Access</p>
                <p>Get unlimited access to all course materials</p>
              </div>

              <button
                onClick={handlePaystackPayment}
                disabled={processing || !paystackConfig || !selectedTrack}
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
                  <span>Pay ₦{getCurrentPrice().toLocaleString()}</span>
                )}
              </button>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure payment with Paystack</span>
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