// pages/kids.tsx — copy managed in Admin → Website CMS → Kids. Courses,
// prices and enrollments stay in Kids Management; the enrollment flow
// itself lives in components/cms/blocks/kids.tsx (KidsPageShell).
import type { GetStaticProps } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import CmsHead from "@/components/cms/CmsHead";
import { KidsPageShell } from "@/components/cms/blocks/kids";
import { getCmsPageProps, type CmsPageProps } from "@/lib/cms/server";

export const getStaticProps: GetStaticProps<CmsPageProps> = () => getCmsPageProps("kids");

export default function Kids({ cmsPage }: CmsPageProps) {
  return (
    <>
      <CmsHead page={cmsPage} />
      <AppLayout>
        <KidsPageShell sections={cmsPage.sections} />
        <Footer />
      </AppLayout>
    </>
  );
}
