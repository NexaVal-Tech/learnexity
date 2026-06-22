'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import api from '@/lib/api';

const BRAND = '#4A3AFF';

export default function ConsultationSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading');
  const [consultation, setConsultation] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { provider, session_id, reference } = router.query;
    if (!provider) { setStatus('error'); return; }

    const verify = async () => {
      try {
        const res = await api.consultations.verifyPayment({
          provider: provider as 'stripe' | 'paystack',
          session_id: session_id as string | undefined,
          reference: reference as string | undefined,
        });
        setConsultation(res.consultation);
        setStatus(res.consultation?.payment_status === 'paid' ? 'paid' : 'pending');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [router.isReady, router.query]);

  return (
    <>
      <Head><title>Booking Confirmation – Learnexity</title></Head>
      <AppLayout>
        <div className="min-h-[100vh] flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
          <div className="max-w-md w-full text-center py-10 ">
            {status === 'loading' && (
              <>
                <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: BRAND }} />
                <p className="text-gray-400">Confirming your payment…</p>
              </>
            )}

            {status === 'paid' && consultation && (
              <>
                <CheckCircle size={64} style={{ color: BRAND }} className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Booking Confirmed!
                </h1>
                <p className="text-gray-400 mb-1">Your consultation is scheduled for:</p>
                <p className="text-white font-semibold">
                  {new Date(consultation.preferred_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p style={{ color: BRAND }} className="font-bold text-lg mb-6">{consultation.preferred_time}</p>
                <p className="text-sm text-gray-500">
                  A confirmation has been sent to <span className="text-white">{consultation.email}</span>.
                </p>
              </>
            )}

            {status === 'pending' && (
              <>
                <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: BRAND }} />
                <p className="text-gray-400">Payment is still processing — this can take a moment. Refresh in a few seconds.</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
                <p className="text-gray-400">We couldn't verify your payment. If you were charged, please contact support with your email.</p>
              </>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}