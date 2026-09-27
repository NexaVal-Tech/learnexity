// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";
import { useRouter } from "next/router";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { InstructorAuthProvider } from '@/contexts/InstructorAuthContext';
import { ThemeProvider } from "@/contexts/ThemeContext";
import WhatsAppButton from "@/components/chat/WhatsappButton";
import Head from "next/head";
import { CmsGlobalsProvider } from "@/contexts/CmsGlobalsContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/admin");
  const isInstructorRoute = router.pathname.startsWith("/instructors");

  return (
    <>
      <Head>
        {/* Default title — pages will override this */}
        <title>Learnexity — Learn In-Demand Tech Skills and Launch Your Career</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Learnexity is a tech career platform. Build real skills, gain hands-on experience, and land jobs, freelance work, or start your own business."
        />
        <meta name="robots" content="index, follow" />
        <link key="canonical" rel="canonical" href={`https://learnexity.org${router.asPath.split(/[?#]/)[0]}`} />

        {/* Open Graph defaults */}
        <meta property="og:site_name" content="Learnexity" />
        <meta property="og:type" content="website" />
        <meta key="og:url" property="og:url" content={`https://learnexity.org${router.asPath.split(/[?#]/)[0]}`} />
        <meta key="og:title" property="og:title" content="Learnexity — Learn In-Demand Tech Skills" />
        <meta
          key="og:description"
          property="og:description"
          content="Build real tech skills, gain hands-on experience, and launch your career with Learnexity."
        />
        <meta key="og:image" property="og:image" content="https://learnexity.org/images/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content="Learnexity — Learn In-Demand Tech Skills" />
        <meta key="twitter:image" name="twitter:image" content="https://learnexity.org/images/og-image.png" />

        {/* Organization JSON-LD — controls Google logo + knowledge panel */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Learnexity",
              url: "https://learnexity.org",
              logo: "https://learnexity.org/images/Logo.png",
              sameAs: [
                "https://www.instagram.com/learnexity",
                "https://www.facebook.com/Learnexity",
                "https://www.linkedin.com/company/valuable-globalus/",
                "https://youtube.com/@learnexity",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-276-252-8415",
                contactType: "customer support",
                email: "info@learnexity.org",
              },
            }),
          }}
        />
      </Head>

      <ThemeProvider>
        <main className={GeistSans.variable}>
          {isAdminRoute ? (
            <AdminAuthProvider>
              <Component {...pageProps} />
            </AdminAuthProvider>
          ) : isInstructorRoute ? (
            <InstructorAuthProvider>
              <Component {...pageProps} />
            </InstructorAuthProvider>
          ) : (
            <AuthProvider>
              {/* CMS pages pass navbar/footer content via getStaticProps;
                  other pages fall back to a client-side fetch. */}
              <CmsGlobalsProvider value={pageProps?.cmsGlobals}>
                <Component {...pageProps} />
              </CmsGlobalsProvider>
              <WhatsAppButton />
            </AuthProvider>
          )}
        </main>
      </ThemeProvider>
    </>
  );
}