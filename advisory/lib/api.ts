// lib/api.ts
//
// Deliberately small: Learnexity Advisory only ever needs to check taken
// slots and submit a booking, both against the SAME Laravel backend the
// main learnexity.org frontend uses (see server/app/Http/Controllers/Api/
// ConsultationController.php + ConsultationPaymentController.php). Every
// request here is tagged source: 'advisory' so the backend treats it as
// always-free and admin can tell it apart from course consultations.
import axios from "axios";

// NEXT_PUBLIC_API_URL should be set per-environment (see .env.local.example).
// The advisory app currently has no NEXT_PUBLIC_API_URL configured in its
// production hosting environment, which meant every request here silently
// fell back to http://localhost:8000 — unreachable from a real visitor's
// browser, so the schedule/slots/booking calls all failed with no visible
// error (caught and swallowed by the callers below). Falling back to the
// real production API instead of localhost means the site works correctly
// even if that env var is still missing; local dev should set
// NEXT_PUBLIC_API_URL=http://localhost:8000 in advisory/.env.local to
// override this and hit a local backend instead.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://api.learnexity.org");

const client = axios.create({ baseURL: API_URL });

export interface BookedSlotsResponse {
  booked_slots: string[];
  is_free_day: boolean;
}

export async function getBookedSlots(date: string): Promise<BookedSlotsResponse> {
  const res = await client.get("/api/consultations/booked-slots", {
    params: { date, source: "advisory" },
  });
  return res.data;
}

export interface AvailableSlotsResponse {
  available: boolean;
  slots: string[];
  is_free_day: boolean;
}

export async function getAvailableSlots(date: string): Promise<AvailableSlotsResponse> {
  const res = await client.get("/api/consultations/available-slots", {
    params: { date, source: "advisory" },
  });
  return res.data;
}

export interface ScheduleResponse {
  recurring: { days: string; hours: string }[];
  one_off: { date: string; label: string; hours: string }[];
  active_weekdays: number[];
  text: string;
}

export async function getSchedule(): Promise<ScheduleResponse> {
  const res = await client.get("/api/consultations/schedule", {
    params: { source: "advisory" },
  });
  return res.data;
}

export interface BookAssessmentPayload {
  full_name: string;
  email: string;
  phone?: string;
  course?: string; // reused as "Company" — see server-side admin email template
  message?: string;
  preferred_date: string;
  preferred_time: string;
}

export async function bookAssessment(payload: BookAssessmentPayload) {
  const res = await client.post("/api/consultations/initiate", {
    ...payload,
    consultation_type: "technology_value_assessment",
    source: "advisory",
  });
  return res.data as { is_free: boolean; message: string; consultation_id: number };
}
