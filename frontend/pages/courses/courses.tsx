import { useState, useEffect } from "react";
import Link from "next/link";
import { api, Course } from "@/lib/api";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
// import { SignUpButton2 } from "@/components/button/Button";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      if (err.friendlyMessage) {
        setError(err.friendlyMessage);
      } else {
        setError('Failed to load courses. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <AppLayout>
        <div className="bg-gray-900 pt-16 md:pt-20 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <p className="text-white text-lg">Loading courses...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-gray-900 pt-16 md:pt-20 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={fetchCourses}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gray-900 pt-16 md:pt-20 pb-20 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-6 py-10 pt-16">
          <h1 className="text-3xl font-bold mb-12 text-white">Explore Our Courses</h1>

          {courses.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">No courses available at the moment.</p>
            </div>
          ) : (
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

                    {/* Price Badge */}
                  {/* {course.price > 0 && (
                      <div className="mt-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          ${course.price}
                        </span>
                      </div>
                    )}   */}

                    {/* Buttons Container */}
                    <div className="mt-6 flex items-center gap-3">
                      <span className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full shadow hover:bg-indigo-700 transition">
                        View Details →
                      </span>
                      {/* <SignUpButton2 /> */}
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