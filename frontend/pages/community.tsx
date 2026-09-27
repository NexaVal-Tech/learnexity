// pages/community.tsx — content managed in Admin → Website CMS → Community.
import type { GetStaticProps } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import SectionRenderer from "@/components/cms/SectionRenderer";
import CmsHead from "@/components/cms/CmsHead";
import { getCmsPageProps, type CmsPageProps } from "@/lib/cms/server";

export const getStaticProps: GetStaticProps<CmsPageProps> = () => getCmsPageProps("community");

export default function CommunityPage({ cmsPage }: CmsPageProps) {
  return (
    <>
      <CmsHead page={cmsPage} />
      <AppLayout>
        <div className="min-h-screen">
          <SectionRenderer sections={cmsPage.sections} />
          <Footer />
        </div>
      </AppLayout>
    </>
  );
}
