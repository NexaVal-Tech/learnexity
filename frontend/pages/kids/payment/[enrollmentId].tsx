import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

interface PaymentInfo { number: number; amount: number; currency: string; paid_at: string; transaction_id: string; gateway: string; }
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BRAND   = "#4A3AFF";

function fmt(amount: number, currency: string): string {
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
function trackLabel(slug: string): string {
  const map: Record<string, string> = { digital_foundations: "Digital Foundations", creative_design: "Creative Design", game_builder: "Game Builder", media_creator: "Media Creator" };
  return map[slug] ?? slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function KidsPaymentPage() {
  const router = useRouter();
  const { enrollmentId, cancelled } = router.query;
  const [enrollment, setEnrollment]     = useState<Enrollment | null>(null);
  const [loading, setLoading]           = useState(true);
  const [paying, setPaying]             = useState(false);
  const [error, setError]               = useState("");
  const [cancelledMsg, setCancelledMsg] = useState(false);

  // ── Page mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log("[KidsPaymentPage] Mounted | API_URL →", API_URL);
    console.log("[KidsPaymentPage] URL query params →", router.query);
  }, []);

  // ── Watch query params ──────────────────────────────────────────────────────
  useEffect(() => {
    console.log("[KidsPaymentPage] enrollmentId →", enrollmentId);
  }, [enrollmentId]);

  useEffect(() => {
    if (cancelled === "1") {
      console.log("[KidsPaymentPage] Payment was cancelled by user — showing cancellation banner");
      setCancelledMsg(true);
    }
  }, [cancelled]);

  // ── Load enrollment ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enrollmentId) { console.log("[KidsPaymentPage] No enrollmentId yet — waiting"); return; }
    console.log(`[KidsPaymentPage] Fetching enrollment ${enrollmentId} from ${API_URL}/api/kids/enrollment/${enrollmentId}`);
    setLoading(true);
    fetch(`${API_URL}/api/kids/enrollment/${enrollmentId}`)
      .then((r) => {
        console.log("[KidsPaymentPage] Enrollment fetch status →", r.status);
        return r.json();
      })
      .then((d) => {
        console.log("[KidsPaymentPage] Enrollment data →", d);
        if (d.enrollment) {
          console.log("[KidsPaymentPage] Enrollment loaded →", {
            id:               d.enrollment.id,
            student:          d.enrollment.student_name,
            course:           d.enrollment.course?.name,
            enrollmentType:   d.enrollment.enrollment_type,
            paymentType:      d.enrollment.payment_type,
            paymentStatus:    d.enrollment.payment_status,
            currency:         d.enrollment.currency,
            totalPrice:       d.enrollment.total_price,
            amountPaid:       d.enrollment.amount_paid,
            remaining:        d.enrollment.remaining_balance,
            nextAmount:       d.enrollment.next_installment_amount,
            installmentsPaid: d.enrollment.installments_paid,
            totalInstallments: d.enrollment.total_installments,
            hasAccess:        d.enrollment.has_access,
          });
          setEnrollment(d.enrollment);
        } else {
          console.warn("[KidsPaymentPage] No enrollment in response →", d);
          setError("Enrollment not found.");
        }
      })
      .catch((e) => {
        console.error("[KidsPaymentPage] Enrollment fetch failed →", e.message, e);
        setError("Could not load enrollment. Please check the link or try again.");
      })
      .finally(() => {
        setLoading(false);
        console.log("[KidsPaymentPage] Enrollment fetch complete — loading off");
      });
  }, [enrollmentId]);

  // ── State change tracking ───────────────────────────────────────────────────
  useEffect(() => { console.log("[KidsPaymentPage] enrollment state →", enrollment ? `id:${enrollment.id} status:${enrollment.payment_status}` : "null"); }, [enrollment]);
  useEffect(() => { console.log("[KidsPaymentPage] loading →", loading); }, [loading]);
  useEffect(() => { console.log("[KidsPaymentPage] paying →", paying); }, [paying]);
  useEffect(() => { if (error) console.error("[KidsPaymentPage] error →", error); }, [error]);

  // ── Handle payment ──────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!enrollment) { console.warn("[KidsPaymentPage] handlePay called but no enrollment loaded"); return; }
    console.log("[KidsPaymentPage] handlePay fired →", {
      enrollmentId:  enrollment.id,
      currency:      enrollment.currency,
      gateway:       enrollment.currency === "USD" ? "Stripe" : "Paystack",
      amount:        fmt(enrollment.next_installment_amount, enrollment.currency),
      paymentType:   enrollment.payment_type,
      installmentNo: enrollment.installments_paid + 1,
    });
    setPaying(true); setError("");
    try {
      if (enrollment.currency === "USD") {
        console.log(`[KidsPaymentPage] POST ${API_URL}/api/kids/stripe/checkout`);
        const res  = await fetch(`${API_URL}/api/kids/stripe/checkout`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollment_id: enrollment.id }),
        });
        const data = await res.json();
        console.log("[KidsPaymentPage] Stripe checkout response →", { status: res.status, ok: res.ok, url: data.url, sessionId: data.session_id, error: data.error });
        if (!res.ok) throw new Error(data.error || "Stripe payment failed to initialise");
        console.log("[KidsPaymentPage] Redirecting to Stripe →", data.url);
        window.location.href = data.url;
      } else {
        console.log(`[KidsPaymentPage] POST ${API_URL}/api/kids/paystack/initialize`);
        const res  = await fetch(`${API_URL}/api/kids/paystack/initialize`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollment_id: enrollment.id }),
        });
        const data = await res.json();
        console.log("[KidsPaymentPage] Paystack initialize response →", { status: res.status, ok: res.ok, authUrl: data.authorization_url, reference: data.reference, error: data.error });
        if (!res.ok) throw new Error(data.error || "Paystack payment failed to initialise");
        console.log("[KidsPaymentPage] Redirecting to Paystack →", data.authorization_url);
        window.location.href = data.authorization_url;
      }
    } catch (e: any) {
      console.error("[KidsPaymentPage] Payment initiation error →", e.message, e);
      setError(e.message || "Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    console.log("[KidsPaymentPage] Rendering loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading your enrollment…</p>
        </div>
      </div>
    );
  }

  if (error && !enrollment) {
    console.log("[KidsPaymentPage] Rendering error state →", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Enrollment Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button onClick={() => { console.log("[KidsPaymentPage] Error state → back to kids"); router.push("/kids"); }} className="px-6 py-3 rounded-xl text-white font-bold text-sm" style={{ background: BRAND }}>Back to Kids Page</button>
        </div>
      </div>
    );
  }

  if (!enrollment) { console.log("[KidsPaymentPage] No enrollment yet — rendering null"); return null; }

  const isComplete  = enrollment.payment_status === "completed";
  const color       = enrollment.course?.color ?? BRAND;
  const paidPercent = enrollment.total_price > 0 ? Math.min(100, (enrollment.amount_paid / enrollment.total_price) * 100) : 0;

  console.log("[KidsPaymentPage] Rendering payment page →", { isComplete, paidPercent: paidPercent.toFixed(1) + "%", color });

  return (
    <>
      <Head><title>Kids Payment — {enrollment.course?.name ?? "Learnexity"}</title></Head>
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "Outfit, sans-serif" }}>
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => { console.log("[KidsPaymentPage] Back to kids clicked"); router.push("/kids"); }} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">← Back to Kids</button>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure Payment</p>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /><span className="text-xs text-slate-500">SSL Protected</span></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          {cancelledMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm flex items-center gap-2">
              <span>⚠️</span> Payment was cancelled. You can try again whenever you're ready.
            </div>
          )}
          {isComplete && (
            <div className="mb-6 px-4 py-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">✅</div>
              <div><p className="font-bold text-green-800 text-sm">This enrollment is fully paid!</p><p className="text-green-600 text-xs mt-0.5">Our team will reach out within 24 hours with session details.</p></div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="px-6 py-6" style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`, borderBottom: `1px solid ${color}22` }}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{enrollment.course?.emoji ?? "📚"}</div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>{enrollment.course?.name ?? "Course"}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">{trackLabel(enrollment.chosen_track)} · {enrollment.session_type === "one_on_one" ? "🎯 One-on-One Coaching" : "👥 Group Mentorship"}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: isComplete ? "#dcfce7" : enrollment.payment_status === "partial" ? "#fff7ed" : "#f1f5f9", color: isComplete ? "#16a34a" : enrollment.payment_status === "partial" ? "#ea580c" : "#64748b" }}>
                  {isComplete ? "Paid" : enrollment.payment_status === "partial" ? "Partial" : "Pending"}
                </span>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Student</p><p className="font-semibold text-slate-800">{enrollment.student_name}, age {enrollment.student_age}</p></div>
                <div><p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Parent</p><p className="font-semibold text-slate-800">{enrollment.parent_name}</p></div>
              </div>
              <hr className="border-slate-100" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Payment Progress</p>
                <div className="w-full h-2.5 rounded-full bg-slate-100 mb-3"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${paidPercent}%`, background: isComplete ? "#22c55e" : color }} /></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Total Course Fee</span><span className="font-bold text-slate-800">{fmt(enrollment.total_price, enrollment.currency)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Amount Paid</span><span className="font-bold text-green-600">{fmt(enrollment.amount_paid, enrollment.currency)}</span></div>
                  {!isComplete && (
                    <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-2">
                      <span className="text-slate-700">{enrollment.payment_type === "installment" ? `Payment ${enrollment.installments_paid + 1} of ${enrollment.total_installments}` : "Amount Due Now"}</span>
                      <span style={{ color }}>{fmt(enrollment.next_installment_amount, enrollment.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              {enrollment.payment_type === "installment" && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Payment Schedule</p>
                  <div className="space-y-2">
                    {Array.from({ length: enrollment.total_installments }).map((_, i) => {
                      const paid      = i < enrollment.installments_paid;
                      const isCurrent = i === enrollment.installments_paid && !isComplete;
                      const amount    = enrollment.total_price / enrollment.total_installments;
                      const paidTxn   = enrollment.payments[i];
                      console.log(`[KidsPaymentPage] Installment row ${i + 1} →`, { paid, isCurrent, amount: fmt(amount, enrollment.currency), txn: paidTxn?.transaction_id ?? "none" });
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: paid ? "#f0fdf4" : isCurrent ? `${color}08` : "#f8fafc", border: `1px solid ${paid ? "#bbf7d0" : isCurrent ? `${color}33` : "#e2e8f0"}` }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: paid ? "#22c55e" : isCurrent ? color : "#cbd5e1", color: "#fff" }}>{paid ? "✓" : i + 1}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">Payment {i + 1} — {fmt(amount, enrollment.currency)}</p>
                            {paid && paidTxn && <p className="text-xs text-slate-400">{new Date(paidTxn.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
                            {isCurrent && <p className="text-xs font-bold" style={{ color }}>Due now</p>}
                            {!paid && !isCurrent && enrollment.next_payment_due && i === enrollment.installments_paid + 1 && <p className="text-xs text-slate-400">Due ~{new Date(enrollment.next_payment_due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>}
                          </div>
                          <span className="text-xs font-bold" style={{ color: paid ? "#22c55e" : isCurrent ? color : "#94a3b8" }}>{paid ? "Paid" : isCurrent ? "Pay now" : "Upcoming"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

          {!isComplete ? (
            <div className="space-y-3">
              <button onClick={handlePay} disabled={paying}
                className="w-full py-5 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-3"
                style={{ background: color, boxShadow: `0 10px 32px ${color}44`, fontFamily: "Poppins, sans-serif" }}>
                {paying ? (<><div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />Redirecting to payment…</>) : (<>{enrollment.currency === "USD" ? "💳" : "🏦"} Pay {fmt(enrollment.next_installment_amount, enrollment.currency)} {enrollment.payment_type === "installment" ? `(${enrollment.installments_paid + 1} of ${enrollment.total_installments})` : ""} →</>)}
              </button>
              <p className="text-center text-xs text-slate-400">{enrollment.currency === "USD" ? "Powered by Stripe · Card payments" : "Powered by Paystack · Card & bank transfer"} · SSL encrypted</p>
            </div>
          ) : (
            <button onClick={() => { console.log("[KidsPaymentPage] Back to kids (fully paid)"); router.push("/kids"); }} className="w-full py-4 rounded-2xl font-bold text-base border-2 border-slate-200 text-slate-700 hover:bg-slate-100 transition-all">← Back to Kids Programme</button>
          )}

          {enrollment.payment_type === "installment" && !isComplete && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-start gap-2">
              <span className="shrink-0">📌</span>
              <span><strong>Bookmark this page</strong> or save the resume link from your email — you can return here at any time to make your next payment without needing an account.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}