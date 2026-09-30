// pages/courses/courses.tsx — DeepTech (live classes & mentorship) courses.
// The all-pathways overview lives at /courses.
import PathwayPage from "@/components/catalog/PathwayPage";

export default function DeepTechCoursesPage() {
  return (
    <PathwayPage
      pathway="deeptech"
      metaTitle="Courses - Expert-led mentorship programmes | Learnexity"
      metaDescription="Group mentorship and one-on-one coaching programmes designed to launch you into high-paying tech careers."
      canonical="https://learnexity.org/courses/courses"
      heroTitle="DeepTech"
      heroSubtitle="Expert-led programmes, live classes & one-on-one coaching to launch you into high-paying tech careers."
      heroBadge="Live Classes & Mentorship"
      heroImageAlt="Courses hero"
    />
  );
}
