// Create this file at: pages/ref/[code].tsx
// This handles URLs like: https://learnexity.org/ref/REF123ABC

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReferralRedirect() {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (code && typeof code === 'string') {
      // Redirect to registration page with referral code
      router.replace(`/user/auth/register?ref=${code}`);
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to registration...</p>
      </div>
    </div>
  );
}