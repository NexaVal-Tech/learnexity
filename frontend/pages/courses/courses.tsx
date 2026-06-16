// pages/courses/courses.tsx

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
        background: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="h-7 bg-gray-800 rounded-full w-3/4 mb-4" />
      <div className="h-4 bg-gray-800 rounded-full w-full mb-2" />
      <div className="h-4 bg-gray-800 rounded-full w-5/6 mb-6" />
      <div className="space-y-3 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-full px-2 py-3 h-10" />
        ))}
      </div>
      <div className="mt-6 h-9 bg-gray-800 rounded-full w-36" />
    </div>
  );
}

function FlexSkeletonCard() {
  return (
    <div
      className="w-full animate-pulse p-7 flex flex-col"
      style={{
        borderRadius: "2rem 0.75rem 2rem 0.75rem",
        background: "#0f0f0f",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="h-6 bg-gray-800 rounded-full w-2/3 mb-3" />
      <div className="h-3 bg-gray-800 rounded-full w-full mb-2" />
      <div className="h-3 bg-gray-800 rounded-full w-4/5 mb-5" />
      <div className="space-y-2 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-full h-8" />
        ))}
      </div>
      <div className="mt-5 h-8 bg-gray-800 rounded-full w-28" />
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingCourseId, setPurchasingCourseId] = useState<string | null>(null);
  const [purchaseErrors, setPurchaseErrors] = useState<Record<string, string>>({});

  // Flex preview state
  const [flexCourses, setFlexCourses] = useState<Course[]>([]);
  const [flexLoading, setFlexLoading] = useState(true);

  const fetchMentoredCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/api/courses/by-track?track[]=group_mentorship&track[]=one_on_one`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to load courses. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlexPreview = useCallback(async () => {
    setFlexLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/courses/by-track?track[]=self_paced`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return;
      const data: Course[] = await res.json();
      // Show up to 3 flex courses as a preview
      setFlexCourses(data.slice(0, 3));
    } catch {
      // Silent fail — flex preview is non-critical
    } finally {
      setFlexLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentoredCourses();
    fetchFlexPreview();
  }, [fetchMentoredCourses, fetchFlexPreview]);

  const handlePurchase = useCallback(
    async (course: Course, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setPurchaseErrors((prev) => ({ ...prev, [course.course_id]: "" }));

      if (!user) {
        router.push(`/user/auth/login?redirect=/courses/courses`);
        return;
      }

      setPurchasingCourseId(course.course_id);

      try {
        const response = await api.post(
          `/api/courses/${course.course_id}/enroll`,
          {
            learning_track: "group_mentorship",
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

        if (
          message.toLowerCase().includes("already enrolled") &&
          message.toLowerCase().includes("paid")
        ) {
          router.push("/user/dashboard?tab=your-course");
          return;
        }

        const pendingId = err?.response?.data?.enrollment_id;
        if (pendingId) {
          router.push(`/user/payment/${pendingId}`);
          return;
        }

        setPurchaseErrors((prev) => ({
          ...prev,
          [course.course_id]: message,
        }));
        setPurchasingCourseId(null);
      }
    },
    [user, router]
  );

  return (
    <>
      <Head>
        <title>Courses - Expert-led mentorship programmes | Learnexity</title>
        <meta
          name="description"
          content="Group mentorship and one-on-one coaching programmes designed to launch you into high-paying tech careers."
        />
        <link rel="canonical" href="https://learnexity.org/courses/courses" />
      </Head>

      <AppLayout>
        <ScholarshipCoursePrompt />

        <style>{`
          .course-card {
            borderRadius: 2rem 0.75rem 2rem 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(15, 15, 15, 0.9);
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
            background-color: #4A3AFF;
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
            border: 1.5px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.55);
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
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 999px;
            padding: 0.5rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.625rem;
          }
          .track-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.3rem 0.7rem;
            border-radius: 999px;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
          }
          .track-badge-group {
            background: rgba(74,58,255,0.12);
            border: 1px solid rgba(74,58,255,0.3);
            color: #a89fff;
          }
          .track-badge-oneone {
            background: rgba(16,185,129,0.1);
            border: 1px solid rgba(16,185,129,0.3);
            color: #6ee7b7;
          }

          /* ── Flex preview section ── */
          .flex-preview-section {
            border-top: 1px solid rgba(255,255,255,0.07);
            margin-top: 5rem;
            padding-top: 4rem;
          }
          .flex-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.35rem 0.85rem;
            border-radius: 999px;
            background: ${BRAND}18;
            border: 1px solid ${BRAND}44;
            color: #a89fff;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .flex-card {
            border: 1px solid rgba(255,255,255,0.07);
            background: rgba(15,15,15,0.6);
            backdrop-filter: blur(8px);
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            transition: all 0.3s ease;
          }
          .flex-card:hover {
            border-color: ${BRAND}44;
            background: rgba(74,58,255,0.05);
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 20px ${BRAND}22;
          }
          .flex-card:hover .flex-icon-wrap {
            transform: scale(1.15) rotate(-5deg);
            background: ${BRAND}33;
          }
          .flex-icon-wrap {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: ${BRAND}18;
            transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s;
          }
          .flex-view-all-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem 0.75rem 2rem 0.75rem;
            border: 1.5px solid ${BRAND}66;
            color: #a89fff;
            background: ${BRAND}10;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.3s;
            white-space: nowrap;
          }
          .flex-view-all-btn:hover {
            background: ${BRAND}22;
            border-color: ${BRAND};
            color: #fff;
            gap: 0.75rem;
            box-shadow: 0 0 20px ${BRAND}44;
          }
        `}</style>

        <div className="min-h-screen pb-20">

          {/* ── HERO SECTION ─────────────────────────────────────────── */}
          <section className="relative">

            <div className="relative w-full" style={{ height: "clamp(380px, 58vw, 640px)" }}>
              <Image
                src="/images/coures.jpg"
                alt="Courses hero"
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
                  <h1
                    className="font-bold text-white leading-tight"
                    style={{
                      fontSize: "clamp(1.55rem, 3.8vw, 2.75rem)",
                      maxWidth: "560px",
                      textShadow: "0 2px 24px rgba(0,0,0,0.7)",
                    }}
                  >
                    Expert-led programmes, group mentorship &amp; one-on-one coaching to launch you into high-paying tech careers.
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
                  Mentorship Programmes
                </p>

                {/* ── Error state ── */}
                {error && !loading && (
                  <div className="text-center py-20">
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button
                      onClick={fetchMentoredCourses}
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
                  <div className="text-center text-gray-400 py-20">
                    <p className="text-xl mb-2">No mentorship courses available at the moment.</p>
                    <p className="text-sm text-gray-500">
                      Looking to learn at your own pace? Check our{" "}
                      <Link href="/flex" className="underline" style={{ color: BRAND }}>
                        flexible programmes
                      </Link>
                      .
                    </p>
                  </div>
                )}

                {/* ── Course grid ── */}
                {!loading && !error && courses.length > 0 && (
                  <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {courses.map((course) => {
                      const isPurchasing = purchasingCourseId === course.course_id;
                      const cardError = purchaseErrors[course.course_id];

                      return (
                        <div key={course.id} className="flex">
                          <Link
                            href={`/courses/${course.course_id}`}
                            className="course-card p-8 flex flex-col h-full w-full"
                            style={{
                              borderRadius: "2rem 0.75rem 2rem 0.75rem",
                              border: "1px solid rgba(255,255,255,0.1)",
                              background: "rgba(15,15,15,0.9)",
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
                            <h3 className="text-2xl font-bold text-white mb-3">
                              {course.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed line-clamp-2">
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
                                  <span className="text-gray-300 font-medium text-sm">
                                    {learning.learning_point}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Per-card purchase error */}
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
                                onClick={(e) => handlePurchase(course, e)}
                                disabled={isPurchasing || purchasingCourseId !== null}
                                aria-label={`Purchase ${course.title}`}
                              >
                                {isPurchasing ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent flex-shrink-0" />
                                    Enrolling...
                                  </>
                                ) : (
                                  <>Purchase this course</>
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

                {/* ── FLEX PREVIEW SECTION ────────────────────────────── */}
                {(flexLoading || flexCourses.length > 0) && (
                  <div className="flex-preview-section">

                    {/* Section header */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                      <div>
                        <div className="flex-badge mb-3">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                          Self-Paced
                        </div>
                        <h2 className="text-white font-bold" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}>
                          Explore flexible programmes
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          Prefer to learn on your own schedule? Browse our self-paced courses.
                        </p>
                      </div>

                      <Link href="/flex" className="flex-view-all-btn flex-shrink-0">
                        View all
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </Link>
                    </div>

                    {/* Flex skeleton */}
                    {flexLoading && (
                      <div className="grid md:grid-cols-3 gap-6 items-stretch">
                        {[1, 2, 3].map((i) => <FlexSkeletonCard key={i} />)}
                      </div>
                    )}

                    {/* Flex course cards */}
                    {!flexLoading && flexCourses.length > 0 && (
                      <div className="grid md:grid-cols-3 gap-6 items-stretch">
                        {flexCourses.map((course) => (
                          <div key={course.id} className="flex">
                            <Link
                              href={`/courses/${course.course_id}`}
                              className="flex-card p-7 flex flex-col h-full w-full"
                            >

                              {/* Title */}
                              <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                                {course.title}
                              </h3>

                              {/* Description */}
                              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                                {course.description}
                              </p>

                              {/* Learning points — up to 3 */}
                              {course.learnings && course.learnings.length > 0 && (
                                <div className="space-y-1.5 mb-5">
                                  {course.learnings.slice(0, 3).map((learning) => (
                                    <div key={learning.id} className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${BRAND}22` }}
                                      >
                                        <svg
                                          className="w-2.5 h-2.5"
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
                                      <span className="text-gray-400 text-xs">
                                        {learning.learning_point}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* CTA */}
                              <div
                                className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto"
                                style={{ color: `${BRAND}cc` }}
                              >
                                View course
                              </div>
                            </Link>
                          </div>
                        ))}

                        {/* "See all" card — only when there are courses */}
                        <div className="flex">
                          <Link
                            href="/flex"
                            className="flex-card p-7 flex flex-col items-center justify-center h-full w-full text-center group"
                            style={{ minHeight: "220px" }}
                          >
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                              style={{
                                background: `${BRAND}18`,
                                border: `1.5px solid ${BRAND}44`,
                                transition: "all 0.3s",
                              }}
                            >
                              <ArrowRight
                                size={20}
                                strokeWidth={2.5}
                                style={{ color: BRAND }}
                              />
                            </div>
                            <p className="text-white font-semibold text-base mb-1">
                              See all flexible courses
                            </p>
                            <p className="text-gray-500 text-xs">
                              Browse the full self-paced catalogue
                            </p>
                          </Link>
                        </div>
                      </div>
                    )}
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