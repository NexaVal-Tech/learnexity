// pages/[slug].tsx
//
// Pages created in the CMS page builder (Admin → Website CMS → New page),
// served at /{slug}. Built-in routes (/about, /courses, …) always take
// precedence over this dynamic route, and the backend refuses those slugs
// for new pages, so the two can't collide.
import type { GetStaticPaths, GetStaticProps } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import SectionRenderer from "@/components/cms/SectionRenderer";
import CmsHead from "@/components/cms/CmsHead";
import { getCustomPageProps, getCustomPageSlugs, type CmsPageProps } from "@/lib/cms/server";

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getCustomPageSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    // Pages published after the last deploy are rendered on first visit.
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<CmsPageProps, { slug: string }> = async ({ params }) => {
  const slug = params?.slug ?? "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { notFound: true };
  return getCustomPageProps(slug);
};

export default function CustomCmsPage({ cmsPage }: CmsPageProps) {
  return (
    <>
      <CmsHead page={cmsPage} />
      <AppLayout>
        <div className="min-h-[60vh] pt-16">
          <SectionRenderer sections={cmsPage.sections} />
        </div>
        <Footer />
      </AppLayout>
    </>
  );
}
