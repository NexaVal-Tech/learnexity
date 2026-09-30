// pages/intermediate.tsx — Accelerator (Career Accelerator) courses.
import PathwayPage from "@/components/catalog/PathwayPage";

export default function IntermediatePage() {
  return (
    <PathwayPage
      pathway="accelerator"
      metaTitle="Career Accelerator Courses - Learnexity"
      metaDescription="Already have foundational knowledge? Move faster with our Career Accelerator track."
      canonical="https://learnexity.org/intermediate"
      heroTitle="Accelerator"
      heroSubtitle="Already have the basics? Move faster with our Career Accelerator track."
      heroBadge="Career Accelerator"
      heroImageAlt="Career Accelerator courses hero"
    />
  );
}
