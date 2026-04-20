// pages/courses/[id].tsx
"use client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { api, Course, handleApiError } from "@/lib/api";
import { getCourses } from "@/lib/courseCache";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Courses from "@/components/headercourses/HeaderCourse";
import { ExpertButton } from "@/components/button/Button";
import { ArrowRight } from "lucide-react";
import { ScholarshipBadge } from '@/components/Scholarship/ScholarshipBadge';

const BRAND = "#4A3AFF";

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

  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [currencyDetected, setCurrencyDetected] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  useEffect(() => {
    getCourses().catch(() => {});
  }, []);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/detect-currency`
        );
        const data = await response.json();
        setCurrency(data.currency);
        setDetectedLocation(data.country);
      } catch {
        setCurrency("USD");
        setDetectedLocation("Unknown");
      } finally {
        setCurrencyDetected(true);
      }
    };
    detectCurrency();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchCourse();
    if (user) checkEnrollmentStatus();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getById(id as string);
      setCourse(data);
    } catch (error) {
      console.error("Failed to fetch course:", error);
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
      console.error("Failed to check enrollment:", error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollClick = async () => {
    if (!user) {
      sessionStorage.setItem("intended_course", id as string);
      sessionStorage.setItem("intended_course_name", course?.title || "");
      router.push("/user/auth/register");
      return;
    }
    try {
      setEnrolling(true);
      setError(null);
      const response = await api.enrollment.enroll(id as string, "self_paced", "onetime");
      router.push(`/user/payment/${response.enrollment_id}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert("You are already enrolled in this course!");
        router.push("/user/dashboard?tab=your-course");
      } else if (error.response?.data?.enrollment_id) {
        router.push(`/user/payment/${error.response.data.enrollment_id}`);
      } else {
        const errorMessage = handleApiError(error);
        setError(errorMessage);
        alert(errorMessage || "Failed to enroll. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const getDisplayPrice = () => {
    if (!course) return 0;
 
    // ✅ FIX: Pick the lowest non-zero price from whichever tracks are enabled,
    //    so courses that don't offer self_paced still show a price.
    const candidates: number[] = [];
 
    if (course.offers_self_paced) {
      const p = parseFloat(
        (currency === 'NGN' ? course.self_paced_price_ngn : course.self_paced_price_usd)?.toString() || '0'
      );
      if (p > 0) candidates.push(p);
    }
 
    if (course.offers_group_mentorship) {
      const p = parseFloat(
        (currency === 'NGN' ? course.group_mentorship_price_ngn : course.group_mentorship_price_usd)?.toString() || '0'
      );
      if (p > 0) candidates.push(p);
    }
 
    if (course.offers_one_on_one) {
      const p = parseFloat(
        (currency === 'NGN' ? course.one_on_one_price_ngn : course.one_on_one_price_usd)?.toString() || '0'
      );
      if (p > 0) candidates.push(p);
    }
 
    // Fall back to legacy price_usd / price_ngn if none of the track prices are set
    if (candidates.length === 0) {
      const fallback = parseFloat(
        (currency === 'NGN' ? course.price_ngn : course.price_usd)?.toString() || '0'
      );
      return fallback;
    }
 
    return Math.min(...candidates);
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (!currencyDetected || loading) {
    return (
      <AppLayout>
        <style>{`
          .spinner { width:48px; height:48px; border:3px solid rgba(74,58,255,0.2); border-top-color:${BRAND}; border-radius:50%; animation:spin 0.8s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
          <div className="text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {!currencyDetected ? "Detecting your location…" : "Loading course…"}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
            <button
              onClick={() => router.push("/courses/courses")}
              className="text-white font-semibold px-6 py-3 transition-all"
              style={{
                borderRadius: "2rem 0.75rem 2rem 0.75rem",
                background: BRAND,
                boxShadow: `0 8px 24px ${BRAND}44`,
              }}
            >
              Back to Courses
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const displayPrice = getDisplayPrice();

  return (
    <AppLayout>
      <style>{`
        // body, .course-detail-root { background: #080808; }

        /* ── Shared card shape ── */
        .dc-card {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(15,15,15,0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.7);
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .dc-card:hover {
          border-color: ${BRAND}55;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${BRAND}22;
        }

        /* ── Brand button ── */
        .dc-btn-brand {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          background: ${BRAND};
          color: #fff;
          font-weight: 700;
          padding: 0.75rem 2rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .dc-btn-brand:hover {
          box-shadow: 0 8px 28px ${BRAND}55;
          transform: translateY(-2px);
        }
        .dc-btn-brand:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Outline button ── */
        .dc-btn-outline {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 2px solid ${BRAND}55;
          color: ${BRAND};
          font-weight: 600;
          padding: 0.75rem 2rem;
          transition: background 0.3s, border-color 0.3s;
        }
        .dc-btn-outline:hover {
          background: ${BRAND}15;
          border-color: ${BRAND};
        }

        /* ── Learning pill ── */
        .dc-pill {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 1rem 1.25rem;
          color: #d1d5db;
          font-size: 0.95rem;
          line-height: 1.5;
          transition: border-color 0.2s, background 0.2s;
        }
        .dc-pill:hover {
          border-color: ${BRAND}44;
          background: ${BRAND}0a;
        }

        /* ── Section header accent ── */
        .dc-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: ${BRAND};
          margin-bottom: 0.5rem;
        }

        /* ── Divider ── */
        .dc-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); }

        /* ── Tool logo hover ── */
        .dc-tool {
          padding: 1rem;
          border-radius: 1rem 0.5rem 1rem 0.5rem;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .dc-tool:hover { border-color: ${BRAND}44; background: ${BRAND}0d; transform: translateY(-3px); }

        /* ── Career level card ── */
        .dc-career {
          border-radius: 1.5rem 0.5rem 1.5rem 0.5rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 1.25rem;
          transition: border-color 0.25s, background 0.25s;
        }
        .dc-career:hover { border-color: ${BRAND}44; background: ${BRAND}08; }

        /* ── Industry card ── */
        .dc-industry {
          border-radius: 1.5rem 0.5rem 1.5rem 0.5rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          padding: 1.5rem;
          transition: border-color 0.25s, background 0.25s;
        }
        .dc-industry:hover { border-color: ${BRAND}44; background: ${BRAND}08; }

        /* ── Salary block ── */
        .dc-salary-grid {
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(15,15,15,0.92);
          overflow: hidden;
        }
        .dc-salary-cell { border-right: 1px solid rgba(255,255,255,0.07); }
        .dc-salary-cell:last-child { border-right: none; }

        /* ── Benefits dark strip ── */
        .dc-benefits-bg {
          // background: linear-gradient(135deg, #0a0a0a 0%, #0f0a1e 100%);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .dc-benefit-card {
          border-radius: 1.5rem 0.5rem 1.5rem 0.5rem;
          border: 1px solid rgba(255,255,255,0.08);
          // background: rgba(255,255,255,0.04);
          padding: 1.5rem;
          transition: border-color 0.25s, background 0.25s;
        }
        .dc-benefit-card:hover { border-color: ${BRAND}44; background: ${BRAND}08; }
      `}</style>

      <div className="course-detail-root" style={{ background: "", minHeight: "100vh" }}>
        <Courses variant="white" />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-[1230px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6">
              <p className="dc-section-label">Course Details</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white">
                {course.title}
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {displayPrice > 0 && (
                  <div
                    className="dc-card flex items-center gap-4 px-6 py-4"
                    style={{ borderRadius: "2rem 0.75rem 2rem 0.75rem" }}
                  >
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                        Price
                      </p>
                      <p className="text-3xl font-bold" style={{ color: BRAND }}>
                        {currency === "NGN" ? "₦" : "$"}
                        {displayPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <ScholarshipBadge
                  courseId={course.course_id}
                  isLoggedIn={!!user}
                  showCta={!enrollmentStatus?.isEnrolled}
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 text-sm text-red-400"
                  style={{
                    borderRadius: "1rem 0.5rem 1rem 0.5rem",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex flex-row flex-wrap items-center gap-3 pt-2">
                {enrollmentStatus?.isEnrolled ? (
                  <button
                    onClick={() => router.push(`/user/courses/${course.course_id}`)}
                    className="dc-btn-brand"
                    style={{ background: "#16a34a" }}
                  >
                    Continue Learning <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    disabled={checkingEnrollment || enrolling}
                    className="dc-btn-brand"
                  >
                    {enrolling ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enrolling…
                      </span>
                    ) : user ? (
                      <>Purchase Course <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <>Get Started <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
                <ExpertButton />
              </div>
            </div>

            {/* Right — hero images */}
            <div className="flex justify-center md:justify-end gap-4">
              <img
                src={course.hero_image || "/images/default-course.jpg"}
                alt={course.title}
                className="object-cover -mt-8"
                style={{
                  width: "clamp(130px,18vw,220px)",
                  height: "clamp(200px,28vw,360px)",
                  borderRadius: "2rem 0.75rem 2rem 0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 40px ${BRAND}22`,
                }}
              />
              <img
                src={course.secondary_image || course.hero_image || "/images/default-course.jpg"}
                alt={course.title}
                className="object-cover"
                style={{
                  width: "clamp(130px,18vw,220px)",
                  height: "clamp(200px,28vw,360px)",
                  borderRadius: "2rem 0.75rem 2rem 0.75rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: `0 30px 60px rgba(0,0,0,0.7)`,
                }}
              />
            </div>
          </div>
        </section>

        {/* ── Tools & Technologies ──────────────────────────────────────── */}
        {course.tools && course.tools.length > 0 && (
          <section className="py-10 px-6">
            <div className="max-w-[1230px] mx-auto">
              <p className="dc-section-label text-center">Stack</p>
              <h2 className="text-3xl font-bold text-center text-white mb-12">
                Key Tools &amp; Technologies
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-6">
                {course.tools.map((tool) => (
                  <div key={tool.id} className="dc-tool flex flex-col items-center gap-2">
                    <img src={tool.icon} alt={tool.name} className="w-12 h-12 object-contain" />
                    <span className="text-xs text-gray-500 font-medium">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <hr className="dc-divider max-w-screen-xl mx-auto" />

        {/* ── What You Will Learn ───────────────────────────────────────── */}
        {course.learnings && course.learnings.length > 0 && (
          <section className="py-16 px-6">
            <div className="max-w-[1230px] mx-auto">
              <p className="dc-section-label text-center">Curriculum</p>
              <h2 className="text-3xl font-bold text-center text-white mb-12">
                What you will learn
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {course.learnings.map((learning) => (
                  <div key={learning.id} className="dc-pill flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${BRAND}30` }}
                    >
                      <svg className="w-3 h-3" style={{ color: BRAND }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {learning.learning_point}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Key Benefits ─────────────────────────────────────────────── */}
        {course.benefits && course.benefits.length > 0 && (
          <section className="dc-benefits-bg py-6 px-6">
            <div className="max-w-[1230px] mx-auto">
              <div className="mb-12">
                <p className="dc-section-label">Project</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {course.project || "Complete AI-powered solution with automation"}
                </h2>
              </div>
              <div>
                <p className="dc-section-label mb-6">Key Benefits</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.benefits.map((benefit) => (
                    <div key={benefit.id} className="dc-benefit-card flex gap-4">
                      <span style={{ color: BRAND }} className="text-2xl flex-shrink-0">★</span>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1">{benefit.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{benefit.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Career Path ───────────────────────────────────────────────── */}
        {course.career_paths && course.career_paths.length > 0 && (
          <section className="py-6 px-6">
            <div className="max-w-[1230px] mx-auto">
              <p className="dc-section-label text-center">Growth</p>
              <h2 className="text-3xl font-bold text-center text-white mb-3">
                Career Path &amp; Progression
              </h2>
              <p className="text-center text-gray-500 mb-12">
                We equip you with the skills and guidance to grow and succeed in your career.
              </p>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  {(["entry", "mid", "advanced", "specialized"] as const).map((level) => {
                    const positions = course.career_paths
                      ?.filter((cp) => cp.level === level)
                      .map((cp) => cp.position)
                      .join(", ");
                    if (!positions) return null;
                    const icons: Record<string, string> = {
                      entry: "📋", mid: "⚙️", advanced: "🎯", specialized: "🔧",
                    };
                    return (
                      <div key={level} className="dc-career flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${BRAND}20` }}
                        >
                          <span>{icons[level]}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-1 capitalize">
                            {level === "specialized" ? "Specialized Roles" : `${level} Level`}
                          </h3>
                          <p className="text-gray-400 text-sm">{positions}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <img
                    src="/images/career-path.png"
                    alt="Career path"
                    className="w-full object-cover shadow-2xl"
                    style={{
                      borderRadius: "2rem 0.75rem 2rem 0.75rem",
                      height: "clamp(300px, 40vw, 500px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Industries ────────────────────────────────────────────────── */}
        {course.industries && course.industries.length > 0 && (
          <section className="py-6 px-6">
            <div className="max-w-[1230px] mx-auto">
              <p className="dc-section-label text-center">Applications</p>
              <h2 className="text-3xl font-bold text-center text-white mb-3">
                Industries &amp; Applications
              </h2>
              <p className="text-center text-gray-500 mb-12">
                Discover how this course translates into real-world impact across industries.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {course.industries.map((industry) => (
                  <div key={industry.id} className="dc-industry">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${BRAND}20` }}
                      >
                        <span>📄</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">{industry.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{industry.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Salary Expectations ───────────────────────────────────────── */}
        {course.salary && (
          <section className="py-6 px-6">
            <div className="max-w-[1230px] mx-auto">
              <p className="dc-section-label text-center">Earnings</p>
              <h2 className="text-3xl font-bold text-center text-white mb-3">
                Salary Expectations
              </h2>
              <p className="text-center text-gray-500 mb-12">Global Remote Opportunities</p>
              <div className="dc-salary-grid grid md:grid-cols-3 max-w-3xl mx-auto">
                {[
                  { label: "Entry level", value: course.salary.entry_level },
                  { label: "Mid level",   value: course.salary.mid_level   },
                  { label: "Senior level",value: course.salary.senior_level },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`p-8 text-center ${i < arr.length - 1 ? "dc-salary-cell" : ""}`}
                  >
                    <p className="text-gray-500 text-sm font-medium mb-2">{row.label}</p>
                    <p className="text-white font-bold text-lg">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </AppLayout>
  );
}