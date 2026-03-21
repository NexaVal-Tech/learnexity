/**
 * pages/kids/payment/success.tsx
 *
 * Shown after a successful Stripe or Paystack payment.
 * Verifies the payment server-side and displays full session details.
 * Works for both one-time and installment payments.
 */
import React, { useEffect, useState } from "react";
import { useRouter }   from "next/router";
import Head            from "next/head";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BRAND   = "#4A3AFF";

interface Enrollment {
  id: number;
  parent_name: string;
  parent_email: string;
  student_name: string;
  student_age: number;
  session_type: "one_on_one" | "group_mentorship";
  chosen_track: string;
  payment_type: "onetime" | "installment";
  payment_status: "pending" | "partial" | "completed" | "failed";
  currency: "USD" | "NGN";
  total_price: number;
  amount_paid: number;
  remaining_balance: number;
  next_installment_amount: number;
  total_installments: number;
  installments_paid: number;
  installments_remaining: number;
  next_payment_due: string | null;
  has_access: boolean;
  course: {
    name: string;
    emoji: string;
    color: string;
    duration_months: number;
  } | null;
  payments: Array<{
    number: number;
    amount: number;
    currency: string;
    paid_at: string;
    transaction_id: string;
    gateway: string;
  }>;
}

function fmt(amount: number, currency: string): string {
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function trackLabel(slug: string): string {
  const map: Record<string, string> = {
    digital_foundations: "Digital Foundations",
    creative_design:     "Creative Design",
    game_builder:        "Game Builder",
    media_creator:       "Media Creator",
  };
  return map[slug] ?? slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function KidsPaymentSuccess() {
  const router = useRouter();
  const { session_id, reference, enrollment_id } = router.query;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!enrollment_id) return;

    const verify = async () => {
      setLoading(true);
      try {
        let data: { enrollment: Enrollment };

        if (session_id) {
          // Stripe
          const res = await fetch(
            `${API_URL}/api/kids/stripe/verify?session_id=${session_id}&enrollment_id=${enrollment_id}`
          );
          data = await res.json();
        } else if (reference) {
          // Paystack
          const res = await fetch(
            `${API_URL}/api/kids/paystack/verify?reference=${reference}&enrollment_id=${enrollment_id}`
          );
          data = await res.json();
        } else {
          // Fallback: just load the enrollment
          const res = await fetch(`${API_URL}/api/kids/enrollment/${enrollment_id}`);
          data = await res.json();
        }

        setEnrollment(data.enrollment ?? null);
        if (!data.enrollment) setError("Could not verify payment. Please contact support.");
      } catch {
        setError("Verification failed. Please contact support with your enrollment reference.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [session_id, reference, enrollment_id]);

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-5">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-slate-500 text-sm">Verifying your payment…</p>
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 gap-5">
        <div className="text-5xl">😔</div>
        <h2 className="text-xl font-bold text-slate-800">Verification Issue</h2>
        <p className="text-slate-500 text-sm max-w-sm text-center">{error}</p>
        <button onClick={() => router.push("/kids")} className="px-6 py-3 rounded-xl text-white font-bold" style={{ background: BRAND }}>
          Back to Kids Page
        </button>
      </div>
    );
  }

  if (!enrollment) return null;

  const isFullyPaid  = enrollment.payment_status === "completed";
  const isPartial    = enrollment.payment_status === "partial";
  const color        = enrollment.course?.color ?? BRAND;
  const lastPayment  = enrollment.payments[enrollment.payments.length - 1];

  return (
    <>
      <Head>
        <title>{isFullyPaid ? "Enrollment Confirmed!" : "Payment Received!"} — Learnexity Kids</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50" style={{ fontFamily: "Outfit, sans-serif" }}>
        <div className="max-w-xl mx-auto px-4 py-12">

          {/* Success header */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg"
              style={{ background: isFullyPaid ? "#dcfce7" : "#fff7ed" }}
            >
              {isFullyPaid ? "🎉" : "✅"}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              {isFullyPaid ? "You're all set!" : "Payment received!"}
            </h1>
            <p className="text-slate-500 mt-2">
              {isFullyPaid
                ? `${enrollment.student_name}'s enrollment is fully confirmed.`
                : `Payment ${enrollment.installments_paid} of ${enrollment.total_installments} received for ${enrollment.student_name}.`}
            </p>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">

            {/* Course band */}
            <div className="px-6 py-5 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, borderBottom: `1px solid ${color}20` }}>
              <div className="text-4xl">{enrollment.course?.emoji ?? "📚"}</div>
              <div>
                <p className="font-bold text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>{enrollment.course?.name}</p>
                <p className="text-sm text-slate-500">
                  {trackLabel(enrollment.chosen_track)} ·{" "}
                  {enrollment.session_type === "one_on_one" ? "🎯 One-on-One Coaching" : "👥 Group Mentorship"} ·{" "}
                  {enrollment.course?.duration_months} months
                </p>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Student & parent */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Student</p>
                  <p className="font-semibold text-slate-800">{enrollment.student_name}</p>
                  <p className="text-xs text-slate-400">Age {enrollment.student_age}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Parent</p>
                  <p className="font-semibold text-slate-800">{enrollment.parent_name}</p>
                  <p className="text-xs text-slate-400">{enrollment.parent_email}</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Payment summary */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Payment Summary</p>
                <div className="space-y-2 text-sm">
                  {lastPayment && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paid now</span>
                      <span className="font-bold text-slate-800">{fmt(lastPayment.amount, lastPayment.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total paid so far</span>
                    <span className="font-bold text-green-600">{fmt(enrollment.amount_paid, enrollment.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total course fee</span>
                    <span className="font-semibold text-slate-600">{fmt(enrollment.total_price, enrollment.currency)}</span>
                  </div>
                  {isPartial && (
                    <>
                      <div className="flex justify-between text-amber-600">
                        <span>Remaining balance</span>
                        <span className="font-bold">{fmt(enrollment.remaining_balance, enrollment.currency)}</span>
                      </div>
                      <div className="flex justify-between text-amber-600">
                        <span>Next payment due</span>
                        <span className="font-semibold">
                          {enrollment.next_payment_due
                            ? new Date(enrollment.next_payment_due).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                            : "~1 month from now"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-100 mt-1">
                    <span className="text-slate-500">Status</span>
                    <span
                      className="font-bold px-3 py-0.5 rounded-full text-xs"
                      style={{ background: isFullyPaid ? "#dcfce7" : "#fff7ed", color: isFullyPaid ? "#16a34a" : "#ea580c" }}
                    >
                      {isFullyPaid ? "Fully Paid" : `${enrollment.installments_paid} of ${enrollment.total_installments} paid`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction reference */}
              {lastPayment?.transaction_id && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Transaction Reference</p>
                  <p className="text-xs font-mono text-slate-600 break-all">{lastPayment.transaction_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">What Happens Next</p>
            <div className="space-y-4">
              {[
                {
                  icon: "📧",
                  title: "Confirmation email sent",
                  desc: `We've sent a receipt to ${enrollment.parent_email}`,
                  done: true,
                },
                {
                  icon: "📞",
                  title: isFullyPaid ? "We'll be in touch within 24 hours" : "Next payment reminder",
                  desc: isFullyPaid
                    ? "Our team will contact you to schedule sessions for " + enrollment.student_name
                    : `You'll receive an email reminder before your next payment is due in ~1 month`,
                  done: false,
                },
                {
                  icon: "🚀",
                  title: "Sessions begin",
                  desc: `${enrollment.student_name} starts the ${enrollment.course?.name} programme`,
                  done: false,
                },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: step.done ? "#dcfce7" : "#f1f5f9" }}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isPartial && (
              <button
                onClick={() => router.push(`/kids/payment/${enrollment.id}`)}
                className="w-full py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.01]"
                style={{ background: color, fontFamily: "Poppins, sans-serif" }}
              >
                View Payment Schedule →
              </button>
            )}
            <button
              onClick={() => router.push("/kids")}
              className="w-full py-4 rounded-2xl font-bold text-slate-700 border-2 border-slate-200 hover:bg-slate-50 transition-all"
            >
              Back to Kids Programme
            </button>
          </div>

          {/* Support line */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Questions? Email us at{" "}
            <a href="mailto:info@learnexity.org" className="underline" style={{ color: BRAND }}>info@learnexity.org</a>
          </p>
        </div>
      </div>
    </>
  );
}