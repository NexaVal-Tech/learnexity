/**
 * pages/kids/payment/[enrollmentId].tsx
 *
 * Dark-themed payment page matching the kids.tsx design language.
 * Handles both Stripe (USD) and Paystack (NGN) payments.
 * Supports one-time and installment payment flows.
 */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BRAND        = "#4A3AFF";
const BRAND_ORANGE = "#f59e0b";

interface PaymentInfo {
  number: number; amount: number; currency: string;
  paid_at: string; transaction_id: string; gateway: string;
}

interface Enrollment {
  id: number; resume_token: string; parent_name: string; parent_email: string;
  student_name: string; student_age: number;
  session_type: "one_on_one" | "group_mentorship";
  chosen_track: string;
  payment_type: "onetime" | "installment";
  payment_status: "pending" | "partial" | "completed" | "failed";
  currency: "USD" | "NGN";
  total_price: number; amount_paid: number; remaining_balance: number;
  next_installment_amount: number; total_installments: number;
  installments_paid: number; installments_remaining: number;
  next_payment_due: string | null; has_access: boolean;
  course: { id: number; slug: string; name: string; emoji: string; color: string; duration_months: number; } | null;
  payments: PaymentInfo[];
}

function fmt(amount: number, currency: string): string {
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function trackLabel(slug: string): string {
  const map: Record<string, string> = {
    digital_foundations: "Digital Foundations",
    creative_design: "Creative Design",
    game_builder: "Game Builder",
    media_creator: "Media Creator",
  };
  return map[slug] ?? slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function KidsPaymentPage() {
  const router = useRouter();
  const { enrollmentId, cancelled } = router.query;

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading]       = useState(true);
  const [paying, setPaying]         = useState(false);
  const [error, setError]           = useState("");
  const [cancelledMsg, setCancelledMsg] = useState(false);

  useEffect(() => {
    if (cancelled === "1") setCancelledMsg(true);
  }, [cancelled]);

  useEffect(() => {
    if (!enrollmentId) return;
    setLoading(true);
    fetch(`${API_URL}/api/kids/enrollment/${enrollmentId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.enrollment) setEnrollment(d.enrollment);
        else setError("Enrollment not found.");
      })
      .catch(() => setError("Could not load enrollment. Please check the link or try again."))
      .finally(() => setLoading(false));
  }, [enrollmentId]);

  const handlePay = async () => {
    if (!enrollment) return;
    setPaying(true);
    setError("");
    try {
      if (enrollment.currency === "USD") {
        const res  = await fetch(`${API_URL}/api/kids/stripe/checkout`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollment_id: enrollment.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Stripe payment failed to initialise");
        window.location.href = data.url;
      } else {
        const res  = await fetch(`${API_URL}/api/kids/paystack/initialize`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollment_id: enrollment.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Paystack payment failed to initialise");
        window.location.href = data.authorization_url;
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#080808" }}>
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Poppins:wght@700;900&display=swap');`}</style>
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: BRAND, borderRightColor: `${BRAND}44` }} />
          <div className="absolute inset-2 rounded-full" style={{ background: `${BRAND}15` }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#9ca3af", fontFamily: "Outfit, sans-serif" }}>Loading your enrollment…</p>
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#080808" }}>
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Poppins:wght@700;900&display=swap');`}</style>
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Enrollment Not Found</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm text-center">{error}</p>
        <button onClick={() => router.push("/kids")}
          className="px-8 py-4 font-bold text-white text-sm transition-all hover:opacity-90"
          style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 10px 32px ${BRAND}44`, fontFamily: "Outfit, sans-serif" }}>
          Back to Kids Programme
        </button>
      </div>
    );
  }

  if (!enrollment) return null;

  const isComplete  = enrollment.payment_status === "completed";
  const isPartial   = enrollment.payment_status === "partial";
  const color       = enrollment.course?.color ?? BRAND;

  return (
    <>
      <Head><title>Kids Payment — {enrollment.course?.name ?? "Learnexity"}</title></Head>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&family=Poppins:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #080808; }
        @keyframes kidsFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-delay { animation: fadeUp 0.5s ease 0.15s forwards; opacity: 0; }
        .fade-up-delay-2 { animation: fadeUp 0.5s ease 0.3s forwards; opacity: 0; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "Outfit, sans-serif", color: "#fff" }}>

        {/* ── Top Bar ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => router.push("/kids")}
              className="flex items-center gap-2 text-sm font-semibold transition-all hover:text-white"
              style={{ color: "#6b7280" }}>
              ← Back to Kids
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: "#22c55e" }} />
              <span className="text-xs font-bold" style={{ color: "#6b7280" }}>SSL Encrypted · Secure Payment</span>
            </div>
          </div>
        </div>

        {/* ── Hero accent ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div style={{ position: "absolute", top: "10%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div style={{ position: "absolute", bottom: "5%", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${BRAND}12 0%, transparent 70%)`, filter: "blur(80px)" }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-10" style={{ zIndex: 1 }}>

          {/* ── Cancelled Banner ── */}
          {cancelledMsg && (
            <div className="mb-6 px-5 py-4 flex items-center gap-3 fade-up"
              style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: "rgba(245,158,11,0.08)", border: `1px solid ${BRAND_ORANGE}30` }}>
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-bold text-sm" style={{ color: BRAND_ORANGE }}>Payment Cancelled</p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>No worries — your enrollment is saved. You can try again whenever you're ready.</p>
              </div>
            </div>
          )}

          {/* ── Fully Paid Banner ── */}
          {isComplete && (
            <div className="mb-6 px-5 py-4 flex items-center gap-3 fade-up"
              style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#22c55e" }} />
              <div>
                <p className="font-bold text-sm" style={{ color: "#22c55e" }}>Enrollment Fully Paid!</p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Our team will reach out within 24 hours with session details for {enrollment.student_name}.</p>
              </div>
            </div>
          )}

          <div className="flex justify-center">

            {/* ── Order Summary ── */}
            <div className="w-full max-w-md space-y-4">
              <div className="fade-up-delay" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,15,15,0.9)", overflow: "hidden", backdropFilter: "blur(12px)", position: "sticky", top: "80px" }}>
                <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${color}12 0%, transparent 100%)`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#4b5563" }}>Order Summary</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold" style={{ color, fontFamily: "Poppins, sans-serif" }}>
                      {fmt(enrollment.next_installment_amount, enrollment.currency)}
                    </span>
                    {enrollment.payment_type === "installment" && (
                      <span className="text-xs" style={{ color: "#6b7280" }}>/ payment</span>
                    )}
                  </div>
                  {enrollment.payment_type === "installment" && (
                    <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                      Payment {enrollment.installments_paid + 1} of {enrollment.total_installments}
                    </p>
                  )}
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "🏗️ Digital Foundations", val: "Month 1 · included" },
                      { label: `${enrollment.course?.emoji ?? "📚"} ${trackLabel(enrollment.chosen_track)}`, val: "Months 2–3" },
                      { label: enrollment.session_type === "one_on_one" ? "🎯 One-on-One" : "👥 Mini Group", val: "Session format" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span style={{ color: "#9ca3af" }}>{row.label}</span>
                        <span className="font-semibold" style={{ color: "#d1d5db" }}>{row.val}</span>
                      </div>
                    ))}
                    <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Due Today</span>
                      <span style={{ color }}>{fmt(enrollment.next_installment_amount, enrollment.currency)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="px-4 py-3 text-sm" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                      {error}
                    </div>
                  )}

                  {!isComplete ? (
                    <>
                      <button onClick={handlePay} disabled={paying}
                        className="w-full py-4 font-bold text-base text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: color, boxShadow: `0 10px 32px ${color}44`, fontFamily: "Poppins, sans-serif" }}>
                        {paying ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Redirecting…
                          </>
                        ) : (
                          <>
                            {enrollment.currency === "USD" ? "💳" : "🏦"} Pay {fmt(enrollment.next_installment_amount, enrollment.currency)}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs" style={{ color: "#4b5563" }}>
                        {enrollment.currency === "USD" ? "Powered by Stripe · Card payments" : "Powered by Paystack · Card & bank transfer"}
                      </p>
                    </>
                  ) : (
                    <button onClick={() => router.push("/kids")}
                      className="w-full py-4 font-bold text-sm text-white transition-all hover:opacity-90"
                      style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)" }}>
                      ← Back to Kids Programme
                    </button>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div className="fade-up-delay-2 grid grid-cols-2 gap-3">
                {[
                  { icon: "🔒", title: "Secure", desc: "SSL encrypted" },
                  { icon: "↩️", title: "Safe", desc: "Verified payments" },
                ].map((b) => (
                  <div key={b.title} className="px-4 py-3 text-center"
                    style={{ borderRadius: "1.25rem 0.5rem 1.25rem 0.5rem", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-xl mb-1">{b.icon}</div>
                    <p className="text-xs font-bold text-white">{b.title}</p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* Installment reminder */}
              {enrollment.payment_type === "installment" && !isComplete && (
                <div className="fade-up-delay-2 px-4 py-4"
                  style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: `${BRAND_ORANGE}08`, border: `1px solid ${BRAND_ORANGE}25` }}>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: BRAND_ORANGE }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: BRAND_ORANGE }}>Bookmark this page</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Return here for your next payment. No account needed — your enrollment is always saved.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}