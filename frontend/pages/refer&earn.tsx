// pages/refer%26earn.tsx

'use client';

import type { GetStaticProps } from "next";
import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Copy, Share2, Users, Gift, TrendingUp, CheckCircle, Clock, LogOut, ArrowRight, Zap } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import SectionRenderer from "@/components/cms/SectionRenderer";
import CmsHead from "@/components/cms/CmsHead";
import { ReferLandingContext, ReferStyles } from "@/components/cms/blocks/refer";
import { getCmsPageProps, type CmsPageProps } from "@/lib/cms/server";
import type { CmsSection } from "@/lib/cms/types";

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

interface PayoutBalance {
  available_balance: number;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
}

interface PayoutItem {
  id: number;
  amount: number;
  status: "pending" | "approved" | "declined";
  created_at: string;
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
// Landing-page copy is managed in Admin → Website CMS → Refer & Earn; the
// sign-up form and referral dashboard below stay in code.
export const getStaticProps: GetStaticProps<CmsPageProps> = () => getCmsPageProps("refer-earn");

export default function ReferAndEarn({ cmsPage }: CmsPageProps) {
  const [view, setView] = useState<"landing" | "auth" | "dashboard">("landing");
  const [session, setSession] = useState<ReferrerSession | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loadingDash, setLoadingDash] = useState(false);
  const [payoutBalance, setPayoutBalance] = useState<PayoutBalance | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutItem[]>([]);

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

          if (res.status === 401) {
              // Token expired or invalid — log the user out
              handleLogout();
              return;
          }

          if (!res.ok) {
              console.error('Stats fetch failed:', res.status, await res.text());
              return;
          }

          const data = await res.json();
          setStats(data.statistics);
          setHistory(data.history || []);
      } catch (err) {
          console.error('Stats fetch error:', err);
      } finally {
          setLoadingDash(false);
      }
  }, [session]);

  const fetchPayoutInfo = useCallback(async () => {
      if (!session) return;
      try {
          const [balanceRes, historyRes] = await Promise.all([
              fetch(`${API}/api/payouts/public/balance`, { headers: { Authorization: `Bearer ${session.token}` } }),
              fetch(`${API}/api/payouts/public/history`, { headers: { Authorization: `Bearer ${session.token}` } }),
          ]);
          if (balanceRes.ok) setPayoutBalance(await balanceRes.json());
          if (historyRes.ok) {
              const data = await historyRes.json();
              setPayoutHistory(data.history || []);
          }
      } catch (err) {
          console.error('Payout info fetch error:', err);
      }
  }, [session]);

  useEffect(() => {
    if (view === "dashboard" && session) {
      fetchDashboard();
      fetchPayoutInfo();
    }
  }, [view, session, fetchDashboard, fetchPayoutInfo]);

  return (
    <>
      <CmsHead page={cmsPage} />

      <AppLayout>
        <ReferStyles />

        {view === "landing" && <LandingView sections={cmsPage.sections} onGetStarted={() => setView("auth")} />}
        {view === "auth" && <AuthView onSuccess={handleAuthSuccess} onBack={() => setView("landing")} />}
        {view === "dashboard" && session && (
          <DashboardView
            session={session}
            stats={stats}
            history={history}
            loading={loadingDash}
            onLogout={handleLogout}
            onRefresh={fetchDashboard}
            payoutBalance={payoutBalance}
            payoutHistory={payoutHistory}
            onPayoutRequested={fetchPayoutInfo}
          />
        )}

        <Footer />
      </AppLayout>
    </>
  );
}

// ─── Landing View ─────────────────────────────────────────────────────────────
function LandingView({ sections, onGetStarted }: { sections: CmsSection[]; onGetStarted: () => void }) {
  return (
    <div className="min-h-screen">
      <ReferLandingContext.Provider value={{ onGetStarted }}>
        <SectionRenderer sections={sections} />
      </ReferLandingContext.Provider>
    </div>
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

        <p style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
          Referral Program
        </p>
        <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1.8rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.75rem" }}>
          {mode === "signup"
            ? "Sign up to get your referral link instantly."
            : "Log in to access your referral dashboard."}
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", background: "var(--surface-alt)", borderRadius: "0.75rem", padding: "0.3rem" }}>
          {(["signup", "login"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1, padding: "0.5rem", borderRadius: "0.55rem", border: "none",
                background: mode === m ? BRAND : "transparent",
                color: mode === m ? "white" : "var(--text-muted)",
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
              <strong style={{ color: "var(--text-primary)" }}>You're already a Learnexity student.</strong><br />
              Student referrals are managed from your{" "}
              <a href="/user/dashboard" style={{ color: BRAND, fontWeight: 600, textDecoration: "none" }}>
                student dashboard 
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
                style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
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
  session, stats, history, loading, onLogout, onRefresh, payoutBalance, payoutHistory, onPayoutRequested
}: {
  session: ReferrerSession;
  stats: Stats | null;
  history: ReferralHistoryItem[];
  loading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  payoutBalance: PayoutBalance | null;
  payoutHistory: PayoutItem[];
  onPayoutRequested: () => void;
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
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Referral Dashboard</p>
          <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", letterSpacing: "-0.02em" }}>
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
          <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem" }}>Your Referral Link</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem" }}>
          Share this link — earn <strong style={{ color: "#4ade80" }}>10%</strong> of what every person who signs up through it pays
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
              style={{ border: "1px solid var(--border-subtle)", borderRadius: "0.75rem 0.25rem 0.75rem 0.25rem" }}>
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

      {/* Payout */}
      <PayoutSection session={session} balance={payoutBalance} history={payoutHistory} onRequested={onPayoutRequested} />

      {/* History */}
      <div className="re-card" style={{ padding: "1.75rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <TrendingUp size={16} style={{ color: BRAND }} />
            <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Referral History</span>
          </div>
          <button onClick={onRefresh} className="re-btn-outline" style={{ padding: "0.35rem 0.9rem", fontSize: "0.75rem" }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
            <div className="re-pulse" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading…</div>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No referrals yet.</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.35rem" }}>Share your link to start earning!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Name", "Status", "Reward"].map(h => (
                    <th key={h} style={{ textAlign: h === "Reward" ? "right" : "left", padding: "0.6rem 0.75rem", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "0.8rem 0.75rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {new Date(r.referred_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {r.referred_user_name}
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem" }}>
                      <span className={`re-badge re-badge-${r.status}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "0.8rem 0.75rem", textAlign: "right", fontSize: "0.85rem", fontWeight: 600, color: r.status === "completed" ? "#4ade80" : "var(--text-muted)" }}>
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

// ─── Payout Section ───────────────────────────────────────────────────────────
function PayoutSection({
  session, balance, history, onRequested
}: {
  session: ReferrerSession;
  balance: PayoutBalance | null;
  history: PayoutItem[];
  onRequested: () => void;
}) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (balance) {
      setBankName(balance.bank_name || "");
      setAccountNumber(balance.account_number || "");
      setAccountName(balance.account_name || "");
    }
  }, [balance]);

  const submit = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setMessage({ text: "Please fill in all bank details.", ok: false });
      return;
    }
    setRequesting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/api/payouts/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_name: accountName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.message || "Something went wrong.", ok: false });
        return;
      }
      setMessage({ text: data.message, ok: true });
      onRequested();
    } catch {
      setMessage({ text: "Network error. Please try again.", ok: false });
    } finally {
      setRequesting(false);
    }
  };

  const statusBadge = (status: string) => {
    const labels: Record<string, string> = { approved: "Paid", pending: "Pending", declined: "Declined" };
    return <span className={`re-badge re-badge-${status === "approved" ? "completed" : status}`}>{labels[status] || status}</span>;
  };

  return (
    <div className="re-card" style={{ padding: "1.75rem 2rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
        <Gift size={16} style={{ color: BRAND }} />
        <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>Payout</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
        Request a payout of your earned rewards — sent manually via bank transfer once approved.
      </p>

      <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "1rem 0.4rem 1rem 0.4rem", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Available Balance</p>
        <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#4ade80" }}>₦{(balance?.available_balance ?? 0).toLocaleString()}</p>
      </div>

      {message && (
        <div style={{
          marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "0.75rem", fontSize: "0.85rem",
          background: message.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${message.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
          color: message.ok ? "#4ade80" : "#fca5a5",
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <label className="re-label">Bank Name</label>
          <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. GTBank" className="re-input" />
        </div>
        <div>
          <label className="re-label">Account Number</label>
          <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="0123456789" className="re-input" />
        </div>
        <div>
          <label className="re-label">Account Name</label>
          <input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="As it appears on your account" className="re-input" />
        </div>
      </div>

      <button className="re-btn" onClick={submit} disabled={requesting || !balance || balance.available_balance <= 0}>
        {requesting ? "Submitting…" : "Request Payout"}
      </button>

      {history.length > 0 && (
        <div style={{ marginTop: "1.75rem" }}>
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.75rem" }}>Payout History</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Amount", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.6rem", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "0.65rem 0.6rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "0.65rem 0.6rem", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>₦{Number(p.amount).toLocaleString()}</td>
                  <td style={{ padding: "0.65rem 0.6rem" }}>{statusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="re-stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {icon}
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>{label}</span>
      </div>
      <p style={{ fontSize: "1.75rem", fontWeight: 800, color: accent ? "#a5b4fc" : "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}