/**
 * pages/kids/payment/success.tsx
 *
 * Dark-themed success page matching the kids.tsx design language.
 * Verifies Stripe / Paystack payment and shows full session details.
 */
import React, { useEffect, useState } from "react";
import { useRouter }   from "next/router";
import Head            from "next/head";
import { ArrowRight, CheckCircle, Mail, Phone, MessageCircle, Rocket } from "lucide-react";

const API_URL      = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BRAND        = "#4A3AFF";
const BRAND_ORANGE = "#f59e0b";
const WHATSAPP_URL = "https://chat.whatsapp.com/KJntcErzERgBOfQqECkHCI?mode=gi_t";

interface Enrollment {
  id: number;
  parent_name: string; parent_email: string;
  student_name: string; student_age: number;
  session_type: "one_on_one" | "group_mentorship";
  chosen_track: string;
  payment_type: "onetime" | "installment";
  payment_status: "pending" | "partial" | "completed" | "failed";
  currency: "USD" | "NGN";
  total_price: number; amount_paid: number; remaining_balance: number;
  next_installment_amount: number; total_installments: number;
  installments_paid: number; installments_remaining: number;
  next_payment_due: string | null;
  has_access: boolean;
  course: { name: string; emoji: string; color: string; duration_months: number; } | null;
  payments: Array<{
    number: number; amount: number; currency: string;
    paid_at: string; transaction_id: string; gateway: string;
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
        let data: any;
        if (session_id) {
          const res = await fetch(`${API_URL}/api/kids/stripe/verify?session_id=${session_id}&enrollment_id=${enrollment_id}`);
          data = await res.json();
        } else if (reference) {
          const res = await fetch(`${API_URL}/api/kids/paystack/verify?reference=${reference}&enrollment_id=${enrollment_id}`);
          data = await res.json();
        } else {
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "#080808" }}>
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Poppins:wght@700;900&display=swap');`}</style>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: BRAND, borderRightColor: `${BRAND}44` }} />
          <div className="absolute inset-2 rounded-full" style={{ background: `${BRAND}15` }} />
        </div>
        <div className="text-center">
          <p className="font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>Verifying your payment…</p>
          <p className="text-sm mt-1" style={{ color: "#6b7280", fontFamily: "Outfit, sans-serif" }}>This usually takes just a second.</p>
        </div>
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-5" style={{ background: "#080808" }}>
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Poppins:wght@700;900&display=swap');`}</style>
        <div className="text-6xl">😔</div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>Verification Issue</h2>
        <p className="text-sm max-w-sm text-center" style={{ color: "#9ca3af" }}>{error}</p>
        <button onClick={() => router.push("/kids")}
          className="px-8 py-4 font-bold text-white transition-all hover:opacity-90"
          style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 10px 32px ${BRAND}44`, fontFamily: "Outfit, sans-serif" }}>
          Back to Kids Page
        </button>
      </div>
    );
  }

  if (!enrollment) return null;

  const isFullyPaid = enrollment.payment_status === "completed";
  const isPartial   = enrollment.payment_status === "partial";
  const color       = enrollment.course?.color ?? BRAND;
  const lastPayment = enrollment.payments[enrollment.payments.length - 1];

  return (
    <>
      <Head>
        <title>{isFullyPaid ? "Enrollment Confirmed! 🎉" : "Payment Received! ✅"} — Learnexity Kids</title>
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&family=Poppins:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #080808; }
        @keyframes successPop {
          0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          70%  { transform: scale(1.1) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes confetti {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes kidsFloat { 0%,100% { transform:translateY(0) rotate(0); } 50% { transform:translateY(-12px) rotate(4deg); } }
        .fade-up-1 { animation: fadeUp 0.5s ease 0.1s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.5s ease 0.25s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.5s ease 0.4s forwards; opacity: 0; }
      `}</style>

      {/* Confetti particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {isFullyPaid && [BRAND, BRAND_ORANGE, "#22c55e", "#ec4899", "#8b5cf6"].map((c, idx) =>
          Array.from({ length: 3 }).map((_, j) => (
            <div key={`${idx}-${j}`} style={{
              position: "absolute",
              left: `${(idx * 20 + j * 7 + 5)}%`,
              top: "-20px",
              width: `${6 + j * 2}px`,
              height: `${6 + j * 2}px`,
              borderRadius: j === 0 ? "50%" : "2px",
              background: c,
              opacity: 0.7,
              animation: `confetti ${3 + idx * 0.4 + j * 0.3}s ease-in ${idx * 0.15 + j * 0.1}s forwards`,
            }} />
          ))
        )}
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "0%", right: "0%", width: "600px", height: "600px", borderRadius: "50%", background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "0%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${BRAND}12 0%, transparent 70%)`, filter: "blur(80px)" }} />
      </div>

      <div className="relative min-h-screen" style={{ fontFamily: "Outfit, sans-serif", color: "#fff", zIndex: 1 }}>

        {/* ── Top bar ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="max-w-3xl mx-auto px-6 py-4">
            <button onClick={() => router.push("/kids")} className="flex items-center gap-2 text-sm font-semibold transition-all hover:text-white" style={{ color: "#6b7280" }}>← Back to Kids</button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">

          {/* ── Success header ── */}
          <div className="text-center mb-10">
            <div style={{ animation: "successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards", display: "inline-block" }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-5"
                style={{ background: isFullyPaid ? "rgba(34,197,94,0.12)" : "rgba(74,58,255,0.12)", border: `2px solid ${isFullyPaid ? "rgba(34,197,94,0.3)" : `${BRAND}40`}`, boxShadow: `0 0 60px ${isFullyPaid ? "rgba(34,197,94,0.2)" : `${BRAND}25`}` }}>
                {isFullyPaid ? "🎉" : "✅"}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white fade-up-1" style={{ fontFamily: "Poppins, sans-serif" }}>
              {isFullyPaid ? "You're all set!" : "Payment received!"}
            </h1>
            <p className="text-lg mt-3 fade-up-1" style={{ color: "#9ca3af" }}>
              {isFullyPaid
                ? `${enrollment.student_name}'s enrollment is fully confirmed. Welcome to Learnexity! 🚀`
                : `Payment ${enrollment.installments_paid} of ${enrollment.total_installments} confirmed for ${enrollment.student_name}.`}
            </p>
          </div>

          {/* ── Email notice ── */}
          <div className="mb-6 fade-up-1 flex items-center gap-3 px-5 py-4"
            style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: `${BRAND}08`, border: `1px solid ${BRAND}25` }}>
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: BRAND }} />
            <p className="text-sm" style={{ color: "#d1d5db" }}>
              <span className="font-bold text-white">Confirmation email sent</span> to <span style={{ color: BRAND }}>{enrollment.parent_email}</span>. Check your inbox (and spam folder).
            </p>
          </div>

          {/* ── WhatsApp CTA banner ── */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 fade-up-1 flex items-center gap-4 px-5 py-4 transition-all hover:opacity-90"
            style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.25)", textDecoration: "none", display: "flex" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.3)" }}>
              <MessageCircle className="w-5 h-5" style={{ color: "#25D366" }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">Join Our Closed group</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                Schedules, session reminders & cohort updates for {enrollment.student_name}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 flex-shrink-0"
              style={{ borderRadius: "1rem 0.25rem 1rem 0.25rem", background: "#25D366", color: "#fff" }}>
              Join 
            </span>
          </a>

          <div className="grid lg:grid-cols-5 gap-6 fade-up-2">

            {/* ── Left: Course + Payment Summary ── */}
            <div className="lg:col-span-3 space-y-4">

              {/* Course card */}
              <div style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,15,15,0.9)", overflow: "hidden", backdropFilter: "blur(12px)" }}>
                <div className="px-6 py-5 flex items-center gap-4"
                  style={{ background: `linear-gradient(135deg, ${color}18 0%, transparent 100%)`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-4xl" style={{ animation: "kidsFloat 4s ease-in-out infinite" }}>{enrollment.course?.emoji ?? "📚"}</div>
                  <div>
                    <p className="font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>{enrollment.course?.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      {trackLabel(enrollment.chosen_track)} · {enrollment.session_type === "one_on_one" ? "🎯 One-on-One Coaching" : "👥 Group Mentorship"} · {enrollment.course?.duration_months} months
                    </p>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#4b5563" }}>Student</p>
                      <p className="font-bold text-sm text-white">{enrollment.student_name}</p>
                      <p className="text-xs" style={{ color: "#6b7280" }}>Age {enrollment.student_age}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#4b5563" }}>Parent</p>
                      <p className="font-bold text-sm text-white">{enrollment.parent_name}</p>
                      <p className="text-xs truncate" style={{ color: "#6b7280" }}>{enrollment.parent_email}</p>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)" }} />

                  {/* Payment summary */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4b5563" }}>Payment Summary</p>
                    <div className="space-y-2 text-sm">
                      {lastPayment && (
                        <div className="flex justify-between">
                          <span style={{ color: "#9ca3af" }}>Paid now</span>
                          <span className="font-bold text-white">{fmt(lastPayment.amount, lastPayment.currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span style={{ color: "#9ca3af" }}>Total paid so far</span>
                        <span className="font-bold" style={{ color: "#22c55e" }}>{fmt(enrollment.amount_paid, enrollment.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "#9ca3af" }}>Total course fee</span>
                        <span className="font-semibold" style={{ color: "#d1d5db" }}>{fmt(enrollment.total_price, enrollment.currency)}</span>
                      </div>
                      {isPartial && (
                        <>
                          <div className="flex justify-between" style={{ color: BRAND_ORANGE }}>
                            <span>Remaining balance</span>
                            <span className="font-bold">{fmt(enrollment.remaining_balance, enrollment.currency)}</span>
                          </div>
                          <div className="flex justify-between" style={{ color: BRAND_ORANGE }}>
                            <span>Next payment due</span>
                            <span className="font-semibold">
                              {enrollment.next_payment_due
                                ? new Date(enrollment.next_payment_due).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
                                : "~1 month from now"}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#9ca3af" }}>Status</span>
                        <span className="font-bold text-xs px-3 py-1 rounded-full"
                          style={{ background: isFullyPaid ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)", color: isFullyPaid ? "#22c55e" : BRAND_ORANGE }}>
                          {isFullyPaid ? "✓ Fully Paid" : `${enrollment.installments_paid} of ${enrollment.total_installments} paid`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ref */}
                  {lastPayment?.transaction_id && (
                    <div className="px-4 py-3" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#4b5563" }}>Transaction Reference</p>
                      <p className="text-xs font-mono break-all" style={{ color: "#6b7280" }}>{lastPayment.transaction_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: What happens next + actions ── */}
            <div className="lg:col-span-2 space-y-4 fade-up-3">

              {/* What happens next */}
              <div style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,15,15,0.9)", overflow: "hidden", backdropFilter: "blur(12px)" }}>
                <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4b5563" }}>What Happens Next</p>
                </div>
                <div className="px-6 py-5 space-y-5">
                  {[
                    {
                      icon: <Mail className="w-5 h-5" />,
                      iconColor: BRAND,
                      title: "Email sent",
                      desc: `Receipt sent to ${enrollment.parent_email}`,
                      done: true,
                      action: null,
                    },
                    {
                      icon: <MessageCircle className="w-5 h-5" />,
                      iconColor: "#25D366",
                      title: "Join the parent group",
                      desc: "Get updates, schedules & session reminders",
                      done: false,
                      action: (
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all hover:opacity-90"
                          style={{ borderRadius: "1rem 0.25rem 1rem 0.25rem", background: "#25D366", color: "#fff", textDecoration: "none" }}
                        >
                          Join WhatsApp →
                        </a>
                      ),
                    },
                    {
                      icon: <Phone className="w-5 h-5" />,
                      iconColor: BRAND_ORANGE,
                      title: isFullyPaid ? "We'll contact you within 24h" : "Next payment reminder",
                      desc: isFullyPaid
                        ? `Scheduling sessions for ${enrollment.student_name}`
                        : "You'll be reminded before your next payment",
                      done: false,
                      action: null,
                    },
                    {
                      icon: <Rocket className="w-5 h-5" />,
                      iconColor: "#22c55e",
                      title: "Sessions begin",
                      desc: `${enrollment.student_name} starts the programme`,
                      done: false,
                      action: null,
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: step.done ? `${step.iconColor}20` : "rgba(255,255,255,0.04)", border: `1px solid ${step.done ? `${step.iconColor}40` : "rgba(255,255,255,0.08)"}`, color: step.iconColor }}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-white">{step.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{step.desc}</p>
                        {step.action}
                      </div>
                      {step.done && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 ml-auto" style={{ color: "#22c55e" }} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isPartial && (
                  <button onClick={() => router.push(`/kids/payment/${enrollment.id}`)}
                    className="w-full py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: color, boxShadow: `0 10px 32px ${color}44`, fontFamily: "Poppins, sans-serif" }}>
                    View Payment Schedule <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => router.push("/kids")}
                  className="w-full py-4 font-bold text-sm text-white transition-all hover:bg-white/5"
                  style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                  ← Back to Kids Programme
                </button>
              </div>

              {/* Support */}
              <p className="text-center text-xs" style={{ color: "#4b5563" }}>
                Questions?{" "}
                <a href="mailto:info@learnexity.org" className="underline transition-all hover:text-white" style={{ color: BRAND }}>
                  info@learnexity.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}