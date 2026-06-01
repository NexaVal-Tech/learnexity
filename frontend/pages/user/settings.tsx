"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Lock, Shield, Trash2, Eye, EyeOff,
  CheckCircle, AlertCircle, Loader2, LogOut, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api, { handleApiError } from "@/lib/api";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }: {
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

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 disabled:opacity-50 ${
        checked ? "bg-[#6C63FF]" : "bg-gray-200"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <div className="p-1.5 bg-[#6C63FF]/10 rounded-lg text-[#6C63FF]">{icon}</div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, description, checked, onChange, disabled }: {
  label: string; description: string;
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ─── Password field ───────────────────────────────────────────────────────────
function PasswordField({ label, value, show, onToggle, onChange, error }: {
  label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="settings-input pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Notification toggles
  const [notif, setNotif] = useState({
    email_notifications: true,
    marketing_emails:    false,
    sms_notifications:   false,
  });
  const [savingNotif, setSavingNotif] = useState(false);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(false);
  const [savingPrivacy, setSavingPrivacy]  = useState(false);

  // Password
  const [hasPassword, setHasPassword]         = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [pwForm, setPwForm] = useState({
    current_password: "", new_password: "", new_password_confirmation: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw]   = useState(false);
  const [pwErrors, setPwErrors]   = useState<Record<string, string>>({});

  // Delete account
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [deleteForm, setDeleteForm]     = useState({ password: "", confirmation: "" });
  const [deleting, setDeleting]         = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  // ── Load settings ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.settings.get()
      .then((res) => {
        const s = res.settings;
        setNotif({
          email_notifications: s.email_notifications,
          marketing_emails:    s.marketing_emails,
          sms_notifications:   s.sms_notifications,
        });
        setProfilePublic(s.profile_public);
        setHasPassword(s.has_password);
        setGoogleConnected(s.google_connected);
      })
      .catch((e) => showToast(handleApiError(e), "error"))
      .finally(() => setLoadingSettings(false));
  }, []);

  // ── Notification toggle ────────────────────────────────────────────────────
  async function handleNotifToggle(key: keyof typeof notif, value: boolean) {
    const updated = { ...notif, [key]: value };
    setNotif(updated);
    setSavingNotif(true);
    try {
      await api.settings.updateNotifications(updated);
      showToast("Notification preferences saved.", "success");
    } catch (e) {
      setNotif((prev) => ({ ...prev, [key]: !value })); // revert
      showToast(handleApiError(e), "error");
    } finally {
      setSavingNotif(false);
    }
  }

  // ── Privacy toggle ─────────────────────────────────────────────────────────
  async function handlePrivacyToggle(value: boolean) {
    setProfilePublic(value);
    setSavingPrivacy(true);
    try {
      await api.settings.updatePrivacy(value);
      showToast("Privacy settings saved.", "success");
    } catch (e) {
      setProfilePublic(!value);
      showToast(handleApiError(e), "error");
    } finally {
      setSavingPrivacy(false);
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErrors({});
    setSavingPw(true);
    try {
      await api.settings.changePassword(pwForm);
      setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      showToast("Password changed successfully.", "success");
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const flat: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]: any) => {
          flat[k] = Array.isArray(v) ? v[0] : v;
        });
        setPwErrors(flat);
      } else {
        showToast(handleApiError(err), "error");
      }
    } finally {
      setSavingPw(false);
    }
  }

  // ── Delete account ─────────────────────────────────────────────────────────
  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteErrors({});
    setDeleting(true);
    try {
      await api.settings.deleteAccount(deleteForm);
      await logout();
      router.push("/");
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const flat: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]: any) => {
          flat[k] = Array.isArray(v) ? v[0] : v;
        });
        setDeleteErrors(flat);
      } else {
        showToast(handleApiError(err), "error");
      }
    } finally {
      setDeleting(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingSettings) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-[#6C63FF]" />
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-[1255px] mx-auto p-6 pt-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account preferences and security.
          </p>
        </div>

        {/* ── Notifications ── */}
        <SectionCard title="Notifications" icon={<Bell className="w-4 h-4" />}>
          <ToggleRow
            label="Email notifications"
            description="Course updates, payment receipts, and important alerts."
            checked={notif.email_notifications}
            onChange={(v) => handleNotifToggle("email_notifications", v)}
            disabled={savingNotif}
          />
          <ToggleRow
            label="Marketing emails"
            description="Tips, new course announcements, and promotions."
            checked={notif.marketing_emails}
            onChange={(v) => handleNotifToggle("marketing_emails", v)}
            disabled={savingNotif}
          />
          <ToggleRow
            label="SMS notifications"
            description="Text messages for critical account updates."
            checked={notif.sms_notifications}
            onChange={(v) => handleNotifToggle("sms_notifications", v)}
            disabled={savingNotif}
          />
        </SectionCard>

        {/* ── Privacy ── */}
        <SectionCard title="Privacy" icon={<Eye className="w-4 h-4" />}>
          <ToggleRow
            label="Public profile"
            description="Allow other learners to see your profile and progress."
            checked={profilePublic}
            onChange={handlePrivacyToggle}
            disabled={savingPrivacy}
          />
        </SectionCard>

        {/* ── Password ── */}
        <SectionCard title="Password & Security" icon={<Lock className="w-4 h-4" />}>
          {googleConnected && !hasPassword && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
              Your account uses Google sign-in. Set a password below to also enable email login.
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-3">
            {hasPassword && (
              <PasswordField
                label="Current password"
                value={pwForm.current_password}
                show={showPw.current}
                onToggle={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                onChange={(v) => setPwForm((f) => ({ ...f, current_password: v }))}
                error={pwErrors.current_password}
              />
            )}
            <PasswordField
              label="New password"
              value={pwForm.new_password}
              show={showPw.new}
              onToggle={() => setShowPw((s) => ({ ...s, new: !s.new }))}
              onChange={(v) => setPwForm((f) => ({ ...f, new_password: v }))}
              error={pwErrors.new_password}
            />
            <PasswordField
              label="Confirm new password"
              value={pwForm.new_password_confirmation}
              show={showPw.confirm}
              onToggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
              onChange={(v) => setPwForm((f) => ({ ...f, new_password_confirmation: v }))}
              error={pwErrors.new_password_confirmation}
            />
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPw || !pwForm.new_password}
                className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5753E6] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
              >
                {savingPw
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : "Update password"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ── Danger zone ── */}
        <SectionCard title="Danger Zone" icon={<Shield className="w-4 h-4 text-red-500" />}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete account</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </SectionCard>

        {/* ── Sign out ── */}
        <button
          type="button"
          onClick={async () => { await logout(); router.push("/"); }}
          className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-gray-400" />
            Sign out of your account
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* ── Delete modal ── */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete account</h3>
                <p className="text-xs text-gray-500">This action is permanent and irreversible.</p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              {hasPassword && (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Your password
                  </label>
                  <input
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="settings-input"
                  />
                  {deleteErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{deleteErrors.password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteForm.confirmation}
                  onChange={(e) => setDeleteForm((f) => ({ ...f, confirmation: e.target.value }))}
                  placeholder="DELETE"
                  className="settings-input"
                />
                {deleteErrors.confirmation && (
                  <p className="text-xs text-red-500 mt-1">{deleteErrors.confirmation}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteForm({ password: "", confirmation: "" });
                    setDeleteErrors({});
                  }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || deleteForm.confirmation !== "DELETE"}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {deleting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                    : "Delete my account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style jsx global>{`
        .settings-input {
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
        .settings-input:focus {
          border-color: #6C63FF;
          box-shadow: 0 0 0 3px rgba(108,99,255,0.1);
        }
      `}</style>
    </UserDashboardLayout>
  );
}
