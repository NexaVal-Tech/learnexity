// pages/admin/cms/preview.tsx
//
// Live preview for the CMS editors. Loaded inside an <iframe> by the page /
// navbar / footer editors, which post the unsaved draft here — so the
// preview uses real viewport widths (desktop / tablet / mobile) and the
// exact public components, without saving anything.
//
// Only accepts messages from this same origin, and only renders the data
// it's sent; it has no access to anything the editor didn't pass it.
import { useEffect, useState } from "react";
import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import SectionRenderer from "@/components/cms/SectionRenderer";
import { KidsPageShell } from "@/components/cms/blocks/kids";
import { AuthProvider } from "@/contexts/AuthContext";
import { CmsGlobalsProvider } from "@/contexts/CmsGlobalsContext";
import { mergeGlobals } from "@/lib/cms/globalDefaults";
import type { CmsSection, FooterData, NavbarData } from "@/lib/cms/types";

export interface CmsPreviewPayload {
  slug?: string;
  sections?: CmsSection[];
  navbar?: NavbarData;
  footer?: FooterData;
  /** Show only the navbar/footer (global editors), no page body. */
  chromeOnly?: boolean;
  /** Page-builder page (rendered with the same top spacing as pages/[slug].tsx). */
  isCustom?: boolean;
}

export default function CmsPreview() {
  const [payload, setPayload] = useState<CmsPreviewPayload | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "cms-preview") setPayload(e.data.payload as CmsPreviewPayload);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "cms-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!payload) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading preview…</div>;
  }

  const globals = payload.navbar || payload.footer ? mergeGlobals({ navbar: payload.navbar, footer: payload.footer }) : null;
  const sections = payload.sections ?? [];

  return (
    <>
      <Head>
        <title>Preview — Learnexity</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AuthProvider>
        <CmsGlobalsProvider value={globals}>
          <AppLayout>
            {payload.chromeOnly ? (
              <div className="min-h-[50vh] pt-24 px-6 text-center text-[var(--text-muted)] text-sm">
                Page content appears here.
              </div>
            ) : payload.slug === "kids" ? (
              <KidsPageShell sections={sections} />
            ) : payload.isCustom ? (
              <div className="min-h-[60vh] pt-16">
                <SectionRenderer sections={sections} />
              </div>
            ) : (
              <SectionRenderer sections={sections} />
            )}
            <Footer />
          </AppLayout>
        </CmsGlobalsProvider>
      </AuthProvider>
    </>
  );
}
