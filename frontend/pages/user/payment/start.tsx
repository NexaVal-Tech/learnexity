// pages/user/payment/start.tsx — /user/payment/start?course=COURSE_ID
//
// Landing point for "Proceed to Payment" links in emails when the
// enrollment doesn't exist yet: creates (or finds) the enrollment for the
// course and sends the student straight to its payment page — never to
// the course page.
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";

type Track = "self_paced" | "group_mentorship" | "one_on_one" | "intermediate";

export default function PaymentStartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const courseId = typeof router.query.course === "string" ? router.query.course : "";

  useEffect(() => {
    if (!router.isReady || loading) return;
    if (!courseId) {
      router.replace("/user/dashboard");
      return;
    }
    if (!user) {
      sessionStorage.setItem("post_login_redirect", router.asPath);
      router.replace("/user/auth/login");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const course: any = await api.courses.getById(courseId);
        const track: Track = course?.offers_group_mentorship
          ? "group_mentorship"
          : course?.offers_one_on_one
          ? "one_on_one"
          : course?.offers_intermediate
          ? "intermediate"
          : "self_paced";
        const res = await api.enrollment.enroll(courseId, track, "onetime");
        if (!cancelled) router.replace(`/user/payment/${res.enrollment_id}`);
      } catch (e: any) {
        const existing = e?.response?.data?.enrollment_id;
        if (existing) {
          if (!cancelled) router.replace(e?.response?.status === 409 ? "/user/dashboard?tab=your-course" : `/user/payment/${existing}`);
          return;
        }
        if (!cancelled) setError(e?.response?.data?.message || "We couldn't open your payment page. Please try again or contact support.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, router.isReady, courseId, user, loading]);

  return (
    <UserDashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        {error ? (
          <div className="max-w-sm">
            <p className="text-black dark:text-white font-semibold mb-2">Something went wrong</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{error}</p>
            <button onClick={() => router.reload()} className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-semibold">
              Try again
            </button>
          </div>
        ) : (
          <div>
            <div className="w-10 h-10 mx-auto mb-4 rounded-full border-4 border-gray-300 border-t-black dark:border-white/20 dark:border-t-white animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Opening your payment page…</p>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
