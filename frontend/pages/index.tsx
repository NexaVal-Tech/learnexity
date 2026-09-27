// pages/index.tsx
//
// Homepage. Every section is managed in Admin → Website CMS → Homepage
// (reorder, hide, edit, add sections); defaults in lib/cms/pages.ts
// reproduce the original hand-built page.
import Head from "next/head";
import type { GetStaticProps } from "next";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import ScholarshipCountdownBanner from "@/components/ScholarshipCountdownBanner";
import SectionRenderer from "@/components/cms/SectionRenderer";
import CmsHead from "@/components/cms/CmsHead";
import { getCmsPageProps, type CmsPageProps } from "@/lib/cms/server";

export const getStaticProps: GetStaticProps<CmsPageProps> = () => getCmsPageProps("home");

export default function Home({ cmsPage }: CmsPageProps) {
  return (
    <AppLayout
      topBanner={({ onHeightChange }) => <ScholarshipCountdownBanner onHeightChange={onHeightChange} />}
    >
      <CmsHead page={cmsPage} />
      <Head>
        {/* WebSite JSON-LD — enables Google Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Learnexity",
              url: "https://learnexity.org",
            }),
          }}
        />
      </Head>

      <SectionRenderer sections={cmsPage.sections} />
      <Footer />
    </AppLayout>
  );
}
