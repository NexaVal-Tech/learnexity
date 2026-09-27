// pages/our-team.tsx — content managed in Admin → Website CMS → Meet Our Team.
import type { GetStaticProps } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import SectionRenderer from "@/components/cms/SectionRenderer";
import CmsHead from "@/components/cms/CmsHead";
import { getCmsPageProps, type CmsPageProps } from "@/lib/cms/server";

export const getStaticProps: GetStaticProps<CmsPageProps> = () => getCmsPageProps("our-team");

export default function Team({ cmsPage }: CmsPageProps) {
  return (
    <>
      <CmsHead page={cmsPage} />
      <AppLayout>
        <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
          <SectionRenderer sections={cmsPage.sections} />
        </div>
        <Footer />
      </AppLayout>
    </>
  );
}
