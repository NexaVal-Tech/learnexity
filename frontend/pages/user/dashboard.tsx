import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api, Course, CourseEnrollment } from "@/lib/api";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tab } = router.query; // Get tab from URL query
  
  const [activeTab, setActiveTab] = useState("catalogue");
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Set active tab from URL query parameter and show success message
  useEffect(() => {
    if (tab === 'your-course') {
      setActiveTab('your-course');
      setShowSuccessToast(true);
      
      // Hide toast after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
        // Clean up URL
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
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const data = await api.enrollment.getUserEnrollments();
      console.log('Fetched enrollments:', data.enrollments);

      // Filter only completed payments
      const paidEnrollments = data.enrollments.filter(
        (e: CourseEnrollment) => e.payment_status === 'completed'
      );
      setEnrollments(paidEnrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
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


  const enrolledCoursesWithDetails = getEnrolledCoursesWithDetails();

  return (
    <UserDashboardLayout>
      <div className="max-w-[1500px] mx-auto p-4 pt-25">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-blue-200 rounded-3xl p-2 md:p-2 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="max-w-xl text-center md:text-left md:p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sharpen your skills with our courses
            </h1>
            <p className="text-gray-700 text-base md:text-lg">
              Stay competitive in today's market by exploring flexible courses that fit your schedule while equipping you with the tools to grow.
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

        {/* Tabs */}
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
            Course Catalogue
          </button>
        </div>

        {/* Course Content */}
        {activeTab === "catalogue" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
              <Link href="/courses/courses" className="text-indigo-600 font-bold text-xl border-2 rounded-xl px-3 hover:text-indigo-700">
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
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} onClick={() => router.push(`/courses/${course.course_id}`)} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer p-2">
                    <div className="h-40 bg-cover bg-center rounded-lg" style={{backgroundImage: `url(${course.hero_image || '/images/default-course.jpg'})`,}}></div>

                    <div className="">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 pt-4">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 pt-4">
                        {course.description}
                      </p>
                    </div>
                  </div>
                ))}

                <Link href="/courses/courses" className="text-indigo-600 font-bold text-xl text-center border-2 rounded-xl px-3 hover:text-indigo-700">
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
                      <div key={enrollment.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow p-2">
                        <div className="h-40 bg-cover bg-center relative rounded-xl" style={{backgroundImage: `url(${course?.hero_image || '/images/default-course.jpg'})`,}}>
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Enrolled
                          </div>
                        </div>

                        <div className="p-2">
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {course?.title || enrollment.course_name}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                            {course?.description || 'No course description available.'}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-500">
                              Enrolled:{' '}
                              {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </div>
                          </div>

                          <button onClick={() => router.push(`/user/courses/${enrollment.course_id}`)} className="w-50 bg-white border-2 border-blue-600 p-2 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded-3xl font-medium transition-colors">
                            Continue Learning
                          </button>
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
                  onClick={() => setActiveTab('catalogue')}
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