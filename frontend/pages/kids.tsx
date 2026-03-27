import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import { ArrowRight } from "lucide-react";

const BRAND        = "#4A3AFF";
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
  { id: "creative-design", emoji: "🎨", name: "Creative Design", tagline: "Turn creativity into real digital skills", image: "/images/kids-3.jpg", color: BRAND, courseSlug: "creative-design", description: "From 'I like drawing' to creating designs they can actually use and share — structured design thinking for young visual minds.", what_they_do: ["Create posters, graphics, and digital visuals", "Turn ideas into clear, structured designs", "Use real design tools with confidence"], what_it_builds: ["Creative confidence", "Visual thinking", "Attention to detail"], what_they_learn: ["Graphic design fundamentals", "Layout and visual storytelling", "Digital design tools"], why_it_matters: "Most kids are creative but don't know how to express it digitally. This track helps them turn imagination into something real and shareable.", decision_line: "If your child enjoys drawing, visuals, or expressing ideas — this is the right path." },
  { id: "game-builder", emoji: "🎮", name: "Game Builder", tagline: "From playing games to building them", image: "/images/kids-2.jpg", color: BRAND, courseSlug: "game-builder", description: "Your child learns how games actually work by creating their own — turning passive gaming into real thinking skills and technical confidence.", what_they_do: ["Build simple interactive games", "Understand how games are designed", "Solve problems through logic and structure"], what_it_builds: ["Logical thinking", "Problem-solving skills", "Persistence and focus"], what_they_learn: ["Game design thinking", "Interactive storytelling", "Beginner programming logic", "Problem-solving through mechanics"], why_it_matters: "Gaming is passive. Building games turns that interest into real thinking skills and technical confidence.", decision_line: "If your child enjoys games, challenges, or figuring things out — this is the right path." },
  { id: "media-creator", emoji: "🎬", name: "Media Creator", tagline: "Turn screen time into creation time", image: "/images/kids-1.jpg", color: BRAND, courseSlug: "media-creator", description: "Instead of just watching videos, your child learns how to create them — editing, producing, and telling stories that matter.", what_they_do: ["Edit and produce their own videos", "Add effects, text, and sound", "Create content they are proud to share"], what_it_builds: ["Communication skills", "Storytelling ability", "Creative confidence"], what_they_learn: ["Video cutting and trimming", "Text and simple motion graphics", "Transitions and effects", "Sound editing and syncing", "Basic color correction"], why_it_matters: "Most kids consume content daily. Very few know how to create it — and that is where real value is built.", decision_line: "If your child enjoys videos, storytelling, or content creation — this is the right path." },
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

  useEffect(() => { setSelectedTrack(preselectedTrack); }, [preselectedTrack]);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  useEffect(() => { if (!isOpen) { setStep(1); setError(""); setShowDFWarning(false); setEnrollmentType("bundle"); } }, [isOpen]);

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

  const handleStep1Next = () => {
    if (!parentName || !parentEmail || !studentName || !studentAge) { setError("Please fill in all required fields."); return; }
    setError(""); setStep(2);
  };
  const handleStep2Next = () => {
    if (enrollmentType === "track_only" && !showDFWarning) { setShowDFWarning(true); return; }
    setShowDFWarning(false); setError(""); setStep(3);
  };
  const handleDFWarningInclude = () => { setEnrollmentType("bundle"); setShowDFWarning(false); };
  const handleDFWarningSkip    = () => { setShowDFWarning(false); setStep(3); };

  const handleSubmit = async () => {
    const payload = { parent_name: parentName, parent_email: parentEmail, parent_phone: parentPhone, student_name: studentName, student_age: parseInt(studentAge), session_type: sessionType, track_slug: trackSlug, enrollment_type: enrollmentType, payment_type: paymentType, currency };
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/api/kids/enroll`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Enrollment failed");
      router.push(`/kids/payment/${data.enrollment.id}`);
      onClose();
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-600";
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" };
  const inputFocusStyle = `focus:border-[${BRAND}] focus:ring-2`;

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,4,12,0.88)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>✕</button>

        <div className="px-8 pt-8 pb-0">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0" style={{ background: step >= s ? BRAND : "rgba(255,255,255,0.08)", color: step >= s ? "#fff" : "#666" }}>{s}</div>
                {s < 3 && <div className="flex-1 h-0.5 rounded" style={{ background: step > s ? BRAND : "rgba(255,255,255,0.08)" }} />}
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 1 ? "Begin Your Child's Journey" : step === 2 ? "Choose Your Path" : "Payment Plan"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            {step === 1 ? "Tell us about your child so we can personalise the experience." : step === 2 ? "Select a track, session format, and how you'd like to start." : "Choose how you'd like to pay. One-time payments include a discount."}
          </p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-4 px-4 py-3 text-red-400 text-sm" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: BRAND }}>A</span>
                  Parent Information
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Parent Name *</label><input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="John Doe" type="text" className={inputCls} style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Email Address *</label><input value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="name@email.com" type="email" className={inputCls} style={inputStyle} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone Number</label><input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+234 800 000 0000" type="tel" className={inputCls} style={inputStyle} /></div>
                </div>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)" }} />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: BRAND }}>B</span>
                  Student Details
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Student's Name *</label><input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Alex" type="text" className={inputCls} style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Student's Age *</label>
                    <select value={studentAge} onChange={(e) => setStudentAge(e.target.value)} className={inputCls} style={{ ...inputStyle, background: "rgba(255,255,255,0.06)" }}>
                      <option value="">Select Age</option>{[10,11,12,13,14,15,16,17].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={handleStep1Next} className="w-full py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {showDFWarning && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                      <p className="font-bold text-amber-400 text-sm mb-1">We recommend Digital Foundations first</p>
                      <p className="text-amber-200/70 text-xs leading-relaxed">If your child has little or no prior computer experience, we strongly advise starting with our <strong>Digital Foundations</strong> module (1 month). Skipping it may make the track harder to follow.</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleDFWarningInclude} className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold" style={{ background: BRAND }}>✓ Include Digital Foundations</button>
                        <button onClick={handleDFWarningSkip} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-amber-400" style={{ border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}>Skip anyway</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!showDFWarning && (
                <>
                  {/* Track selection */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Specialisation Track</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ value: "Creative Design", emoji: "🎨" }, { value: "Game Builder", emoji: "🎮" }, { value: "Media Creator", emoji: "🎬" }].map((t) => (
                        <button key={t.value} type="button" onClick={() => setSelectedTrack(t.value)}
                          className="p-3 text-center transition-all hover:scale-105"
                          style={{
                            borderRadius: "1.25rem 0.5rem 1.25rem 0.5rem",
                            border: selectedTrack === t.value ? `2px solid ${BRAND}` : "1px solid rgba(255,255,255,0.1)",
                            background: selectedTrack === t.value ? `${BRAND}15` : "rgba(255,255,255,0.04)",
                            boxShadow: selectedTrack === t.value ? `0 0 20px ${BRAND}22` : "none",
                          }}>
                          <div className="text-xl mb-1">{t.emoji}</div>
                          <div className="text-[11px] font-bold leading-tight" style={{ color: selectedTrack === t.value ? BRAND : "#9ca3af" }}>{t.value}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Programme path */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Programme Path</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: "bundle" as const, icon: "🎓", label: "Full Journey (Recommended)", desc: `Digital Foundations (1 month) + ${selectedTrack} (2 months) = 3 months`, badge: "Best value", badgeColor: "#16a34a" },
                        { value: "track_only" as const, icon: "⚡", label: `${selectedTrack} Only`, desc: "Skip to the specialisation track directly (2 months). For kids with computer basics.", badge: "Advanced", badgeColor: BRAND_ORANGE },
                      ]).map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setEnrollmentType(opt.value)} className="p-4 text-left transition-all"
                          style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: enrollmentType === opt.value ? `2px solid ${BRAND}` : "1px solid rgba(255,255,255,0.1)", background: enrollmentType === opt.value ? `${BRAND}10` : "rgba(255,255,255,0.04)", boxShadow: enrollmentType === opt.value ? `0 0 20px ${BRAND}22` : "none" }}>
                          <div className="flex items-start justify-between mb-2"><span className="text-2xl">{opt.icon}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${opt.badgeColor}20`, color: opt.badgeColor }}>{opt.badge}</span></div>
                          <p className="font-bold text-sm text-white mb-1">{opt.label}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Session format */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Session Format</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: "group_mentorship" as const, icon: "👥", label: "Group Mentorship", desc: "Collaborative, peer-learning environment", badge: "Popular" },
                        { value: "one_on_one" as const, icon: "🎯", label: "One-on-One Coaching", desc: "Fully personalised, your child's own pace", badge: "Premium" },
                      ]).map((s) => (
                        <button key={s.value} type="button" onClick={() => setSessionType(s.value)} className="p-4 text-left transition-all"
                          style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: sessionType === s.value ? `2px solid ${BRAND}` : "1px solid rgba(255,255,255,0.1)", background: sessionType === s.value ? `${BRAND}10` : "rgba(255,255,255,0.04)", boxShadow: sessionType === s.value ? `0 0 20px ${BRAND}22` : "none" }}>
                          <div className="flex items-center justify-between mb-2"><span className="text-2xl">{s.icon}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sessionType === s.value ? `${BRAND}20` : "rgba(255,255,255,0.06)", color: sessionType === s.value ? BRAND : "#9ca3af" }}>{s.badge}</span></div>
                          <p className="font-bold text-sm text-white">{s.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-sm text-gray-400 transition-all hover:text-white" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>← Back</button>
                    <button onClick={handleStep2Next} className="flex-[2] py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Payment plan */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Payment Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "onetime" as const, icon: "⚡", label: "Pay in Full", desc: discount > 0 ? `Save ${discount}% when you pay upfront` : "Single payment, full access immediately", highlight: discount > 0 },
                    { value: "installment" as const, icon: "📅", label: "3 Monthly Payments", desc: "Split across 3 months. Access starts after first payment.", highlight: false },
                  ]).map((pt) => (
                    <button key={pt.value} type="button" onClick={() => setPaymentType(pt.value)} className="p-4 text-left relative transition-all"
                      style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: paymentType === pt.value ? `2px solid ${pt.highlight ? "#16a34a" : BRAND}` : "1px solid rgba(255,255,255,0.1)", background: paymentType === pt.value ? (pt.highlight ? "rgba(22,163,74,0.1)" : `${BRAND}10`) : "rgba(255,255,255,0.04)", boxShadow: paymentType === pt.value ? `0 0 20px ${pt.highlight ? "rgba(22,163,74,0.3)" : BRAND + "22"}` : "none" }}>
                      {pt.highlight && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-900/40 text-green-400">Save {discount}%</span>}
                      <span className="text-2xl block mb-2">{pt.icon}</span>
                      <p className="font-bold text-sm text-white">{pt.label}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              {p && (
                <div style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price Summary</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${BRAND}20`, color: BRAND }}>{isBundle ? "3 months total" : `${trackCourse?.duration_months} months`}</span>
                  </div>
                  <div className="px-4 py-4 space-y-2 text-sm">
                    {isBundle && (
                      <>
                        <div className="flex justify-between text-gray-500"><span>🏗️ Digital Foundations (1 month)</span><span className="text-gray-600 text-xs italic">included</span></div>
                        <div className="flex justify-between text-gray-500"><span>{tracks.find(t => t.courseSlug === trackSlug)?.emoji} {trackCourse?.name} (2 months)</span><span className="text-gray-600 text-xs italic">included</span></div>
                        <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)" }} />
                      </>
                    )}
                    <div className="flex justify-between"><span className="text-gray-400">Full programme price</span><span className={`font-semibold ${isOnetime && savedAmount > 0 ? "line-through text-gray-600" : "text-white"}`}>{fmt(fullPrice, currency)}</span></div>
                    {isOnetime && savedAmount > 0 && <div className="flex justify-between text-green-400"><span>One-time discount ({discount}%)</span><span className="font-bold">−{fmt(savedAmount, currency)}</span></div>}
                    <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <span className="text-white">{isOnetime ? "Total due today" : "Due today (1 of 3)"}</span>
                      <span style={{ color: BRAND }} className="text-base">{fmt(todayAmount, currency)}</span>
                    </div>
                    {!isOnetime && <p className="text-[11px] text-gray-600 pt-1">Then {fmt(installmentAmount, currency)}/month for 2 more months.</p>}
                    {enrollmentType === "track_only" && <div className="mt-2 px-3 py-2 text-[11px] text-amber-400" style={{ borderRadius: "0.75rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>⚠️ You're enrolling in the track only. Digital Foundations is not included.</div>}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 font-bold text-sm text-gray-400 transition-all hover:text-white" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 font-bold text-base text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
                  {loading ? "Processing…" : <><span>Proceed to Payment</span><ArrowRight className="w-4 h-4" /></>}
                </button>
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
  useEffect(() => { document.body.style.overflow = track ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [track]);
  if (!track) return null;
  const course   = courses.find(c => c.slug === track.courseSlug);
  const p        = course?.pricing[currency as "USD" | "NGN"];
  const discount = course?.onetime_discount_percent ?? 0;
  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,4,12,0.88)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>✕</button>

        {/* Modal header */}
        <div className="px-8 pt-10 pb-8" style={{ background: `linear-gradient(135deg, ${BRAND}12 0%, transparent 100%)`, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-5xl mb-3">{track.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-1">{track.name}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{track.description}</p>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="w-full overflow-hidden" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Image src={track.image} alt={track.name} width={500} height={200} className="w-full object-cover" />
          </div>

          {p && (
            <div className="p-4" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: `${BRAND}08`, border: `1px solid ${BRAND}22` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>
                Pricing — {course?.duration_months} months (or 3 months with Digital Foundations)
              </p>
              <div className="space-y-3">
                {[
                  { label: "🎓 Full Journey (DF + " + track.name + ")", badge: "3 months", group: p.bundle_group_discounted, groupFull: p.bundle_group, one: p.bundle_one_on_one_discounted, oneFull: p.bundle_one_on_one, instGroup: p.installment_bundle_group, instOne: p.installment_bundle_one_on_one },
                  { label: "⚡ Track only", badge: "2 months", group: p.standalone_group_discounted, groupFull: p.standalone_group, one: p.standalone_one_on_one_discounted, oneFull: p.standalone_one_on_one, instGroup: p.installment_standalone_group, instOne: p.installment_standalone_one_on_one },
                ].map((row) => (
                  <div key={row.label} className="p-3" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-300">{row.label}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af" }}>{row.badge}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-gray-500 mb-0.5">👥 Group · Pay in full</p><p className="font-bold text-white">{fmt(row.group, currency)}</p>{discount > 0 && <p className="text-gray-600 line-through text-[10px]">{fmt(row.groupFull, currency)}</p>}<p className="text-gray-600 text-[10px]">or {fmt(row.instGroup, currency)}/mo × 3</p></div>
                      <div><p className="text-gray-500 mb-0.5">🎯 1-on-1 · Pay in full</p><p className="font-bold text-white">{fmt(row.one, currency)}</p>{discount > 0 && <p className="text-gray-600 line-through text-[10px]">{fmt(row.oneFull, currency)}</p>}<p className="text-gray-600 text-[10px]">or {fmt(row.instOne, currency)}/mo × 3</p></div>
                    </div>
                  </div>
                ))}
                {discount > 0 && <p className="text-[10px] text-green-400 font-semibold px-1">✦ {discount}% discount applied when paying in full</p>}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>What Your Child Will Be Able To Do</h4>
            <ul className="space-y-2">
              {track.what_they_do.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: BRAND }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>What This Builds In Your Child</h4>
            <div className="flex flex-wrap gap-2">
              {track.what_it_builds.map((item, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${BRAND}18`, color: BRAND }}>{item}</span>
              ))}
            </div>
          </div>

          <div className="p-4 text-sm leading-relaxed" style={{ background: `${BRAND}0a`, borderLeft: `3px solid ${BRAND}`, borderRadius: "0 1rem 0 1rem" }}>
            <p className="font-bold text-white mb-1">Why This Matters</p>
            <p className="text-gray-400">{track.why_it_matters}</p>
          </div>

          <p className="text-sm font-semibold text-gray-400 italic" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem" }}>{track.decision_line}</p>

          <button onClick={() => { onClose(); onEnroll(track.name); }} className="w-full py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
            Choose {track.name} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style jsx>{`@keyframes kidsModalIn { from { opacity:0; transform:translateY(32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
};

// ─── Track Card ───────────────────────────────────────────────────────────────
const TrackCard: React.FC<{ track: Track; onLearnMore: (track: Track) => void; onEnroll: (trackName: string) => void; currency: string; courses: KidsCourseAPI[]; }> = ({ track, onLearnMore, onEnroll, currency, courses }) => {
  const course   = courses.find(c => c.slug === track.courseSlug);
  const p        = course?.pricing[currency as "USD" | "NGN"];
  const discount = course?.onetime_discount_percent ?? 0;

  return (
    <div
      className="flex flex-col h-full cursor-pointer group"
      style={{
        borderRadius: "2rem 0.75rem 2rem 0.75rem",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(15,15,15,0.92)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
        transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = `${BRAND}55`;
        el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${BRAND}22`;
        el.style.transform = "translateY(-6px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.boxShadow = "0 25px 50px rgba(0,0,0,0.7)";
        el.style.transform = "";
      }}
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden" style={{ borderRadius: "2rem 0.75rem 0 0" }}>
        <Image src={track.image} alt={track.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(15,15,15,0.8) 100%)" }} />
        <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(15,15,15,0.85)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }}>2 months</div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-8 gap-4">
        <div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: `${BRAND}20` }}>
            <span>{track.emoji}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{track.name}</h3>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{track.description}</p>
        </div>

        {/* What it builds */}
        <ul className="space-y-2 mt-1">
          {track.what_it_builds.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
              <span style={{ color: BRAND }}>✦</span>{item}
            </li>
          ))}
        </ul>

        {/* Pricing summary */}
        {p && (
          <div className="p-3 text-xs" style={{ borderRadius: "1.25rem 0.5rem 1.25rem 0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-600">
              Pricing {discount > 0 && <span className="text-green-400 ml-1">· {discount}% off in full</span>}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">🎓 Bundle (with DF, 3 mo)</span>
                <div className="text-right">
                  <span className="font-bold" style={{ color: BRAND }}>{fmt(p.bundle_group_discounted, currency)}</span>
                  <span className="text-gray-600 ml-1">group</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">⚡ Track only (2 mo)</span>
                <div className="text-right">
                  <span className="font-bold text-white">{fmt(p.standalone_group_discounted, currency)}</span>
                  <span className="text-gray-600 ml-1">group</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTAs pinned to bottom */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <button onClick={() => onEnroll(track.name)}
            className="w-full py-3 font-bold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 20px ${BRAND}33` }}>
            Enroll Now <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => onLearnMore(track)}
            className="w-full py-3 font-semibold text-sm transition-all hover:bg-white/5"
            style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: `2px solid ${BRAND}33`, color: BRAND }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Resume Banner ─────────────────────────────────────────────────────────────
const ResumeBanner: React.FC<{ onResume: () => void }> = ({ onResume }) => (
  <div className="flex items-center gap-4 px-6 py-4" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${BRAND_ORANGE}20` }}>📋</div>
    <div className="flex-1">
      <p className="font-bold text-white text-sm">Have an incomplete enrollment?</p>
      <p className="text-gray-500 text-xs mt-0.5">Enter your email to pick up where you left off — no account needed.</p>
    </div>
    <button onClick={onResume} className="px-4 py-2 font-bold text-xs text-white flex-shrink-0 transition-all hover:opacity-90" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: BRAND_ORANGE, boxShadow: `0 4px 16px ${BRAND_ORANGE}44` }}>
      Resume Payment
    </button>
  </div>
);

// ─── Resume Modal ─────────────────────────────────────────────────────────────
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
      const res  = await fetch(`${API_URL}/api/kids/enrollment/lookup?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.enrollments?.length) setFound(data.enrollments);
      else setError("No pending enrollments found for this email.");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,4,12,0.88)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-md p-8 shadow-2xl" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.06)" }}>✕</button>
        <h3 className="text-xl font-bold text-white mb-1">Resume Your Enrollment</h3>
        <p className="text-gray-500 text-sm mb-6">Enter the parent email used during registration.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-gray-600 mb-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        {found.length === 0 ? (
          <button onClick={lookup} disabled={loading} className="w-full py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND }}>
            {loading ? "Searching…" : "Find My Enrollment →"}
          </button>
        ) : (
          <div className="space-y-3">
            {found.map((enr: any) => (
              <button key={enr.id} onClick={() => router.push(`/kids/payment/${enr.id}`)} className="w-full p-4 text-left transition-all hover:border-indigo-500" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                <p className="font-bold text-white text-sm">{enr.course?.name} — {enr.student_name}</p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{enr.enrollment_type?.replace("_", " ")} · Paid {enr.currency} {enr.amount_paid?.toLocaleString()} of {enr.total_price?.toLocaleString()} · {enr.installments_remaining} payment{enr.installments_remaining !== 1 ? "s" : ""} remaining</p>
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

  useEffect(() => {
    fetch(`${API_URL}/api/detect-currency`)
      .then(r => r.json())
      .then(d => { if (d.currency) setCurrency(d.currency); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/kids/courses`)
      .then(r => r.json())
      .then(d => { if (d.courses) setCourses(d.courses); })
      .catch(() => {});
  }, []);

  const openEnroll = (trackName?: string) => {
    if (trackName) setPreselectedTrack(trackName);
    setEnrollOpen(true);
  };

  const dfCourse  = courses.find(c => c.is_foundation);
  const dfPricing = dfCourse?.pricing[currency as "USD" | "NGN"];

  return (
    <AppLayout>
      <style jsx global>{`
        // body { background: #080808; }
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
        .dc-divider { border:none; border-top:1px solid rgba(255,255,255,0.07); }
      `}</style>

      <div style={{  color: "#fff", minHeight: "100vh" }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
          {/* Blobs */}
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${BRAND_ORANGE}30 0%, transparent 70%)`, filter: "blur(80px)", animation: "kidsFloat 6s ease-in-out infinite" }} />
          <div className="absolute bottom-10 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${BRAND}25 0%, transparent 70%)`, filter: "blur(100px)", animation: "kidsFloat 6s ease-in-out infinite 2s" }} />

          <div className="relative max-w-[1230px] mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: `${BRAND_ORANGE}18`, color: BRAND_ORANGE, border: `1px solid ${BRAND_ORANGE}30` }}>
                Ages 10–17 Program
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight text-white mt-2">
                Turn Screen Time Into Real{" "}
                <span style={{ background: `linear-gradient(90deg, ${BRAND}, ${BRAND_ORANGE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Creative Skills
                </span>
              </h1>
              <p className="text-lg text-gray-400 mt-6 leading-relaxed max-w-md">
                Stop wasting hours on the screen. Join a guided digital program where kids design, build, and create technology with personalised 1-on-1 or group mentorship.
              </p>

              {/* {dfPricing && (
                <div className="flex items-center gap-6 mt-8 p-5" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", display: "inline-flex" }}>
                  <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Bundle from</p><p className="text-2xl font-bold text-white">{fmt(dfPricing.bundle_group_discounted, currency)}</p><p className="text-xs text-gray-500">or {fmt(dfPricing.installment_bundle_group, currency)}/mo × 3</p></div>
                  <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.08)" }} />
                  <div><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">1-on-1 from</p><p className="text-2xl font-bold" style={{ color: BRAND }}>{fmt(dfPricing.bundle_one_on_one_discounted, currency)}</p><p className="text-xs text-gray-500">or {fmt(dfPricing.installment_bundle_one_on_one, currency)}/mo × 3</p></div>
                </div>
              )} */}

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button onClick={() => openEnroll()} className="px-6 py-3 font-bold text-white transition-all hover:opacity-90 flex items-center gap-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 10px 32px ${BRAND}44` }}>
                  Start Your Child's Journey <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 px-2">
                  <div className="flex -space-x-2">
                    {[BRAND, BRAND_ORANGE, "#000000"].map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2" style={{ background: c, borderColor: "#080808" }} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Join 500+ young creators</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Spots are limited · Beginner-friendly · No experience needed
              </p>
            </div>

            <div className="relative">
              <div className="relative w-full aspect-[4/3] md:aspect-[10/6] overflow-hidden group" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.1)", boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 60px ${BRAND}18` }}>
                <Image src="images/photo-1593642532842-98d0fd5ebc1a.avif" alt="Student coding" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, transparent 50%, rgba(8,8,8,0.6) 100%)" }} />
                <div className="absolute bottom-5 left-5 px-4 py-3 flex items-center gap-3" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", animation: "kidsBounce 3s ease-in-out infinite" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#6C63FF" }}>✓</div>
                  <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Mentorship</p><p className="text-sm font-bold text-white">One-on-One Session</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Resume Banner ─────────────────────────────────────────────── */}
        <section className="py-4 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1230px] mx-auto">
            <ResumeBanner onResume={() => setResumeOpen(true)} />
          </div>
        </section>

        {/* ── What Your Child Will Gain ──────────────────────────────────── */}
        <section className="py-20 px-6" style={{ background: "linear-gradient(135deg, #080808 0%, #0a0818 100%)" }}>
          <div className="max-w-[1230px] mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Outcomes</p>
            <h2 className="text-3xl font-bold text-white mb-12">What Your Child Will Gain</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: "🛠️", title: "Practical Skills",  desc: "Real tools used by designers and developers today." },
                { icon: "🧠", title: "Logical Thinking",  desc: "Problem-solving skills that translate to school and life." },
                { icon: "✨", title: "Confidence",         desc: "Mastering tools that usually feel 'too hard'." },
                { icon: "📂", title: "Real Portfolio",     desc: "A collection of projects they built from scratch." },
              ].map((item, i) => (
                <div key={i} className="p-6 transition-all duration-300 hover:transform hover:-translate-y-1" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${BRAND}44`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${BRAND}15`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Problem ───────────────────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-[1230px] mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="relative w-full aspect-video overflow-hidden" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
              <Image src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80" alt="Passive tech use" fill className="object-cover opacity-70 hover:scale-105 transition-transform duration-700 hover:opacity-90" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>The Problem</p>
              <h2 className="text-4xl font-bold text-white leading-tight">The Problem Most Parents Face</h2>
              <p className="text-lg text-gray-400 mt-6">
                Children spend hours on devices, but they are stuck in a loop of <span className="text-white font-semibold">Passive Consumption</span>:
              </p>
              <ul className="mt-8 space-y-3">
                {["Watching endless videos", "Scrolling social media for hours", "Gaming without building anything"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <span className="text-red-500 font-bold text-lg">✕</span> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-5" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: `${BRAND_ORANGE}10`, border: `1px solid ${BRAND_ORANGE}25` }}>
                <p className="font-bold text-amber-400">The Gap:</p>
                <p className="text-amber-200/70 mt-1 text-sm leading-relaxed">Very few kids are taught to <strong className="text-amber-300">Create</strong>. Learnexity closes that gap — turning screen time into real, shareable skills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <section className="py-20 px-6" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0f0a1e 100%)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1230px] mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Structure</p>
            <h2 className="text-4xl font-bold text-white mb-16">How the Program Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  num: "1", color: BRAND, title: "Stage 1: Digital Foundations",
                  desc: "Every student starts here to master essential professional tools — the bedrock for everything that follows.",
                  items: ["🔹 Computer Fundamentals", "🔹 Presentation & Visual Design", "🔹 Introduction to Cloud Tools", "🔹 Word Processing & Spreadsheets"],
                },
                {
                  num: "2", color: BRAND_ORANGE, title: "Stage 2: Specialisation",
                  desc: "After foundations, students pick a track based on their unique interests.",
                  items: ["🎨 Creative Design", "🎮 Game Builder", "🎬 Media Creator"],
                },
              ].map((stage) => (
                <div key={stage.num} className="p-10 text-left transition-all duration-300 hover:-translate-y-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: `1px solid rgba(255,255,255,0.08)`, background: "rgba(15,15,15,0.9)", borderTop: `4px solid ${stage.color}`, backdropFilter: "blur(8px)" }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl mb-6 text-white" style={{ background: stage.color }}>
                    {stage.num}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{stage.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{stage.desc}</p>
                  <ul className="space-y-3">
                    {stage.items.map((item) => (
                      <li key={item} className="text-gray-300 font-medium">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-5 py-3" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span>💡</span>
              <span className="text-sm text-gray-400">Already have computer basics? Enroll in a specialisation track directly (2 months).</span>
              <button onClick={() => openEnroll()} className="font-bold underline text-sm" style={{ color: BRAND }}>Enroll now</button>
            </div>
          </div>
        </section>

        {/* ── Specialisation Tracks ─────────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-[1230px] mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Months 2 &amp; 3</p>
              <h2 className="text-4xl font-bold text-white mb-4">Our Specialised Tracks</h2>
              <p className="text-gray-400 max-w-lg mx-auto">After foundations, pick the track that matches your child's passion. Each offers both Group and One-on-One formats.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} onLearnMore={setActiveTrack} onEnroll={openEnroll} currency={currency} courses={courses} />
              ))}
            </div>
          </div>
        </section>

        {/* ── A Personalised Experience ──────────────────────────────────── */}
        <section className="py-20 px-6" style={{ background: "linear-gradient(135deg, #080808 0%, #0a0818 100%)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1230px] mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Experience</p>
            <h2 className="text-4xl font-bold text-white mb-4">A Personalised Experience</h2>
            <p className="text-xl text-gray-500 mb-16">No large groups. Just your child and their expert mentor.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                { value: "1:1",      label: "Instruction" },
                { value: "60–90",    label: "Min Per Session" },
                { value: "Group",    label: "Mentorship" },
                { value: "Flexible", label: "Scheduling" },
                { value: "Hands-on", label: "Projects" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-3xl md:text-4xl font-bold" style={{ color: BRAND }}>{s.value}</div>
                  <div className="text-xs text-gray-600 font-semibold uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <TrackModal track={activeTrack} onClose={() => setActiveTrack(null)} onEnroll={(name) => { setActiveTrack(null); openEnroll(name); }} currency={currency} courses={courses} />
      <RegistrationModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} preselectedTrack={preselectedTrack} currency={currency} courses={courses} />
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
      <Footer />
    </AppLayout>
  );
}