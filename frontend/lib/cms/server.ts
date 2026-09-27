// lib/cms/server.ts
//
// getStaticProps / getStaticPaths helpers for CMS pages. Runs only on the
// Next.js server (at build time and when a page is revalidated), never in
// the browser.
//
// Failure handling matters here because a pre-rendered page is cached:
//   - 404 from the API  → the page was never edited: render its defaults.
//   - API unreachable / 5xx during `next build` → render defaults, so a
//     backend outage can't fail the deploy.
//   - API unreachable / 5xx during a *revalidation* → throw. Next.js then
//     keeps serving the last good version instead of replacing an edited
//     page with the defaults.
import type { GetStaticPropsResult } from "next";
import type { CmsGlobals, CmsPage } from "./types";
import { mergeGlobals } from "./globalDefaults";
import { resolvePage } from "./resolve";

// Server-side fetches: on Windows, Node resolves "localhost" to the IPv6
// address ::1 first, but `php artisan serve` only listens on 127.0.0.1, so
// the request fails with "fetch failed" (the browser silently falls back,
// which is why the site itself still works). Use the IPv4 loopback here.
const toIPv4 = (url: string) => url.replace(/^(https?:\/\/)localhost(?=[:/]|$)/i, "$1127.0.0.1");

const API_BASE = toIPv4(
  (process.env.CMS_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "").replace(/\/api$/, "")
);

/** Safety net: even if an on-demand revalidation is missed, pages refresh within this many seconds. */
export const CMS_REVALIDATE_SECONDS = 600;

// During `next build`, and always in development (`next dev`), a CMS
// outage falls back to default content instead of erroring. Only a
// production revalidation throws, so the last good cached page is kept.
const isBuildPhase = () =>
  process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV !== "production";

class CmsUnavailable extends Error {}

async function getJson(path: string): Promise<{ status: number; body: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (res.status === 404) return { status: 404, body: null };
    if (!res.ok) throw new CmsUnavailable(`CMS API ${path} → HTTP ${res.status}`);
    return { status: res.status, body: await res.json() };
  } catch (e) {
    if (e instanceof CmsUnavailable) throw e;
    const err = e as Error & { cause?: { code?: string; message?: string } };
    const cause = err.cause?.code || err.cause?.message;
    throw new CmsUnavailable(
      `CMS API ${API_BASE}${path} unreachable: ${err.message}${cause ? ` (${cause})` : ""}. Is the Laravel server running?`
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch, or decide what to do when the API is down (see header comment). */
async function fetchOrFallback<T>(path: string, fallback: T, pick: (body: any) => T): Promise<T> {
  try {
    const { status, body } = await getJson(path);
    return status === 404 ? fallback : pick(body);
  } catch (e) {
    if (isBuildPhase()) {
      console.warn(`[cms] ${(e as Error).message} — building with default content.`);
      return fallback;
    }
    throw e;
  }
}

export async function fetchCmsGlobals(): Promise<CmsGlobals> {
  return fetchOrFallback("/api/cms/globals", mergeGlobals(null), (body) => mergeGlobals(body));
}

export interface CmsPageProps {
  cmsPage: CmsPage;
  cmsGlobals: CmsGlobals;
}

/** getStaticProps for a built-in page (home, about, …). */
export async function getCmsPageProps(slug: string): Promise<GetStaticPropsResult<CmsPageProps>> {
  const [saved, cmsGlobals] = await Promise.all([
    fetchOrFallback<CmsPage | null>(`/api/cms/pages/${encodeURIComponent(slug)}`, null, (b) => b?.page ?? null),
    fetchCmsGlobals(),
  ]);

  const cmsPage = resolvePage(slug, saved);
  if (!cmsPage) throw new Error(`Unknown built-in CMS page "${slug}"`);

  return { props: { cmsPage, cmsGlobals }, revalidate: CMS_REVALIDATE_SECONDS };
}

/** getStaticProps for a page-builder page at /{slug}. */
export async function getCustomPageProps(slug: string): Promise<GetStaticPropsResult<CmsPageProps>> {
  const [saved, cmsGlobals] = await Promise.all([
    fetchOrFallback<CmsPage | null>(`/api/cms/pages/${encodeURIComponent(slug)}`, null, (b) => b?.page ?? null),
    fetchCmsGlobals(),
  ]);

  // The public endpoint 404s for unpublished pages, so drafts never render here.
  if (!saved || saved.is_system) {
    return { notFound: true, revalidate: 60 };
  }

  const cmsPage = resolvePage(slug, saved)!;
  return { props: { cmsPage, cmsGlobals }, revalidate: CMS_REVALIDATE_SECONDS };
}

/** Published page-builder slugs, pre-rendered at build (others render on first visit). */
export async function getCustomPageSlugs(): Promise<string[]> {
  try {
    const { body } = await getJson("/api/cms/custom-pages");
    return (body?.pages ?? []).map((p: { slug: string }) => p.slug);
  } catch {
    return [];
  }
}
