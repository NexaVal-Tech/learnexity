// pages/courses/courses.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { Course } from "@/lib/api";
import { subscribeCourses } from "@/lib/courseCache";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";

// ── Skeleton card shown while loading ──────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-3xl p-4 w-full animate-pulse">
      <div className="h-7 bg-gray-700 rounded-full w-3/4 mb-4" />
      <div className="h-4 bg-gray-700 rounded-full w-full mb-2" />
      <div className="h-4 bg-gray-700 rounded-full w-5/6 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-700 rounded-full px-2 py-3 h-10" />
        ))}
      </div>
      <div className="mt-6 h-9 bg-gray-700 rounded-full w-36" />
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  // Start as true only if cache is empty; if cache already has data, we show instantly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // subscribeCourses fires the callback immediately with cached data (if any),
    // so on re-visits the page feels instant.
    const unsub = subscribeCourses((data) => {
      setCourses(data);
      setLoading(false);
      setError(null);
    });

    // Also handle the error case — subscribeCourses kicks off getCourses() internally,
    // but we need to catch failures separately.
    // We wrap it so a rejection is surfaced to the user.
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
      <div className="bg-gray-900 pt-16 md:pt-20 pb-20 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-6 py-10 pt-16">
          <h1 className="text-3xl font-bold mb-12 text-white">Explore Our Courses</h1>

          {/* ── Error state ── */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={retry}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Skeleton grid while loading ── */}
          {loading && !error && (
            <div className="grid md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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
            <div className="grid md:grid-cols-3 gap-10">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.course_id}`}>
                  <div className="bg-gray-800 rounded-3xl p-4 w-full cursor-pointer hover:scale-[1.05] transition-transform shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">
                      {course.title}
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {course.description.slice(0, 100)}...
                    </p>

                    {/* Learning Points */}
                    <div className="space-y-3">
                      {course.learnings?.slice(0, 4).map((learning) => (
                        <div
                          key={learning.id}
                          className="bg-gray-700 rounded-full px-2 py-3 flex items-center gap-3"
                        >
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
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

                    {/* CTA */}
                    <div className="mt-6 flex items-center gap-3">
                      <span className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full shadow hover:bg-indigo-700 transition">
                        View Details →
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