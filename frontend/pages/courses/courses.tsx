// pages/courses/courses.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { Course } from "@/lib/api";
import { subscribeCourses } from "@/lib/courseCache";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import { ArrowRight } from "lucide-react";

const BRAND = "#4A3AFF";

// ── Skeleton card shown while loading ──────────────────────────────────────
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCourses((data) => {
      setCourses(data);
      setLoading(false);
      setError(null);
    });

    import("@/lib/courseCache").then(({ getCourses }) =>
      getCourses().catch((err: any) => {
        setError(
          err?.friendlyMessage ||
            "Failed to load courses. Please check your connection and try again."
        );
        setLoading(false);
      })
    );

    return unsub;
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    import("@/lib/courseCache").then(({ bustCourseCache, getCourses }) => {
      bustCourseCache();
      getCourses()
        .then((data) => {
          setCourses(data);
          setLoading(false);
        })
        .catch((err: any) => {
          setError(
            err?.friendlyMessage ||
              "Failed to load courses. Please try again later."
          );
          setLoading(false);
        });
    });
  };

  return (
    <AppLayout>
      <style>{`
        .course-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 15, 15, 0.9);
          backdrop-filter: blur(8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
          transition: all 0.3s ease;
        }
        .course-card:hover {
          border-color: ${BRAND}66;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 30px ${BRAND}33;
          transform: translateY(-4px);
        }
        .course-cta-btn {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          background-color: ${BRAND};
          color: white;
          font-weight: 600;
          padding: 0.5rem 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        .course-cta-btn:hover {
          box-shadow: 0 0 20px ${BRAND}66;
          gap: 0.75rem;
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
      `}</style>

      <div className=" pt-16 md:pt-20 pb-20 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-6 py-10 pt-16">
          <h1 className="text-3xl font-bold mb-12 text-white">
            Explore Our Courses
          </h1>

          {/* ── Error state ── */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={retry}
                className="course-cta-btn"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Skeleton grid while loading ── */}
          {loading && !error && (
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && courses.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">No courses available at the moment.</p>
            </div>
          )}

          {/* ── Course grid ── */}
          {!loading && !error && courses.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.course_id}`}
                  className="flex"
                >
                  {/* flex + flex-col + h-full makes every card stretch to row height */}
                  <div className="course-card p-8 flex flex-col h-full w-full cursor-pointer">

                    {/* Icon accent */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-6 flex-shrink-0"
                      style={{ backgroundColor: `${BRAND}22` }}
                    >
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
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {course.title}
                    </h3>

                    {/* Description — fixed to 2 lines via line-clamp so cards stay aligned */}
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Learning pills — flex-1 pushes CTA to the bottom */}
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

                    {/* CTA — always pinned to bottom */}
                    <div className="mt-6 flex-shrink-0">
                      <span className="course-cta-btn">
                        View Details <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </AppLayout>
  );
}