// components/BookingWidget.tsx
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { bookAssessment, getBookedSlots } from "@/lib/api";
import toast from "react-hot-toast";

const BRAND = "#4A3AFF";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

/** Next 14 weekdays (Mon–Fri) starting tomorrow, as { value, label } pairs. */
function getUpcomingWeekdays(count: number) {
  const days: { value: string; label: string }[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);

  while (days.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      const value = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      days.push({ value, label });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function BookingWidget() {
  const dateOptions = useMemo(() => getUpcomingWeekdays(14), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!date) {
      setBookedSlots([]);
      return;
    }
    setSlotsLoading(true);
    setTime("");
    getBookedSlots(date)
      .then((res) => setBookedSlots(res.booked_slots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date]);

  const availableSlots = TIME_SLOTS.filter((t) => !bookedSlots.includes(t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !date || !time) {
      setError("Please fill in your name, email, and pick a date and time.");
      return;
    }

    setSubmitting(true);
    try {
      await bookAssessment({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        course: company.trim() || undefined,
        message: message.trim() || undefined,
        preferred_date: date,
        preferred_time: time,
      });
      setDone(true);
      toast.success("Your assessment is booked — check your email for confirmation.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-16 px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: `${BRAND}18` }}
        >
          <CheckCircle2 size={30} style={{ color: BRAND }} />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">You're booked.</h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          We've sent a confirmation to <strong>{email}</strong>. Our team will follow up with a
          meeting link before your session on {date && new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {time}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-10">
      {error && (
        <div className="mb-6 text-sm px-4 py-3 rounded-xl" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Full name *</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="assessment-input"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Work email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="assessment-input"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="assessment-input"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Company</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="assessment-input"
            placeholder="Your organization"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">
          What technology investment or decision would you like to discuss?
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="assessment-input resize-none"
          placeholder="A brief description helps us prepare for the call."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
            <CalendarDays size={13} /> Preferred date *
          </label>
          <select value={date} onChange={(e) => setDate(e.target.value)} required className="assessment-input">
            <option value="">Select a date</option>
            {dateOptions.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
            <Clock size={13} /> Preferred time *
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            disabled={!date || slotsLoading}
            className="assessment-input disabled:opacity-50"
          >
            <option value="">{slotsLoading ? "Loading availability…" : date ? "Select a time" : "Pick a date first"}</option>
            {availableSlots.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-60"
        style={{ background: BRAND, boxShadow: `0 8px 24px ${BRAND}55` }}
      >
        {submitting ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Booking…
          </>
        ) : (
          "Book my complimentary assessment"
        )}
      </button>
      <p className="text-xs text-[var(--text-muted)] text-center mt-3">
        No cost, no obligation. Monday–Friday, 30 minutes.
      </p>

      <style jsx>{`
        .assessment-input {
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.9rem;
          color: var(--text-primary);
          background: white;
          transition: border-color 0.2s;
        }
        .assessment-input:focus {
          outline: none;
          border-color: ${BRAND}88;
          box-shadow: 0 0 0 3px ${BRAND}1a;
        }
      `}</style>
    </form>
  );
}
