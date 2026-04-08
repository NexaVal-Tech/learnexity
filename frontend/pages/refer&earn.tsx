'use client';

import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Copy, Share2, Users, Gift, TrendingUp, CheckCircle, Clock, LogOut, ArrowRight, Zap } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";

const BRAND = "#4A3AFF";
const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ───────────────────────────────────────────────────────────────────
interface ReferrerSession {
  token: string;
  email: string;
  referral_code: string;
  referral_link: string;
}

interface Stats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earnings: number; // in naira
}

interface ReferralHistoryItem {
  id: number;
  referred_user_name: string;
  status: "pending" | "completed" | "failed";
  reward_amount: number;
  referred_at: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
const SESSION_KEY = "re_session";

function saveSession(s: ReferrerSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
function loadSession(): ReferrerSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReferAndEarn() {
  const [view, setView] = useState<"landing" | "auth" | "dashboard">("landing");
  const [session, setSession] = useState<ReferrerSession | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loadingDash, setLoadingDash] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const s = loadSession();
    if (s) {
      setSession(s);
      setView("dashboard");
    }
  }, []);

  const handleAuthSuccess = (s: ReferrerSession) => {
    saveSession(s);
    setSession(s);
    setView("dashboard");
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setStats(null);
    setHistory([]);
    setView("landing");
  };

  const fetchDashboard = useCallback(async () => {
    if (!session) return;
    setLoadingDash(true);
    try {
      const res = await fetch(`${API}/api/referrals/public/stats`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.statistics);
        setHistory(data.history || []);
      }
    } catch {
      // silently fail — show cached/empty state
    } finally {
      setLoadingDash(false);
    }
  }, [session]);

  useEffect(() => {
    if (view === "dashboard" && session) fetchDashboard();
  }, [view, session, fetchDashboard]);

  return (
    <>
      <Head>
        <title>Refer &amp; Earn — Learnexity</title>
        <meta name="description" content="Share your referral link and earn ₦5,000 for every person who signs up through your link." />
        <link rel="canonical" href="https://learnexity.org/refer-earn" />
      </Head>

      <AppLayout>
        <GlobalStyles />

        {view === "landing" && <LandingView onGetStarted={() => setView("auth")} />}
        {view === "auth" && <AuthView onSuccess={handleAuthSuccess} onBack={() => setView("landing")} />}
        {view === "dashboard" && session && (
          <DashboardView
            session={session}
            stats={stats}
            history={history}
            loading={loadingDash}
            onLogout={handleLogout}
            onRefresh={fetchDashboard}
          />
        )}

        <Footer />
      </AppLayout>
    </>
  );
}

// ─── Global Styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes reEnter {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes reShimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .re-enter { animation: reEnter 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      .re-card {
        border-radius: 2rem 0.75rem 2rem 0.75rem;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(12,12,14,0.92);
        backdrop-filter: blur(20px);
        box-shadow: 0 32px 80px rgba(0,0,0,0.7);
      }
      .re-btn {
        background: ${BRAND};
        color: white;
        font-weight: 700;
        padding: 0.8rem 1.75rem;
        border-radius: 2rem 0.5rem 2rem 0.5rem;
        font-size: 0.9rem;
        letter-spacing: 0.02em;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        border: none;
      }
      .re-btn:hover:not(:disabled) {
        background: #3628e0;
        box-shadow: 0 0 32px ${BRAND}55;
        transform: translateY(-2px);
      }
      .re-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .re-btn-outline {
        background: transparent;
        border: 1.5px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.7);
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem 0.5rem 2rem 0.5rem;
        font-size: 0.875rem;
        transition: all 0.25s ease;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .re-btn-outline:hover {
        border-color: rgba(255,255,255,0.35);
        color: white;
        background: rgba(255,255,255,0.05);
      }
      .re-input {
        background: transparent;
        border: none;
        border-bottom: 1.5px solid rgba(255,255,255,0.18);
        width: 100%;
        padding: 0.5rem 0;
        color: white;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.25s;
        caret-color: ${BRAND};
      }
      .re-input::placeholder { color: rgba(255,255,255,0.25); font-size: 0.875rem; }
      .re-input:focus { border-bottom-color: ${BRAND}; }
      .re-input:disabled { opacity: 0.4; }
      .re-label {
        font-size: 0.68rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.38);
        display: block;
        margin-bottom: 0.3rem;
      }
      .re-stat-card {
        border-radius: 1.5rem 0.5rem 1.5rem 0.5rem;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(15,15,18,0.9);
        padding: 1.5rem;
        backdrop-filter: blur(12px);
      }
      .re-link-box {
        background: rgba(74,58,255,0.08);
        border: 1px solid rgba(74,58,255,0.25);
        border-radius: 1rem 0.4rem 1rem 0.4rem;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-family: monospace;
        font-size: 0.85rem;
        color: rgba(255,255,255,0.85);
        word-break: break-all;
      }
      .re-copy-btn {
        flex-shrink: 0;
        background: ${BRAND};
        color: white;
        border: none;
        border-radius: 0.6rem;
        padding: 0.5rem 0.9rem;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
      .re-copy-btn:hover { background: #3628e0; }
      .re-social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 1rem 0.35rem 1rem 0.35rem;
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.7);
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      .re-social-btn:hover { background: rgba(255,255,255,0.09); color: white; }
      .re-divider {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1.5rem 0;
      }
      .re-divider::before, .re-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(255,255,255,0.07);
      }
      .re-divider span { font-size: 0.72rem; color: rgba(255,255,255,0.25); letter-spacing: 0.08em; }
      .re-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .re-badge-pending  { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.25); }
      .re-badge-completed { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
      .re-badge-failed   { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
      .re-accent { color: #a5b4fc; }
      .re-pulse {
        animation: rePulse 2s ease-in-out infinite;
      }
      @keyframes rePulse {
        0%,100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  );
}

// ─── Landing View ─────────────────────────────────────────────────────────────
function LandingView({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="min-h-screen px-4 pt-28 pb-20 re-enter">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Hero */}
        <div className="text-center mb-16">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(74,58,255,0.12)", border: "1px solid rgba(74,58,255,0.3)",
            borderRadius: "999px", padding: "0.35rem 1rem", marginBottom: "1.5rem",
          }}>
            <Zap size={13} style={{ color: BRAND }} />
            <span style={{ fontSize: "0.75rem", color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.06em" }}>
              REFERRAL PROGRAM
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
            Share Learnexity.<br />
            <span className="re-accent">Earn ₦5,000</span> per referral.
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto 2.5rem" }}>
            No course enrollment needed. Get your unique link, share it, and earn for every person who signs up through it.
          </p>
          <button className="re-btn" onClick={onGetStarted} style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>
            Get My Referral Link <ArrowRight size={18} />
          </button>
        </div>

        {/* How it works */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "1.25rem", marginBottom: "4rem" }}>
          {[
            { n: "01", title: "Sign Up", desc: "Enter your email and create a password — takes 30 seconds." },
            { n: "02", title: "Get Your Link", desc: "Instantly receive your unique referral link to share anywhere." },
            { n: "03", title: "Share & Earn", desc: "Every person who registers through your link earns you ₦5,000." },
          ].map((s) => (
            <div key={s.n} className="re-card" style={{ padding: "1.75rem" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", color: BRAND, fontWeight: 700, marginBottom: "0.75rem" }}>{s.n}</div>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>{s.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Earnings visual */}
        <div className="re-card" style={{ padding: "2.5rem", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Your potential earnings</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { refs: 5, earn: "₦25,000" },
              { refs: 10, earn: "₦50,000" },
              { refs: 25, earn: "₦125,000" },
              { refs: 50, earn: "₦250,000" },
            ].map((r) => (
              <div key={r.refs} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "white" }}>{r.earn}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>{r.refs} referrals</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Auth View ────────────────────────────────────────────────────────────────
function AuthView({ onSuccess, onBack }: { onSuccess: (s: ReferrerSession) => void; onBack: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);

    try {
      const endpoint = mode === "signup"
        ? `${API}/api/referrals/public/register`
        : `${API}/api/referrals/public/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if the email belongs to a registered student
        if (data.is_student) {
          setError("student");
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
        return;
      }

      onSuccess({
        token: data.token,
        email: data.email,
        referral_code: data.referral_code,
        referral_link: data.referral_link,
      });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 re-enter">
      <div className="re-card w-full" style={{ maxWidth: 440, padding: "2.5rem 2.25rem" }}>

        {/* Back */}
        <button onClick={onBack} className="re-btn-outline" style={{ marginBottom: "1.75rem", padding: "0.45rem 1rem", fontSize: "0.78rem" }}>
          ← Back
        </button>

        <p style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.4rem" }}>
          Referral Program
        </p>
        <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", marginBottom: "1.75rem" }}>
          {mode === "signup"
            ? "Sign up to get your referral link instantly."
            : "Log in to access your referral dashboard."}
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.75rem", padding: "0.3rem" }}>
          {(["signup", "login"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1, padding: "0.5rem", borderRadius: "0.55rem", border: "none",
                background: mode === m ? BRAND : "transparent",
                color: mode === m ? "white" : "rgba(255,255,255,0.45)",
                fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s"
              }}>
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        {/* Student error */}
        {error === "student" && (
          <div style={{
            background: "rgba(74,58,255,0.1)", border: "1px solid rgba(74,58,255,0.3)",
            borderRadius: "0.75rem", padding: "1rem 1.1rem", marginBottom: "1.25rem"
          }}>
            <p style={{ color: "#a5b4fc", fontSize: "0.85rem", lineHeight: 1.6 }}>
              <strong style={{ color: "white" }}>You're already a Learnexity student.</strong><br />
              Student referrals are managed from your{" "}
              <a href="/user/dashboard" style={{ color: BRAND, fontWeight: 600, textDecoration: "none" }}>
                student dashboard →
              </a>
            </p>
          </div>
        )}

        {error && error !== "student" && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "0.75rem", padding: "0.85rem 1rem", marginBottom: "1.25rem",
            color: "#fca5a5", fontSize: "0.85rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label className="re-label">Email Address</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="you@example.com" disabled={loading} className="re-input" />
          </div>
          <div>
            <label className="re-label">Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                disabled={loading} className="re-input" style={{ paddingRight: "2.5rem" }} />
              <button type="button" onClick={() => setShowPw(!showPw)} disabled={loading}
                style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0 }}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="re-btn" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            {loading ? (mode === "signup" ? "Creating account…" : "Logging in…") : (mode === "signup" ? "Get My Referral Link" : "Log In")}
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({
  session, stats, history, loading, onLogout, onRefresh
}: {
  session: ReferrerSession;
  stats: Stats | null;
  history: ReferralHistoryItem[];
  loading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(session.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const share = (platform: string) => {
    const link = session.referral_link;
    const text = "I'm earning money by referring people to Learnexity! Join using my link:";
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <section className="px-4 pt-28 pb-20 re-enter" style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.25rem" }}>Referral Dashboard</p>
          <h1 style={{ color: "white", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", letterSpacing: "-0.02em" }}>
            Welcome back, <span className="re-accent">{session.email.split("@")[0]}</span>
          </h1>
        </div>
        <button onClick={onLogout} className="re-btn-outline">
          <LogOut size={15} /> Log Out
        </button>
      </div>

      {/* Referral link */}
      <div className="re-card" style={{ padding: "1.75rem 2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <Share2 size={16} style={{ color: BRAND }} />
          <span style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>Your Referral Link</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", marginBottom: "1rem" }}>
          Share this link — every signup earns you <strong style={{ color: "#4ade80" }}>₦5,000</strong>
        </p>
        <div className="re-link-box">
          <span style={{ flex: 1 }}>{session.referral_link}</span>
          <button className="re-copy-btn" onClick={copyLink}>
            <Copy size={13} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Share row */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {[
            { id: "whatsapp", label: "WhatsApp", emoji: "💬" },
            { id: "facebook", label: "Facebook", emoji: "📘" },
            { id: "twitter", label: "Twitter", emoji: "🐦" },
            { id: "linkedin", label: "LinkedIn", emoji: "💼" },
          ].map(s => (
            <button key={s.id} className="re-social-btn" onClick={() => share(s.id)}
              style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem 0.25rem 0.75rem 0.25rem" }}>
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard icon={<Users size={18} style={{ color: BRAND }} />} label="Total Referrals" value={loading ? "—" : String(stats?.total_referrals ?? 0)} />
        <StatCard icon={<CheckCircle size={18} style={{ color: "#4ade80" }} />} label="Successful" value={loading ? "—" : String(stats?.successful_referrals ?? 0)} />
        <StatCard icon={<Clock size={18} style={{ color: "#fb923c" }} />} label="Pending" value={loading ? "—" : String(stats?.pending_referrals ?? 0)} />
        <StatCard
          icon={<Gift size={18} style={{ color: "#a5b4fc" }} />}
          label="Total Earned"
          value={loading ? "—" : `₦${(stats?.total_earnings ?? 0).toLocaleString()}`}
          accent
        />
      </div>

      {/* History */}
      <div className="re-card" style={{ padding: "1.75rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <TrendingUp size={16} style={{ color: BRAND }} />
            <span style={{ color: "white", fontWeight: 700 }}>Referral History</span>
          </div>
          <button onClick={onRefresh} className="re-btn-outline" style={{ padding: "0.35rem 0.9rem", fontSize: "0.75rem" }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
            <div className="re-pulse" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>Loading…</div>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>No referrals yet.</p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", marginTop: "0.35rem" }}>Share your link to start earning!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Name", "Status", "Reward"].map(h => (
                    <th key={h} style={{ textAlign: h === "Reward" ? "right" : "left", padding: "0.6rem 0.75rem", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.8rem 0.75rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
                      {new Date(r.referred_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>
                      {r.referred_user_name}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem" }}>
                      <span className={`re-badge re-badge-${r.status}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", textAlign: "right", fontSize: "0.85rem", fontWeight: 600, color: r.status === "completed" ? "#4ade80" : "rgba(255,255,255,0.25)" }}>
                      {r.status === "completed" ? `₦${Number(r.reward_amount).toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="re-stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {icon}
        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{label}</span>
      </div>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, color: accent ? "#a5b4fc" : "white", letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}