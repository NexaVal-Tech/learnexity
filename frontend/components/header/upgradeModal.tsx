"use client";
import { useState, useEffect, useCallback } from "react";
import { X, ArrowRight, Clock, Users, Zap, CheckCircle, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api, { handleApiError } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type UpgradeOption = {
  type: "track_upgrade" | "addon";
  target_track: string;
  label: string;
  description: string;
  charge_amount?: number;
  hourly_rate?: number;
  currency: string;
  payment_options: ("onetime" | "installment")[];
};

type UpgradeState = {
  current_track: string;
  currency: string;
  can_upgrade: boolean;
  options: UpgradeOption[];
};

type Props = {
  courseId: string;
  /** override the trigger element — defaults to the standard purple pill */
  trigger?: React.ReactNode;
  onUpgradeComplete?: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRACK_LABELS: Record<string, string> = {
  self_paced: "Self-Paced",
  group_mentorship: "Group Mentorship",
  one_on_one: "One-on-One",
};

const TRACK_ICONS: Record<string, React.ReactNode> = {
  self_paced: <Zap className="w-4 h-4" />,
  group_mentorship: <Users className="w-4 h-4" />,
  one_on_one: <Clock className="w-4 h-4" />,
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "NGN" ? "NGN" : "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UpgradeModal({ courseId, trigger, onUpgradeComplete }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeState, setUpgradeState] = useState<UpgradeState | null>(null);

  // per-option selection state
  const [selectedHours, setSelectedHours] = useState<Record<string, number>>({});
  const [selectedPaymentType, setSelectedPaymentType] = useState<Record<string, "onetime" | "installment">>({});
  const [initiating, setInitiating] = useState<string | null>(null); // target_track being processed
  const [success, setSuccess] = useState<string | null>(null); // target_track that succeeded

  // ── Fetch options when modal opens ──────────────────────────────────────────
  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.trackUpgrade.getOptions(courseId);
      setUpgradeState(data);
      // seed defaults
      const hours: Record<string, number> = {};
      const payTypes: Record<string, "onetime" | "installment"> = {};
      (data.options as UpgradeOption[]).forEach((opt) => {
        hours[opt.target_track] = 1;
        payTypes[opt.target_track] = opt.payment_options[0];
      });
      setSelectedHours(hours);
      setSelectedPaymentType(payTypes);
    } catch (err) {
      const msg = handleApiError(err);
      // Not enrolled / no active enrollment — show a friendly state
      if (msg.includes("No active enrollment")) {
        setUpgradeState({ current_track: "", currency: "USD", can_upgrade: false, options: [] });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (open) fetchOptions();
  }, [open, fetchOptions]);

  // ── Initiate upgrade ─────────────────────────────────────────────────────────
  async function handleUpgrade(option: UpgradeOption) {
    setInitiating(option.target_track);
    setError(null);
    try {
      const payload: { target_track: string; payment_type: "onetime" | "installment"; hours?: number } = {
        target_track: option.target_track,
        payment_type: selectedPaymentType[option.target_track] ?? "onetime",
      };
      if (option.type === "addon") {
        payload.hours = selectedHours[option.target_track] ?? 1;
      }

      const result = await api.trackUpgrade.initiate(courseId, payload);

      // ── Hand off to payment provider ──────────────────────────────────────
      // The initiate endpoint stores the pending upgrade and returns the amount.
      // Now trigger Paystack / Stripe exactly like the normal enroll flow does.
      // Adjust this block to match your existing payment launch code.
      const chargeAmount: number = result.charge_amount;
      const enrollmentId: number = result.enrollment_id;
      const currency: string = result.currency;

      if (currency === "NGN") {
        // Paystack flow — callback must be a plain sync function (no async)
        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
          throw new Error("Paystack is not loaded. Please refresh the page.");
        }

        // Email comes from AuthContext — same source your existing payment pages use
        const userEmail = user?.email ?? "";
        if (!userEmail) {
          throw new Error("User email not found. Please refresh and try again.");
        }
        const handler = PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: userEmail,
          amount: Math.round(chargeAmount * 100), // kobo
          currency: "NGN",
          ref: `UPG-${enrollmentId}-${option.target_track}-${Date.now()}`,
          metadata: {
            enrollment_id: enrollmentId,
            upgrade_type: result.upgrade_type,
            target_track: option.target_track,
            payment_type: payload.payment_type,
          },
          // Paystack requires a plain (non-async) callback function
          callback(response: { reference: string }) {
            api.trackUpgrade
              .finalise(enrollmentId, response.reference, {
                target_track: option.target_track,
                upgrade_type: result.upgrade_type,
                amount_paid: chargeAmount,
                currency,
                hours: payload.hours ?? 1,
              })
              .then(() => {
                setSuccess(option.target_track);
                setInitiating(null);
                onUpgradeComplete?.();
              })
              .catch((e: unknown) => {
                setError(handleApiError(e));
                setInitiating(null);
              });
          },
          onClose() {
            setInitiating(null);
          },
        });
        handler.openIframe();
      } else {
        // Stripe flow — create checkout session and redirect
        const session = await (api as any).post("/api/create-stripe-checkout", {
          enrollment_id: enrollmentId,
          learning_track: option.target_track === "one_on_one"
            ? upgradeState?.current_track
            : option.target_track,
          payment_type: payload.payment_type,
          currency: "usd",
        });
        window.location.href = session.url;
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setInitiating(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger ?? (
          <button className="bg-[#4A3AFF] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#3D30E0] transition-colors">
            Upgrade
          </button>
        )}
      </div>

      {/* Backdrop + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upgrade your plan</h2>
                {upgradeState?.current_track && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Currently on{" "}
                    <span className="font-medium text-[#4A3AFF]">
                      {TRACK_LABELS[upgradeState.current_track] ?? upgradeState.current_track}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-8 h-8 border-2 border-[#4A3AFF] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Checking your upgrade options…</p>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* No enrollment */}
              {!loading && upgradeState && !upgradeState.can_upgrade && upgradeState.options.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {upgradeState.current_track
                      ? "You're already on the highest track."
                      : "You don't have an active enrollment for this course."}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Enroll in the course first to access upgrade options.</p>
                </div>
              )}

              {/* Options */}
              {!loading && upgradeState?.options.map((option) => {
                const isDone = success === option.target_track;
                const isBusy = initiating === option.target_track;
                const hours = selectedHours[option.target_track] ?? 1;
                const payType = selectedPaymentType[option.target_track] ?? "onetime";
                const effectiveAmount = option.type === "addon"
                  ? (option.hourly_rate ?? 0) * hours
                  : option.charge_amount ?? 0;
                const isInstallment = payType === "installment";
                const displayAmount = isInstallment
                  ? effectiveAmount / 4
                  : effectiveAmount;

                return (
                  <div
                    key={option.target_track}
                    className={`rounded-xl border-2 p-4 transition-colors ${
                      isDone
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 hover:border-[#4A3AFF]/40"
                    }`}
                  >
                    {/* Option header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`mt-0.5 p-2 rounded-lg ${
                        option.type === "addon"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-[#4A3AFF]/10 text-[#4A3AFF]"
                      }`}>
                        {TRACK_ICONS[option.target_track] ?? <ArrowRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{option.description}</p>
                      </div>
                      {isDone && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                    </div>

                    {/* One-on-one: hour picker */}
                    {option.type === "addon" && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                          Number of hours
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedHours((prev) => ({
                                ...prev,
                                [option.target_track]: Math.max(1, (prev[option.target_track] ?? 1) - 1),
                              }))
                            }
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 font-medium text-sm"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                            {hours}
                          </span>
                          <button
                            onClick={() =>
                              setSelectedHours((prev) => ({
                                ...prev,
                                [option.target_track]: Math.min(100, (prev[option.target_track] ?? 1) + 1),
                              }))
                            }
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 font-medium text-sm"
                          >
                            +
                          </button>
                          <span className="text-xs text-gray-400 ml-1">
                            @ {fmt(option.hourly_rate ?? 0, option.currency)} / hr
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment type selector (track_upgrade only) */}
                    {option.type === "track_upgrade" && option.payment_options.length > 1 && (
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                          Payment plan
                        </label>
                        <div className="relative">
                          <select
                            value={payType}
                            onChange={(e) =>
                              setSelectedPaymentType((prev) => ({
                                ...prev,
                                [option.target_track]: e.target.value as "onetime" | "installment",
                              }))
                            }
                            className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#4A3AFF] transition-colors"
                          >
                            <option value="onetime">Pay in full (one-time)</option>
                            <option value="installment">4 installments</option>
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Amount + CTA */}
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {fmt(displayAmount, option.currency)}
                        </span>
                        {isInstallment && (
                          <span className="text-xs text-gray-400 ml-1">/ installment</span>
                        )}
                        {option.type === "addon" && (
                          <span className="text-xs text-gray-400 ml-1">total</span>
                        )}
                      </div>

                      {isDone ? (
                        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(option)}
                          disabled={isBusy || !!initiating}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            option.type === "addon"
                              ? "bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60"
                              : "bg-[#4A3AFF] hover:bg-[#3D30E0] text-white disabled:opacity-60"
                          }`}
                        >
                          {isBusy ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Processing…
                            </>
                          ) : (
                            <>
                              {option.type === "addon" ? "Book hours" : "Upgrade now"}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Installment breakdown note */}
                    {isInstallment && option.type === "track_upgrade" && (
                      <p className="text-xs text-gray-400 mt-2">
                        4 × {fmt(displayAmount, option.currency)} — first payment charged now, then every 4 weeks.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            {!loading && upgradeState?.can_upgrade && (
              <div className="px-6 pb-5">
                <p className="text-xs text-gray-400 text-center">
                  Upgrades are processed securely via Paystack or Stripe.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}