import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api, CourseEnrollment } from '@/lib/api';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { usePaystack, PaystackResponse } from '@/hooks/usePaystack';

export default function PaymentPage() {
  const router = useRouter();
  const { enrollmentId } = router.query;
  const { user } = useAuth();

  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 Debug Info:', {
      enrollmentId,
      userId: user?.id,
      userEmail: user?.email,
      enrollment,
      loading,
      routerReady: router.isReady
    });
  }, [enrollmentId, user, enrollment, loading, router.isReady]);

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

    if (enrollmentId && typeof enrollmentId === 'string') {
      console.log('✅ Fetching enrollment details for ID:', enrollmentId);
      fetchEnrollmentDetails();
    } else {
      console.log('⚠️ No valid enrollmentId:', enrollmentId);
    }
  }, [router.isReady, enrollmentId, user]);

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
        router.push('/user/dashboard');
        return;
      }

      setEnrollment(found);
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

  const onSuccess = async (response: PaystackResponse) => {
    console.log('✅ Payment successful:', response);
    setProcessing(true);

    try {
      // Give webhook time to process (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the payment status from backend
      console.log('🔍 Verifying payment with backend...');
      
      // First, try to get updated enrollment
      const enrollmentsResponse = await api.enrollment.getUserEnrollments();
      const updatedEnrollment = enrollmentsResponse.enrollments.find(
        (e: CourseEnrollment) => e.id === enrollment!.id
      );

      if (updatedEnrollment?.payment_status === 'completed') {
        console.log('✅ Webhook already processed payment');
        setProcessing(true); // Keep showing processing state
        // Redirect to dashboard with your-course tab
        await router.push('/user/dashboard?tab=your-course');
        return;
      }

      // If webhook hasn't processed yet, update manually as fallback
      console.log('⏳ Webhook not processed yet, updating manually...');
      await api.enrollment.updatePayment(
        enrollment!.id,
        'completed',
        response.reference
      );

      // Redirect to dashboard with your-course tab
      await router.push('/user/dashboard?tab=your-course');
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert(`Payment received! Reference: ${response.reference}. Redirecting to your dashboard...`);
      // Still redirect to your-course tab
      await router.push('/user/dashboard?tab=your-course');
    }
  };

  const onClose = () => {
    console.log('❌ Payment popup closed');
  };

  // Paystack configuration
  const paystackConfig = enrollment && user ? {
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    email: user.email,
    amount: Math.round(enrollment.course_price * 100),
    ref: `ENR-${enrollment.id}-${Date.now()}`,
    currency: 'NGN',
    metadata: {
      enrollment_id: enrollment.id,
      course_id: enrollment.course_id,
      course_name: enrollment.course_name,
      user_id: user.id,
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
        }
      ]
    },
    onSuccess,
    onClose
  } : null;

  const { initializePayment } = usePaystack(paystackConfig || {} as any);

  const handlePaystackPayment = () => {
    if (!paystackConfig) {
      alert('Payment configuration error. Please try again.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      alert('Paystack is not configured. Please add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your .env.local file.');
      return;
    }

    if (!user?.email) {
      alert('User email is required for payment.');
      return;
    }

    console.log('🚀 Initializing Paystack payment with config:', {
      ...paystackConfig,
      key: '***'
    });
    
    initializePayment();
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

  if (!enrollment) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enrollment not found
          </h2>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      {/* Processing Overlay */}
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

      <div className="max-w-4xl mx-auto p-4 md:p-8 pt-24">
        <button
          onClick={() => router.back()}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Payment</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                    {enrollment.course_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">₦{enrollment.course_price.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ₦{enrollment.course_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">✓ Lifetime Access</p>
                <p>Get unlimited access to all course materials</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Method
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Pay securely with Paystack
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">🔒</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Payment with Paystack</h4>
                    <p className="text-sm text-gray-600">Your payment information is safe and encrypted</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Credit/Debit Cards (Visa, Mastercard, Verve)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Bank Transfer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Mobile Money & USSD</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handlePaystackPayment}
                disabled={processing || !paystackConfig}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay ₦{enrollment.course_price.toLocaleString()}</span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Powered by Paystack. Your payment is secure and encrypted.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6 text-gray-500 text-sm">
              <span>🔒 Secure Payment</span>
              <span>•</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}