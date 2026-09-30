// components/catalog/pathways.ts
//
// The four course pathways shown on the courses pages, and the data/text
// that goes with each. Maps the site's learning tracks onto the pathway
// layout:
//   Foundation / Flex → self_paced          (/flex)
//   Accelerator       → intermediate        (/intermediate)
//   DeepTech          → group_mentorship + one_on_one (/courses/courses)
//   Free              → free courses        (/free-courses)
import type { Course } from "@/lib/api";

export type PathwayKey = "flex" | "accelerator" | "deeptech" | "free";
export type Track = "self_paced" | "intermediate" | "group_mentorship" | "one_on_one";

export const BRAND = "#4A3AFF";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PathwayDef {
  key: PathwayKey;
  /** Heading on the listing pages. */
  title: string;
  /** Short line under the heading. */
  tagline: string;
  /** Paragraph at the top of the pathway card. */
  audience: string;
  /** "Outcome:" box at the bottom of the pathway card. */
  outcome: string;
  outcomeNote?: string;
  /** Tag on the details page hero, e.g. "Accelerator Pathway". */
  tag: string;
  /** Listing page for this pathway ("Back to Programs" goes here). */
  href: string;
  /** API endpoint (relative to API_URL) that lists this pathway's courses. */
  endpoint: string;
  /** Tracks this pathway enrolls into, in order of preference. */
  tracks: Track[];
  /** Details page: "Who this is for" + "Prerequisites". */
  who: string;
  prereqs: string;
  /** Details page: Program Structure rows. */
  structure: { format: string; schedule: string; support: string };
}

export const PATHWAYS: Record<PathwayKey, PathwayDef> = {
  flex: {
    key: "flex",
    title: "Foundation / Flex",
    tagline: "Build Practical Digital Capabilities.",
    audience:
      "For people who want to build immediately useful digital skills for work, business, creativity, or personal growth.",
    outcome:
      "Build practical skills, complete real projects, and develop a portfolio you can use beyond the classroom.",
    tag: "Foundation Pathway",
    href: "/flex",
    endpoint: "/api/courses/by-track?track[]=self_paced",
    tracks: ["self_paced"],
    who:
      "Designed for people who want to build immediately useful digital skills for work, business, creativity, or personal growth, and learn on their own schedule.",
    prereqs: "No prior experience required. A laptop, reliable internet and a willingness to practise are all you need.",
    structure: { format: "Online / Self-Paced", schedule: "Flexible, learn at your own pace", support: "Community & Guided Resources" },
  },
  accelerator: {
    key: "accelerator",
    title: "Accelerator",
    tagline: "Turn Skills into Professional Value.",
    audience:
      "For people who want to move beyond learning and develop capabilities they can apply to career growth, consulting, freelancing, remote work, or entrepreneurship.",
    outcome:
      "Develop specialized skills, apply them to real-world projects, and build toward professional and scalable opportunities.",
    outcomeNote: "(3–6 month commitment)",
    tag: "Accelerator Pathway",
    href: "/intermediate",
    endpoint: "/api/courses/by-track?track[]=intermediate",
    tracks: ["intermediate"],
    who:
      "Designed for professionals and ambitious learners who already have the basics and want to build specialized, practical capability they can apply to real-world problems.",
    prereqs: "Foundational knowledge of the subject area. Already have the basics? This is where you move faster.",
    structure: { format: "Online / Hybrid", schedule: "Part-Time (3–6 months)", support: "Dedicated Mentorship" },
  },
  deeptech: {
    key: "deeptech",
    title: "DeepTech",
    tagline: "Build the Technical Capabilities Behind What's Next.",
    audience:
      "For professionals preparing to work more deeply with the technologies transforming how organizations build, secure, manage, and use technology.",
    outcome:
      "Develop deeper technical capability, build real-world systems, and demonstrate your ability to work with technologies shaping the future of work.",
    outcomeNote: "Go deeper. Build what’s next.",
    tag: "DeepTech Pathway",
    href: "/courses/courses",
    endpoint: "/api/courses/by-track?track[]=group_mentorship&track[]=one_on_one",
    tracks: ["group_mentorship", "one_on_one"],
    who:
      "Designed for professionals and technologists preparing to work more deeply with the technologies transforming how organizations build, secure, manage, and use technology.",
    prereqs: "A laptop, reliable internet, and basic programming knowledge. You'll confirm these before payment.",
    structure: { format: "Live Classes / Online", schedule: "Intensive Part-Time", support: "Live Mentorship (Group or 1-on-1)" },
  },
  free: {
    key: "free",
    title: "Free Courses",
    tagline: "Start Learning at No Cost.",
    audience:
      "For anyone who wants to explore a new skill before committing. Enroll and get full access, no payment required.",
    outcome:
      "Build real skills, explore a pathway, and decide your next step with confidence.",
    tag: "Free Course",
    href: "/free-courses",
    endpoint: "/api/courses/free",
    tracks: ["self_paced"],
    who:
      "Designed for anyone who wants to explore a new skill, try a pathway, and get started without any cost.",
    prereqs: "None. Open to everyone.",
    structure: { format: "Online / Self-Paced", schedule: "Flexible, learn at your own pace", support: "Community & Guided Resources" },
  },
};

export const PATHWAY_ORDER: PathwayKey[] = ["flex", "accelerator", "deeptech"];

export function isPathwayKey(v: unknown): v is PathwayKey {
  return typeof v === "string" && v in PATHWAYS;
}

/** Which pathway a course belongs to when the visitor didn't come from a listing. */
export function pathwayForCourse(course: Course, fromQuery?: unknown): PathwayKey {
  if (isPathwayKey(fromQuery)) return fromQuery;
  if (course.is_free) return "free";
  if (course.offers_group_mentorship || course.offers_one_on_one) return "deeptech";
  if (course.offers_intermediate) return "accelerator";
  return "flex";
}

/** Link to a course's details page, remembering which pathway it was opened from. */
export function courseHref(course: Pick<Course, "course_id">, pathway: PathwayKey): string {
  return `/courses/${encodeURIComponent(course.course_id)}?pathway=${pathway}`;
}

/** Resolve any image path the API returns to a usable URL. */
export function imageUrl(path: string | null | undefined, fallback = "/images/default-course.jpg"): string {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/storage/")) return `${API_URL}${path}`;
  if (path.startsWith("/")) return path;
  return `${API_URL}/storage/${path.replace(/^storage\//, "")}`;
}
