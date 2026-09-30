// components/catalog/PathwayPage.tsx
//
// A page that lists one pathway's courses (/flex, /intermediate,
// /free-courses): hero, the pathway block with every course, then links
// to the other pathways.
import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import ScholarshipCoursePrompt from "@/components/Scholarship/ScholarshipCoursePrompt";
import PathwaySection, { PathwayStyles, usePathwayCourses } from "./PathwaySection";
import { CatalogTheme } from "./CatalogTheme";
import { CatalogHero, OtherPathways } from "./CatalogHero";
import type { PathwayKey } from "./pathways";

export interface PathwayPageProps {
  pathway: PathwayKey;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge?: string;
  heroImageAlt?: string;
}

export default function PathwayPage({
  pathway, metaTitle, metaDescription, canonical, heroTitle, heroSubtitle, heroBadge, heroImageAlt,
}: PathwayPageProps) {
  const { courses, loading, error, reload } = usePathwayCourses(pathway);

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
      </Head>

      <AppLayout>
        <ScholarshipCoursePrompt />
        <CatalogTheme />
        <PathwayStyles />

        <div className="min-h-screen">
          <CatalogHero title={heroTitle} subtitle={heroSubtitle} badge={heroBadge} imageAlt={heroImageAlt} />

          <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16 md:py-20">
            <PathwaySection pathway={pathway} courses={courses} loading={loading} error={error} onRetry={reload} />
            <OtherPathways current={pathway} />
          </div>

          <Footer />
        </div>
      </AppLayout>
    </>
  );
}
