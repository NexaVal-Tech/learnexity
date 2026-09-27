// Kids page (pages/kids.tsx) — CMS sections plus the page's enrollment
// machinery (registration, track details, resume-payment modals).
//
// The sections share live state (currency, kids course prices from the
// database, and the "open the enrollment form" action), provided by
// KidsPageShell through KidsContext. That's why these blocks only work on
// the Kids page (see `pages: ["kids"]` in their definitions). The tracks and
// session-format labels an admin edits in the "Tracks" and "Session
// formats" sections are also what the enrollment form shows.
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight } from "lucide-react";
import { CmsImage, CmsText } from "@/components/cms/ui";
import SectionRenderer from "@/components/cms/SectionRenderer";
import { f, EMPHASIS_HELP } from "@/lib/cms/fields";
import type { BlockDefinition } from "@/lib/cms/blockTypes";
import type { CmsSection } from "@/lib/cms/types";

const BRAND        = "#4A3AFF";
const BRAND_ORANGE = "#f59e0b";
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

interface KidsCourseAPI {
  id: number; slug: string; name: string; description: string;
  emoji: string; color: string; duration_months: number;
  is_foundation: boolean; onetime_discount_percent: number;
  pricing: {
    USD: {
      standalone_starter_group: number;
      standalone_group: number;
      standalone_one_on_one: number;
      bundle_starter_group: number;
      bundle_group: number;
      bundle_one_on_one: number;
      bundle_starter_group_discounted: number;
      bundle_group_discounted: number;
      bundle_one_on_one_discounted: number;
      installment_bundle_starter_group: number;
      installment_bundle_group: number;
      installment_bundle_one_on_one: number;
    };
    NGN: {
      standalone_starter_group: number;
      standalone_group: number;
      standalone_one_on_one: number;
      bundle_starter_group: number;
      bundle_group: number;
      bundle_one_on_one: number;
      bundle_starter_group_discounted: number;
      bundle_group_discounted: number;
      bundle_one_on_one_discounted: number;
      installment_bundle_starter_group: number;
      installment_bundle_group: number;
      installment_bundle_one_on_one: number;
    };
  };
}

export interface Track {
  id: string; emoji: string; name: string; tagline: string; image: string;
  description: string; courseSlug: string;
  what_they_do: string[]; what_it_builds: string[]; what_they_learn: string[];
  why_it_matters: string; decision_line: string;
}

export const DEFAULT_TRACKS: Track[] = [
  {
    id: "creative-design", emoji: "🎨", name: "Creative Design",
    tagline: "Turn creativity into real digital skills",
    image: "/images/kids-3.jpg", courseSlug: "creative-design",
    description: "From 'I like drawing' to creating designs they can actually use and share — structured design thinking for young visual minds.",
    what_they_do: ["Create posters, graphics, and digital visuals", "Turn ideas into clear, structured designs", "Use real design tools with confidence"],
    what_it_builds: ["Creative confidence", "Visual thinking", "Attention to detail"],
    what_they_learn: ["Graphic design fundamentals", "Layout and visual storytelling", "Digital design tools"],
    why_it_matters: "Most kids are creative but don't know how to express it digitally. This track helps them turn imagination into something real and shareable.",
    decision_line: "If your child enjoys drawing, visuals, or expressing ideas — this is the right path.",
  },
  {
    id: "game-builder", emoji: "🎮", name: "Game Builder",
    tagline: "From playing games to building them",
    image: "/images/kids-2.jpg", courseSlug: "game-builder",
    description: "Your child learns how games actually work by creating their own — turning passive gaming into real thinking skills and technical confidence.",
    what_they_do: ["Build simple interactive games", "Understand how games are designed", "Solve problems through logic and structure"],
    what_it_builds: ["Logical thinking", "Problem-solving skills", "Persistence and focus"],
    what_they_learn: ["Game design thinking", "Interactive storytelling", "Beginner programming logic", "Problem-solving through mechanics"],
    why_it_matters: "Gaming is passive. Building games turns that interest into real thinking skills and technical confidence.",
    decision_line: "If your child enjoys games, challenges, or figuring things out — this is the right path.",
  },
  {
    id: "media-creator", emoji: "🎬", name: "Media Creator",
    tagline: "Turn screen time into creation time",
    image: "/images/kids-1.jpg", courseSlug: "media-creator",
    description: "Instead of just watching videos, your child learns how to create them — editing, producing, and telling stories that matter.",
    what_they_do: ["Edit and produce their own videos", "Add effects, text, and sound", "Create content they are proud to share"],
    what_it_builds: ["Communication skills", "Storytelling ability", "Creative confidence"],
    what_they_learn: ["Video cutting and trimming", "Text and simple motion graphics", "Transitions and effects", "Sound editing and syncing", "Basic color correction"],
    why_it_matters: "Most kids consume content daily. Very few know how to create it — and that is where real value is built.",
    decision_line: "If your child enjoys videos, storytelling, or content creation — this is the right path.",
  },
];

// ── Single source of truth for all session display text ───────────────────────
// Internal values (starter_group / mini_group / one_on_one) never change.
// Only edit here to rename what users see anywhere on the page.
export const DEFAULT_SESSION_LABELS: Record<
  "starter_group" | "mini_group" | "one_on_one",
  { icon: string; label: string; sublabel: string; desc: string; badge: string }
> = {
  starter_group: {
    icon:    "🌱",
    label:   "Team Lab",
    sublabel: "Small teams of 5–10",
    desc:    "Collaborative, project-based experience.",
    badge:   "Best Value",
  },
  mini_group: {
    icon:    "👥",
    label:   "Guided Small Group",
    sublabel: "Small teams of 3–5",
    desc:    "Shared learning with dedicated guidance.",
    badge:   "Most Popular",
  },
  one_on_one: {
    icon:    "🎯",
    label:   "Private Track",
    sublabel: "Just your child",
    desc:    "Personalized, focused learning.",
    badge:   "Premium",
  },
};


type SessionKey = "starter_group" | "mini_group" | "one_on_one";
type SessionLabels = Record<SessionKey, { icon: string; label: string; sublabel: string; desc: string; badge: string }>;

interface KidsContextValue {
  tracks: Track[];
  sessionLabels: SessionLabels;
  discountPercent: number;
  currency: "USD" | "NGN";
  courses: KidsCourseAPI[];
  openEnroll: (trackName?: string) => void;
  openTrack: (track: Track) => void;
  openResume: () => void;
}

const KidsContext = createContext<KidsContextValue | null>(null);

/** Outside the Kids page (e.g. the admin preview) the actions are no-ops. */
function useKids(): KidsContextValue {
  return (
    useContext(KidsContext) ?? {
      tracks: DEFAULT_TRACKS,
      sessionLabels: DEFAULT_SESSION_LABELS,
      discountPercent: 12,
      currency: "USD",
      courses: [],
      openEnroll: () => {},
      openTrack: () => {},
      openResume: () => {},
    }
  );
}

function fmt(amount: number, currency: string): string {
  if (!amount) return "—";
  if (currency === "NGN") return `₦${amount.toLocaleString("en-NG")}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function getTrackCourse(courses: KidsCourseAPI[], trackSlug: string): KidsCourseAPI | null {
  return courses.find(c => c.slug === trackSlug) ?? null;
}

function getPricing(
  courses: KidsCourseAPI[],
  trackSlug: string,
  currency: "USD" | "NGN",
  sessionType: "starter_group" | "mini_group" | "one_on_one",
  paymentType: "onetime" | "installment"
) {
  const course = getTrackCourse(courses, trackSlug);
  if (!course) return null;

  const p = course.pricing[currency];
  const isStarter = sessionType === "starter_group";
  const isGroup   = sessionType === "mini_group";

  const fullPrice = isStarter ? p.bundle_starter_group
                  : isGroup   ? p.bundle_group
                              : p.bundle_one_on_one;

  const discPrice = isStarter ? p.bundle_starter_group_discounted
                  : isGroup   ? p.bundle_group_discounted
                              : p.bundle_one_on_one_discounted;

  const monthly   = isStarter ? p.installment_bundle_starter_group
                  : isGroup   ? p.installment_bundle_group
                              : p.installment_bundle_one_on_one;

  const todayAmount = paymentType === "onetime" ? discPrice : monthly;
  const saved       = fullPrice - discPrice;

  return { fullPrice, discPrice, monthly, todayAmount, saved };
}

function getDisplayPrices(courses: KidsCourseAPI[], currency: "USD" | "NGN") {
  const track = courses.find(c => !c.is_foundation);
  if (!track) return {
    monthlyStarter: 0, monthlyGroup: 0, monthly1on1: 0,
    fullStarter: 0, fullGroup: 0, full1on1: 0,
    discStarter: 0, discGroup: 0, disc1on1: 0,
  };
  const p = track.pricing[currency];
  return {
    monthlyStarter: p.installment_bundle_starter_group,
    monthlyGroup:   p.installment_bundle_group,
    monthly1on1:    p.installment_bundle_one_on_one,
    fullStarter:    p.bundle_starter_group,
    fullGroup:      p.bundle_group,
    full1on1:       p.bundle_one_on_one,
    discStarter:    p.bundle_starter_group_discounted,
    discGroup:      p.bundle_group_discounted,
    disc1on1:       p.bundle_one_on_one_discounted,
  };
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
const CTAButton: React.FC<{ onClick: () => void; label?: string; secondary?: boolean }> = ({
  onClick, label = "Start Your Child's Journey", secondary = false
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 px-4 py-1 font-bold text-base transition-all hover:opacity-90 active:scale-95"
    style={{
      borderRadius: "2rem 0.75rem 2rem 0.75rem",
      background: secondary ? "transparent" : BRAND,
      border: secondary ? `2px solid ${BRAND}55` : "none",
      color: secondary ? BRAND : "var(--text-primary)",
      boxShadow: secondary ? "none" : `0 10px 32px ${BRAND}44`,
    }}
  >
    {label} <ArrowRight className="w-4 h-4" />
  </button>
);

// ─── Inline CTA Banner ────────────────────────────────────────────────────────
const SectionCTA: React.FC<{ onEnroll: () => void; headline: string; sub: string; cta?: string }> = ({
  onEnroll, headline, sub, cta = "Enroll Now — Spots Are Limited"
}) => (
  <div
    className="my-8 mx-auto max-w-[1230px] px-6 py-10 text-center"
    style={{
      borderRadius: "2rem 0.75rem 2rem 0.75rem",
      background: `linear-gradient(135deg, ${BRAND}18 0%, rgba(245,158,11,0.08) 100%)`,
      border: `1px solid ${BRAND}30`,
    }}
  >
    <p className="text-2xl font-bold text-white mb-2">{headline}</p>
    <p className="text-gray-400 text-sm mb-6">{sub}</p>
    <CTAButton onClick={onEnroll} label={cta} />
  </div>
);

// ─── Registration Modal ───────────────────────────────────────────────────────
interface RegModalProps {
  isOpen: boolean; onClose: () => void;
  preselectedTrack: string; currency: "USD" | "NGN"; courses: KidsCourseAPI[];
}

const RegistrationModal: React.FC<RegModalProps> = ({ isOpen, onClose, preselectedTrack, currency, courses }) => {
  const { tracks, sessionLabels: SESSION_LABELS, discountPercent: ONETIME_DISCOUNT } = useKids();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [parentName, setParentName]   = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge]   = useState("");
  const [selectedTrack, setSelectedTrack] = useState(preselectedTrack);
  const [sessionType, setSessionType]     = useState<"starter_group" | "mini_group" | "one_on_one">("mini_group");
  const [paymentType, setPaymentType]     = useState<"onetime" | "installment">("onetime");

  useEffect(() => { setSelectedTrack(preselectedTrack); }, [preselectedTrack]);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  useEffect(() => { if (!isOpen) { setStep(1); setError(""); } }, [isOpen]);

  const coursesLoaded = courses.length > 0;
  const trackSlug     = tracks.find(t => t.name === selectedTrack)?.courseSlug ?? "creative-design";
  const pricing       = getPricing(courses, trackSlug, currency, sessionType, paymentType);

  const fullPrice   = pricing?.fullPrice   ?? 0;
  const discPrice   = pricing?.discPrice   ?? 0;
  const monthly     = pricing?.monthly     ?? 0;
  const todayAmount = pricing?.todayAmount ?? 0;
  const saved       = pricing?.saved       ?? 0;

  const starterMonthly = getTrackCourse(courses, trackSlug)?.pricing[currency].installment_bundle_starter_group ?? 0;
  const groupMonthly   = getTrackCourse(courses, trackSlug)?.pricing[currency].installment_bundle_group ?? 0;
  const oneOnMonthly   = getTrackCourse(courses, trackSlug)?.pricing[currency].installment_bundle_one_on_one ?? 0;

  const handleStep1Next = () => {
    if (!parentName || !parentEmail || !studentName || !studentAge) { setError("Please fill in all required fields."); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async () => {
    const backendSessionType =
      sessionType === "mini_group"      ? "group_mentorship"
      : sessionType === "starter_group" ? "starter_group"
      : "one_on_one";

    const payload = {
      parent_name: parentName, parent_email: parentEmail, parent_phone: parentPhone,
      student_name: studentName, student_age: parseInt(studentAge),
      session_type: backendSessionType,
      track_slug: trackSlug,
      enrollment_type: "bundle",
      payment_type: paymentType,
      currency,
    };
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

  const inputCls   = "w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all placeholder-gray-600";
  const inputStyle = { background: "var(--surface-alt)", border: "1px solid var(--border-subtle)" };

  // Step 2 session options — badge color per tier
  const sessionOptions: {
    value: "starter_group" | "mini_group" | "one_on_one";
    badgeColor: string;
    priceNote: string;
  }[] = [
    { value: "starter_group", badgeColor: BRAND, priceNote: coursesLoaded ? `${fmt(starterMonthly, currency)}/mo` : "…" },
    { value: "mini_group",    badgeColor: BRAND,     priceNote: coursesLoaded ? `${fmt(groupMonthly,   currency)}/mo` : "…" },
    { value: "one_on_one",    badgeColor: BRAND,     priceNote: coursesLoaded ? `${fmt(oneOnMonthly,   currency)}/mo` : "…" },
  ];

  const selectedSessionMeta = SESSION_LABELS[sessionType];

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--overlay)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "var(--surface)", border: "1px solid var(--border-subtle)", animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ background: "var(--surface-alt)" }}>✕</button>

        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0"
                  style={{ background: step >= s ? BRAND : "var(--surface-alt)", color: step >= s ? "var(--text-primary)" : "var(--text-muted)" }}>{s}</div>
                {s < 3 && <div className="flex-1 h-0.5 rounded" style={{ background: step > s ? BRAND : "var(--surface-alt)" }} />}
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 1 ? "Begin Your Child's Journey" : step === 2 ? "Choose Track & Format" : "Payment Plan"}
          </h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            {step === 1 ? "Tell us about your child so we can personalise the experience."
              : step === 2 ? "Pick a specialisation track and your preferred session format. Digital Foundations is always included."
              : `Choose how you'd like to pay. Pay in full and save ${ONETIME_DISCOUNT}%.`}
          </p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="mb-4 px-4 py-3 text-red-400 text-sm" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>
          )}

          {/* ── Step 1 ── */}
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
              <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: BRAND }}>B</span>
                  Student Details
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">Student's Name *</label><input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Alex" type="text" className={inputCls} style={inputStyle} /></div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Student's Age *</label>
                    <select value={studentAge} onChange={(e) => setStudentAge(e.target.value)} className={inputCls} style={{ ...inputStyle, background: "var(--surface-alt)" }}>
                      <option value="">Select Age</option>
                      {[10,11,12,13,14,15,16,17].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={handleStep1Next} className="w-full py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4 py-3 text-sm" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(74,58,255,0.08)", border: `1px solid ${BRAND}30` }}>
                <span className="text-xl">🏗️</span>
                <div>
                  <p className="font-bold text-white text-xs">Digital Foundations included — Month 1</p>
                  <p className="text-gray-500 text-xs mt-0.5">Every program starts with essential computer & digital skills before the track begins.</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Specialisation Track (Months 2 & 3)</p>
                <div className="grid grid-cols-3 gap-2">
                  {tracks.map((t) => ({ value: t.name, emoji: t.emoji })).map((t) => (
                    <button key={t.value} type="button" onClick={() => setSelectedTrack(t.value)}
                      className="p-3 text-center transition-all hover:scale-105"
                      style={{
                        borderRadius: "1.25rem 0.5rem 1.25rem 0.5rem",
                        border: selectedTrack === t.value ? `2px solid ${BRAND}` : "1px solid var(--border-subtle)",
                        background: selectedTrack === t.value ? `${BRAND}15` : "var(--surface-alt)",
                        boxShadow: selectedTrack === t.value ? `0 0 20px ${BRAND}22` : "none",
                      }}>
                      <div className="text-xl mb-1">{t.emoji}</div>
                      <div className="text-[11px] font-bold leading-tight" style={{ color: selectedTrack === t.value ? BRAND : "var(--text-secondary)" }}>{t.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session format — labels come from SESSION_LABELS */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Session Format</p>
                <div className="grid grid-cols-3 gap-2">
                  {sessionOptions.map((s) => {
                    const meta      = SESSION_LABELS[s.value];
                    const isSelected = sessionType === s.value;
                    return (
                      <button key={s.value} type="button" onClick={() => setSessionType(s.value)}
                        className="p-3 text-center transition-all hover:scale-105"
                        style={{
                          borderRadius: "1.25rem 0.5rem 1.25rem 0.5rem",
                          border: isSelected ? `2px solid ${s.badgeColor}` : "1px solid var(--border-subtle)",
                          background: isSelected ? `${s.badgeColor}15` : "var(--surface-alt)",
                          boxShadow: isSelected ? `0 0 20px ${s.badgeColor}22` : "none",
                        }}>
                        <div className="text-xl mb-1">{meta.icon}</div>
                        <div className="text-[11px] font-bold leading-tight mb-0.5"
                          style={{ color: isSelected ? s.badgeColor : "var(--text-secondary)" }}>
                          {meta.label}
                        </div>
                        <div className="text-[10px] text-gray-600 mb-1 leading-tight">{meta.sublabel}</div>
                        <div className="text-[10px] font-bold" style={{ color: isSelected ? s.badgeColor : "var(--text-muted)" }}>
                          {s.priceNote} · 3 mo
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-sm text-gray-400 transition-all hover:text-white" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", background: "var(--surface-alt)" }}>← Back</button>
                <button onClick={() => { setError(""); setStep(3); }} className="flex-[2] py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Payment Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "onetime" as const, icon: "⚡", label: "Pay in Full", desc: `Save ${ONETIME_DISCOUNT}% — single payment, full access starts immediately.`, highlight: true },
                    { value: "installment" as const, icon: "📅", label: "3 Monthly Payments", desc: "Pay month by month. Access starts after the first payment.", highlight: false },
                  ]).map((pt) => (
                    <button key={pt.value} type="button" onClick={() => setPaymentType(pt.value)}
                      className="p-4 text-left relative transition-all"
                      style={{
                        borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem",
                        border: paymentType === pt.value ? `2px solid ${pt.highlight ? "#16a34a" : BRAND}` : "1px solid var(--border-subtle)",
                        background: paymentType === pt.value ? (pt.highlight ? "rgba(22,163,74,0.1)" : `${BRAND}10`) : "var(--surface-alt)",
                        boxShadow: paymentType === pt.value ? `0 0 20px ${pt.highlight ? "rgba(22,163,74,0.3)" : BRAND + "22"}` : "none",
                      }}>
                      {pt.highlight && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-900/40 text-green-400">Save {ONETIME_DISCOUNT}%</span>}
                      <span className="text-2xl block mb-2">{pt.icon}</span>
                      <p className="font-bold text-sm text-white">{pt.label}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{pt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary — session label from SESSION_LABELS */}
              <div style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price Summary</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${BRAND}20`, color: BRAND }}>3 months total</span>
                </div>
                <div className="px-4 py-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500"><span>🏗️ Digital Foundations (Month 1)</span><span className="text-gray-600 text-xs italic">included</span></div>
                  <div className="flex justify-between text-gray-500">
                    <span>{tracks.find(t => t.courseSlug === trackSlug)?.emoji} {tracks.find(t => t.name === selectedTrack)?.name} (Months 2 & 3)</span>
                    <span className="text-gray-600 text-xs italic">included</span>
                  </div>
                  <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)" }} />
                  {coursesLoaded ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {selectedSessionMeta.icon} {selectedSessionMeta.label} · 3 months
                        </span>
                        <span className={`font-semibold ${paymentType === "onetime" && saved > 0 ? "line-through text-gray-600" : "text-white"}`}>
                          {fmt(fullPrice, currency)}
                        </span>
                      </div>
                      {paymentType === "onetime" && saved > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Pay-in-full discount ({ONETIME_DISCOUNT}%)</span>
                          <span className="font-bold">−{fmt(saved, currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <span className="text-white">{paymentType === "onetime" ? "Total due today" : "Due today (1 of 3)"}</span>
                        <span style={{ color: BRAND }} className="text-base">{fmt(todayAmount, currency)}</span>
                      </div>
                      {paymentType === "installment" && (
                        <p className="text-[11px] text-gray-600 pt-1">Then {fmt(monthly, currency)}/month for 2 more months.</p>
                      )}
                    </>
                  ) : (
                    <div className="py-4 text-center text-gray-500 text-xs">Loading prices…</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 font-bold text-sm text-gray-400 transition-all hover:text-white" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", background: "var(--surface-alt)" }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading || !coursesLoaded} className="flex-[2] py-4 font-bold text-base text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
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
const TrackModal: React.FC<{ track: Track | null; onClose: () => void; onEnroll: (trackName: string) => void; currency: "USD" | "NGN"; courses: KidsCourseAPI[]; }> = ({ track, onClose, onEnroll, currency, courses }) => {
  const { sessionLabels: SESSION_LABELS, discountPercent: ONETIME_DISCOUNT } = useKids();
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => { document.body.style.overflow = track ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [track]);
  if (!track) return null;

  const coursesLoaded = courses.length > 0;
  const course        = getTrackCourse(courses, track.courseSlug);
  const p             = course?.pricing[currency];

  const fullStarter = p?.bundle_starter_group            ?? 0;
  const fullGroup   = p?.bundle_group                    ?? 0;
  const full1on1    = p?.bundle_one_on_one               ?? 0;
  const discStarter = p?.bundle_starter_group_discounted ?? 0;
  const discGroup   = p?.bundle_group_discounted         ?? 0;
  const disc1on1    = p?.bundle_one_on_one_discounted    ?? 0;
  const moStarter   = p?.installment_bundle_starter_group ?? 0;
  const moGroup     = p?.installment_bundle_group        ?? 0;
  const mo1on1      = p?.installment_bundle_one_on_one   ?? 0;

  const pricingRows: { key: "starter_group" | "mini_group" | "one_on_one"; monthly: number; full: number; disc: number }[] = [
    { key: "starter_group", monthly: moStarter, full: fullStarter, disc: discStarter },
    { key: "mini_group",    monthly: moGroup,   full: fullGroup,   disc: discGroup   },
    { key: "one_on_one",    monthly: mo1on1,    full: full1on1,    disc: disc1on1    },
  ];

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "var(--overlay)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "var(--surface)", border: "1px solid var(--border-subtle)", animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ background: "var(--surface-alt)" }}>✕</button>

        <div className="px-8 pt-10 pb-8" style={{ background: `linear-gradient(135deg, ${BRAND}12 0%, transparent 100%)`, borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="text-5xl mb-3">{track.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-1">{track.name}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{track.description}</p>
        </div>

        <div className="px-8 py-6 space-y-6">
          <div className="w-full overflow-hidden" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: "1px solid var(--border-subtle)" }}>
            <CmsImage src={track.image} alt={track.name} width={500} height={200} className="w-full object-cover" />
          </div>

          <div className="flex items-center gap-3 px-4 py-3" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "rgba(74,58,255,0.08)", border: `1px solid ${BRAND}25` }}>
            <span className="text-xl">🏗️</span>
            <p className="text-xs text-gray-400"><span className="text-white font-bold">Digital Foundations included.</span> Month 1 builds essential skills before this track begins in months 2 & 3.</p>
          </div>

          {/* Pricing — labels from SESSION_LABELS */}
          <div className="p-4" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: `${BRAND}08`, border: `1px solid ${BRAND}22` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Pricing — 3 months total</p>
            {coursesLoaded ? (
              <div className="grid grid-cols-3 gap-2">
                {pricingRows.map((row) => {
                  const meta = SESSION_LABELS[row.key];
                  return (
                    <div key={row.key} className="p-3"
                      style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "var(--surface-alt)", border: "1px solid var(--border-subtle)" }}>
                      <p className="text-lg mb-1">{meta.icon}</p>
                      <p className="text-xs font-bold text-white leading-tight">{meta.label}</p>
                      <p className="text-[10px] text-gray-500 mb-2 leading-tight">{meta.sublabel}</p>
                      <p className="text-xs text-gray-400">{fmt(row.monthly, currency)}/mo × 3</p>
                      <p className="font-bold text-white text-sm">{fmt(row.full, currency)}</p>
                      <p className="text-[10px] text-green-400">or {fmt(row.disc, currency)} in full</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500 text-xs">Loading prices…</div>
            )}
            <p className="text-[10px] text-green-400 font-semibold mt-3 px-1">✦ Save {ONETIME_DISCOUNT}% when you pay the full program upfront</p>
          </div>

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

          <p className="text-sm font-semibold text-gray-400 italic" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>{track.decision_line}</p>

          <button onClick={() => { onClose(); onEnroll(track.name); }}
            className="w-full py-4 font-bold text-base text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 24px ${BRAND}44` }}>
            Choose {track.name} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style jsx>{`@keyframes kidsModalIn { from { opacity:0; transform:translateY(32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
};

// ─── Track Card ───────────────────────────────────────────────────────────────
const TrackCard: React.FC<{ track: Track; onLearnMore: (track: Track) => void; onEnroll: (trackName: string) => void; durationBadge: string; enrollLabel: string; learnMoreLabel: string }> = ({ track, onLearnMore, onEnroll, durationBadge, enrollLabel, learnMoreLabel }) => (
  <div
    className="flex flex-col h-full cursor-pointer group"
    style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", background: "var(--surface-elevated)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px rgba(0,0,0,0.7)", transition: "border-color 0.3s, box-shadow 0.3s, transform 0.3s" }}
    onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${BRAND}55`; el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${BRAND}22`; el.style.transform = "translateY(-6px)"; }}
    onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border-subtle)"; el.style.boxShadow = "0 25px 50px rgba(0,0,0,0.7)"; el.style.transform = ""; }}
  >
    <div className="relative w-full h-48 overflow-hidden" style={{ borderRadius: "2rem 0.75rem 0 0" }}>
      <CmsImage src={track.image} alt={track.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(15,15,15,0.8) 100%)" }} />
      <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "var(--surface-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>{durationBadge}</div>
    </div>

    <div className="flex flex-col flex-1 p-8 gap-4">
      <div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: `${BRAND}20` }}>
          <span>{track.emoji}</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{track.name}</h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{track.description}</p>
      </div>

      <ul className="space-y-2 mt-1">
        {track.what_it_builds.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
            <span style={{ color: BRAND }}>✦</span>{item}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 mt-auto pt-2">
        <button onClick={() => onEnroll(track.name)}
          className="w-full py-3 font-bold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND, boxShadow: `0 8px 20px ${BRAND}33` }}>
          {enrollLabel}
        </button>
        <button onClick={() => onLearnMore(track)}
          className="w-full py-3 font-semibold text-sm transition-all hover:bg-white/5"
          style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: `2px solid ${BRAND}33`, color: BRAND }}>
          {learnMoreLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Resume Banner ─────────────────────────────────────────────────────────────
const ResumeBanner: React.FC<{ onResume: () => void; title: string; text: string; buttonLabel: string }> = ({ onResume, title, text, buttonLabel }) => (
  <div className="flex items-center gap-4 px-6 py-4" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)", backdropFilter: "blur(8px)" }}>
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${BRAND_ORANGE}20` }}>📋</div>
    <div className="flex-1">
      <p className="font-bold text-white text-sm">{title}</p>
      <p className="text-gray-500 text-xs mt-0.5">{text}</p>
    </div>
    <button onClick={onResume} className="px-4 py-2 font-bold text-xs text-white flex-shrink-0 transition-all hover:opacity-90" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: BRAND_ORANGE, boxShadow: `0 4px 16px ${BRAND_ORANGE}44` }}>
      {buttonLabel}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--overlay)", backdropFilter: "blur(12px)" }}>
      <div className="relative w-full max-w-md p-8 shadow-2xl" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: "var(--surface)", border: "1px solid var(--border-subtle)", animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all" style={{ background: "var(--surface-alt)" }}>✕</button>
        <h3 className="text-xl font-bold text-white mb-1">Resume Your Enrollment</h3>
        <p className="text-gray-500 text-sm mb-6">Enter the parent email used during registration.</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-gray-600 mb-3" style={{ background: "var(--surface-alt)", border: "1px solid var(--border-subtle)" }} />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        {found.length === 0 ? (
          <button onClick={lookup} disabled={loading} className="w-full py-3 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: BRAND }}>
            {loading ? "Searching…" : "Find My Enrollment →"}
          </button>
        ) : (
          <div className="space-y-3">
            {found.map((enr: any) => (
              <button key={enr.id} onClick={() => router.push(`/kids/payment/${enr.id}`)} className="w-full p-4 text-left transition-all hover:border-indigo-500" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", border: "1px solid var(--border-subtle)", background: "var(--surface-alt)" }}>
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


// ═══════════════════════════════════════════════════════════════════════════════
// CMS data ↔ runtime shapes
// ═══════════════════════════════════════════════════════════════════════════════

/** How a track is stored in the CMS (lists as one-item-per-line text). */
interface CmsTrack {
  emoji: string;
  name: string;
  tagline: string;
  image: string;
  description: string;
  courseSlug: string;
  whatTheyDo: string;
  whatItBuilds: string;
  whatTheyLearn: string;
  whyItMatters: string;
  decisionLine: string;
}

const lines = (s: string | undefined) => (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

function toTrack(t: CmsTrack, i: number): Track {
  return {
    id: t.courseSlug || `track-${i}`,
    emoji: t.emoji,
    name: t.name,
    tagline: t.tagline,
    image: t.image,
    description: t.description,
    courseSlug: t.courseSlug,
    what_they_do: lines(t.whatTheyDo),
    what_it_builds: lines(t.whatItBuilds),
    what_they_learn: lines(t.whatTheyLearn),
    why_it_matters: t.whyItMatters,
    decision_line: t.decisionLine,
  };
}

function fromTrack(t: Track): CmsTrack {
  return {
    emoji: t.emoji,
    name: t.name,
    tagline: t.tagline,
    image: t.image,
    description: t.description,
    courseSlug: t.courseSlug,
    whatTheyDo: t.what_they_do.join("\n"),
    whatItBuilds: t.what_it_builds.join("\n"),
    whatTheyLearn: t.what_they_learn.join("\n"),
    whyItMatters: t.why_it_matters,
    decisionLine: t.decision_line,
  };
}

interface CmsSessionFormat {
  icon: string;
  label: string;
  sublabel: string;
  desc: string;
  badge: string;
  color: "brand" | "orange";
  points: string;
}

const SESSION_KEYS: { key: SessionKey; field: "starter" | "mini" | "private" }[] = [
  { key: "starter_group", field: "starter" },
  { key: "mini_group", field: "mini" },
  { key: "one_on_one", field: "private" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Sections
// ═══════════════════════════════════════════════════════════════════════════════

export interface KidsHeroData {
  badge: string;
  heading: string;
  headingHighlight: string;
  text: string;
  ctaLabel: string;
  socialProof: string;
  note: string;
  image: string;
  imageAlt: string;
  imageBadgeLabel: string;
  imageBadgeTitle: string;
}

export function KidsHero({ data }: { data: KidsHeroData }) {
  const { openEnroll } = useKids();
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${BRAND_ORANGE}30 0%, transparent 70%)`, filter: "blur(80px)", animation: "kidsFloat 6s ease-in-out infinite" }} />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${BRAND}25 0%, transparent 70%)`, filter: "blur(100px)", animation: "kidsFloat 6s ease-in-out infinite 2s" }} />

      <div className="relative max-w-[1230px] mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          {data.badge && (
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: `${BRAND_ORANGE}18`, color: BRAND_ORANGE, border: `1px solid ${BRAND_ORANGE}30` }}>
              {data.badge}
            </span>
          )}
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mt-2">
            <CmsText text={data.heading} />{" "}
            {data.headingHighlight && (
              <span style={{ background: `linear-gradient(90deg, ${BRAND}, ${BRAND_ORANGE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {data.headingHighlight}
              </span>
            )}
          </h1>
          <p className="text-lg text-gray-400 mt-6 leading-relaxed max-w-md">
            <CmsText text={data.text} />
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <CTAButton onClick={() => openEnroll()} label={data.ctaLabel || undefined} />
            {data.socialProof && (
              <div className="flex items-center gap-3 px-2">
                <div className="flex -space-x-2">
                  {[BRAND, BRAND_ORANGE, "var(--page-bg)"].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2" style={{ background: c, borderColor: "var(--page-bg)" }} />
                  ))}
                </div>
                <span className="text-sm text-gray-400">{data.socialProof}</span>
              </div>
            )}
          </div>
          {data.note && (
            <p className="text-xs text-gray-600 mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {data.note}
            </p>
          )}
        </div>

        {data.image && (
          <div className="relative">
            <div className="relative w-full aspect-[4/3] md:aspect-[14/10] overflow-hidden group" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 60px ${BRAND}18` }}>
              <CmsImage src={data.image} alt={data.imageAlt || ""} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, transparent 50%, rgba(8,8,8,0.6) 100%)" }} />
              {(data.imageBadgeLabel || data.imageBadgeTitle) && (
                <div className="absolute bottom-5 left-5 px-4 py-3 flex items-center gap-3" style={{ borderRadius: "1.5rem 0.5rem 1.5rem 0.5rem", background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)", backdropFilter: "blur(8px)", animation: "kidsBounce 3s ease-in-out infinite" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#6C63FF" }}>✓</div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{data.imageBadgeLabel}</p>
                    <p className="text-sm font-bold text-white">{data.imageBadgeTitle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export interface KidsTracksData {
  eyebrow: string;
  heading: string;
  intro: string;
  durationBadge: string;
  enrollLabel: string;
  learnMoreLabel: string;
  tracks: CmsTrack[];
}

export function KidsTracks({ data }: { data: KidsTracksData }) {
  const { openEnroll, openTrack } = useKids();
  const tracks = (data.tracks ?? []).filter((t) => t.name).map(toTrack);
  return (
    <section className="py-10 px-6">
      <div className="max-w-[1230px] mx-auto">
        <div className="text-center mb-16">
          {data.eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>{data.eyebrow}</p>}
          <h2 className="text-4xl font-bold text-white mb-4"><CmsText text={data.heading} /></h2>
          {data.intro && <p className="text-gray-400 max-w-lg mx-auto"><CmsText text={data.intro} /></p>}
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onLearnMore={openTrack}
              onEnroll={openEnroll}
              durationBadge={data.durationBadge}
              enrollLabel={data.enrollLabel || "Enroll Now"}
              learnMoreLabel={data.learnMoreLabel || "Learn More"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export interface KidsResumeData {
  title: string;
  text: string;
  buttonLabel: string;
}

export function KidsResume({ data }: { data: KidsResumeData }) {
  const { openResume } = useKids();
  return (
    <section className="py-4 px-6" style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="max-w-[1230px] mx-auto">
        <ResumeBanner onResume={openResume} title={data.title} text={data.text} buttonLabel={data.buttonLabel || "Resume Payment"} />
      </div>
    </section>
  );
}

export interface KidsOutcomesData {
  eyebrow: string;
  heading: string;
  items: { icon: string; title: string; desc: string }[];
}

export function KidsOutcomes({ data }: { data: KidsOutcomesData }) {
  const items = data.items ?? [];
  return (
    <section className="py-20 px-6" style={{ background: "var(--page-bg-alt)" }}>
      <div className="max-w-[1230px] mx-auto text-center">
        {data.eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>{data.eyebrow}</p>}
        <h2 className="text-3xl font-bold text-white mb-12"><CmsText text={data.heading} /></h2>
        <div className={`grid gap-6 ${items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", background: "var(--surface-alt)", backdropFilter: "blur(8px)" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${BRAND}44`; el.style.boxShadow = `0 0 30px ${BRAND}15`; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border-subtle)"; el.style.boxShadow = "none"; }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm"><CmsText text={item.desc} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface KidsCtaData {
  headline: string;
  sub: string;
  cta: string;
}

export function KidsCta({ data }: { data: KidsCtaData }) {
  const { openEnroll } = useKids();
  return (
    <section className="px-6">
      <SectionCTA onEnroll={() => openEnroll()} headline={data.headline} sub={data.sub} cta={data.cta || undefined} />
    </section>
  );
}

export interface KidsProblemData {
  image: string;
  imageAlt: string;
  eyebrow: string;
  heading: string;
  text: string;
  calloutTitle: string;
  calloutText: string;
}

export function KidsProblem({ data }: { data: KidsProblemData }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[1230px] mx-auto grid md:grid-cols-2 gap-16 items-center">
        {data.image && (
          <div className="relative w-full aspect-video overflow-hidden" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
            <CmsImage src={data.image} alt={data.imageAlt || ""} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-70 hover:scale-105 transition-transform duration-700 hover:opacity-90" />
          </div>
        )}
        <div>
          {data.eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>{data.eyebrow}</p>}
          <h2 className="text-4xl font-bold text-white leading-tight"><CmsText text={data.heading} /></h2>
          {data.text && (
            <p className="text-lg text-gray-400 mt-6">
              <CmsText text={data.text} accentClassName="text-white font-semibold" />
            </p>
          )}
          {(data.calloutTitle || data.calloutText) && (
            <div className="mt-8 p-5" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: `${BRAND_ORANGE}10`, border: `1px solid ${BRAND_ORANGE}25` }}>
              {data.calloutTitle && <p className="font-bold text-amber-400">{data.calloutTitle}</p>}
              <p className="text-amber-200/70 mt-1 text-xl leading-relaxed">
                <CmsText text={data.calloutText} accentClassName="text-amber-300 font-bold" />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export interface KidsStructureData {
  eyebrow: string;
  heading: string;
  intro: string;
  stages: { label: string; color: "brand" | "orange"; title: string; desc: string; items: string }[];
}

export function KidsStructure({ data }: { data: KidsStructureData }) {
  return (
    <section className="py-20 px-6" style={{ background: "var(--page-bg-alt)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="max-w-[1230px] mx-auto text-center">
        {data.eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>{data.eyebrow}</p>}
        <h2 className="text-4xl font-bold text-white mb-4"><CmsText text={data.heading} /></h2>
        {data.intro && <p className="text-gray-500 mb-16 max-w-lg mx-auto"><CmsText text={data.intro} /></p>}
        <div className="grid md:grid-cols-2 gap-8">
          {(data.stages ?? []).map((stage, i) => {
            const color = stage.color === "orange" ? BRAND_ORANGE : BRAND;
            return (
              <div key={i} className="p-10 text-left transition-all duration-300 hover:-translate-y-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: "1px solid var(--border-subtle)", background: "var(--surface-elevated)", borderTop: `4px solid ${color}`, backdropFilter: "blur(8px)" }}>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: `${color}20`, color }}>{stage.label}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{stage.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed"><CmsText text={stage.desc} /></p>
                <ul className="space-y-3">
                  {lines(stage.items).map((item, j) => <li key={j} className="text-gray-300 font-medium">{item}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export interface KidsSessionFormatsData {
  eyebrow: string;
  heading: string;
  intro: string;
  starter: CmsSessionFormat;
  mini: CmsSessionFormat;
  private: CmsSessionFormat;
}

export function KidsSessionFormats({ data }: { data: KidsSessionFormatsData }) {
  const { openEnroll, courses, currency, discountPercent } = useKids();
  const coursesLoaded = courses.length > 0;
  const prices = getDisplayPrices(courses, currency);
  const monthly: Record<SessionKey, number> = {
    starter_group: prices.monthlyStarter,
    mini_group: prices.monthlyGroup,
    one_on_one: prices.monthly1on1,
  };

  return (
    <section className="py-20 px-6" style={{ background: "var(--page-bg-alt)", borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-[1230px] mx-auto">
        <div className="text-center mb-12">
          {data.eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>{data.eyebrow}</p>}
          <h2 className="text-4xl font-bold text-white mb-4"><CmsText text={data.heading} /></h2>
          {data.intro && <p className="text-gray-500 max-w-md mx-auto"><CmsText text={data.intro} /></p>}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SESSION_KEYS.map(({ key, field }) => {
            const meta = { ...DEFAULT_SESSION_FORMATS[field], ...(data[field] ?? {}) };
            const color = meta.color === "brand" ? BRAND : BRAND_ORANGE;
            return (
              <div key={key} className="p-8 transition-all duration-300 hover:-translate-y-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", border: `1px solid ${color}30`, background: "var(--surface-elevated)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{meta.icon}</span>
                  {meta.badge && <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${color}20`, color }}>{meta.badge}</span>}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{meta.label}</h3>
                <p className="text-sm font-semibold mb-1" style={{ color }}>{meta.sublabel}</p>
                <p className="text-xs text-gray-500 mb-5">{meta.desc}</p>
                <ul className="space-y-2 mb-6">
                  {lines(meta.points).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-0.5 shrink-0" style={{ color }}>✦</span>{pt}
                    </li>
                  ))}
                </ul>
                <div className="p-4" style={{ borderRadius: "1rem 0.5rem 1rem 0.5rem", background: "var(--surface-alt)", border: "1px solid var(--border-subtle)" }}>
                  {coursesLoaded ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold" style={{ color }}>{fmt(monthly[key], currency)}</span>
                        <span className="text-gray-500 text-sm">/month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-green-400">Pay in full and (save {discountPercent}%)</span>
                      </p>
                    </>
                  ) : (
                    <div className="h-10 flex items-center text-gray-600 text-xs">Loading prices…</div>
                  )}
                </div>
                <button onClick={() => openEnroll()} className="mt-4 w-full py-3 font-bold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem", background: color, boxShadow: `0 8px 20px ${color}33` }}>
                  Enroll — {meta.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export interface KidsExperienceData {
  eyebrow: string;
  heading: string;
  text: string;
  stats: { value: string; label: string }[];
}

export function KidsExperience({ data }: { data: KidsExperienceData }) {
  return (
    <section className="py-20 px-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-[1230px] mx-auto text-center">
        {data.eyebrow && <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>{data.eyebrow}</p>}
        <h2 className="text-4xl font-bold text-white mb-4"><CmsText text={data.heading} /></h2>
        {data.text && <p className="text-xl text-gray-500 mb-16"><CmsText text={data.text} /></p>}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {(data.stats ?? []).map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-3xl md:text-4xl font-bold" style={{ color: BRAND }}>{s.value}</div>
              <div className="text-xs text-gray-600 font-semibold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page shell — owns the shared state and the modals
// ═══════════════════════════════════════════════════════════════════════════════

export function KidsPageShell({ sections }: { sections: CmsSection[] }) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState("");
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [courses, setCourses] = useState<KidsCourseAPI[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/detect-currency`).then((r) => r.json()).then((d) => { if (d.currency) setCurrency(d.currency); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/kids/courses`).then((r) => r.json()).then((d) => { if (d.courses) setCourses(d.courses); }).catch(() => {});
  }, []);

  // The tracks + session labels the admin edited are also what the
  // enrollment form offers, so the two can never disagree.
  const tracksSection = sections.find((s) => s.type === "kids.tracks" && !s.hidden);
  const cmsTracks = (tracksSection?.data?.tracks as CmsTrack[] | undefined)?.filter((t) => t.name);
  const tracks = cmsTracks?.length ? cmsTracks.map(toTrack) : DEFAULT_TRACKS;

  const formatsSection = sections.find((s) => s.type === "kids.sessionFormats");
  const sessionLabels = SESSION_KEYS.reduce((acc, { key, field }) => {
    const saved = { ...DEFAULT_SESSION_FORMATS[field], ...((formatsSection?.data?.[field] as Partial<CmsSessionFormat>) ?? {}) };
    acc[key] = { icon: saved.icon, label: saved.label, sublabel: saved.sublabel, desc: saved.desc, badge: saved.badge };
    return acc;
  }, {} as SessionLabels);

  // Discount comes from the kids course settings in the database.
  const discountPercent = courses.find((c) => !c.is_foundation)?.onetime_discount_percent ?? 12;

  const openEnroll = (trackName?: string) => {
    setPreselectedTrack(trackName || tracks[0]?.name || "");
    setEnrollOpen(true);
  };

  const value: KidsContextValue = {
    tracks,
    sessionLabels,
    discountPercent,
    currency,
    courses,
    openEnroll,
    openTrack: setActiveTrack,
    openResume: () => setResumeOpen(true),
  };

  return (
    <KidsContext.Provider value={value}>
      <style>{`
        @keyframes kidsFloat { 0%,100% { transform:translateY(0) rotate(0); } 50% { transform:translateY(-20px) rotate(5deg); } }
        @keyframes kidsBounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes kidsModalIn { from { opacity:0; transform:translateY(32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .dc-divider { border:none; border-top:1px solid var(--border-subtle); }
      `}</style>
      <div style={{ color: "var(--text-primary)", minHeight: "100vh" }}>
        <SectionRenderer sections={sections} />
      </div>
      <TrackModal track={activeTrack} onClose={() => setActiveTrack(null)} onEnroll={(name) => { setActiveTrack(null); openEnroll(name); }} currency={currency} courses={courses} />
      <RegistrationModal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} preselectedTrack={preselectedTrack} currency={currency} courses={courses} />
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
    </KidsContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Definitions
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SESSION_FORMATS: Record<"starter" | "mini" | "private", CmsSessionFormat> = {
  starter: { ...DEFAULT_SESSION_LABELS.starter_group, color: "orange", points: "Best value, most affordable option\nGreat for social, outgoing learners\nStructured pace suits all beginners\nHigh-energy, collaborative environment" },
  mini: { ...DEFAULT_SESSION_LABELS.mini_group, color: "brand", points: "Learn with a tight-knit peer group\nMore mentor attention per student\nCollaborative, focused, and social\nHealthy group motivation and energy" },
  private: { ...DEFAULT_SESSION_LABELS.one_on_one, color: "orange", points: "Entirely at your child's own pace\nMentor adapts to their learning style\nMaximum time for questions and depth\nFastest path to mastery" },
};

const sessionFormatFields = [
  f.text("icon", "Emoji"),
  f.text("label", "Name"),
  f.text("sublabel", "Group size text"),
  f.text("desc", "Short description"),
  f.text("badge", "Badge"),
  f.select("color", "Colour", [
    { value: "brand", label: "Purple" },
    { value: "orange", label: "Amber" },
  ]),
  f.textarea("points", "Bullet points (one per line)", { rows: 4 }),
];

const KIDS = ["kids"];

export const kidsBlocks: BlockDefinition[] = [
  {
    type: "kids.hero",
    label: "Kids — hero",
    category: "Kids",
    pages: KIDS,
    addable: false,
    description: "The main button opens the enrollment form.",
    fields: [
      f.text("badge", "Badge"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.text("headingHighlight", "Highlighted end of heading (gradient)"),
      f.textarea("text", "Text", { rows: 3, help: EMPHASIS_HELP }),
      f.text("ctaLabel", "Button text"),
      f.text("socialProof", "Text beside the button"),
      f.text("note", "Small note under the button"),
      f.image("image", "Photo"),
      f.text("imageAlt", "Photo description"),
      f.text("imageBadgeLabel", "Photo badge — small label"),
      f.text("imageBadgeTitle", "Photo badge — title"),
    ],
    defaults: {
      badge: "Ages 10–17 · 3-Month Program",
      heading: "Turn Screen Time Into Real",
      headingHighlight: "Creative Tech Skills",
      text: "Enroll your child in a structured 3-month tech program with expert mentorship. Start with digital foundations, then advance into their chosen specialization.",
      ctaLabel: "Start Your Child's Journey",
      socialProof: "Join 500+ young creators",
      note: "Spots are limited · Beginner-friendly · No experience needed",
      image: "/images/photo-1593642532842-98d0fd5ebc1a.avif",
      imageAlt: "Student coding",
      imageBadgeLabel: "Live Mentorship",
      imageBadgeTitle: "Expert-led Sessions",
    } satisfies KidsHeroData,
  },
  {
    type: "kids.tracks",
    label: "Kids — specialisation tracks",
    category: "Kids",
    pages: KIDS,
    addable: false,
    description: "Track cards with a details popup. These tracks are also the choices in the enrollment form.",
    fields: [
      f.text("eyebrow", "Small label"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.textarea("intro", "Intro", { rows: 2 }),
      f.text("durationBadge", "Duration badge on photos"),
      f.text("enrollLabel", "Enroll button text"),
      f.text("learnMoreLabel", "Learn more button text"),
      f.list(
        "tracks",
        "Tracks",
        [
          f.text("emoji", "Emoji"),
          f.text("name", "Name"),
          f.text("courseSlug", "Kids course slug", { help: "Must match the course's slug in Kids Management — it decides which prices are shown and which course the child is enrolled in." }),
          f.text("tagline", "Tagline"),
          f.image("image", "Photo"),
          f.textarea("description", "Description", { rows: 3 }),
          f.textarea("whatTheyDo", "What they'll be able to do (one per line)", { rows: 3 }),
          f.textarea("whatItBuilds", "What it builds (one per line)", { rows: 3 }),
          f.textarea("whatTheyLearn", "What they learn (one per line)", { rows: 4 }),
          f.textarea("whyItMatters", "Why it matters", { rows: 3 }),
          f.textarea("decisionLine", "Closing line", { rows: 2 }),
        ],
        {
          itemLabelKey: "name",
          addLabel: "Add track",
          max: 6,
          itemDefaults: { emoji: "✨", name: "New track", courseSlug: "", tagline: "", image: "", description: "", whatTheyDo: "", whatItBuilds: "", whatTheyLearn: "", whyItMatters: "", decisionLine: "" },
        }
      ),
    ],
    defaults: {
      eyebrow: "Chose a Specialised Track",
      heading: "What Would Your Child Love To Create",
      intro: "Pick the track that matches your child's passion. Digital Foundations is always included in month 1.",
      durationBadge: "3 months",
      enrollLabel: "Enroll Now",
      learnMoreLabel: "Learn More",
      tracks: DEFAULT_TRACKS.map(fromTrack),
    } satisfies KidsTracksData,
  },
  {
    type: "kids.resume",
    label: "Kids — resume payment banner",
    category: "Kids",
    pages: KIDS,
    addable: false,
    fields: [f.text("title", "Title"), f.textarea("text", "Text", { rows: 2 }), f.text("buttonLabel", "Button text")],
    defaults: {
      title: "Have an incomplete enrollment?",
      text: "Enter your email to pick up where you left off — no account needed.",
      buttonLabel: "Resume Payment",
    } satisfies KidsResumeData,
  },
  {
    type: "kids.outcomes",
    label: "Kids — outcomes",
    category: "Kids",
    pages: KIDS,
    fields: [
      f.text("eyebrow", "Small label"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.list("items", "Outcomes", [f.text("icon", "Emoji"), f.text("title", "Title"), f.textarea("desc", "Text", { rows: 2 })], {
        itemLabelKey: "title",
        addLabel: "Add outcome",
        max: 8,
        itemDefaults: { icon: "⭐", title: "Outcome", desc: "Describe it." },
      }),
    ],
    defaults: {
      eyebrow: "Program Outcomes",
      heading: "What Your Child Will Gain",
      items: [
        { icon: "🛠️", title: "Practical Skills", desc: "Real tools used by designers and developers today." },
        { icon: "🧠", title: "Logical Thinking", desc: "Problem-solving skills that translate to school and life." },
        { icon: "✨", title: "Confidence", desc: "Mastering tools that usually feel 'too hard'." },
        { icon: "📂", title: "Real Portfolio", desc: "A collection of projects they built from scratch." },
      ],
    } satisfies KidsOutcomesData,
  },
  {
    type: "kids.cta",
    label: "Kids — enroll banner",
    category: "Kids",
    pages: KIDS,
    addable: false,
    description: "The button opens the enrollment form.",
    fields: [f.textarea("headline", "Headline", { rows: 2 }), f.text("sub", "Text"), f.text("cta", "Button text")],
    defaults: {
      headline: "Ready to invest in your child's future?",
      sub: "3 months. Beginner friendly, lifelong skills.",
      cta: "Reserve a Spot Now",
    } satisfies KidsCtaData,
  },
  {
    type: "kids.problem",
    label: "Kids — the problem",
    category: "Kids",
    pages: KIDS,
    fields: [
      f.image("image", "Photo"),
      f.text("imageAlt", "Photo description"),
      f.text("eyebrow", "Small label"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.textarea("text", "Text", { rows: 2, help: "Wrap words in **double asterisks** to make them bold white." }),
      f.text("calloutTitle", "Callout title"),
      f.textarea("calloutText", "Callout text", { rows: 4, help: "Wrap words in **double asterisks** to make them bold." }),
    ],
    defaults: {
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
      imageAlt: "Passive tech use",
      eyebrow: "The Problem",
      heading: "From Passive Screens to Active Minds",
      text: "Today, most kids use technology **passively**:",
      calloutTitle: "Why Join Us:",
      calloutText: "With Learnexity, screen time becomes skill time. **Every** hour spent on a device is a step toward real, lasting creativity, confidence, and problem-solving ability.",
    } satisfies KidsProblemData,
  },
  {
    type: "kids.structure",
    label: "Kids — program structure",
    category: "Kids",
    pages: KIDS,
    fields: [
      f.text("eyebrow", "Small label"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.textarea("intro", "Intro", { rows: 3 }),
      f.list(
        "stages",
        "Stages",
        [
          f.text("label", "Label (e.g. Month 1)"),
          f.select("color", "Colour", [
            { value: "brand", label: "Purple" },
            { value: "orange", label: "Amber" },
          ]),
          f.text("title", "Title"),
          f.textarea("desc", "Description", { rows: 3 }),
          f.textarea("items", "List (one per line)", { rows: 4 }),
        ],
        { itemLabelKey: "title", addLabel: "Add stage", max: 4, itemDefaults: { label: "Month", color: "brand", title: "Stage", desc: "", items: "" } }
      ),
    ],
    defaults: {
      eyebrow: "Program Structure",
      heading: "What Your Child Will Learn.",
      intro: "Every enrollment includes Digital Foundations first, then your child's chosen specialisation, beginner friendly. Designed to build real, lifelong skills.",
      stages: [
        {
          label: "Month 1",
          color: "brand",
          title: "Digital Foundations",
          desc: "Every student starts here to master essential digital tools — the bedrock for everything that follows.",
          items: "🔹 Computer Fundamentals\n🔹 Presentation & Visual Design\n🔹 Introduction to Cloud Tools\n🔹 Word Processing & Spreadsheets",
        },
        {
          label: "Months 2–3",
          color: "orange",
          title: "Specialisation Track",
          desc: "After foundations, students deep-dive into their chosen track with hands-on, mentor-guided projects.",
          items: "🎨 Creative Design\n🎮 Game Builder\n🎬 Media Creator",
        },
      ],
    } satisfies KidsStructureData,
  },
  {
    type: "kids.sessionFormats",
    label: "Kids — session formats & prices",
    category: "Kids",
    pages: KIDS,
    addable: false,
    description: "Prices come from Kids Management. The names here are also used in the enrollment form.",
    fields: [
      f.text("eyebrow", "Small label"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.textarea("intro", "Intro", { rows: 2 }),
      f.group("starter", "Team Lab (starter group)", sessionFormatFields),
      f.group("mini", "Guided Small Group (mini group)", sessionFormatFields),
      f.group("private", "Private Track (one-on-one)", sessionFormatFields),
    ],
    defaults: {
      eyebrow: "Session Format",
      heading: "How Would Your Child Learn Best?",
      intro: "All formats include the same 3-month curriculum. The difference is the class size and learning environment.",
      starter: DEFAULT_SESSION_FORMATS.starter,
      mini: DEFAULT_SESSION_FORMATS.mini,
      private: DEFAULT_SESSION_FORMATS.private,
    } satisfies KidsSessionFormatsData,
  },
  {
    type: "kids.experience",
    label: "Kids — experience stats",
    category: "Kids",
    pages: KIDS,
    fields: [
      f.text("eyebrow", "Small label"),
      f.textarea("heading", "Heading", { rows: 2 }),
      f.textarea("text", "Text", { rows: 2 }),
      f.list("stats", "Stats", [f.text("value", "Value"), f.text("label", "Label")], {
        itemLabelKey: "label",
        addLabel: "Add stat",
        max: 6,
        itemDefaults: { value: "1", label: "Label" },
      }),
    ],
    defaults: {
      eyebrow: "Experience",
      heading: "A Personalised Experience",
      text: "No passive learning. Just your child, their mentor, and real projects.",
      stats: [
        { value: "3", label: "Months" },
        { value: "60–90", label: "Min Per Session" },
        { value: "3–5", label: "Kids Per Group" },
        { value: "Flexible", label: "Scheduling" },
        { value: "Hands-on", label: "Projects" },
        { value: "one week", label: "two sessions" },
      ],
    } satisfies KidsExperienceData,
  },
];
