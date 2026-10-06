// pages/courses/[id].tsx
//
// Course details page. Layout: dark hero (pathway tag, title, description,
// course images), then a two-column body — course content on the left,
// a sticky "Program Structure" / price / Apply card on the right.
// Data, enrolment and payment flow are unchanged.
"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { api, Course, handleApiError } from "@/lib/api";
import { getCourses } from "@/lib/courseCache";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import {
  ArrowLeft, BadgeCheck, CalendarDays, Check, CircleCheck, ClipboardCheck, Clock,
  Flame, Gauge, Headset, Monitor, Quote, Star, Briefcase, Factory, PlayCircle,
} from "lucide-react";
import {
  API_URL, BRAND, PATHWAYS, imageUrl, pathwayForCourse, type PathwayKey, type Track,
} from "@/components/catalog/pathways";
import { CatalogTheme } from "@/components/catalog/CatalogTheme";
import { CmsImage, SOCIAL_ICONS } from "@/components/cms/ui";
import { formatMoney } from "@/lib/format";
import { useCmsGlobals } from "@/contexts/CmsGlobalsContext";
import { fillCopy } from "@/lib/cms/globalDefaults";

const HERO_BG = "#140c3d";

const PATHWAY_TAG: Record<PathwayKey, { bg: string; border: string; color: string }> = {
  flex: { bg: "rgba(59,130,246,0.25)", border: "#3b82f6", color: "#bfdbfe" },
  accelerator: { bg: "rgba(147,51,234,0.3)", border: "#a855f7", color: "#e9d5ff" },
  deeptech: { bg: "rgba(74,58,255,0.3)", border: "#6d5dff", color: "#c7d2fe" },
  free: { bg: "rgba(5,150,105,0.3)", border: "#10b981", color: "#a7f3d0" },
};

const NEXT_STEPS = ["Employment", "Freelance Projects", "Consulting", "Internships", "Entrepreneurship", "Further Specialization"];
const INCLUDES = [
  "Structured instruction",
  "Practical projects & Assessments",
  "Mentorship/support",
  "Portfolio development",
  "2 months global certifications support",
];
const CAREER_LEVELS = [
  { key: "entry", label: "Entry Level" },
  { key: "mid", label: "Mid Level" },
  { key: "advanced", label: "Advanced Level" },
  { key: "specialized", label: "Specialized Roles" },
] as const;

function offersTrack(course: Course, track: Track): boolean {
  switch (track) {
    case "self_paced": return !!course.offers_self_paced;
    case "intermediate": return !!course.offers_intermediate;
    case "group_mentorship": return !!course.offers_group_mentorship;
    case "one_on_one": return !!course.offers_one_on_one;
  }
}

function trackPrice(course: Course, track: Track, currency: "USD" | "NGN"): number {
  const raw =
    currency === "NGN"
      ? { self_paced: course.self_paced_price_ngn, intermediate: course.intermediate_price_ngn, group_mentorship: course.group_mentorship_price_ngn, one_on_one: course.one_on_one_price_ngn }[track]
      : { self_paced: course.self_paced_price_usd, intermediate: course.intermediate_price_usd, group_mentorship: course.group_mentorship_price_usd, one_on_one: course.one_on_one_price_usd }[track];
  return parseFloat(raw?.toString() || "0") || 0;
}

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
  const [scholarshipChoice, setScholarshipChoice] = useState(false);
  const scholarshipCopy = useCmsGlobals().scholarship;
  const [fetchError, setFetchError] = useState(false);

  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [currencyDetected, setCurrencyDetected] = useState(false);
  const [, setDetectedLocation] = useState<string | null>(null);

  useEffect(() => {
    getCourses().catch(() => {});
  }, []);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch(`${API_URL}/api/detect-currency`);
        const data = await response.json();
        setCurrency(data.currency === "NGN" ? "NGN" : "USD");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const data = await api.courses.getById(id as string);
      setCourse(data);
    } catch (error) {
      console.error("Failed to fetch course:", error);
      // Distinguish "the course really doesn't exist" from a transient
      // network/server error — the latter shouldn't tell the user the
      // course is gone with no way to retry.
      setFetchError(true);
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

  const pathway: PathwayKey = course ? pathwayForCourse(course, router.query.pathway) : "flex";
  const p = PATHWAYS[pathway];

  /** Track to enrol into: the pathway's track if this course offers it. */
  const enrollTrack = (): Track => {
    if (!course) return "self_paced";
    const fromPathway = p.tracks.find((t) => offersTrack(course, t));
    if (fromPathway) return fromPathway;
    if (course.offers_self_paced) return "self_paced";
    const first = course.available_tracks?.[0] as Track | undefined;
    return first ?? "self_paced";
  };

  /** Create (or reuse) the enrollment for THIS course and open its payment page. */
  const doEnroll = async () => {
    try {
      setEnrolling(true);
      setError(null);
      setScholarshipChoice(false);
      const response: any = await api.enrollment.enroll(id as string, enrollTrack(), "onetime");
      if (response?.is_free) {
        // Free courses unlock straight away — no payment step.
        router.push({ pathname: "/user/resource", query: { courseId: id as string } });
        return;
      }
      router.push(`/user/payment/${response.enrollment_id}`);
    } catch (error: any) {
      const status = error.response?.status;
      const existingId = error.response?.data?.enrollment_id;
      if (status === 409) {
        // Already enrolled AND paid for this course.
        router.push({ pathname: "/user/resource", query: { courseId: id as string } });
      } else if (existingId) {
        router.push(`/user/payment/${existingId}`);
      } else {
        const errorMessage = handleApiError(error);
        setError(errorMessage || "Failed to enroll. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  /**
   * "Apply Now". Always enrolls in the course on THIS page.
   *
   * It used to send every logged-in student whose onboarding wasn't
   * "finished" (no scholarship yet, or an unused one for another course)
   * to the dashboard — which only showed their earlier pending
   * enrollment, so they could never start a new course from here.
   */
  const handleEnrollClick = async () => {
    if (!user) {
      sessionStorage.setItem("intended_course", id as string);
      sessionStorage.setItem("intended_course_name", course?.title || "");
      router.push("/user/auth/register");
      return;
    }
    if (enrolling) return;
    setError(null);

    // Already started this course but not paid → straight to its payment page.
    if (enrollmentStatus?.isEnrolled && enrollmentStatus.enrollment?.id && !hasPaidAccess) {
      router.push(`/user/payment/${enrollmentStatus.enrollment.id}`);
      return;
    }

    // Never applied for a scholarship → offer it once, right here (no detour
    // to the dashboard). An awarded scholarship for this course is applied
    // automatically at checkout; one for another course doesn't block this.
    if (!course?.is_free) {
      try {
        setEnrolling(true);
        const st = await api.onboarding.getStatus();
        if (st?.screening_status === "not_started") {
          setScholarshipChoice(true);
          return;
        }
      } catch {
        // status check failing must never block enrolling
      } finally {
        setEnrolling(false);
      }
    }

    await doEnroll();
  };

  const applyForScholarship = async () => {
    try {
      await api.onboarding.setIntendedCourse(id as string);
    } catch {
      // non-critical
    }
    router.push(`/scholarships/${id}`);
  };

  /** Lowest price across every track the course offers (previous behaviour). */
  const getDisplayPrice = () => {
    if (!course) return 0;
    const candidates: number[] = [];
    (["self_paced", "group_mentorship", "one_on_one"] as Track[]).forEach((t) => {
      if (offersTrack(course, t)) {
        const v = trackPrice(course, t, currency);
        if (v > 0) candidates.push(v);
      }
    });
    if (candidates.length === 0) {
      return parseFloat((currency === "NGN" ? course.price_ngn : course.price_usd)?.toString() || "0") || 0;
    }
    return Math.min(...candidates);
  };

  /** Price for the pathway the visitor is looking at, falling back to the above. */
  const getPathwayPrice = () => {
    if (!course) return 0;
    const prices = p.tracks.filter((t) => offersTrack(course, t)).map((t) => trackPrice(course, t, currency)).filter((v) => v > 0);
    return prices.length ? Math.min(...prices) : getDisplayPrice();
  };

  /** Optional slashed "was" price for the track that sets the price above. */
  const getPathwayComparePrice = (shown: number) => {
    if (!course?.compare_prices) return 0;
    const cur = currency === "NGN" ? "ngn" : "usd";
    const tracks = p.tracks.filter((t) => offersTrack(course, t));
    const track = tracks.find((t) => trackPrice(course, t, currency) === shown) ?? tracks[0];
    const was = Number(track ? course.compare_prices?.[track]?.[cur] ?? 0 : 0);
    return was > shown ? was : 0;
  };

  const hasPaidAccess =
    enrollmentStatus?.isEnrolled &&
    (enrollmentStatus?.enrollment?.payment_status === "completed" ||
      enrollmentStatus?.enrollment?.has_access === true);

  // ── Loading ───────────────────────────────────────────────────────
  if (!currencyDetected || loading) {
    return (
      <AppLayout>
        <style>{`
          .spinner { width:48px; height:48px; border:3px solid rgba(74,58,255,0.2); border-top-color:${BRAND}; border-radius:50%; animation:spin 0.8s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
        `}</style>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
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

  // ── Not found / failed ────────────────────────────────────────────
  if (!course) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--page-bg)" }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              {fetchError ? "Couldn't load this course" : "Course not found"}
            </h2>
            {fetchError && (
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                Something went wrong loading this page. Please check your connection and try again.
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              {fetchError && (
                <button
                  onClick={() => fetchCourse()}
                  className="lx-btn-outline px-6 py-3"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => router.push("/courses")}
                className="lx-btn px-6 py-3"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isFree = !!course.is_free;
  const price = isFree ? 0 : getPathwayPrice();
  const listPrice = isFree ? getDisplayPrice() : 0;
  const symbol = currency === "NGN" ? "₦" : "$";
  const comparePrice = isFree ? 0 : getPathwayComparePrice(price);
  const instructors = (course.course_instructors ?? []).filter((i) => i && i.name);
  const tag = PATHWAY_TAG[pathway];
  // Same images as before: hero image (or the default course image) and
  // the secondary image, falling back to the hero image.
  const heroImg = imageUrl(course.hero_image);
  const secondImg = imageUrl(course.secondary_image || course.hero_image);
  const learnings = course.learnings ?? [];
  const tools = course.tools ?? [];
  const benefits = course.benefits ?? [];
  const careerPaths = course.career_paths ?? [];
  const industries = course.industries ?? [];
  const salary = course.salary;

  const structure: { icon: typeof Clock; label: string; value: string | null | undefined }[] = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: Gauge, label: "Level", value: course.level },
    { icon: Monitor, label: "Format", value: p.structure.format },
    { icon: CalendarDays, label: "Schedule", value: p.structure.schedule },
    { icon: Headset, label: "Support", value: p.structure.support },
  ];

  const card = "lx-card p-6 md:p-8";
  const cardTitle = "text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-4";
  const inset = "lx-inset lx-inset-hover";

  return (
    <AppLayout>
      <CatalogTheme />
      <div className="min-h-screen" style={{ background: "var(--page-bg-alt)" }}>
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="text-white pt-32 pb-32 relative overflow-hidden" style={{ background: HERO_BG }}>
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{ backgroundImage: "radial-gradient(#334155 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${HERO_BG})` }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] blur-[120px] rounded-full pointer-events-none" style={{ background: `${BRAND}33` }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              href={p.href}
              className="text-indigo-300 hover:text-white mb-8 inline-flex items-center text-sm font-medium transition"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Programs
            </Link>

            <div className={`grid grid-cols-1 ${heroImg ? "md:grid-cols-[1fr_auto]" : ""} gap-10 items-center`}>
              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className="px-3 py-1 text-xs font-bold rounded-full uppercase border"
                    style={{ background: tag.bg, borderColor: tag.border, color: tag.color }}
                  >
                    {p.tag}
                  </span>
                  {isFree && pathway !== "free" && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full uppercase border" style={{ background: PATHWAY_TAG.free.bg, borderColor: PATHWAY_TAG.free.border, color: PATHWAY_TAG.free.color }}>
                      Free
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-600/30 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-full uppercase inline-flex items-center">
                    <Flame size={12} className="mr-1" /> In-Demand
                  </span>
                  {hasPaidAccess && (
                    <span className="px-3 py-1 bg-green-600/30 border border-green-500 text-green-200 text-xs font-bold rounded-full uppercase inline-flex items-center">
                      <Check size={12} className="mr-1" /> You're enrolled
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">{course.title}</h1>
                {course.description && (
                  <p className="text-lg md:text-2xl text-slate-300 max-w-3xl font-light leading-relaxed">{course.description}</p>
                )}
              </div>

              {heroImg && (
                <div className="flex justify-center md:justify-end gap-4">
                  <CmsImage
                    src={heroImg}
                    alt={course.title}
                    width={420}
                    height={660}
                    priority
                    sizes="(min-width: 768px) 210px, 130px"
                    className="object-cover lx-r border border-white/10 md:-mt-8"
                    style={{ width: "clamp(130px,16vw,210px)", height: "clamp(200px,26vw,330px)", boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${BRAND}33` }}
                  />
                  {secondImg && (
                    <CmsImage
                      src={secondImg}
                      alt={course.title}
                      width={420}
                      height={660}
                      sizes="(min-width: 768px) 210px, 130px"
                      className="object-cover lx-r border border-white/10 md:mt-8"
                      style={{ width: "clamp(130px,16vw,210px)", height: "clamp(200px,26vw,330px)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-8 min-w-0">
              {/* Who this is for */}
              <div className={card}>
                <h2 className={cardTitle}>Who This Is For</h2>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{p.who}</p>
                <div className={`mt-6 p-4 ${inset}`}>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                    <ClipboardCheck size={18} className="mr-2" style={{ color: BRAND }} /> Prerequisites
                  </h4>
                  <p className="text-[var(--text-secondary)] text-sm">{p.prereqs}</p>
                </div>
              </div>

              {/* Outcomes (what you will learn) */}
              {learnings.length > 0 && (
                <div className={card}>
                  <h2 className={`${cardTitle} mb-6`}>By the end of the program, you should be able to:</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learnings.map((l) => (
                      <li key={l.id} className="flex items-start">
                        <CircleCheck size={20} className="mt-0.5 mr-3 flex-shrink-0" style={{ color: BRAND }} />
                        <span className="text-[var(--text-secondary)]">{l.learning_point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tools */}
              {tools.length > 0 && (
                <div className={card}>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">Key Tools &amp; Technologies</h2>
                  <p className="text-[var(--text-muted)] mb-6 border-b border-[var(--border-subtle)] pb-4">The stack you'll work with.</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {tools.map((tool) => {
                      const icon = tool.icon_url ? imageUrl(tool.icon_url) : tool.icon ? imageUrl(tool.icon) : null;
                      return (
                        <div key={tool.id} className={`flex flex-col items-center gap-2 p-3 ${inset} hover:-translate-y-1 transition`} title={tool.name}>
                          {icon ? (
                            <img
                              src={icon}
                              alt={tool.name}
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.style.display = "none";
                                const ph = img.nextElementSibling as HTMLElement | null;
                                if (ph) ph.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-10 h-10 lx-r-sm items-center justify-center font-bold"
                            style={{ display: icon ? "none" : "flex", background: `${BRAND}20`, color: BRAND }}
                          >
                            {tool.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-[var(--text-muted)] font-medium text-center w-full truncate">{tool.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What you'll build */}
              {(course.project || benefits.length > 0) && (
                <div className={card}>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">What You'll Build</h2>
                  <p className="text-[var(--text-muted)] mb-6 border-b border-[var(--border-subtle)] pb-4">Real-world systems for your portfolio.</p>
                  <div className="space-y-6">
                    {course.project && (
                      <div className="p-6 lx-r-sm relative overflow-hidden border" style={{ background: `${BRAND}0d`, borderColor: `${BRAND}33` }}>
                        <div className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg" style={{ background: BRAND }}>
                          CAPSTONE
                        </div>
                        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1 pr-20">Capstone Project</h3>
                        <p className="text-[var(--text-secondary)] text-sm">{course.project}</p>
                      </div>
                    )}
                    {benefits.length > 0 && (
                      <>
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] pt-2">Key Benefits</p>
                        {benefits.map((b, i) => (
                          <div key={b.id} className={`${inset} p-6 relative overflow-hidden`}>
                            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: i % 2 ? "#a855f7" : BRAND }} />
                            <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-2 flex items-center">
                              <Star size={16} className="mr-2 flex-shrink-0" style={{ color: BRAND }} fill="currentColor" />
                              {b.title}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm">{b.text}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Career path */}
              {careerPaths.length > 0 && (
                <div className={card}>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">Career Path &amp; Progression</h2>
                  <p className="text-[var(--text-muted)] mb-6 border-b border-[var(--border-subtle)] pb-4">
                    We equip you with the skills and guidance to grow and succeed in your career.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      {CAREER_LEVELS.map(({ key, label }) => {
                        const positions = careerPaths.filter((cp) => cp.level === key).map((cp) => cp.position).join(", ");
                        if (!positions) return null;
                        return (
                          <div key={key} className={`${inset} p-4 flex items-start gap-3`}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND}1a`, color: BRAND }}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)] mb-0.5">{label}</h3>
                              <p className="text-[var(--text-secondary)] text-sm">{positions}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <CmsImage
                      src="/images/career-path.png"
                      alt="Career path"
                      width={596}
                      height={500}
                      sizes="(min-width: 1024px) 400px, 90vw"
                      className="w-full object-cover lx-r border border-[var(--border-subtle)]"
                      style={{ height: "clamp(240px, 30vw, 380px)" }}
                    />
                  </div>
                </div>
              )}

              {/* Industries */}
              {industries.length > 0 && (
                <div className={card}>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">Industries &amp; Applications</h2>
                  <p className="text-[var(--text-muted)] mb-6 border-b border-[var(--border-subtle)] pb-4">
                    Discover how this course translates into real-world impact across industries.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {industries.map((ind) => (
                      <div key={ind.id} className={`${inset} p-5 flex items-start gap-3`}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND}1a`, color: BRAND }}>
                          <Factory size={16} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)] mb-1">{ind.title}</h3>
                          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{ind.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructors */}
              {instructors.length > 0 && (
                <div className={card}>
                  <h2 className={cardTitle}>{instructors.length === 1 ? "Your Instructor" : "Your Instructors"}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {instructors.map((ins, i) => {
                      const photo = ins.photo ? imageUrl(ins.photo, "") : "";
                      const links = [
                        ...(ins.socials ?? []),
                        ...(ins.website ? [{ platform: "website", url: ins.website }] : []),
                      ];
                      return (
                        <div key={i} className={`${inset} p-4 flex items-center gap-4`}>
                          {photo ? (
                            <CmsImage src={photo} alt={ins.name} width={128} height={128} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{ background: `${BRAND}1a`, color: BRAND }}>
                              {ins.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text-primary)] leading-snug">{ins.name}</p>
                            {ins.role && <p className="text-sm text-[var(--text-secondary)] leading-snug">{ins.role}</p>}
                            {links.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                {links.map((l, j) => {
                                  const Icon = SOCIAL_ICONS[l.platform] ?? SOCIAL_ICONS.website;
                                  return (
                                    <a
                                      key={j}
                                      href={l.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={l.platform}
                                      className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                                    >
                                      <Icon size={15} />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What comes next */}
              <div className={card}>
                <h2 className={cardTitle}>What Comes Next</h2>
                <p className="text-[var(--text-secondary)] mb-4">After the program, you can use your capability to pursue:</p>
                <div className="flex flex-wrap gap-3">
                  {NEXT_STEPS.map((s) => (
                    <span key={s} className="bg-[var(--surface-alt)] text-[var(--text-secondary)] px-4 py-2 lx-r-sm text-sm font-medium border border-[var(--border-subtle)]">{s}</span>
                  ))}
                </div>
              </div>

              {/* Our commitment */}
              <div className="text-white lx-r shadow-xl p-6 md:p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #2e1065 0%, #3b1a8a 100%)" }}>
                <Quote size={64} className="absolute top-4 left-4 opacity-20" style={{ color: "#a78bfa" }} />
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Commitment</h2>
                  <p className="text-violet-200 font-medium mb-4 text-lg">We don’t believe learning should end with a certificate.</p>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    We are committed to developing practical skills through relevant learning, real-world application, performance validation, and structured support.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Our goal is to help people become more capable, more adaptable, and better prepared to create value as technology and the economy evolve.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="lx-card p-6">
                  <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Program Structure</h3>
                  <ul className="space-y-4 mb-6">
                    {structure.filter((r) => r.value).map(({ icon: Icon, label, value }) => (
                      <li key={label} className="flex justify-between items-center gap-4 text-sm border-b border-[var(--border-subtle)] pb-2">
                        <span className="text-[var(--text-muted)] inline-flex items-center flex-shrink-0">
                          <Icon size={15} className="mr-2" /> {label}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] text-right capitalize">{value}</span>
                      </li>
                    ))}
                  </ul>

                  {salary && (salary.entry_level || salary.mid_level || salary.senior_level) && (
                    <div className={`mb-6 p-4 ${inset}`}>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wide mb-2">Avg. Earning Potential</p>
                      <div className="space-y-1.5">
                        {[
                          { label: "Entry level", value: salary.entry_level },
                          { label: "Mid level", value: salary.mid_level },
                          { label: "Senior level", value: salary.senior_level },
                        ].filter((r) => r.value).map((r) => (
                          <div key={r.label} className="flex justify-between items-baseline gap-3">
                            <span className="text-xs text-[var(--text-muted)]">{r.label}</span>
                            <span className="font-bold text-emerald-600 text-right">{r.value}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-2">Global remote opportunities</p>
                    </div>
                  )}

                  {!hasPaidAccess && (
                    <div className="mb-6">
                      <p className="text-sm text-[var(--text-muted)] mb-1">Program Investment</p>
                      {isFree ? (
                        <p className="text-3xl font-bold text-emerald-600">
                          Free
                          {listPrice > 0 && (
                            <span className="ml-2 text-base font-medium text-[var(--text-muted)] line-through">
                              {formatMoney(listPrice, currency)}
                            </span>
                          )}
                        </p>
                      ) : price > 0 ? (
                        <p className="text-3xl font-bold text-[var(--text-primary)]">
                          {formatMoney(price, currency)}
                          {comparePrice > 0 && (
                            <span className="ml-2 text-lg font-medium text-[var(--text-muted)] line-through align-middle">
                              {formatMoney(comparePrice, currency)}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-lg font-bold text-[var(--text-primary)]">See pricing at checkout</p>
                      )}
                      <p className="text-xs font-medium mt-1" style={{ color: BRAND }}>
                        {isFree ? "No payment required" : "Flexible payment options available"}
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 px-4 py-3 text-sm text-red-500 lx-r-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                      {error}
                    </div>
                  )}

                  {hasPaidAccess ? (
                    <button
                      onClick={() => router.push({ pathname: "/user/resource", query: { courseId: course.course_id } })}
                      className="w-full py-4 lx-r bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-md transition transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={20} /> Continue Learning
                    </button>
                  ) : enrollmentStatus?.isEnrolled ? (
                    <button
                      onClick={() => router.push(`/user/payment/${enrollmentStatus.enrollment?.id}`)}
                      className="w-full py-4 lx-r bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg shadow-md transition transform hover:-translate-y-0.5"
                    >
                      Complete Payment
                    </button>
                  ) : (
                    <button
                      onClick={handleEnrollClick}
                      disabled={checkingEnrollment || enrolling}
                      className="lx-btn w-full py-4 text-lg"
                    >
                      {enrolling ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enrolling…
                        </span>
                      ) : isFree ? (
                        "Enroll for Free"
                      ) : (
                        "Apply Now"
                      )}
                    </button>
                  )}

                  {!hasPaidAccess && (
                    <a
                      href="https://calendly.com/nexavaltech/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lx-btn-outline mt-3 w-full py-3 text-sm"
                    >
                      Talk to an expert
                    </a>
                  )}

                  <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                    <p className="text-xs font-bold text-[var(--text-primary)] mb-2">Program Includes:</p>
                    <ul className="text-xs text-[var(--text-muted)] space-y-1">
                      {INCLUDES.map((i) => (
                        <li key={i} className="flex items-center">
                          <Check size={12} className="mr-1.5 flex-shrink-0" style={{ color: BRAND }} /> {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-white lx-r shadow-md p-6 border border-slate-800" style={{ background: `linear-gradient(135deg, #0f172a 0%, ${HERO_BG} 100%)` }}>
                  <div className="flex items-center mb-3">
                    <BadgeCheck size={24} className="text-emerald-400 mr-3" />
                    <h4 className="font-semibold text-lg">Learnexity Validation</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">
                    Qualified individuals will get <strong>Learnexity Verified</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Which allows you to join our verified talent pool for potential employment opportunities, projects, and employer partnerships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {scholarshipChoice && (
          <div
            className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setScholarshipChoice(false)}
          >
            <div className="lx-card w-full max-w-md p-6 sm:p-8 bg-[var(--surface)]" onClick={(e) => e.stopPropagation()}>
              <p className="lx-label mb-2">🎓 {scholarshipCopy.awardBadge.replace(/awarded/i, "available")}</p>
              <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">{scholarshipCopy.welcomeTitle}</h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {fillCopy(scholarshipCopy.welcomeText, { course: course.title })}
              </p>
              <button onClick={applyForScholarship} className="lx-btn w-full py-3.5">
                {scholarshipCopy.applyButton}
              </button>
              <button onClick={doEnroll} disabled={enrolling} className="lx-btn-outline w-full py-3 mt-3 text-sm">
                {enrolling ? "Preparing payment…" : scholarshipCopy.skipButton}
              </button>
              <button onClick={() => setScholarshipChoice(false)} className="w-full mt-3 text-sm text-[var(--text-muted)] hover:underline">
                Cancel
              </button>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </AppLayout>
  );
}
