// contexts/CmsGlobalsContext.tsx
//
// Navbar + footer content for every public page.
//
// CMS pages get it at build/revalidate time via getStaticProps
// (pageProps.cmsGlobals), so it's in the pre-rendered HTML. Pages that
// aren't CMS-managed (course listings, dashboards, …) have no such prop:
// they render the defaults first — identical on server and client, so no
// hydration mismatch — then swap in the saved version fetched once from
// the API and cached for the rest of the visit.
import { createContext, useContext, useEffect, useState } from 'react';
import type { CmsGlobals } from '@/lib/cms/types';
import { GLOBAL_DEFAULTS, mergeGlobals } from '@/lib/cms/globalDefaults';

const CmsGlobalsCtx = createContext<CmsGlobals | null>(null);

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '').replace(/\/api$/, '');

let cached: CmsGlobals | null = null;
let inflight: Promise<CmsGlobals | null> | null = null;

function loadGlobals(): Promise<CmsGlobals | null> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch(`${API_URL}/api/cms/globals`, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) cached = mergeGlobals(json);
        return cached;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Called by the admin editor after saving, so the admin's own tab shows the change. */
export function invalidateCmsGlobalsCache() {
  cached = null;
}

export function CmsGlobalsProvider({ value, children }: { value?: CmsGlobals | null; children: React.ReactNode }) {
  if (value) cached = value; // freshest copy wins for later non-CMS pages
  return <CmsGlobalsCtx.Provider value={value ?? null}>{children}</CmsGlobalsCtx.Provider>;
}

export function useCmsGlobals(): CmsGlobals {
  const fromProps = useContext(CmsGlobalsCtx);
  // `cached` is only ever set after the first page has loaded (by a fetch
  // or by a CMS page's props), so reading it here can't cause a hydration
  // mismatch — on first load it's null — while client-side navigations to
  // non-CMS pages get the saved navbar/footer immediately, with no flash.
  const [fetched, setFetched] = useState<CmsGlobals | null>(() => cached);

  useEffect(() => {
    if (fromProps) return;
    let alive = true;
    loadGlobals().then((g) => {
      if (alive && g) setFetched(g);
    });
    return () => {
      alive = false;
    };
  }, [fromProps]);

  return fromProps ?? fetched ?? GLOBAL_DEFAULTS;
}
