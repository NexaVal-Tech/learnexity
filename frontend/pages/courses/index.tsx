// pages/courses/index.tsx  →  /courses
//
// "Our Pathways" overview: pathway cards at the top (each opens that
// pathway's page), then each pathway with its courses — Foundation /
// Flex, Accelerator, DeepTech and Free.
import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import ScholarshipCoursePrompt from "@/components/Scholarship/ScholarshipCoursePrompt";
import PathwaySection, { PathwayStyles, usePathwayCourses } from "@/components/catalog/PathwaySection";
import { CatalogHero, PathwayCards } from "@/components/catalog/CatalogHero";
import { CatalogTheme } from "@/components/catalog/CatalogTheme";
import { PATHWAYS } from "@/components/catalog/pathways";


export default function CoursesOverviewPage() {
  const flex = usePathwayCourses("flex");
  const accelerator = usePathwayCourses("accelerator");
  const deeptech = usePathwayCourses("deeptech");
  const free = usePathwayCourses("free");

  // Free courses only appear once there are some.
  const showFree = free.loading || free.error !== null || free.courses.length > 0;
  const count = (h: { loading: boolean; courses: unknown[] }) => (h.loading ? null : h.courses.length);

  return (
    <>
      <Head>
        <title>Courses - Our Pathways | Learnexity</title>
        <meta
          name="description"
          content="Foundation, Accelerator, DeepTech and free courses. Different starting points, one direction: greater capability. Choose the pathway that fits your goals."
        />
        <link rel="canonical" href="https://learnexity.org/courses" />
      </Head>

      <AppLayout>
        <ScholarshipCoursePrompt />
        <CatalogTheme />
        <PathwayStyles />

        <div className="min-h-screen">
          <CatalogHero
            title="Our Pathways"
            subtitle="Different starting points. One direction: greater capability. Choose the pathway that fits your current goals."
            badge="Expert-led programmes, live classes & one-on-one coaching"
          />

          <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16 md:py-20">
            <PathwayCards
              counts={{ flex: count(flex), accelerator: count(accelerator), deeptech: count(deeptech), free: count(free) }}
            />

            <div className="mt-24 space-y-24">
              <PathwaySection
                pathway="flex"
                courses={flex.courses}
                loading={flex.loading}
                error={flex.error}
                onRetry={flex.reload}
                viewAllHref={PATHWAYS.flex.href}
              />
              <PathwaySection
                pathway="accelerator"
                courses={accelerator.courses}
                loading={accelerator.loading}
                error={accelerator.error}
                onRetry={accelerator.reload}
                viewAllHref={PATHWAYS.accelerator.href}
              />
              <PathwaySection
                pathway="deeptech"
                courses={deeptech.courses}
                loading={deeptech.loading}
                error={deeptech.error}
                onRetry={deeptech.reload}
                viewAllHref={PATHWAYS.deeptech.href}
              />
              {showFree && (
                <PathwaySection
                  pathway="free"
                  courses={free.courses}
                  loading={free.loading}
                  error={free.error}
                  onRetry={free.reload}
                  viewAllHref={PATHWAYS.free.href}
                />
              )}
            </div>
          </div>

          <Footer />
        </div>
      </AppLayout>
    </>
  );
}
