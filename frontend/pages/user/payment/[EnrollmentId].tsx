import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { api, CourseEnrollment } from '@/lib/api';
import UserDashboardLayout from '../UserDashboardLayout';

export default function PaymentPage() {
  const router = useRouter();
  const { enrollmentId } = router.query;
  const { user } = useAuth();

  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  useEffect(() => {
    if (!user) {
      router.push('/user/auth/login');
      return;
    }

    if (enrollmentId) {
      fetchEnrollmentDetails();
    }
  }, [enrollmentId, user]);

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      // Get user enrollments and find the specific one
      const response = await api.enrollment.getUserEnrollments();
      const found = response.enrollments.find(
        (e: CourseEnrollment) => e.id === Number(enrollmentId)
      );

      if (!found) {
        alert('Enrollment not found');
        router.push('/user/dashboard');
        return;
      }

      if (found.payment_status === 'completed') {
        alert('This course is already paid for!');
        router.push('/user/dashboard');
        return;
      }

      setEnrollment(found);
    } catch (error) {
      console.error('Failed to fetch enrollment:', error);
      alert('Failed to load payment details');
      router.push('/user/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollment) return;

    setProcessing(true);

    try {
      // Simulate payment processing
      // In production, integrate with Stripe, PayPal, or Paystack
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update payment status
      await api.enrollment.updatePayment(
        enrollment.id,
        'completed',
        transactionId
      );

      alert('Payment successful! Welcome to the course.');
      router.push('/user/dashboard');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
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
      <div className="max-w-4xl mx-auto p-4 md:p-8 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Payment</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-semibold text-gray-900">{enrollment.course_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">${enrollment.course_price}</span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${enrollment.course_price}
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

          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <form onSubmit={handlePayment}>
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-semibold text-gray-900">Credit Card</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-4 border-2 rounded-xl text-center transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">🅿️</div>
                      <div className="font-semibold text-gray-900">PayPal</div>
                    </button>
                  </div>
                </div>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* PayPal Message */}
                {paymentMethod === 'paypal' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">🅿️</div>
                    <p className="text-gray-700 mb-4">
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay $${enrollment.course_price}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your payment is secure and encrypted. By completing this purchase, you agree to our terms of service.
                </p>
              </form>
            </div>

            {/* Security Badges */}
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