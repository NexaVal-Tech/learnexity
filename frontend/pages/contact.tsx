// pages/contact.tsx — content managed in Admin → Website CMS → Contact Us.
import type { GetStaticProps } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import SectionRenderer from "@/components/cms/SectionRenderer";
import CmsHead from "@/components/cms/CmsHead";
import { getCmsPageProps, type CmsPageProps } from "@/lib/cms/server";

export const getStaticProps: GetStaticProps<CmsPageProps> = () => getCmsPageProps("contact");

export default function Contact({ cmsPage }: CmsPageProps) {
  return (
    <>
      <CmsHead page={cmsPage} />
      <AppLayout>
        <SectionRenderer sections={cmsPage.sections} />
        <Footer />
      </AppLayout>
    </>
  );
}
