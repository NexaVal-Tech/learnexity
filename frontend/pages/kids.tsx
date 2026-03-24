import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";

const BRAND        = "#4A3AFF";
const BRAND_LIGHT  = "#4A3AFF";
const BRAND_ORANGE = "#f59e0b";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CoursePricing {
  standalone_group: number; standalone_one_on_one: number;
  bundle_group: number; bundle_one_on_one: number;
  standalone_group_discounted: number; standalone_one_on_one_discounted: number;
  bundle_group_discounted: number; bundle_one_on_one_discounted: number;
  installment_standalone_group: number; installment_standalone_one_on_one: number;
  installment_bundle_group: number; installment_bundle_one_on_one: number;
}
interface KidsCourseAPI {
  id: number; slug: string; name: string; description: string;
  emoji: string; color: string; duration_months: number;
  is_foundation: boolean; onetime_discount_percent: number;
  pricing: { USD: CoursePricing; NGN: CoursePricing };
}
interface Track {
  id: string; emoji: string; name: string; tagline: string; image: string;
  description: string; color: string; courseSlug: string;
  what_they_do: string[]; what_it_builds: string[]; what_they_learn: string[];
  why_it_matters: string; decision_line: string;
}

const tracks: Track[] = [
  { id: "creative-design", emoji: "🎨", name: "Creative Design", tagline: "Turn creativity into real digital skills", image: "/images/kids-3.jpg", color: "#4A3AFF", courseSlug: "creative-design", description: "From 'I like drawing' to creating designs they can actually use and share — structured design thinking for young visual minds.", what_they_do: ["Create posters, graphics, and digital visuals", "Turn ideas into clear, structured designs", "Use real design tools with confidence"], what_it_builds: ["Creative confidence", "Visual thinking", "Attention to detail"], what_they_learn: ["Graphic design fundamentals", "Layout and visual storytelling", "Digital design tools"], why_it_matters: "Most kids are creative but don't know how to express it digitally. This track helps them turn imagination into something real and shareable.", decision_line: "If your child enjoys drawing, visuals, or expressing ideas — this is the right path." },
  { id: "game-builder", emoji: "🎮", name: "Game Builder", tagline: "From playing games to building them", image: "/images/kids-2.jpg", color: "#4A3AFF", courseSlug: "game-builder", description: "Your child learns how games actually work by creating their own — turning passive gaming into real thinking skills and technical confidence.", what_they_do: ["Build simple interactive games", "Understand how games are designed", "Solve problems through logic and structure"], what_it_builds: ["Logical thinking", "Problem-solving skills", "Persistence and focus"], what_they_learn: ["Game design thinking", "Interactive storytelling", "Beginner programming logic", "Problem-solving through mechanics"], why_it_matters: "Gaming is passive. Building games turns that interest into real thinking skills and technical confidence.", decision_line: "If your child enjoys games, challenges, or figuring things out — this is the right path." },
  { id: "media-creator", emoji: "🎬", name: "Media Creator", tagline: "Turn screen time into creation time", image: "/images/kids-1.jpg", color: "#4A3AFF", courseSlug: "media-creator", description: "Instead of just watching videos, your child learns how to create them — editing, producing, and telling stories that matter.", what_they_do: ["Edit and produce their own videos", "Add effects, text, and sound", "Create content they are proud to share"], what_it_builds: ["Communication skills", "Storytelling ability", "Creative confidence"], what_they_learn: ["Video cutting and trimming", "Text and simple motion graphics", "Transitions and effects", "Sound editing and syncing", "Basic color correction"], why_it_matters: "Most kids consume content daily. Very few know how to create it — and that is where real value is built.", decision_line: "If your child enjoys videos, storytelling, or content creation — this is the right path." },
];

function fmt(amount: number, currency: string): string {
  if (!amount) return "—";
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ─── Registration Modal ───────────────────────────────────────────────────────
interface RegModalProps { isOpen: boolean; onClose: () => void; preselectedTrack: string; currency: string; courses: KidsCourseAPI[]; }

const RegistrationModal: React.FC<RegModalProps> = ({ isOpen, onClose, preselectedTrack, currency, courses }) => {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(preselectedTrack);
  const [enrollmentType, setEnrollmentType] = useState<"bundle" | "track_only">("bundle");
  const [showDFWarning, setShowDFWarning] = useState(false);
  const [sessionType, setSessionType] = useState<"one_on_one" | "group_mentorship">("group_mentorship");
  const [paymentType, setPaymentType] = useState<"onetime" | "installment">("onetime");

  useEffect(() => { console.log("[RegistrationModal] isOpen →", isOpen); }, [isOpen]);
  useEffect(() => { console.log("[RegistrationModal] preselectedTrack →", preselectedTrack); setSelectedTrack(preselectedTrack); }, [preselectedTrack]);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  useEffect(() => { if (!isOpen) { console.log("[RegistrationModal] Closed — resetting state"); setStep(1); setError(""); setShowDFWarning(false); setEnrollmentType("bundle"); } }, [isOpen]);
  useEffect(() => { console.log("[RegistrationModal] Step →", step); }, [step]);

  const trackSlug   = tracks.find(t => t.name === selectedTrack)?.courseSlug ?? "creative-design";
  const trackCourse = courses.find(c => c.slug === trackSlug);
  const cur         = currency as "USD" | "NGN";
  const p           = trackCourse?.pricing[cur];
  const discount    = trackCourse?.onetime_discount_percent ?? 0;
  const isBundle    = enrollmentType === "bundle";
  const isOnetime   = paymentType === "onetime";
  const is1on1      = sessionType === "one_on_one";

  const fullPrice         = p ? (isBundle ? (is1on1 ? p.bundle_one_on_one : p.bundle_group) : (is1on1 ? p.standalone_one_on_one : p.standalone_group)) : 0;
  const discountedPrice   = p ? (isBundle ? (is1on1 ? p.bundle_one_on_one_discounted : p.bundle_group_discounted) : (is1on1 ? p.standalone_one_on_one_discounted : p.standalone_group_discounted)) : 0;
  const installmentAmount = p ? (isBundle ? (is1on1 ? p.installment_bundle_one_on_one : p.installment_bundle_group) : (is1on1 ? p.installment_standalone_one_on_one : p.installment_standalone_group)) : 0;
  const todayAmount       = isOnetime ? discountedPrice : installmentAmount;
  const savedAmount       = isOnetime && discount > 0 ? fullPrice - discountedPrice : 0;

  useEffect(() => {
    console.log("[RegistrationModal] Pricing →", { selectedTrack, trackSlug, enrollmentType, sessionType, paymentType, currency, fullPrice, discountedPrice, installmentAmount, todayAmount, savedAmount, discount, courseFound: !!trackCourse });
  }, [selectedTrack, enrollmentType, sessionType, paymentType, currency]);

  const handleStep1Next = () => {
    console.log("[RegistrationModal] Step 1 Next →", { parentName, parentEmail, parentPhone, studentName, studentAge });
    if (!parentName || !parentEmail || !studentName || !studentAge) { console.warn("[RegistrationModal] Step 1 validation failed — missing fields"); setError("Please fill in all required fields."); return; }
    console.log("[RegistrationModal] Step 1 passed → step 2");
    setError(""); setStep(2);
  };

  const handleStep2Next = () => {
    console.log("[RegistrationModal] Step 2 Next →", { selectedTrack, enrollmentType, sessionType, showDFWarning });
    if (enrollmentType === "track_only" && !showDFWarning) { console.log("[RegistrationModal] track_only → showing DF advisory"); setShowDFWarning(true); return; }
    console.log("[RegistrationModal] Step 2 passed → step 3");
    setShowDFWarning(false); setError(""); setStep(3);
  };

  const handleDFWarningInclude = () => { console.log("[RegistrationModal] DF warning → INCLUDE chosen (switching to bundle)"); setEnrollmentType("bundle"); setShowDFWarning(false); };
  const handleDFWarningSkip    = () => { console.log("[RegistrationModal] DF warning → SKIP chosen (track_only confirmed)"); setShowDFWarning(false); setStep(3); };

  const handleSubmit = async () => {
    const payload = { parent_name: parentName, parent_email: parentEmail, parent_phone: parentPhone, student_name: studentName, student_age: parseInt(studentAge), session_type: sessionType, track_slug: trackSlug, enrollment_type: enrollmentType, payment_type: paymentType, currency };
    console.log("[RegistrationModal] Submit →", payload);
    console.log("[RegistrationModal] Expected amount today →", fmt(todayAmount, currency));
    setLoading(true); setError("");
    try {
      console.log(`[RegistrationModal] POST ${API_URL}/api/kids/enroll`);
      const res  = await fetch(`${API_URL}/api/kids/enroll`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      console.log("[RegistrationModal] Enroll response →", { status: res.status, ok: res.ok, data });
      if (!res.ok) { console.error("[RegistrationModal] Enrollment API error →", data); throw new Error(data.error || data.message || "Enrollment failed"); }
      console.log("[RegistrationModal] Enrollment OK → redirecting to payment", { enrollmentId: data.enrollment.id, totalPrice: data.enrollment.total_price });
      router.push(`/kids/payment/${data.enrollment.id}`);
      onClose();
    } catch (e: any) {
      console.error("[RegistrationModal] Submit error →", e.message, e);
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      console.log("[RegistrationModal] Submit complete — loading reset");
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) { console.log("[RegistrationModal] Overlay click → close"); onClose(); } }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,8,30,0.82)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" style={{ animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={() => { console.log("[RegistrationModal] ✕ clicked"); onClose(); }} className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">✕</button>
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0" style={{ background: step >= s ? BRAND : "#e2e8f0", color: step >= s ? "#fff" : "#94a3b8" }}>{s}</div>
                {s < 3 && <div className="flex-1 h-0.5 rounded" style={{ background: step > s ? BRAND : "#e2e8f0" }} />}
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            {step === 1 ? "Begin Your Child's Journey" : step === 2 ? "Choose Your Path" : "Payment Plan"}
          </h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            {step === 1 ? "Tell us about your child so we can personalise the experience." : step === 2 ? "Select a track, session format, and how you'd like to start." : "Choose how you'd like to pay. One-time payments include a discount."}
          </p>
        </div>
        <div className="px-8 pb-8">
          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: BRAND }}>A</span>Parent Information</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Parent Name *</label><input value={parentName} onChange={(e) => { setParentName(e.target.value); }} placeholder="John Doe" type="text" className="w-full px-4 py-3 text-gray-800 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address *</label><input value={parentEmail} onChange={(e) => { setParentEmail(e.target.value); }} placeholder="name@email.com" type="email" className="w-full px-4 py-3 text-gray-800 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label><input value={parentPhone} onChange={(e) => { setParentPhone(e.target.value); }} placeholder="+234 800 000 0000" type="tel" className="w-full px-4 text-gray-800 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" /></div>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: BRAND }}>B</span>Student Details</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Student's Name *</label><input value={studentName} onChange={(e) => { setStudentName(e.target.value); }} placeholder="Alex" type="text" className="w-full px-4 py-3 text-gray-800 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Student's Age *</label><select value={studentAge} onChange={(e) => { setStudentAge(e.target.value); }} className="w-full px-4 py-3 text-gray-800 rounded-xl border border-slate-200 text-sm outline-none bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"><option value="">Select Age</option>{[10,11,12,13,14,15,16,17].map((a) => <option key={a}>{a}</option>)}</select></div>
                </div>
              </div>
              <button onClick={handleStep1Next} className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.01]" style={{ background: BRAND, fontFamily: "Poppins, sans-serif" }}>Continue →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {showDFWarning && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                      <p className="font-bold text-amber-900 text-sm mb-1">We recommend Digital Foundations first</p>
                      <p className="text-amber-800 text-xs leading-relaxed">If your child has little or no prior computer experience, we strongly advise starting with our <strong>Digital Foundations</strong> module (1 month). It builds the essential skills and confidence needed to get the most out of the specialisation track. Skipping it may make the track harder to follow.</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleDFWarningInclude} className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold" style={{ background: BRAND }}>✓ Include Digital Foundations (Recommended)</button>
                        <button onClick={handleDFWarningSkip} className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 border-amber-300 text-amber-800 bg-white">Skip anyway, I understand</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!showDFWarning && (
                <>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Specialisation Track</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ value: "Creative Design", emoji: "🎨" }, { value: "Game Builder", emoji: "🎮" }, { value: "Media Creator", emoji: "🎬" }].map((t) => (
                        <button key={t.value} type="button" onClick={() => { setSelectedTrack(t.value); }} className="p-3 rounded-2xl border-2 text-center transition-all hover:scale-105" style={selectedTrack === t.value ? { borderColor: BRAND, background: `${BRAND}0d`, boxShadow: `0 0 0 3px ${BRAND}22` } : { borderColor: "#e2e8f0", background: "white" }}>
                          <div className="text-xl mb-1">{t.emoji}</div>
                          <div className="text-[11px] font-bold leading-tight" style={{ color: selectedTrack === t.value ? BRAND : "#475569" }}>{t.value}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Programme Path</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([{ value: "bundle" as const, icon: "🎓", label: "Full Journey (Recommended)", desc: "Digital Foundations (1 month) + " + selectedTrack + " (2 months) = 3 months total", badge: "Best value", badgeColor: "#16a34a", badgeBg: "#dcfce7" }, { value: "track_only" as const, icon: "⚡", label: selectedTrack + " Only", desc: "Skip to the specialisation track directly (2 months). Suitable if your child already has computer basics.", badge: "For advanced", badgeColor: "#d97706", badgeBg: "#fef3c7" }]).map((opt) => (
                        <button key={opt.value} type="button" onClick={() => { setEnrollmentType(opt.value); }} className="p-4 rounded-2xl border-2 text-left transition-all" style={enrollmentType === opt.value ? { borderColor: BRAND, background: `${BRAND}07`, boxShadow: `0 0 0 3px ${BRAND}18` } : { borderColor: "#e2e8f0", background: "white" }}>
                          <div className="flex items-start justify-between mb-2"><span className="text-2xl">{opt.icon}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: opt.badgeBg, color: opt.badgeColor }}>{opt.badge}</span></div>
                          <p className="font-bold text-sm text-slate-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{opt.label}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Session Format</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([{ value: "group_mentorship" as const, icon: "👥", label: "Group Mentorship", desc: "Collaborative, peer-learning environment", badge: "Popular" }, { value: "one_on_one" as const, icon: "🎯", label: "One-on-One Coaching", desc: "Fully personalised, your child's own pace", badge: "Premium" }]).map((s) => (
                        <button key={s.value} type="button" onClick={() => { setSessionType(s.value); }} className="p-4 rounded-2xl border-2 text-left transition-all" style={sessionType === s.value ? { borderColor: BRAND, background: `${BRAND}07`, boxShadow: `0 0 0 3px ${BRAND}18` } : { borderColor: "#e2e8f0", background: "white" }}>
                          <div className="flex items-center justify-between mb-2"><span className="text-2xl">{s.icon}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sessionType === s.value ? `${BRAND}18` : "#f1f5f9", color: sessionType === s.value ? BRAND : "#94a3b8" }}>{s.badge}</span></div>
                          <p className="font-bold text-sm text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>{s.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setStep(1); }} className="flex-1 py-4 rounded-2xl font-bold text-base border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">← Back</button>
                    <button onClick={handleStep2Next} className="flex-[2] py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.01]" style={{ background: BRAND, fontFamily: "Poppins, sans-serif" }}>Continue →</button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Payment Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  {([{ value: "onetime" as const, icon: "⚡", label: "Pay in Full", desc: discount > 0 ? `Save ${discount}% when you pay upfront` : "Single payment, full access immediately", highlight: discount > 0 }, { value: "installment" as const, icon: "📅", label: "3 Monthly Payments", desc: "Split across 3 months at full price. Access starts after first payment.", highlight: false }]).map((pt) => (
                    <button key={pt.value} type="button" onClick={() => { setPaymentType(pt.value); }} className="p-4 rounded-2xl border-2 text-left transition-all relative" style={paymentType === pt.value ? { borderColor: pt.highlight ? "#16a34a" : BRAND, background: pt.highlight ? "#f0fdf4" : `${BRAND}07`, boxShadow: `0 0 0 3px ${pt.highlight ? "#16a34a" : BRAND}18` } : { borderColor: "#e2e8f0", background: "white" }}>
                      {pt.highlight && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Save {discount}%</span>}
                      <span className="text-2xl block mb-2">{pt.icon}</span>
                      <p className="font-bold text-sm text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>{pt.label}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {p && (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price Summary</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${BRAND}14`, color: BRAND }}>{isBundle ? "3 months total" : `${trackCourse?.duration_months} months`}</span>
                  </div>
                  <div className="px-4 py-4 space-y-2 text-sm">
                    {isBundle && (<><div className="flex justify-between text-slate-500"><span>🏗️ Digital Foundations (1 month)</span><span className="text-slate-400 text-xs italic">included</span></div><div className="flex justify-between text-slate-500"><span>{tracks.find(t => t.courseSlug === trackSlug)?.emoji} {trackCourse?.name} (2 months)</span><span className="text-slate-400 text-xs italic">included</span></div><hr className="border-slate-100" /></>)}
                    <div className="flex justify-between"><span className="text-slate-600">Full programme price</span><span className={`font-semibold ${isOnetime && savedAmount > 0 ? "line-through text-slate-400" : "text-slate-800"}`}>{fmt(fullPrice, currency)}</span></div>
                    {isOnetime && savedAmount > 0 && <div className="flex justify-between text-green-600"><span>One-time discount ({discount}%)</span><span className="font-bold">−{fmt(savedAmount, currency)}</span></div>}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold"><span className="text-slate-800">{isOnetime ? "Total due today" : "Due today (1 of 3)"}</span><span style={{ color: BRAND }} className="text-base">{fmt(todayAmount, currency)}</span></div>
                    {!isOnetime && <p className="text-[11px] text-slate-400 pt-1">Then {fmt(installmentAmount, currency)}/month for 2 more months. No discount on instalment plan.</p>}
                    {enrollmentType === "track_only" && <div className="mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-700">⚠️ You're enrolling in the track only. Digital Foundations is not included.</div>}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setStep(2); }} className="flex-1 py-4 rounded-2xl font-bold text-base border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.01] disabled:opacity-60" style={{ background: BRAND, fontFamily: "Poppins, sans-serif" }}>{loading ? "Processing…" : "Proceed to Payment →"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`@keyframes kidsModalIn { from { opacity:0; transform:translateY(32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
};

// ─── Track Detail Modal ───────────────────────────────────────────────────────
const TrackModal: React.FC<{ track: Track | null; onClose: () => void; onEnroll: (trackName: string) => void; currency: string; courses: KidsCourseAPI[]; }> = ({ track, onClose, onEnroll, currency, courses }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.body.style.overflow = track ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [track]);
  if (!track) return null;
  const course   = courses.find(c => c.slug === track.courseSlug);
  const p        = course?.pricing[currency as "USD" | "NGN"];
  const discount = course?.onetime_discount_percent ?? 0;
  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) { onClose(); } }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,8,30,0.80)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" style={{ animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">✕</button>
        <div className="px-8 pt-10 pb-8 rounded-t-3xl" style={{ background: `linear-gradient(135deg, ${track.color}18 0%, ${track.color}06 100%)`, borderBottom: `1px solid ${track.color}22` }}>
          <div className="text-5xl mb-3">{track.emoji}</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{track.name}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{track.description}</p>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div className="w-full overflow-hidden rounded-2xl"><Image src={track.image} alt={track.name} width={500} height={200} className="rounded-2xl w-full object-cover" /></div>
          {p && (
            <div className="rounded-2xl p-4 border" style={{ background: `${track.color}07`, borderColor: `${track.color}22` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: track.color }}>Pricing — {course?.duration_months} months (or 3 months with Digital Foundations)</p>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold text-slate-700">🎓 Full Journey (DF + {track.name})</p><span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">3 months</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-slate-400 mb-0.5">👥 Group · Pay in full</p><p className="font-bold text-slate-800">{fmt(p.bundle_group_discounted, currency)}</p>{discount > 0 && <p className="text-slate-400 line-through text-[10px]">{fmt(p.bundle_group, currency)}</p>}<p className="text-slate-400 text-[10px]">or {fmt(p.installment_bundle_group, currency)}/mo × 3</p></div>
                    <div><p className="text-slate-400 mb-0.5">🎯 1-on-1 · Pay in full</p><p className="font-bold text-slate-800">{fmt(p.bundle_one_on_one_discounted, currency)}</p>{discount > 0 && <p className="text-slate-400 line-through text-[10px]">{fmt(p.bundle_one_on_one, currency)}</p>}<p className="text-slate-400 text-[10px]">or {fmt(p.installment_bundle_one_on_one, currency)}/mo × 3</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2"><p className="text-xs font-bold text-slate-700">⚡ Track only</p><span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">2 months</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-slate-400 mb-0.5">👥 Group · Pay in full</p><p className="font-bold text-slate-800">{fmt(p.standalone_group_discounted, currency)}</p>{discount > 0 && <p className="text-slate-400 line-through text-[10px]">{fmt(p.standalone_group, currency)}</p>}<p className="text-slate-400 text-[10px]">or {fmt(p.installment_standalone_group, currency)}/mo × 3</p></div>
                    <div><p className="text-slate-400 mb-0.5">🎯 1-on-1 · Pay in full</p><p className="font-bold text-slate-800">{fmt(p.standalone_one_on_one_discounted, currency)}</p>{discount > 0 && <p className="text-slate-400 line-through text-[10px]">{fmt(p.standalone_one_on_one, currency)}</p>}<p className="text-slate-400 text-[10px]">or {fmt(p.installment_standalone_one_on_one, currency)}/mo × 3</p></div>
                  </div>
                </div>
                {discount > 0 && <p className="text-[10px] text-green-600 font-semibold px-1">✦ {discount}% discount applied when paying in full</p>}
              </div>
            </div>
          )}
          <div><h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: track.color }}>What Your Child Will Be Able To Do</h4><ul className="space-y-2">{track.what_they_do.map((item, i) => (<li key={i} className="flex items-start gap-2.5 text-sm text-slate-700"><span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: track.color }}>✓</span>{item}</li>))}</ul></div>
          <div><h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: track.color }}>What This Builds In Your Child</h4><div className="flex flex-wrap gap-2">{track.what_it_builds.map((item, i) => (<span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${track.color}14`, color: track.color }}>{item}</span>))}</div></div>
          <div className="p-4 rounded-2xl text-sm leading-relaxed" style={{ background: `${track.color}0d`, borderLeft: `3px solid ${track.color}` }}><p className="font-bold text-slate-800 mb-1">Why This Matters</p><p className="text-slate-600">{track.why_it_matters}</p></div>
          <p className="text-sm font-semibold text-slate-700 italic border-t border-slate-100 pt-4">{track.decision_line}</p>
          <button onClick={() => { onClose(); onEnroll(track.name); }} className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99]" style={{ background: track.color, boxShadow: `0 8px 24px ${track.color}44`, fontFamily: "Poppins, sans-serif" }}>Choose {track.name} →</button>
        </div>
      </div>
      <style jsx>{`@keyframes kidsModalIn { from { opacity:0; transform:translateY(32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
};

// ─── Track Card ───────────────────────────────────────────────────────────────
const GAME_BUILDER_GRADIENT = "linear-gradient(163.36deg, #5B1EF6 -33.94%, #F59E0B 18.93%, #5B1EF6 48.37%, #DE492B 97.22%)";

const TrackCard: React.FC<{ track: Track; onLearnMore: (track: Track) => void; onEnroll: (trackName: string) => void; currency: string; courses: KidsCourseAPI[]; }> = ({ track, onLearnMore, onEnroll, currency, courses }) => {
  const course   = courses.find(c => c.slug === track.courseSlug);
  const p        = course?.pricing[currency as "USD" | "NGN"];
  const discount = course?.onetime_discount_percent ?? 0;
  const isGameBuilder = track.id === "game-builder";

  const cardBg: Record<string, string> = {
    "creative-design": "bg-indigo-50 border-indigo-100",
    "game-builder":    "border-transparent",          // border handled by gradient bg
    "media-creator":   "bg-orange-50 border-orange-100",
  };
  const titleColor: Record<string, string> = {
    "creative-design": "text-indigo-900",
    "game-builder":    "text-white",
    "media-creator":   "text-orange-900",
  };

  return (
    <div
      className={`group rounded-3xl overflow-hidden border text-left flex flex-col ${cardBg[track.id] ?? "bg-white border-slate-100"}`}
      style={{
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        ...(isGameBuilder ? { background: GAME_BUILDER_GRADIENT } : {}),
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-10px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = isGameBuilder ? "0 24px 40px rgba(91,30,246,0.45)" : "0 20px 25px -5px rgb(0 0 0 / 0.1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <Image src={track.image} alt={track.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-white/90 text-slate-600 shadow-sm">2 months</div>
      </div>
      <div className="flex flex-col flex-1 p-8 gap-4">
        <div>
          <h3 className={`text-2xl font-bold mb-3 ${titleColor[track.id] ?? "text-slate-900"}`} style={{ fontFamily: "Poppins, sans-serif" }}>{track.emoji} {track.name}</h3>
          <p className={`text-sm leading-relaxed ${isGameBuilder ? "text-white/80" : "text-slate-600"}`}>{track.description}</p>
        </div>
        <ul className="space-y-2 mt-1">
          {track.what_it_builds.map((item, i) => (
            <li key={i} className={`flex items-center gap-2 text-sm ${isGameBuilder ? "text-white/90" : "text-slate-600"}`}>
              <span className="text-xs" style={{ color: isGameBuilder ? "#F59E0B" : track.color }}>✦</span>{item}
            </li>
          ))}
        </ul>
        {p && (
          <div className={`rounded-xl p-3 text-xs border ${isGameBuilder ? "bg-white/15 border-white/20" : "bg-white/70 border-white"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isGameBuilder ? "text-white/60" : "text-slate-400"}`}>
              Pricing {discount > 0 && <span className={isGameBuilder ? "text-amber-300 ml-1" : "text-green-600 ml-1"}>· {discount}% off when paid in full</span>}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={isGameBuilder ? "text-white/70" : "text-slate-500"}>🎓 Bundle (with DF, 3 mo)</span>
                <div className="text-right">
                  <span className="font-bold" style={{ color: isGameBuilder ? "#F59E0B" : track.color }}>{fmt(p.bundle_group_discounted, currency)}</span>
                  <span className={`ml-1 ${isGameBuilder ? "text-white/50" : "text-slate-400"}`}>group</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={isGameBuilder ? "text-white/70" : "text-slate-500"}>⚡ Track only (2 mo)</span>
                <div className="text-right">
                  <span className={`font-bold ${isGameBuilder ? "text-white" : "text-slate-600"}`}>{fmt(p.standalone_group_discounted, currency)}</span>
                  <span className={`ml-1 ${isGameBuilder ? "text-white/50" : "text-slate-400"}`}>group</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <button onClick={() => onEnroll(track.name)} className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg" style={{ background: isGameBuilder ? "rgba(255,255,255,0.2)" : BRAND, backdropFilter: isGameBuilder ? "blur(8px)" : undefined, border: isGameBuilder ? "1px solid rgba(255,255,255,0.35)" : undefined, boxShadow: isGameBuilder ? "0 4px 16px rgba(0,0,0,0.2)" : `0 8px 20px ${BRAND}33`, fontFamily: "Poppins, sans-serif" }}>
            Enroll Now →
          </button>
          <button onClick={() => onLearnMore(track)} className="w-full py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-white/20 active:scale-95" style={{ borderColor: isGameBuilder ? "rgba(255,255,255,0.35)" : `${track.color}44`, color: isGameBuilder ? "white" : track.color }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Resume Banner + Modal ────────────────────────────────────────────────────
const ResumeBanner: React.FC<{ onResume: () => void }> = ({ onResume }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">📋</div>
    <div className="flex-1"><p className="font-bold text-slate-800 text-sm">Have an incomplete enrollment?</p><p className="text-slate-500 text-xs mt-0.5">Enter your email to pick up where you left off — no account needed.</p></div>
    <button onClick={onResume} className="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0" style={{ background: BRAND_ORANGE }}>Resume Payment</button>
  </div>
);

const ResumeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [found, setFound]     = useState<any[]>([]);
  if (!isOpen) return null;
  const lookup = async () => {
    if (!email) return;
    setLoading(true); setError("");
    try {
      const url = `${API_URL}/api/kids/enrollment/lookup?email=${encodeURIComponent(email)}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.enrollments?.length) { setFound(data.enrollments); }
      else { setError("No pending enrollments found for this email."); }
    } catch (e) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,8,30,0.80)", backdropFilter: "blur(8px)" }}>
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-8" style={{ animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">✕</button>
        <h3 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Resume Your Enrollment</h3>
        <p className="text-slate-500 text-sm mb-6">Enter the parent email used during registration.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all mb-3" />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        {found.length === 0 ? (
          <button onClick={lookup} disabled={loading} className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-60" style={{ background: BRAND }}>{loading ? "Searching…" : "Find My Enrollment →"}</button>
        ) : (
          <div className="space-y-3">
            {found.map((enr: any) => (
              <button key={enr.id} onClick={() => router.push(`/kids/payment/${enr.id}`)} className="w-full p-4 rounded-2xl border-2 border-slate-200 text-left hover:border-indigo-300 transition-all">
                <p className="font-bold text-slate-800 text-sm">{enr.course?.name} — {enr.student_name}</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{enr.enrollment_type?.replace("_", " ")} · Paid {enr.currency} {enr.amount_paid?.toLocaleString()} of {enr.total_price?.toLocaleString()} · {enr.installments_remaining} payment{enr.installments_remaining !== 1 ? "s" : ""} remaining</p>
              </button>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`@keyframes kidsModalIn { from { opacity:0; transform:translateY(32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Kids() {
  const [enrollOpen, setEnrollOpen]             = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState("Creative Design");
  const [activeTrack, setActiveTrack]           = useState<Track | null>(null);
  const [resumeOpen, setResumeOpen]             = useState(false);
  const [currency, setCurrency]                 = useState("USD");
  const [courses, setCourses]                   = useState<KidsCourseAPI[]>([]);

  useEffect(() => { console.log("[Kids Page] Mounted | API_URL →", API_URL); }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/detect-currency`)
      .then(r => r.json())
      .then(d => { if (d.currency) setCurrency(d.currency); })
      .catch(e => console.error("[Kids Page] detect-currency failed →", e.message));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/kids/courses`)
      .then(r => r.json())
      .then(d => { if (d.courses) setCourses(d.courses); })
      .catch(e => console.error("[Kids Page] /api/kids/courses failed →", e.message));
  }, []);

  const openEnroll = (trackName?: string) => {
    if (trackName) setPreselectedTrack(trackName);
    setEnrollOpen(true);
  };

  const dfCourse  = courses.find(c => c.is_foundation);
  const dfPricing = dfCourse?.pricing[currency as "USD" | "NGN"];

  return (
    <AppLayout>
      <div style={{ fontFamily: "Outfit, sans-serif" }} className="bg-slate-50 text-slate-800 overflow-x-hidden">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <header className="relative bg-white pt-28 pb-12 overflow-hidden">
          {/* floating blobs */}
          <div className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle, ${BRAND_ORANGE}88 0%, transparent 70%)`, filter: "blur(80px)", animation: "kidsFloat 6s ease-in-out infinite" }} />
          <div className="absolute bottom-10 left-0 w-96 h-96 rounded-full opacity-30 pointer-events-none" style={{ background: `radial-gradient(circle, ${BRAND}88 0%, transparent 70%)`, filter: "blur(80px)", animation: "kidsFloat 6s ease-in-out infinite 2s" }} />

          <div className="relative max-w-screen-xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider rounded-full px-4 py-1 mb-6" style={{ background: "#fff3cd", color: BRAND_ORANGE }}>
                Ages 10–17 Program
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mt-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Turn Screen Time Into Real{" "}
                <span style={{ background: `linear-gradient(90deg, ${BRAND}, ${BRAND_ORANGE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Creative Skills
                </span>
              </h1>
              <p className="text-lg text-slate-600 mt-6 leading-relaxed max-w-md">
                Stop wasting hours on the screen. Join a guided digital program where kids design, build, and create technology with personalised 1-on-1 or group mentorship.
              </p>

              {dfPricing && (
                <div className="flex items-center gap-4 mt-6 p-4 rounded-2xl border border-slate-200 bg-slate-50 w-fit">
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bundle from</p><p className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>{fmt(dfPricing.bundle_group_discounted, currency)}</p><p className="text-xs text-slate-500">or {fmt(dfPricing.installment_bundle_group, currency)}/mo × 3</p></div>
                  <div className="w-px h-12 bg-slate-200" />
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">1-on-1 from</p><p className="text-2xl font-extrabold" style={{ color: BRAND, fontFamily: "Poppins, sans-serif" }}>{fmt(dfPricing.bundle_one_on_one_discounted, currency)}</p><p className="text-xs text-slate-500">or {fmt(dfPricing.installment_bundle_one_on_one, currency)}/mo × 3</p></div>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={() => openEnroll()}
                  className="px-4 py-2 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{ background: BRAND, boxShadow: `0 10px 32px ${BRAND}44`, fontFamily: "Poppins, sans-serif" }}
                >
                  Start Your Child's Journey
                </button>
                <div className="flex items-center gap-3 px-2">
                  <div className="flex -space-x-2">
                    {["#4A3AFF", "#f59e0b", "#22c55e"].map((c, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">Join 500+ young creators</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                Spots are limited · Beginner-friendly · No experience needed
              </p>
            </div>

            <div className="relative">
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-2xl group">
                <Image src="images/photo-1593642532842-98d0fd5ebc1a.avif" alt="Student coding" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3" style={{ animation: "kidsBounce 3s ease-in-out infinite" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#22c55e" }}>✓</div>
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Live Mentorship</p><p className="text-sm font-bold text-slate-800">One-on-One Session</p></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Resume Banner ─────────────────────────────────────────── */}
        <section className="py-4 bg-white border-b border-slate-100">
          <div className="max-w-screen-xl mx-auto px-6">
            <ResumeBanner onResume={() => setResumeOpen(true)} />
          </div>
        </section>

        {/* ── What Your Child Will Gain ─────────────────────────────── */}
        <section className="py-10 overflow-hidden" style={{ background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)` }}>
          <div className="max-w-screen-xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-12" style={{ fontFamily: "Poppins, sans-serif" }}>What Your Child Will Gain</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: "🛠️", title: "Practical Skills",    desc: "Real tools used by designers and developers today." },
                { icon: "🧠", title: "Logical Thinking",    desc: "Problem-solving skills that translate to school and life." },
                { icon: "✨", title: "Confidence",           desc: "Mastering tools that usually feel 'too hard'." },
                { icon: "📂", title: "Real Portfolio",       desc: "A collection of projects they built from scratch." },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/20 cursor-default" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-xl text-white mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{item.title}</h3>
                  <p className="text-indigo-200 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Problem ───────────────────────────────────────────── */}
        <section className="py-10 max-w-screen-xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                <Image src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80" alt="Passive tech use" fill className="object-cover opacity-80 hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                The Problem Most Parents Face
              </h2>
              <p className="text-lg text-slate-600 mt-6">
                Children spend hours on devices, but they are stuck in a loop of <strong>Passive Consumption</strong>:
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-slate-700"><span className="text-red-500 font-bold text-lg">✕</span> Watching endless videos</li>
                <li className="flex items-center gap-3 text-slate-700"><span className="text-red-500 font-bold text-lg">✕</span> Scrolling social media for hours</li>
                <li className="flex items-center gap-3 text-slate-700"><span className="text-red-500 font-bold text-lg">✕</span> Gaming without building anything</li>
              </ul>
              <div className="mt-8 p-6 rounded-2xl border-l-4" style={{ background: "#fffbeb", borderLeftColor: BRAND_ORANGE }}>
                <p className="font-bold text-amber-800">The Gap:</p>
                <p className="text-amber-700 mt-1">Very few kids are taught to <strong>Create</strong>. Learnexity closes that gap — turning screen time into real, shareable skills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────── */}
        <section className="py-10 bg-slate-100">
          <div className="max-w-screen-xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-16" style={{ fontFamily: "Poppins, sans-serif" }}>How the Program Works</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Stage 1 */}
              <div className="bg-white p-10 rounded-3xl shadow-xl text-left transition-all duration-400 hover:-translate-y-2" style={{ borderTop: `8px solid ${BRAND}` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-6 text-white" style={{ background: BRAND }}>1</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Stage 1: Digital Foundations</h3>
                <p className="text-slate-600 mb-6">Every student starts here to master essential professional tools — the bedrock for everything that follows.</p>
                <ul className="space-y-3 font-medium text-slate-700">
                  <li>🔹 Computer Fundamentals</li>
                  <li>🔹 Presentation &amp; Visual Design</li>
                  <li>🔹 Introduction to Cloud Tools</li>
                  <li>🔹 Word Processing &amp; Spreadsheets</li>
                </ul>
              </div>
              {/* Stage 2 */}
              <div className="bg-white p-10 rounded-3xl shadow-xl text-left transition-all duration-400 hover:-translate-y-2" style={{ borderTop: `8px solid ${BRAND_ORANGE}` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-6 text-white" style={{ background: BRAND_ORANGE }}>2</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Stage 2: Specialisation</h3>
                <p className="text-slate-600 mb-6">After foundations, students pick a track based on their unique interests.</p>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold" style={{ color: BRAND }}>🎨 Creative Design</div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-green-600">🎮 Game Builder</div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold" style={{ color: BRAND_ORANGE }}>🎬 Media Creator</div>
                </div>
              </div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-600">
              <span>💡</span>
              <span>Already have computer basics? You can enroll in a specialisation track directly (2 months).</span>
              <button onClick={() => openEnroll()} className="font-bold underline" style={{ color: BRAND }}>Enroll now</button>
            </div>
          </div>
        </section>

        {/* ── Specialisation Tracks ─────────────────────────────────── */}
        <section className="py-10">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Months 2 &amp; 3</p>
              <h2 className="text-4xl font-bold text-indigo-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Our Specialised Tracks</h2>
              <p className="text-slate-500 max-w-lg mx-auto">After foundations, pick the track that matches your child's passion. Each offers both Group and One-on-One formats.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} onLearnMore={setActiveTrack} onEnroll={openEnroll} currency={currency} courses={courses} />
              ))}
            </div>
          </div>
        </section>

        {/* ── A Personalised Experience ─────────────────────────────── */}
        <section className="py-6 text-white" style={{ background: "#0f172a" }}>
          <div className="max-w-screen-xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>A Personalised Experience</h2>
            <p className="text-xl text-indigo-300 mb-12">No large groups. Just your child and their expert mentor.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                { value: "1:1",      label: "Instruction" },
                { value: "60–90",    label: "Min Per Sessions" },
                { value: "Group",    label: "Mentorship" },
                { value: "Flexible", label: "Scheduling" },
                { value: "Hands-on", label: "Projects" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-3xl md:text-4xl font-extrabold" style={{ color: BRAND_LIGHT }}>{s.value}</div>
                  <div className="text-xs text-indigo-300 font-semibold uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <TrackModal
        track={activeTrack}
        onClose={() => setActiveTrack(null)}
        onEnroll={(name) => { setActiveTrack(null); openEnroll(name); }}
        currency={currency}
        courses={courses}
      />
      <RegistrationModal
        isOpen={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        preselectedTrack={preselectedTrack}
        currency={currency}
        courses={courses}
      />
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
      <Footer />

      <style jsx global>{`
        @keyframes kidsFloat {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes kidsBounce {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes kidsModalIn {
          from { opacity:0; transform:translateY(32px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </AppLayout>
  );
}