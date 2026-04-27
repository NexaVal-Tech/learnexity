// pages/user/payment/success.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;

    const verify = async () => {
      try {
        if (session_id) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stripe/verify-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ session_id }),
          });
        }
      } catch {
        // non-critical — webhook handles DB update
      } finally {
        window.location.replace(
          `${window.location.origin}/user/dashboard?tab=your-course&payment=success`
        );
      }
    };

    verify();
  }, [router.isReady, session_id]);

  return (
    <UserDashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Payment confirmed! Redirecting...</p>
        </div>
      </div>
    </UserDashboardLayout>
  );
}