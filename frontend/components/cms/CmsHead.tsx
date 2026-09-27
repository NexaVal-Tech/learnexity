// components/cms/CmsHead.tsx — <title>, description, Open Graph for a CMS page.
import Head from "next/head";
import type { CmsPage } from "@/lib/cms/types";

const SITE = "https://learnexity.org";

export default function CmsHead({ page, children }: { page: CmsPage; children?: React.ReactNode }) {
  const title = page.seo?.title || `${page.title} — Learnexity`;
  const description = page.seo?.description;
  const ogImage = page.seo?.og_image;
  const canonical = `${SITE}${page.path === "/" ? "" : page.path}`;

  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta key="og:title" property="og:title" content={title} />
      {description && <meta key="og:description" property="og:description" content={description} />}
      {ogImage && <meta key="og:image" property="og:image" content={ogImage} />}
      {ogImage && <meta key="twitter:image" name="twitter:image" content={ogImage} />}
      <meta key="twitter:title" name="twitter:title" content={title} />
      <link key="canonical" rel="canonical" href={canonical || SITE} />
      {children}
    </Head>
  );
}
