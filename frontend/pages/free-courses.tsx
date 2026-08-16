// pages/free-courses.tsx

import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Course, api } from "@/lib/api";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import { ArrowRight } from "lucide-react";
import ScholarshipCoursePrompt from "@/components/Scholarship/ScholarshipCoursePrompt";
import { useAuth } from "@/contexts/AuthContext";

const BRAND = "#4A3AFF";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function SkeletonCard() {
  return (
    <div
      className="w-full animate-pulse p-8 flex flex-col"
      style={{
        borderRadius: "2rem 0.75rem 2rem 0.75rem",
        background: "var(--surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="h-7 bg-[var(--border-strong)] rounded-full w-3/4 mb-4" />
      <div className="h-4 bg-[var(--border-strong)] rounded-full w-full mb-2" />
      <div className="h-4 bg-[var(--border-strong)] rounded-full w-5/6 mb-6" />
      <div className="space-y-3 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--border-strong)] rounded-full px-2 py-3 h-10" />
        ))}
      </div>
      <div className="mt-6 h-9 bg-[var(--border-strong)] rounded-full w-36" />
    </div>
  );
}

export default function FreeCoursesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollErrors, setEnrollErrors] = useState<Record<string, string>>({});

  const fetchFreeCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/courses/free`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err: any) {
      setError(
        err?.message || "Failed to load courses. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreeCourses();
  }, [fetchFreeCourses]);

  const handleEnroll = useCallback(
    async (course: Course, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setEnrollErrors((prev) => ({ ...prev, [course.course_id]: "" }));

      if (!user) {
        router.push(`/user/auth/login?redirect=/free-courses`);
        return;
      }

      setEnrollingCourseId(course.course_id);

      try {
        const preferredTrack =
          course.available_tracks?.find((t) => t === "self_paced") ||
          course.available_tracks?.[0] ||
          "self_paced";

        const response = await api.post(
          `/api/courses/${course.course_id}/enroll`,
          {
            learning_track: preferredTrack,
            payment_type: "onetime",
          }
        );

        const enrollmentId =
          response?.enrollment_id ?? response?.data?.enrollment_id;

        if (!enrollmentId) {
          throw new Error("No enrollment ID returned from server.");
        }

        router.push(`/user/payment/${enrollmentId}`);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.";

        if (message.toLowerCase().includes("already enrolled")) {
          router.push("/user/dashboard?tab=your-course");
          return;
        }

        const pendingId = err?.response?.data?.enrollment_id;
        if (pendingId) {
          router.push(`/user/payment/${pendingId}`);
          return;
        }

        setEnrollErrors((prev) => ({
          ...prev,
          [course.course_id]: message,
        }));
        setEnrollingCourseId(null);
      }
    },
    [user, router]
  );

  return (
    <>
      <Head>
        <title>Free Courses - Learnexity</title>
        <meta
          name="description"
          content="Enroll in our free courses and get full access to resources — no payment required."
        />
        <link rel="canonical" href="https://learnexity.org/free-courses" />
      </Head>

      <AppLayout>
        <ScholarshipCoursePrompt />

        <style>{`
          .course-card {
            borderRadius: 2rem 0.75rem 2rem 0.75rem;
            border: 1px solid var(--border-subtle);
            background: var(--surface-elevated);
            backdrop-filter: blur(8px);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
            transition: all 0.3s ease;
          }
          .course-card:hover {
            border-color: ${BRAND}66;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${BRAND}33;
            transform: translateY(-4px);
          }
          .purchase-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: fit-content;

            background-color: ${BRAND};
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
            padding: 0.625rem 1rem;
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
          }
          .purchase-btn:hover:not(:disabled) {
            box-shadow: 0 0 20px ${BRAND}66;
            gap: 0.625rem;
          }
          .purchase-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .details-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            padding: 0.5rem 0.875rem;
            border-radius: 2rem;
            border: 1.5px solid var(--border-strong);
            color: var(--text-muted);
            background: transparent;
            font-size: 0.8rem;
            font-weight: 500;
            flex-shrink: 0;
            white-space: nowrap;
            transition: all 0.3s;
          }
          .details-btn:hover {
            border-color: ${BRAND}88;
            color: ${BRAND};
            background: ${BRAND}12;
          }
          .course-icon-wrap {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            flex-shrink: 0;
            background: ${BRAND}22;
            transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s, box-shadow 0.3s;
          }
          .course-card:hover .course-icon-wrap {
            transform: scale(1.18) rotate(-6deg);
            background: ${BRAND}44;
            box-shadow: 0 0 22px ${BRAND}55;
          }
          .course-icon-wrap svg {
            transition: stroke 0.3s;
          }
          .course-card:hover .course-icon-wrap svg {
            stroke: #fff;
          }
          .learning-pill {
            background: var(--surface-alt);
            border: 1px solid var(--border-subtle);
            border-radius: 999px;
            padding: 0.5rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.625rem;
          }
          .free-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.35rem 0.85rem;
            border-radius: 999px;
            background: ${BRAND}26;
            border: 1px solid ${BRAND}59;
            color: ${BRAND};
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
        `}</style>

        <div className="min-h-screen pb-20">

          {/* ── HERO SECTION ─────────────────────────────────────────── */}
          <section className="relative">

            <div className="relative w-full" style={{ height: "clamp(380px, 58vw, 640px)" }}>
              <Image
                src="/images/coures.jpg"
                alt="Free courses hero"
                fill
                className="object-cover object-center"
                priority
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(6,14,31,0.25) 0%, rgba(6,14,31,0.45) 55%, rgba(6,14,31,0.93) 100%)",
                }}
              />

              <div className="absolute top-28 md:top-38 left-0 right-0 px-6 md:px-10 lg:px-16">
                <div className="max-w-screen-xl mx-auto">
                  {/* Free badge */}
                  <div className="free-badge mb-4">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    100% Free
                  </div>

                  <h1
                    className="font-bold text-white leading-tight"
                    style={{
                      fontSize: "clamp(1.55rem, 3.8vw, 2.75rem)",
                      maxWidth: "560px",
                      textShadow: "0 2px 24px rgba(0,0,0,0.7)",
                    }}
                  >
                    Enroll in our free courses, no payment required, full access from day one.
                  </h1>
                </div>
              </div>
            </div>

            <div
              className="relative z-10 px-6 md:px-10 lg:px-16"
              style={{ marginTop: "clamp(-8rem, -14vw, -18rem)" }}
            >
              <div className="max-w-screen-xl mx-auto">

                <p
                  className="font-semibold mb-6"
                  style={{ color: BRAND, fontSize: "clamp(0.9rem, 1.4vw, 1.05rem)" }}
                >
                  Free Programmes
                </p>

                {/* ── Error state ── */}
                {error && !loading && (
                  <div className="text-center py-20">
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button
                      onClick={fetchFreeCourses}
                      className="purchase-btn"
                      style={{ maxWidth: "140px", margin: "0 auto" }}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* ── Skeleton grid while loading ── */}
                {loading && !error && (
                  <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                  </div>
                )}

                {/* ── Empty state ── */}
                {!loading && !error && courses.length === 0 && (
                  <div className="text-center text-[var(--text-secondary)] py-20">
                    <p className="text-xl mb-2">No free courses available yet.</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Check our{" "}
                      <Link href="/flex" className="underline" style={{ color: BRAND }}>
                        flexible programmes
                      </Link>{" "}
                      in the meantime.
                    </p>
                  </div>
                )}

                {/* ── Course grid ── */}
                {!loading && !error && courses.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {courses.map((course) => {
                      const isEnrolling = enrollingCourseId === course.course_id;
                      const cardError = enrollErrors[course.course_id];
                      const price = course.price_usd ?? course.price;

                      return (
                        <div key={course.id} className="flex">
                          <Link
                            href={`/courses/${course.course_id}`}
                            className="course-card p-8 flex flex-col h-full w-full"
                            style={{
                              borderRadius: "2rem 0.75rem 2rem 0.75rem",
                              border: "1px solid var(--border-subtle)",
                              background: "var(--surface-elevated)",
                              backdropFilter: "blur(8px)",
                              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {/* Icon */}
                            <div className="course-icon-wrap">
                              <svg
                                className="w-6 h-6"
                                style={{ color: BRAND }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                              {course.title}
                            </h3>

                            {/* Price badge */}
                            <div className="flex items-center gap-2 mb-4">
                              <span
                                className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                                style={{ background: `${BRAND}26`, color: BRAND, border: `1px solid ${BRAND}59` }}
                              >
                                Free
                              </span>
                              {price > 0 && (
                                <span className="text-sm text-[var(--text-muted)] line-through">
                                  ${Number(price).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed line-clamp-2">
                              {course.description}
                            </p>

                            {/* Learning points */}
                            <div className="space-y-2 flex-1">
                              {course.learnings?.slice(0, 4).map((learning) => (
                                <div key={learning.id} className="learning-pill">
                                  <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${BRAND}33` }}
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      style={{ color: BRAND }}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-[var(--text-secondary)] font-medium text-sm">
                                    {learning.learning_point}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Per-card enroll error */}
                            {cardError && (
                              <p
                                className="mt-4 text-xs px-3 py-2 rounded-lg"
                                style={{
                                  background: "rgba(220,38,38,0.12)",
                                  color: "#fca5a5",
                                  border: "1px solid rgba(220,38,38,0.25)",
                                }}
                              >
                                {cardError}
                              </p>
                            )}

                            {/* CTA row */}
                            <div className="mt-6 flex-shrink-0 flex items-center justify-between w-full">
                              <button
                                className="purchase-btn"
                                onClick={(e) => handleEnroll(course, e)}
                                disabled={isEnrolling || enrollingCourseId !== null}
                                aria-label={`Enroll in ${course.title}`}
                              >
                                {isEnrolling ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent flex-shrink-0" />
                                    Enrolling...
                                  </>
                                ) : (
                                  <>Enroll for free</>
                                )}
                              </button>

                              <span
                                className="details-btn"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`View details for ${course.title}`}
                              >
                                <ArrowRight size={22} strokeWidth={3.2} />
                              </span>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </AppLayout>
    </>
  );
}
