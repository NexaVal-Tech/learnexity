// pages/free-courses.tsx — Free courses.
import PathwayPage from "@/components/catalog/PathwayPage";

export default function FreeCoursesPage() {
  return (
    <PathwayPage
      pathway="free"
      metaTitle="Free Courses - Learnexity"
      metaDescription="Enroll in our free courses and get full access to resources — no payment required."
      canonical="https://learnexity.org/free-courses"
      heroTitle="Free Courses"
      heroSubtitle="Enroll in our free courses, no payment required, full access from day one."
      heroBadge="100% Free"
      heroImageAlt="Free courses hero"
    />
  );
}
