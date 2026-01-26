"use client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { api, Course, handleApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Courses from "@/components/headercourses/HeaderCourse";
import { ExpertButton } from "@/components/button/Button";

export default function CoursePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrolled: boolean;
    enrollment: any;
  } | null>(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  
  // Currency detection states
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [currencyDetected, setCurrencyDetected] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  // Detect currency on component mount
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/detect-currency`);
        const data = await response.json();
        
        console.log('💱 Currency detected:', data);
        
        setCurrency(data.currency);
        setDetectedLocation(data.country);
        setCurrencyDetected(true);
      } catch (error) {
        console.error('Failed to detect currency:', error);
        setCurrency('USD');
        setDetectedLocation('Unknown');
        setCurrencyDetected(true);
      }
    };

    detectCurrency();
  }, []);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        checkEnrollmentStatus();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getById(id as string);
      setCourse(data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!id) return;
    
    try {
      setCheckingEnrollment(true);
      const status = await api.enrollment.checkStatus(id as string);
      setEnrollmentStatus(status);
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollClick = async () => {
    if (!user) {
      sessionStorage.setItem('intended_course', id as string);
      sessionStorage.setItem('intended_course_name', course?.title || '');
      router.push('/user/auth/login');
      return;
    }

    try {
      setEnrolling(true);
      setError(null);

      console.log('🚀 Enrolling in course:', id);

      const response = await api.enrollment.enroll(
        id as string,
        'self_paced',
        'onetime'
      );

      console.log('✅ Enrollment successful:', response);
      router.push(`/user/payment/${response.enrollment_id}`);
      
    } catch (error: any) {
      console.error('❌ Enrollment failed:', error);
      
      if (error.response?.status === 409) {
        alert('You are already enrolled in this course!');
        router.push('/user/dashboard?tab=your-course');
      } else if (error.response?.status === 200 && error.response?.data?.enrollment_id) {
        console.log('📋 Redirecting to existing enrollment payment');
        router.push(`/user/payment/${error.response.data.enrollment_id}`);
      } else if (error.response?.data?.enrollment_id) {
        router.push(`/user/payment/${error.response.data.enrollment_id}`);
      } else {
        const errorMessage = handleApiError(error);
        setError(errorMessage);
        alert(errorMessage || 'Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Get the appropriate price based on currency
  const getDisplayPrice = () => {
    if (!course) return 0;
    
    const price = currency === 'NGN' 
      ? course.self_paced_price_ngn 
      : course.self_paced_price_usd;
    
    return parseFloat(price?.toString() || '0');
  };

  if (!currencyDetected || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">
              {!currencyDetected ? 'Detecting your location...' : 'Loading course...'}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <button onClick={() => router.push('/courses/courses')} className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700">
            Back to Courses
          </button>
        </div>
      </AppLayout>
    );
  }

  const displayPrice = getDisplayPrice();

  return (
    <AppLayout>
      <div className="background pt-16 md:pt-20">
        <Courses variant="black" />
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-1">
          {/* Hero Section */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-start mb-8 md:mb-8 lg:pt-20">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                {course.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                {course.description}
              </p>
              
              {/* Price Display with Currency */}
              {displayPrice > 0 && (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-indigo-600">
                    {currency === 'NGN' ? '₦' : '$'}{displayPrice.toLocaleString()}
                  </div>
                  {detectedLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🌍</span>
                      <span>Price for {detectedLocation} ({currency})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                {enrollmentStatus?.isEnrolled ? (
                  <button 
                    onClick={() => router.push(`/user/courses/${course.course_id}`)} 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                  >
                    Continue Learning 
                  </button>
                ) : (
                  <button 
                    onClick={handleEnrollClick} 
                    disabled={checkingEnrollment || enrolling} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Enrolling...
                      </span>
                    ) : user ? (
                      'Purchase Course'
                    ) : (
                      'Get Started'
                    )}
                  </button>
                )}
                <ExpertButton />
              </div>
            </div>
            <div className="flex justify-center md:justify-end gap-3 sm:gap-8 pt-6 md:pt-0">
              <img src={course.hero_image || '/images/default-course.jpg'} alt={course.title} className="rounded-2xl w-40 h-60 sm:w-40 sm:h-56 md:w-52 md:h-72 lg:w-60 lg:h-100 object-cover -mt-8"/>
              <img src={course.secondary_image || course.hero_image || '/images/default-course.jpg'} alt={course.title} className="rounded-2xl w-40 h-60 sm:w-40 sm:h-56 md:w-52 md:h-72 lg:w-60 lg:h-100 object-cover"/>
            </div>
          </div>
        </div>
      </div>

      {/* Tools and Technology */}
      {course.tools && course.tools.length > 0 && (
        <section className="max-w-[1530px] mx-auto px-6 py-12 mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Key Tools & Technologies
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 bg-white py-4">
            {course.tools.map((tool) => (
              <img key={tool.id} src={tool.icon} alt={tool.name} className="w-16 h-16 md:w-24 md:h-22 object-contain"/>
            ))}
          </div>
        </section>
      )}

      {/* What You Will Learn */}
      {course.learnings && course.learnings.length > 0 && (
        <section className="max-w-[1530px] mx-auto px-6 mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">
            What you will learn
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {course.learnings.map((learning) => (
              <div key={learning.id} className="bg-gray-200 p-5 rounded-3xl text-gray-900 text-lg leading-relaxed">
                {learning.learning_point}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Benefits */}
      {course.benefits && course.benefits.length > 0 && (
        <section className="bg-gray-900 text-white px-4 md:px-12 py-12 mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-8 items-center py-6 md:py-6">
            <div className="md:mb-4 md:px-12">
              <span className="text-lg md:text-2xl text-gray-100 tracking-wide">
                Project
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10">
              {course.project || 'Complete AI-powered solution with automation'}
            </h2>
          </div>
          <div className="bg-gray-700 pt-8 rounded-3xl">
            <div className="flex flex-col md:flex-row items-start md:items-start justify-between px-6">
              <h3 className="text-xl font-semibold mb-4 md:mb-0 md:mt-12">
                Key Benefits
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {course.benefits.map((benefit) => (
                  <div key={benefit.id} className="flex flex-col py-4">
                    <div className="flex flex-col w-full md:w-2/3">
                      <span className="text-white text-3xl">★</span>
                      <div>
                        <h4 className="font-bold text-xl">{benefit.title}</h4>
                        <p className="text-sm text-gray-100 mt-1 text-xl">
                          {benefit.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Career Path */}
      {course.career_paths && course.career_paths.length > 0 && (
        <section className="max-w-[1530px] mx-auto px-6 mb-16">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Career Path & Progression
          </h2>
          <p className="text-center text-gray-600 mb-10">
            We equip you with the skills and guidance to grow and succeed in your career.
          </p>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {['entry', 'mid', 'advanced', 'specialized'].map((level) => {
                const positions = course.career_paths
                  ?.filter((cp) => cp.level === level)
                  .map((cp) => cp.position)
                  .join(', ');
                
                if (!positions) return null;

                const icons: Record<string, string> = {
                  entry: '📋',
                  mid: '⚙️',
                  advanced: '🎯',
                  specialized: '🔧',
                };

                return (
                  <div key={level} className="flex items-start gap-4 bg-gray-200 p-5 rounded-xl">
                    <div className="bg-gray-200 p-2 rounded-lg mt-1">
                      <span className="text-gray-600 text-sm">{icons[level]}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 capitalize">
                        {level === 'specialized' ? 'Specialized Roles' : `${level} Level`}
                      </h3>
                      <p className="text-lg text-gray-600">{positions}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <img src="/images/career-path.png" alt="Career path" className="rounded-2xl w-full lg:h-[500px] object-cover shadow-lg" />
            </div>
          </div>
        </section>
      )}

      {/* Industries */}
      {course.industries && course.industries.length > 0 && (
        <section className="max-w-[1530px] mx-auto px-6 mb-16">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Industries & Applications
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Discover how AI can seamlessly create these solutions starting you from fresh applications.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {course.industries.map((industry) => (
              <div key={industry.id} className="bg-gray-200 p-6 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-gray-600">📄</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-lg">
                      {industry.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {industry.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Salary Expectations */}
      {course.salary && (
        <section className="max-w-[1530px] mx-auto px-6 mb-16">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Salary Expectations
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Global Remote Opportunities
          </p>
          <div className="grid md:grid-cols-3 bg-gray-200 rounded-2xl">
            <div className="p-8 text-center relative">
              <p className="text-gray-600 text-lg font-medium mb-2">Entry level:</p>
              <p className="text-gray-900 font-semibold">{course.salary.entry_level}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-black md:bottom-auto md:top-1/2 md:left-auto md:right-0 md:-translate-x-0 md:-translate-y-1/2 md:w-px md:h-2/3"></div>
            </div>
            <div className="p-8 text-center relative">
              <p className="text-gray-600 text-lg font-medium mb-2">Mid level:</p>
              <p className="text-gray-900 font-semibold">{course.salary.mid_level}</p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-black md:bottom-auto md:top-1/2 md:left-auto md:right-0 md:-translate-x-0 md:-translate-y-1/2 md:w-px md:h-2/3"></div>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-600 text-lg font-medium mb-2">Senior level:</p>
              <p className="text-gray-900 font-semibold">{course.salary.senior_level}</p>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </AppLayout>
  );
}