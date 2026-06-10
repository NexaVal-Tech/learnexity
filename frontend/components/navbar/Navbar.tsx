"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Animated accordion (mobile smooth expand/collapse) ───────────────────────

function AnimatedAccordion({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.scrollHeight));
    ro.observe(el);
    setHeight(el.scrollHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      style={{ maxHeight: isOpen ? height : 0 }}
      className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownItem {
  href: string;
  label: string;
  description: string;
  // hasSubMenu now carries which sub-panel to show
  subMenu?: "deeptech" | "flex";
}

interface NavGroup {
  label: string;
  items: DropdownItem[];
}

interface NavLink {
  type: "link";
  href: string;
  label: string;
}

type NavEntry = NavLink | (NavGroup & { type: "group" });

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV: NavEntry[] = [
  { type: "link", href: "/", label: "Home" },
  {
    type: "group",
    label: "Courses",
    items: [
      {
        href: "/courses/courses",
        label: "Deep Tech Courses",
        description: "Group mentorship & one-on-one coaching",
        subMenu: "deeptech",
      },
      {
        href: "/flex",
        label: "Flexible Courses",
        description: "Self-paced programmes",
        subMenu: "flex",
      },
    ],
  },
  {
    type: "group",
    label: "Learn More",
    items: [
      { href: "/about", label: "About Us", description: "Our story and mission" },
      { href: "/contact", label: "Contact Us", description: "Get in touch" },
    ],
  },
  { type: "link", href: "/community", label: "Community" },
  { type: "link", href: "/refer&earn", label: "Refer & Earn" },
];

// ─── Courses Sub-Panel (Desktop) ──────────────────────────────────────────────
// Shows the list of courses for a given sub-menu type

function CoursesSubPanel({
  isOpen,
  courses,
  isLoading,
  browseHref,
  browseLabel,
}: {
  isOpen: boolean;
  courses: Course[];
  isLoading: boolean;
  browseHref: string;
  browseLabel: string;
}) {
  return (
    <div
      className={`
        absolute left-full top-0 ml-1.5 w-56 z-50
        bg-white border border-gray-100 rounded-xl shadow-xl
        transition-all duration-200 ease-out origin-top-left
        ${isOpen
          ? "opacity-100 scale-100 translate-x-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
        }
      `}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-50">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          {browseLabel}
        </p>
      </div>

      {/* Scrollable list */}
      <div
        className="overflow-y-auto"
        style={{
          maxHeight: "260px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`.courses-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="courses-scroll p-1.5 flex flex-col gap-0.5">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg bg-gray-100 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </>
          ) : courses.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3 text-center">No courses available</p>
          ) : (
            courses.map((course, i) => (
              <Link
                key={course.id}
                href={`/courses/${course.course_id}`}
                style={{ transitionDelay: isOpen ? `${i * 30}ms` : "0ms" }}
                className={`
                  group/course flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs
                  text-gray-700 hover:text-[#6C63FF] hover:bg-indigo-50/60
                  transition-all duration-150
                  ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}
                `}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/course:bg-[#6C63FF] flex-shrink-0 transition-colors duration-150" />
                <span className="truncate font-medium leading-snug">{course.title}</span>
                <ChevronRight className="ml-auto flex-shrink-0 text-gray-300 group-hover/course:text-[#6C63FF] opacity-0 group-hover/course:opacity-100 transition-all duration-150" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-2 pb-2 pt-1.5 border-t border-gray-50">
        <Link
          href={browseHref}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold text-[#6C63FF] bg-indigo-50 hover:bg-indigo-100 transition-colors duration-150"
        >
          Browse all
          <ChevronRight className="text-[#6C63FF]" />
        </Link>
      </div>
    </div>
  );
}

// ─── Desktop Dropdown ─────────────────────────────────────────────────────────

function DropdownMenu({
  group,
  isOpen,
  onClose,
  deepTechCourses,
  deepTechLoading,
  flexCourses,
  flexLoading,
}: {
  group: NavGroup;
  isOpen: boolean;
  onClose: () => void;
  deepTechCourses: Course[];
  deepTechLoading: boolean;
  flexCourses: Course[];
  flexLoading: boolean;
}) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setOpenSubMenu(null);
  }, [isOpen]);

  return (
    <div
      className={`
        absolute top-[calc(100%+12px)] left-0 z-50 w-60
        bg-white border border-gray-100 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)]
        transition-all duration-200 ease-out origin-top-left overflow-visible
        ${isOpen
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }
      `}
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/30 to-transparent rounded-full" />

      <div className="p-1.5">
        {group.items.map((item, i) => {
          const hasSubMenu = !!item.subMenu;
          const isSubOpen = openSubMenu === item.label;

          // Decide which courses to pass to the sub-panel
          const subCourses =
            item.subMenu === "deeptech" ? deepTechCourses : flexCourses;
          const subLoading =
            item.subMenu === "deeptech" ? deepTechLoading : flexLoading;
          const browseLabel =
            item.subMenu === "deeptech" ? "Mentorship Courses" : "Self-Paced Courses";

          return (
            <div key={item.href} className="relative">
              {hasSubMenu ? (
                <button
                  onClick={() => setOpenSubMenu(isSubOpen ? null : item.label)}
                  style={{ transitionDelay: isOpen ? `${i * 40}ms` : "0ms" }}
                  className={`
                    w-full flex items-center justify-between px-3 py-3 rounded-xl
                    hover:bg-gray-50 transition-all duration-200 group/item cursor-pointer
                    ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
                    ${isSubOpen ? "bg-indigo-50" : ""}
                  `}
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className={`text-[13px] font-semibold ${isSubOpen ? "text-[#6C63FF]" : "text-gray-800"}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    className={`flex-shrink-0 transition-all duration-200 ${isSubOpen ? "text-[#6C63FF] rotate-90" : "text-gray-300 group-hover/item:text-gray-500"}`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  style={{ transitionDelay: isOpen ? `${i * 40}ms` : "0ms" }}
                  className={`
                    flex items-center justify-between px-3 py-3 rounded-xl
                    hover:bg-gray-50 transition-all duration-200 group/item
                    ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
                  `}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-gray-800">{item.label}</span>
                  </div>
                  <ChevronRight className="flex-shrink-0 text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                </Link>
              )}

              {/* Sub-panel for both deeptech and flex */}
              {hasSubMenu && (
                <CoursesSubPanel
                  isOpen={isSubOpen}
                  courses={subCourses}
                  isLoading={subLoading}
                  browseHref={item.href}
                  browseLabel={browseLabel}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile Courses Sub-Accordion ────────────────────────────────────────────

function MobileCoursesAccordion({
  isOpen,
  courses,
  isLoading,
  onLinkClick,
  browseHref,
}: {
  isOpen: boolean;
  courses: Course[];
  isLoading: boolean;
  onLinkClick: () => void;
  browseHref: string;
}) {
  return (
    <AnimatedAccordion isOpen={isOpen}>
      <div
        className="overflow-y-auto mt-1 mb-2 border-indigo-100 flex flex-col gap-0.5"
        style={{
          maxHeight: "200px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse my-0.5" />
            ))}
          </>
        ) : courses.length === 0 ? (
          <p className="text-xs text-gray-400 py-2 px-2">No courses found</p>
        ) : (
          courses.map((course, i) => (
            <Link
              key={course.id}
              href={`/courses/${course.course_id}`}
              onClick={onLinkClick}
              style={{ transitionDelay: isOpen ? `${i * 35}ms` : "0ms" }}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px]
                font-medium text-gray-600 hover:text-[#6C63FF] hover:bg-indigo-50
                transition-all duration-200
                ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
              `}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 flex-shrink-0" />
              <span className="truncate">{course.title}</span>
            </Link>
          ))
        )}

        {/* Browse all link */}
        <Link
          href={browseHref}
          onClick={onLinkClick}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#6C63FF] hover:bg-indigo-50 transition-colors mt-1"
        >
          Browse all
        </Link>
      </div>
    </AnimatedAccordion>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  // Track which mobile sub-accordion is open: "deeptech" | "flex" | null
  const [expandedMobileSub, setExpandedMobileSub] = useState<string | null>(null);

  // Separate state for the two course lists
  const [deepTechCourses, setDeepTechCourses] = useState<Course[]>([]);
  const [deepTechLoading, setDeepTechLoading] = useState(false);
  const [flexCourses, setFlexCourses] = useState<Course[]>([]);
  const [flexLoading, setFlexLoading] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const { user } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);

  // Fetch deep tech (group_mentorship + one_on_one) courses
  useEffect(() => {
    setDeepTechLoading(true);
    fetch(
      `${API_URL}/api/courses/by-track?track[]=group_mentorship&track[]=one_on_one`,
      { headers: { Accept: "application/json" } }
    )
      .then((r) => r.json())
      .then((data) => {
        setDeepTechCourses(Array.isArray(data) ? data : data?.data ?? []);
      })
      .catch(() => setDeepTechCourses([]))
      .finally(() => setDeepTechLoading(false));
  }, []);

  // Fetch self-paced (flex) courses
  useEffect(() => {
    setFlexLoading(true);
    fetch(
      `${API_URL}/api/courses/by-track?track[]=self_paced`,
      { headers: { Accept: "application/json" } }
    )
      .then((r) => r.json())
      .then((data) => {
        setFlexCourses(Array.isArray(data) ? data : data?.data ?? []);
      })
      .catch(() => setFlexCourses([]))
      .finally(() => setFlexLoading(false));
  }, []);

  // Navbar shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setOpenGroup(null);
    setExpandedMobile(null);
    setExpandedMobileSub(null);
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => pathname === item.href);

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav
        ref={navRef}
        className={`
          bg-white fixed w-full z-50
          transition-all duration-300
          ${scrolled
            ? "border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            : "border-b border-gray-100"
          }
        `}
        aria-label="Main navigation"
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 h-[62px]">

          {/* Logo */}
          <Link href="/" aria-label="Learnexity homepage" className="flex-shrink-0">
            <img src="/images/Logo.png" alt="Learnexity" width={136} height={38} className="object-contain" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map((entry) => {
              if (entry.type === "group") {
                const active = isGroupActive(entry);
                const isThisOpen = openGroup === entry.label;
                return (
                  <div key={entry.label} className="relative">
                    <button
                      onClick={() => toggleGroup(entry.label)}
                      aria-expanded={isThisOpen}
                      aria-haspopup="true"
                      className={`
                        relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                        text-[13.5px] font-medium transition-all duration-150
                        ${active || isThisOpen
                          ? "text-[#6C63FF] bg-indigo-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
                        }
                      `}
                    >
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] flex-shrink-0" aria-hidden="true" />
                      )}
                      {entry.label}
                      <ChevronDown
                        className={`flex-shrink-0 transition-transform duration-200 ${isThisOpen ? "rotate-180 text-[#6C63FF]" : ""}`}
                      />
                    </button>
                    <DropdownMenu
                      group={entry}
                      isOpen={isThisOpen}
                      onClose={() => setOpenGroup(null)}
                      deepTechCourses={deepTechCourses}
                      deepTechLoading={deepTechLoading}
                      flexCourses={flexCourses}
                      flexLoading={flexLoading}
                    />
                  </div>
                );
              }

              const isActive = pathname === entry.href;
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                    text-[13.5px] font-medium transition-all duration-150
                    ${isActive
                      ? "text-[#6C63FF] bg-indigo-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
                    }
                  `}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]" aria-hidden="true" />
                  )}
                  {entry.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <Link
                href="/user/dashboard"
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                  text-[13px] font-medium border transition-all duration-150
                  ${pathname === "/user/dashboard"
                    ? "border-[#6C63FF] text-[#6C63FF] bg-indigo-50"
                    : "border-gray-200 text-gray-600 hover:border-[#6C63FF] hover:text-[#6C63FF] hover:bg-indigo-50/60"
                  }
                `}
              >
                <DashboardIcon />
                Dashboard
              </Link>
            )}
            {!user ? (
              <Link
                href="/user/auth/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-150"
              >
                <UserIcon />
                Log in
              </Link>
            ) : (
              <></>
            )}

            <Link
              href="https://calendly.com/nexavaltech/30min"
              className="
                relative overflow-hidden
                bg-[#6C63FF] text-white text-[13px] px-5 py-2.5 rounded-xl font-semibold
                hover:bg-[#5753E6] transition-all duration-200
                shadow-[0_2px_12px_rgba(108,99,255,0.35)]
                hover:shadow-[0_4px_16px_rgba(108,99,255,0.45)]
                hover:-translate-y-px
              "
            >
              Book a consultation
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            <div className="w-[18px] h-[14px] flex flex-col justify-between">
              <span className={`block h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${isMobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${isMobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${isMobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile slide-down panel ── */}
      <div
        className={`
          fixed top-0 left-0 w-full bg-white z-50 md:hidden
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        `}
      >
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6C63FF] via-purple-400 to-pink-400" />

        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 h-[62px] border-b border-gray-100">
          <Link href="/" onClick={() => setIsMobileOpen(false)}>
            <img src="/images/Logo.png" alt="Learnexity" width={116} height={34} className="object-contain" />
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mobile nav items */}
        <nav className="flex flex-col px-4 py-3 gap-0.5" aria-label="Mobile navigation">
          {NAV.map((entry) => {
            if (entry.type === "group") {
              const isExpanded = expandedMobile === entry.label;
              const active = isGroupActive(entry);

              return (
                <div key={entry.label}>
                  <button
                    onClick={() => setExpandedMobile(isExpanded ? null : entry.label)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3.5 rounded-xl
                      text-[14px] font-semibold transition-all duration-150
                      ${active ? "text-[#6C63FF] bg-indigo-50" : "text-gray-700 hover:bg-gray-50"}
                    `}
                  >
                    {entry.label}
                    <ChevronDown
                      className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#6C63FF]" : "text-gray-400"}`}
                    />
                  </button>

                  <AnimatedAccordion isOpen={isExpanded}>
                    <div className="ml-1 mt-1 mb-2 pl-1 border-gray-100 flex flex-col gap-0.5">
                      {entry.items.map((item, i) => {
                        const hasSubMenu = !!item.subMenu;
                        const subKey = item.subMenu ?? item.label;
                        const isSubExpanded = expandedMobileSub === subKey;

                        // Pick the right courses for this sub-menu
                        const subCourses =
                          item.subMenu === "deeptech" ? deepTechCourses : flexCourses;
                        const subLoading =
                          item.subMenu === "deeptech" ? deepTechLoading : flexLoading;

                        if (hasSubMenu) {
                          return (
                            <div key={item.href}>
                              <button
                                onClick={() =>
                                  setExpandedMobileSub(
                                    isSubExpanded ? null : subKey
                                  )
                                }
                                style={{ transitionDelay: isExpanded ? `${i * 50}ms` : "0ms" }}
                                className={`
                                  w-full flex items-center justify-between px-3 py-3 rounded-xl text-[13px]
                                  transition-all duration-200
                                  ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
                                  ${isSubExpanded
                                    ? "text-[#6C63FF] bg-indigo-50 font-semibold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                  }
                                `}
                              >
                                <div className="flex flex-col gap-0.5 text-left">
                                  <p className="font-semibold text-[13px] leading-none mb-0.5">
                                    {item.label}
                                  </p>
                                </div>
                                <ChevronDown
                                  className={`transition-transform duration-300 flex-shrink-0 ${isSubExpanded ? "rotate-180 text-[#6C63FF]" : "text-gray-300"}`}
                                />
                              </button>

                              <MobileCoursesAccordion
                                isOpen={isSubExpanded}
                                courses={subCourses}
                                isLoading={subLoading}
                                onLinkClick={() => setIsMobileOpen(false)}
                                browseHref={item.href}
                              />
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            style={{ transitionDelay: isExpanded ? `${i * 50}ms` : "0ms" }}
                            className={`
                              flex items-center justify-between px-3 py-3 rounded-xl text-[13px] font-medium
                              transition-all duration-200
                              ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
                              ${pathname === item.href
                                ? "text-[#6C63FF] bg-indigo-50"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }
                            `}
                          >
                            <div>
                              <p className="font-semibold text-[13px] leading-none mb-0.5">{item.label}</p>
                            </div>
                            <ChevronRight className="flex-shrink-0 text-gray-300" />
                          </Link>
                        );
                      })}
                    </div>
                  </AnimatedAccordion>
                </div>
              );
            }

            const isActive = pathname === entry.href;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-2 px-4 py-3.5 rounded-xl
                  text-[14px] font-semibold transition-all duration-150
                  ${isActive
                    ? "text-[#6C63FF] bg-indigo-50"
                    : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]" aria-hidden="true" />
                )}
                {entry.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href="/user/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-[14px] font-semibold text-[#6C63FF] border border-indigo-200 bg-indigo-50/50 mt-1 hover:bg-indigo-100 transition-colors"
            >
              <DashboardIcon />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Mobile bottom actions */}
        <div className="px-4 pb-6 flex flex-col gap-2.5">
          <div className="border-t border-gray-100 pt-4">
            {!user ? (
              <Link
                href="/user/auth/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-150"
              >
                <UserIcon />
                Log in
              </Link>
            ) : (
              <></>
            )}
          </div>
          <Link
            href="https://calendly.com/nexavaltech/30min"
            onClick={() => setIsMobileOpen(false)}
            className="
              block w-full text-center
              bg-[#6C63FF] text-white py-3.5 rounded-xl
              text-[13.5px] font-semibold
              hover:bg-[#5753E6] transition-all duration-200
              shadow-[0_2px_12px_rgba(108,99,255,0.35)]
            "
          >
            Book a consultation
          </Link>
        </div>
      </div>
    </>
  );
}