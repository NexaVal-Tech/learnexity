// components/user/AccessBlockedBanner.tsx

import React from 'react';
import { Lock, AlertTriangle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/router';
import type { CourseEnrollment } from '@/lib/types';

interface AccessBlockedBannerProps {
  enrollment: CourseEnrollment | null;
  onPayNow: () => void;
}

export const AccessBlockedBanner: React.FC<AccessBlockedBannerProps> = ({ enrollment, onPayNow }) => {
  const router = useRouter();

  if (!enrollment || enrollment.has_access) return null;
  
  const isOverdue = enrollment.next_payment_due && 
    new Date(enrollment.next_payment_due) < new Date();
  
  const daysOverdue = isOverdue 
    ? Math.floor((new Date().getTime() - new Date(enrollment.next_payment_due!).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Course Access Suspended
          </h2>

          {/* Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-red-900 font-semibold mb-1">
                  Payment Overdue by {daysOverdue} Days
                </p>
                <p className="text-red-700 text-sm">
                  {enrollment.access_blocked_reason || 
                   "Your installment payment is past due. Complete your payment to restore access to course materials."}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium text-gray-900">{enrollment.course_name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Installment:</span>
                <span className="font-medium text-gray-900">
                  {enrollment.installments_paid + 1} of {enrollment.total_installments}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Due:</span>
                <span className="font-bold text-red-600 text-xl">
                  {enrollment.currency === 'NGN' ? '₦' : '$'}
                  {enrollment.installment_amount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(enrollment.next_payment_due!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/user/payment/${enrollment.id}`)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Make Payment Now
            </button>
            
            <button
              onClick={() => router.push('/user/dashboard')}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-600 mt-6">
            Need help? Contact support at{' '}
            <a href="mailto:info@lernexity.org" className="text-purple-600 hover:underline">
              info@learnexity.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Warning Banner for upcoming payment (7 days grace period)
interface PaymentWarningBannerProps {
  enrollment: CourseEnrollment;
}

export const PaymentWarningBanner: React.FC<PaymentWarningBannerProps> = ({ enrollment }) => {
  const router = useRouter();
  
  if (!enrollment.access_blocked_reason || enrollment.has_access === false) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">Payment Due Soon</h3>
          <p className="text-yellow-800 text-sm mb-3">
            {enrollment.access_blocked_reason}
          </p>
          <button
            onClick={() => router.push(`/user/payment/${enrollment.id}`)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Make Payment Now
          </button>
        </div>
      </div>
    </div>
  );
};