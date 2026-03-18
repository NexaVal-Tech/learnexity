import React, { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND = "#4A3AFF";
const BRAND_LIGHT = "#6C63FF";
const BRAND_ORANGE = "#f59e0b";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Track {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  image: string;
  description: string;
  color: string;
  what_they_do: string[];
  what_it_builds: string[];
  what_they_learn: string[];
  why_it_matters: string;
  decision_line: string;
}

// ─── Track data ───────────────────────────────────────────────────────────────
const tracks: Track[] = [
  {
    id: "creative-design",
    emoji: "🎨",
    name: "Creative Design",
    tagline: "Turn creativity into real digital skills",
    image: "/images/kids-3.jpg",
    description:
      "From 'I like drawing' to creating designs they can actually use and share — structured design thinking for young visual minds.",
    color: "#4A3AFF",
    what_they_do: [
      "Create posters, graphics, and digital visuals",
      "Turn ideas into clear, structured designs",
      "Use real design tools with confidence",
    ],
    what_it_builds: ["Creative confidence", "Visual thinking", "Attention to detail"],
    what_they_learn: [
      "Graphic design fundamentals",
      "Layout and visual storytelling",
      "Digital design tools",
    ],
    why_it_matters:
      "Most kids are creative but don't know how to express it digitally. This track helps them turn imagination into something real and shareable.",
    decision_line:
      "If your child enjoys drawing, visuals, or expressing ideas — this is the right path.",
  },
  {
    id: "game-builder",
    emoji: "🎮",
    name: "Game Builder",
    tagline: "From playing games to building them",
    image: "/images/kids-2.jpg",
    description:
      "Your child learns how games actually work by creating their own — turning passive gaming into real thinking skills and technical confidence.",
    color: "#059669",
    what_they_do: [
      "Build simple interactive games",
      "Understand how games are designed",
      "Solve problems through logic and structure",
    ],
    what_it_builds: ["Logical thinking", "Problem-solving skills", "Persistence and focus"],
    what_they_learn: [
      "Game design thinking",
      "Interactive storytelling",
      "Beginner programming logic",
      "Problem-solving through mechanics",
    ],
    why_it_matters:
      "Gaming is passive. Building games turns that interest into real thinking skills and technical confidence.",
    decision_line:
      "If your child enjoys games, challenges, or figuring things out — this is the right path.",
  },
  {
    id: "media-creator",
    emoji: "🎬",
    name: "Media Creator",
    tagline: "Turn screen time into creation time",
    image: "/images/kids-1.jpg",
    description:
      "Instead of just watching videos, your child learns how to create them — editing, producing, and telling stories that matter.",
    color: "#ea580c",
    what_they_do: [
      "Edit and produce their own videos",
      "Add effects, text, and sound",
      "Create content they are proud to share",
    ],
    what_it_builds: ["Communication skills", "Storytelling ability", "Creative confidence"],
    what_they_learn: [
      "Video cutting and trimming",
      "Text and simple motion graphics",
      "Transitions and effects",
      "Sound editing and syncing",
      "Basic color correction",
    ],
    why_it_matters:
      "Most kids consume content daily. Very few know how to create it — and that is where real value is built.",
    decision_line:
      "If your child enjoys videos, storytelling, or content creation — this is the right path.",
  },
];

// ─── Registration Modal ───────────────────────────────────────────────────────
const RegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  preselectedTrack: string;
}> = ({ isOpen, onClose, preselectedTrack }) => {
  const [selectedTrack, setSelectedTrack] = useState(preselectedTrack);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSelectedTrack(preselectedTrack); }, [preselectedTrack]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData(e.currentTarget);
    data.set("Chosen_Track", selectedTrack);
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      if (res.ok) setSubmitted(true);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,30,0.80)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        style={{ animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          ✕
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: `${BRAND}15` }}>🎉</div>
            <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>Spot Reserved!</h2>
            <p className="text-slate-500 max-w-sm">We'll be in touch shortly with next steps. Your child's journey starts now.</p>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold transition-all duration-300 hover:scale-105"
              style={{ background: BRAND }}
            >
              Close →
            </button>
          </div>
        ) : (
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mt-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                Begin Your Child&apos;s Journey
              </h2>
              <p className="text-slate-500 mt-1 text-sm">Complete this form and we&apos;ll email you the next steps.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <input type="hidden" name="access_key" value="f742de36-c13e-4b98-a17d-ea27d051f1b9" />
              <input type="hidden" name="subject" value="New Learnexity Kids Registration" />
              <input type="hidden" name="from_name" value="Learnexity Enrollment" />

              {/* Parent */}
              <section>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: BRAND }}>1</span>
                  Parent Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Parent Name", name: "Parent_Name", type: "text", placeholder: "John Doe", full: false },
                    { label: "Email Address", name: "Parent_Email", type: "email", placeholder: "name@email.com", full: false },
                    { label: "Phone Number", name: "Phone_Number", type: "tel", placeholder: "+1 (555) 000-0000", full: true },
                  ].map((f) => (
                    <div key={f.name} className={f.full ? "md:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                      <input
                        type={f.type} name={f.name} required placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Student */}
              <section>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: BRAND }}>2</span>
                  Student Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student&apos;s Name</label>
                    <input type="text" name="Student_Name" required placeholder="Alex"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student&apos;s Age</label>
                    <select name="Student_Age" required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50">
                      <option value="">Select Age</option>
                      {[10, 11, 12, 13, 14, 15, 16, 17].map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Track */}
              <section>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: BRAND }}>3</span>
                  Choose a Learning Track
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "Creative Design", emoji: "🎨", label: "Creative" },
                    { value: "Game Builder", emoji: "🎮", label: "Gaming" },
                    { value: "Media Creator", emoji: "🎬", label: "Media" },
                  ].map((t) => (
                    <button key={t.value} type="button" onClick={() => setSelectedTrack(t.value)}
                      className="p-4 rounded-2xl border-2 text-center transition-all duration-200 hover:scale-105"
                      style={selectedTrack === t.value
                        ? { borderColor: BRAND, background: `${BRAND}0d`, boxShadow: `0 0 0 3px ${BRAND}22` }
                        : { borderColor: "#e2e8f0", background: "white" }}>
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xs font-bold" style={{ color: selectedTrack === t.value ? BRAND : "#475569" }}>{t.label}</div>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="Chosen_Track" value={selectedTrack} />
              </section>

              <button
                type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                style={{ background: BRAND, boxShadow: `0 10px 30px ${BRAND}44`, fontFamily: "Poppins, sans-serif" }}
              >
                {loading ? "Reserving…" : "Reserve My Child's Spot →"}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes kidsModalIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// ─── Track Detail Modal ───────────────────────────────────────────────────────
const TrackModal: React.FC<{
  track: Track | null;
  onClose: () => void;
  onEnroll: (trackName: string) => void;
}> = ({ track, onClose, onEnroll }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = track ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [track]);

  if (!track) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,8,30,0.80)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
        style={{ animation: "kidsModalIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards" }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >✕</button>

        {/* Header band */}
        <div
          className="px-8 pt-10 pb-8 rounded-t-3xl"
          style={{ background: `linear-gradient(135deg, ${track.color}18 0%, ${track.color}06 100%)`, borderBottom: `1px solid ${track.color}22` }}
        >
          <div className="text-5xl mb-3">{track.emoji}</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{track.name}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{track.description}</p>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Image placeholder — swap for <Image> when asset is ready */}
          <div
            className="w-[500px] h-50 mx-auto rounded-2xl flex items-cent justify-centr text-sm font-semibold"
            style={{ background: `${track.color}10`, border: `2px dashed ${track.color}33`, color: track.color }}
          >
              <Image src={track.image} alt={track.name} width={500} height={20} className="rounded-2xl"/>
          </div>

          {/* What they'll do */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: track.color }}>What Your Child Will Be Able To Do</h4>
            <ul className="space-y-2">
              {track.what_they_do.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: track.color }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What it builds */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: track.color }}>What This Builds In Your Child</h4>
            <div className="flex flex-wrap gap-2">
              {track.what_it_builds.map((item, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${track.color}14`, color: track.color }}>{item}</span>
              ))}
            </div>
          </div>

          {/* What they learn */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: track.color }}>What They Learn</h4>
            <ul className="space-y-1.5">
              {track.what_they_learn.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <span style={{ color: track.color }}>▸</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Why it matters */}
          <div className="p-4 rounded-2xl text-sm leading-relaxed" style={{ background: `${track.color}0d`, borderLeft: `3px solid ${track.color}` }}>
            <p className="font-bold text-slate-800 mb-1">Why This Matters</p>
            <p className="text-slate-600">{track.why_it_matters}</p>
          </div>

          {/* Decision line */}
          <p className="text-sm font-semibold text-slate-700 italic border-t border-slate-100 pt-4">{track.decision_line}</p>

          {/* CTA */}
          <button
            onClick={() => { onClose(); onEnroll(track.name); }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: track.color, boxShadow: `0 8px 24px ${track.color}44`, fontFamily: "Poppins, sans-serif" }}
          >
            Choose {track.name} →
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes kidsModalIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// ─── Track Card ───────────────────────────────────────────────────────────────
const TrackCard: React.FC<{
  track: Track;
  onLearnMore: (track: Track) => void;
  onEnroll: (trackName: string) => void;
}> = ({ track, onLearnMore, onEnroll }) => (
  <div
    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 flex flex-col transition-all duration-300 hover:-translate-y-2"
    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 48px ${track.color}22`; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; }}
  >
    {/* Image zone — swap inner div for <Image> when asset is ready */}
    <div
      className="relative w-full h-48 flex items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${track.color}18 0%, ${track.color}0a 100%)` }}
    >
      <div className="flex flex-col items-center gap-2 opacity-100">
            <Image src={track.image} alt={track.name} fill className="object-cover"/>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${track.color}, transparent)` }} />
    </div>

    {/* Body */}
    <div className="flex flex-col flex-1 p-6 gap-4">
      <div>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-3"
          style={{ background: `${track.color}14`, color: track.color }}
        >
          {track.emoji} {track.name}
        </div>
        <h3 className="text-xl font-bold text-slate-900 leading-snug mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          {track.tagline}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed">{track.description}</p>
      </div>

      {/* Quick wins */}
      <ul className="space-y-1.5 mt-1">
        {track.what_it_builds.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-xs" style={{ color: track.color }}>✦</span>
            {item}
          </li>
        ))}
      </ul>

      {/* CTAs — pinned to bottom */}
      <div className="flex flex-col gap-2 mt-auto pt-4">
        <button
          onClick={() => onEnroll(track.name)}
          className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: track.color, fontFamily: "Poppins, sans-serif" }}
        >
          Enroll Now →
        </button>
        <button
          onClick={() => onLearnMore(track)}
          className="w-full py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 hover:bg-slate-50 active:scale-95"
          style={{ borderColor: `${track.color}44`, color: track.color }}
        >
          Learn More
        </button>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Kids() {
  const [enrollOpen, setEnrollOpen]       = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState("Creative Design");
  const [activeTrack, setActiveTrack]     = useState<Track | null>(null);

  const openEnroll = (trackName?: string) => {
    if (trackName) setPreselectedTrack(trackName);
    setEnrollOpen(true);
  };

  return (
    <AppLayout>
      <div style={{ fontFamily: "Outfit, sans-serif" }} className="bg-slate-50 text-slate-800 overflow-x-hidden">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative bg-white pt-30 pb-10 overflow-hidden">
          {/* Blob bg decorations */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${BRAND_ORANGE}55 0%, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${BRAND}55 0%, transparent 70%)`, filter: "blur(80px)" }} />

          <div className="relative max-w-screen-2xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-full px-4 py-1.5 mb-6"
                style={{ background: `${BRAND_ORANGE}18`, color: BRAND_ORANGE }}
              >
                ⚡ Ages 10–17 Program
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
                Turn Your Child Into a{" "}
                <span style={{ color: BRAND }}>Tech Creator</span>
              </h1>
              <p className="text-lg text-slate-500 mt-6 leading-relaxed max-w-md">
                Start with the basics. Then choose what they love. Guided 1-on-1 mentorship that builds real skills, not screen time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <button
                  onClick={() => openEnroll()}
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ background: BRAND, boxShadow: `0 10px 32px ${BRAND}44`, fontFamily: "Poppins, sans-serif" }}
                >
                  Start With Digital Foundations
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">→</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                Spots are limited · Beginner-friendly · No experience needed
              </p>
            </div>

            {/* Right — swap inner div for <Image> when asset is ready */}
            <div className="relative">
              <div className="w-full h-[450px] rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${BRAND}18 0%, ${BRAND_ORANGE}18 100%)` }}
              >
                <div className="flex flex-col items-center gap-3 text-center opacity-100">
                    <Image
                        src="images/photo-1593642532842-98d0fd5ebc1a.avif"
                        alt="Student coding" fill className="object-cover transition-transform duration-700 group-hover:scale-110 rounded-3xl border-4 border-white shadow-2xl"
                    />
                </div>
                <div className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#22c55e" }}>✓</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Mentorship</p>
                    <p className="text-sm font-bold text-slate-800">One-on-One Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="py-8 bg-slate-100">
          <div className="max-w-screen-2xl mx-auto px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>The Process</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-16" style={{ fontFamily: "Poppins, sans-serif" }}>How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-12 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-orange-200" />
              {[
                { step: "01", icon: "🏗️", title: "Start with Digital Foundations", desc: "Every child starts here to build computer confidence and core digital skills.", color: BRAND },
                { step: "02", icon: "🔍", title: "Discover What They Enjoy", desc: "Explore three specialization paths and find what clicks for your child.", color: "#7c3aed" },
                { step: "03", icon: "🚀", title: "Build Real Projects", desc: "Choose a track and create real work they can show off and be proud of.", color: BRAND_ORANGE },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 text-left border border-slate-100" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-5" style={{ background: s.color }}>{s.step}</div>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIGITAL FOUNDATIONS ───────────────────────────────────────────── */}
        <section className="py-8 bg-white">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-full px-4 py-1.5 mb-6" style={{ background: `${BRAND}12`, color: BRAND }}>
                  🏁 Start Here
                </span>
                <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                  This Is Where<br /><span style={{ color: BRAND }}>Everything Changes</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  In just weeks, your child goes from &quot;I don&apos;t know how&quot; to{" "}
                  <strong className="text-slate-800">&quot;I can do this myself.&quot;</strong>
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "Confidence using a computer without help",
                    "Create documents, slides & projects independently",
                    "Strong thinking and organisation skills",
                    "A real foundation for future tech skills",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 text-sm">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: BRAND }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openEnroll()}
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl text-white font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ background: BRAND, boxShadow: `0 8px 24px ${BRAND}44`, fontFamily: "Poppins, sans-serif" }}
                >
                  Start Here →
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🧠", title: "Critical Thinking", desc: "Approach problems with logic and structure" },
                  { icon: "⚡", title: "Digital Independence", desc: "Work without constant adult help" },
                  { icon: "🎯", title: "Problem-Solving", desc: "Break challenges into manageable steps" },
                  { icon: "🔍", title: "Focused Mind", desc: "Build sustained attention on tasks" },
                ].map((c, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all duration-300" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                    <div className="text-3xl mb-3">{c.icon}</div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{c.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRACKS ────────────────────────────────────────────────────────── */}
        <section className="py-8 bg-slate-50">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: BRAND }}>Step 2</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Then Choose a Path</h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                After foundations, pick the track that matches your child&apos;s interests and watch them thrive.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} onLearnMore={setActiveTrack} onEnroll={openEnroll} />
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
        <section className="py-20 text-white" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
          <div className="max-w-screen-2xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-12" style={{ fontFamily: "Poppins, sans-serif" }}>A Personalised Experience</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "1:1", label: "Instruction" },
                { value: "60–90", label: "Min Sessions" },
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

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        {/* <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              Give Them Skills{" "}
              <span style={{ color: BRAND }}>Most Kids Don&apos;t Have</span>
            </h2>
            <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
              Limited spots available to keep classes focused and mentorship personal.
            </p>
            <button
              onClick={() => openEnroll()}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: BRAND, boxShadow: `0 14px 40px ${BRAND}55`, fontFamily: "Poppins, sans-serif" }}
            >
              Enroll Now
              <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">→</span>
            </button>
            <p className="text-xs text-slate-400 mt-5">
              📞 +1 (276) 252-8415 &nbsp;·&nbsp; ✉️ info@learnexity.org
            </p>
          </div>
        </section> */}

      </div>

      {/* ── MODALS (outside scroll div, still inside AppLayout) ───────────── */}
      <TrackModal
        track={activeTrack}
        onClose={() => setActiveTrack(null)}
        onEnroll={(name) => { setActiveTrack(null); openEnroll(name); }}
      />
      <RegistrationModal
        isOpen={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        preselectedTrack={preselectedTrack}
      />

      <Footer />
    </AppLayout>
  );
}