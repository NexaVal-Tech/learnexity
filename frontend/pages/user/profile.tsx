"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera, Trash2, Save, Linkedin, Twitter, Github, Globe,
  MapPin, Phone, FileText, CheckCircle, AlertCircle, User,
  Clock, BookOpen, Settings, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api, { handleApiError } from "@/lib/api";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProfileData = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  website_url?: string;
  email_verified_at?: string;
  created_at: string;
  google_id?: string;
};

type ActivityLog = {
  id: number;
  action: string;
  entity_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  enrolled:                      { label: "Enrolled in course",     color: "bg-blue-100 text-blue-700" },
  payment_completed:             { label: "Payment completed",      color: "bg-green-100 text-green-700" },
  track_upgraded:                { label: "Track upgraded",         color: "bg-purple-100 text-purple-700" },
  one_on_one_booked:             { label: "1-on-1 hours booked",    color: "bg-amber-100 text-amber-700" },
  profile_updated:               { label: "Profile updated",        color: "bg-gray-100 text-gray-600" },
  avatar_uploaded:               { label: "Avatar changed",         color: "bg-gray-100 text-gray-600" },
  avatar_removed:                { label: "Avatar removed",         color: "bg-gray-100 text-gray-600" },
  password_changed:              { label: "Password changed",       color: "bg-red-100 text-red-700" },
  notification_settings_updated: { label: "Notifications updated",  color: "bg-gray-100 text-gray-600" },
  upgrade_initiated:             { label: "Upgrade initiated",      color: "bg-indigo-100 text-indigo-700" },
  upgrade_options_checked:       { label: "Viewed upgrade options", color: "bg-gray-100 text-gray-500" },
};

function getActionMeta(action: string) {
  return ACTION_LABELS[action] ?? {
    label: action.replace(/_/g, " "),
    color: "bg-gray-100 text-gray-500",
  };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getAvatarUrl(avatar?: string) {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${avatar}`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
  message, type, onDone,
}: {
  message: string; type: "success" | "error"; onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success"
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon, children }: {
  label: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, setUser } = useAuth() as any;
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile]             = useState<ProfileData | null>(null);
  const [activity, setActivity]           = useState<ActivityLog[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast]                 = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab]         = useState<"profile" | "activity">("profile");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", bio: "", location: "",
    linkedin_url: "", twitter_url: "", github_url: "", website_url: "",
  });

  // ── Load ───────────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, activityRes] = await Promise.all([
        api.profile.get(),
        api.profile.getActivity(),
      ]);
      const p: ProfileData = profileRes.user;
      setProfile(p);
      setForm({
        name:         p.name         ?? "",
        phone:        p.phone        ?? "",
        bio:          p.bio          ?? "",
        location:     p.location     ?? "",
        linkedin_url: p.linkedin_url ?? "",
        twitter_url:  p.twitter_url  ?? "",
        github_url:   p.github_url   ?? "",
        website_url:  p.website_url  ?? "",
      });
      setActivity(activityRes.activity ?? []);
    } catch (e) {
      showToast(handleApiError(e), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const res = await api.profile.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatar: res.avatar_url } : prev);
      if (setUser) setUser((u: any) => ({ ...u, avatar: res.avatar_url }));
      showToast("Avatar updated!", "success");
    } catch (e) {
      setAvatarPreview(null);
      showToast(handleApiError(e), "error");
    } finally {
      setAvatarUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemoveAvatar() {
    setAvatarUploading(true);
    try {
      await api.profile.deleteAvatar();
      setProfile((prev) => prev ? { ...prev, avatar: undefined } : prev);
      setAvatarPreview(null);
      if (setUser) setUser((u: any) => ({ ...u, avatar: null }));
      showToast("Avatar removed.", "success");
    } catch (e) {
      showToast(handleApiError(e), "error");
    } finally {
      setAvatarUploading(false);
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.profile.update(form);
      setProfile(res.user);
      if (setUser) setUser((u: any) => ({ ...u, name: res.user.name }));
      showToast("Profile saved!", "success");
    } catch (e) {
      showToast(handleApiError(e), "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-[#6C63FF]" />
        </div>
      </UserDashboardLayout>
    );
  }

  const avatarSrc = avatarPreview ?? getAvatarUrl(profile?.avatar);
  const initials  = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <UserDashboardLayout>
      <div className="max-w-[1255px] mx-auto p-6 pt-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information and account activity.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["profile", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "activity" ? "Activity Log" : "Profile"}
            </button>
          ))}
        </div>

        {/* ══ PROFILE TAB ══ */}
        {activeTab === "profile" && (
          <form onSubmit={handleSave} className="space-y-5">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Profile Photo</h2>
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#6C63FF]/20 bg-gray-100 flex items-center justify-center">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt="avatar"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-500">{initials}</span>
                    )}
                  </div>
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={avatarUploading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" /> Upload photo
                  </button>
                  {avatarSrc && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarUploading}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                  <p className="text-xs text-gray-400">JPG, PNG or WebP · Max 2 MB</p>
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name" icon={<User className="w-4 h-4" />}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="profile-input"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={profile?.email ?? ""}
                    disabled
                    className="profile-input opacity-60 cursor-not-allowed bg-gray-50"
                  />
                </Field>

                <Field label="Phone" icon={<Phone className="w-4 h-4" />}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+234 000 000 0000"
                    className="profile-input"
                  />
                </Field>

                <Field label="Location" icon={<MapPin className="w-4 h-4" />}>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="City, Country"
                    className="profile-input"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Bio" icon={<FileText className="w-4 h-4" />}>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      maxLength={500}
                      placeholder="Tell us a little about yourself…"
                      className="profile-input resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {form.bio.length}/500
                    </p>
                  </Field>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Social Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="LinkedIn" icon={<Linkedin className="w-4 h-4 text-blue-600" />}>
                  <input type="url" value={form.linkedin_url}
                    onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/you" className="profile-input" />
                </Field>
                <Field label="Twitter / X" icon={<Twitter className="w-4 h-4 text-sky-500" />}>
                  <input type="url" value={form.twitter_url}
                    onChange={(e) => setForm((f) => ({ ...f, twitter_url: e.target.value }))}
                    placeholder="https://x.com/you" className="profile-input" />
                </Field>
                <Field label="GitHub" icon={<Github className="w-4 h-4" />}>
                  <input type="url" value={form.github_url}
                    onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                    placeholder="https://github.com/you" className="profile-input" />
                </Field>
                <Field label="Website" icon={<Globe className="w-4 h-4 text-gray-500" />}>
                  <input type="url" value={form.website_url}
                    onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                    placeholder="https://yoursite.com" className="profile-input" />
                </Field>
              </div>
            </div>

            {/* Account meta */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Account Info</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Joined {new Date(profile?.created_at ?? "").toLocaleDateString("en-US", {
                    month: "long", year: "numeric",
                  })}
                </span>
                {profile?.email_verified_at && (
                  <span className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle className="w-4 h-4" /> Email verified
                  </span>
                )}
                {profile?.google_id && (
                  <span className="flex items-center gap-1.5 text-blue-500">
                    <Globe className="w-4 h-4" /> Google connected
                  </span>
                )}
              </div>
              <div className="flex gap-4 mt-3">
                <Link href="/user/dashboard"
                  className="flex items-center gap-1.5 text-sm text-[#6C63FF] hover:underline">
                  <BookOpen className="w-4 h-4" /> My courses
                </Link>
                <Link href="/user/settings"
                  className="flex items-center gap-1.5 text-sm text-[#6C63FF] hover:underline">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5753E6] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save changes</>}
              </button>
            </div>
          </form>
        )}

        {/* ══ ACTIVITY TAB ══ */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 50 actions on your account</p>
            </div>

            {activity.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No activity recorded yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activity.map((log) => {
                  const meta   = getActionMeta(log.action);
                  const detail = log.metadata?.course_name
                    ? log.metadata.course_name
                    : log.metadata?.to_track
                    ? `→ ${String(log.metadata.to_track).replace(/_/g, " ")}`
                    : log.metadata?.hours
                    ? `${log.metadata.hours} hour(s)`
                    : null;

                  return (
                    <li key={log.id}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${meta.color}`}>
                        {meta.label}
                      </span>
                      {detail && (
                        <p className="flex-1 text-xs text-gray-400 truncate">{detail}</p>
                      )}
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 ml-auto">
                        {timeAgo(log.created_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style jsx global>{`
        .profile-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: white;
        }
        .profile-input:focus {
          border-color: #6C63FF;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }
      `}</style>
    </UserDashboardLayout>
  );
}