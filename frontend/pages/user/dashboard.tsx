// pages/user/dashboard.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api, Course, CourseEnrollment } from "@/lib/api";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tab } = router.query;
  
  const [activeTab, setActiveTab] = useState("your-course");
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (tab === 'your-course') {
      setActiveTab('your-course');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        router.replace('/user/dashboard', undefined, { shallow: true });
      }, 5000);
    }
  }, [tab]);

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (error) {}
  };

  const fetchEnrollments = async () => {
    try {
      const data = await api.enrollment.getUserEnrollments();
      setEnrollments(data.enrollments);
    } catch (error) {}
    finally {
      setLoading(false);
    }
  };

  const getEnrolledCoursesWithDetails = () => {
    return enrollments.map((enrollment) => {
      const courseData = courses.find(
        (c) => String(c.course_id ?? c.id) === String(enrollment.course_id)
      );
      return { ...enrollment, courseData };
    });
  };

  // ── Helper: is a catalogue course already enrolled & paid? ─────────────
  const getEnrollmentForCourse = (courseId: number | string) => {
    return enrollments.find(
      (e) =>
        String(e.course_id) === String(courseId) &&
        e.payment_status === "completed"
    ) ?? null;
  };

  const enrolledCoursesWithDetails = getEnrolledCoursesWithDetails();

  // ── Payment summary for hero section ───────────────────────────────────
  // ── Payment summary for hero section ───────────────────────────────────
  const pendingEnrollments = enrollments.filter(
    (e) => e.payment_status !== "completed"
  );

  const installmentEnrollments = enrollments.filter(
    (e) =>
      e.payment_type === "installment" &&
      e.next_payment_due &&
      e.payment_status !== "completed"
  );

  const nextInstallment =
    installmentEnrollments.sort(
      (a, b) =>
        new Date(a.next_payment_due!).getTime() -
        new Date(b.next_payment_due!).getTime()
    )[0] ?? null;

  const daysUntilNext = nextInstallment
    ? Math.ceil(
        (new Date(nextInstallment.next_payment_due!).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const hasPendingPayments = pendingEnrollments.length > 0;
  const hasAnyEnrollment = enrollments.length > 0;

  return (
    <UserDashboardLayout>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Payment confirmed! You're enrolled.
        </div>
      )}

      <div className="max-w-[1500px] mx-auto p-4 pt-25">

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        {hasAnyEnrollment ? (
          /* Payment Info Hero — shown when the student has at least one enrollment */
          <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 rounded-3xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Left — greeting */}
              <div className="max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-600 mb-1">
                  My Learning
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Keep up the momentum — your skills are growing every day.
                </p>
              </div>

              {/* Right — payment stat cards */}
              <div className="flex flex-wrap gap-4 flex-1 justify-end">
                {/* Courses enrolled */}
                {/* Courses Enrolled — show ALL enrollments, note pending ones */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 min-w-[150px] flex flex-col gap-1 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Courses Enrolled
                  </p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {enrollments.length}  {/* ✅ all enrollments, not just completed */}
                  </p>
                  <p className="text-xs text-gray-400">
                    {pendingEnrollments.length > 0
                      ? `${pendingEnrollments.length} payment${pendingEnrollments.length > 1 ? "s" : ""} pending`
                      : "All paid & active"}
                  </p>
                </div>

                {/* Payment Status — check ALL pending, not just installments */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 min-w-[160px] flex flex-col gap-1 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Payment Status
                  </p>
                  {nextInstallment ? (
                    <>
                      <p className="text-4xl font-bold text-amber-500">
                        {daysUntilNext !== null && daysUntilNext <= 0
                          ? "Due"
                          : daysUntilNext === 1
                          ? "1 day"
                          : `${daysUntilNext}d`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {daysUntilNext !== null && daysUntilNext <= 0
                          ? "Next installment overdue"
                          : "Until next payment"}
                      </p>
                    </>
                  ) : hasPendingPayments ? (  /* ✅ catch pending one-time payments too */
                    <>
                      <p className="text-4xl font-bold text-yellow-500">!</p>
                      <p className="text-xs text-gray-400">
                        {pendingEnrollments.length} payment{pendingEnrollments.length > 1 ? "s" : ""} required
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-green-500">✓</p>
                      <p className="text-xs text-gray-400">All payments up to date</p>
                    </>
                  )}
                </div>

                {/* Payment Plan — "Fully paid" only when truly no pending payments */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 min-w-[150px] flex flex-col gap-1 shadow-sm">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Payment Plan
                  </p>
                  {installmentEnrollments.length > 0 ? (
                    <>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                        <p className="text-base font-bold text-gray-800">Installment</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {installmentEnrollments.length} active plan
                        {installmentEnrollments.length > 1 ? "s" : ""}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${hasPendingPayments ? "bg-yellow-400" : "bg-green-400"} inline-block`}></span>
                        <p className="text-base font-bold text-gray-800">One-time</p>
                      </div>
                      {/* ✅ Only say "Fully paid" when there are truly no pending payments */}
                      <p className="text-xs text-gray-400">
                        {hasPendingPayments ? "Payment required" : "Fully paid"}
                      </p>
                    </>
                  )}
                </div>
                {/* Next due date detail — only for installment students */}
                {nextInstallment && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 min-w-[180px] flex flex-col gap-1 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Next Due Date
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(nextInstallment.next_payment_due!).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug">
                      {nextInstallment.course_name ||
                        `Course #${nextInstallment.course_id}`}
                    </p>
                    <button
                      onClick={() =>
                        router.push(`/user/payment/${nextInstallment.id}`)
                      }
                      className="mt-2 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full font-semibold transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Default hero — shown when not enrolled in anything yet */
          <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 rounded-3xl p-2 md:p-2 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="max-w-xl text-center md:text-left md:p-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Sharpen your skills with our courses
              </h1>
              <p className="text-gray-700 text-base md:text-lg">
                Stay competitive in today's market by exploring flexible courses
                that fit your schedule while equipping you with the tools to grow.
              </p>
            </div>
            <div className="flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop"
                alt="Student with laptop"
                className="w-full max-w-sm md:w-96 md:h-64 object-cover rounded-2xl"
              />
            </div>
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8 bg-gray-200 p-1 rounded-xl w-[335px]">
          <button
            onClick={() => setActiveTab("your-course")}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "your-course"
                ? "bg-white text-gray-900 shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Your Courses
          </button>
          <button
            onClick={() => setActiveTab("catalogue")}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "catalogue"
                ? "bg-white text-gray-900 shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Explore Courses
          </button>
        </div>

        {/* ── Course Content ────────────────────────────────────────────── */}
        {activeTab === "catalogue" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
              <Link
                href="/courses/courses"
                className="text-indigo-600 font-bold text-xl border-2 rounded-xl px-3 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.slice(0, 4).map((course) => {
                  const courseId = course.course_id ?? course.id;
                  const enrollment = getEnrollmentForCourse(courseId);
                  const isEnrolled = !!enrollment;

                  return (
                    <div
                      key={course.id}
                      onClick={() => {
                        if (isEnrolled) {
                          router.push({
                            pathname: "/user/resource",
                            query: { courseId: courseId },
                          });
                        } else {
                          router.push(`/courses/${courseId}`);
                        }
                      }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer p-2 relative"
                    >
                      {/* Enrolled badge */}
                      {isEnrolled && (
                        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Enrolled
                        </div>
                      )}

                      <div
                        className="h-40 bg-cover bg-center rounded-lg"
                        style={{
                          backgroundImage: `url(${
                            course.hero_image || "/images/default-course.jpg"
                          })`,
                        }}
                      ></div>

                      <div className="">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 pt-4">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 pt-4">
                          {course.description}
                        </p>

                        {/* Continue learning CTA for enrolled courses */}
                        {isEnrolled && (
                          <div className="mt-3 mb-1">
                            <span className="inline-block w-full text-center text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl py-2 transition-colors">
                              Continue Learning →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <Link
                  href="/courses/courses"
                  className="text-indigo-600 font-bold text-xl text-center border-2 rounded-xl px-3 hover:text-indigo-700 flex items-center justify-center"
                >
                  View all
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading your courses...</p>
              </div>
            ) : enrolledCoursesWithDetails.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Enrolled Courses ({enrolledCoursesWithDetails.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCoursesWithDetails.map((enrollment) => {
                    const course = enrollment.courseData;

                    return (
                      <div
                        key={enrollment.id}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow p-2"
                      >
                        <div
                          className="h-40 bg-cover bg-center relative rounded-xl"
                          style={{
                            backgroundImage: `url(${
                              course?.hero_image || "/images/default-course.jpg"
                            })`,
                          }}
                        >
                          {enrollment.payment_status === "completed" ? (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Enrolled
                            </div>
                          ) : (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Payment Pending
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {course?.title || enrollment.course_name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                            {course?.description || "No course description available."}
                          </p>

                          <div className="mb-4">
                            {enrollment.payment_status === "completed" ? (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  Enrolled:{" "}
                                  {new Date(
                                    enrollment.enrollment_date
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-green-600 font-semibold">
                                  ✓ Paid
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Status:</span>
                                  <span className="text-yellow-600 font-semibold">
                                    Payment Required
                                  </span>
                                </div>
                                {enrollment.payment_type === "installment" &&
                                  enrollment.next_payment_due && (
                                    <div className="text-xs text-gray-500">
                                      Next payment:{" "}
                                      {new Date(
                                        enrollment.next_payment_due
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>

                          {enrollment.payment_status === "completed" ? (
                            <button
                              onClick={() =>
                                router.push({
                                  pathname: "/user/resource",
                                  query: { courseId: enrollment.course_id },
                                })
                              }
                              className="w-full bg-white border-2 border-blue-600 p-2 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded-3xl font-medium transition-colors"
                            >
                              Continue Learning
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                router.push(`/user/payment/${enrollment.id}`)
                              }
                              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-3xl font-medium transition-colors"
                            >
                              Complete Payment
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  You haven't enrolled in any courses yet
                </h2>
                <p className="text-gray-500 mt-1 mb-6">
                  Start your learning journey today!
                </p>
                <button
                  onClick={() => setActiveTab("catalogue")}
                  className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </UserDashboardLayout>
  );
}