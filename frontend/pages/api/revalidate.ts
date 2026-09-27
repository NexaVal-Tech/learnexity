// pages/api/revalidate.ts
//
// On-demand revalidation for CMS pages: after an admin saves in the CMS,
// the admin dashboard (same origin) POSTs the affected paths here and the
// pages are re-rendered with the new content within seconds.
//
// Auth: the caller sends its admin JWT; we confirm it with the Laravel API
// (/api/admin/me) and require the "cms" permission. No shared secret has to
// be configured, and nobody without CMS access can trigger rebuilds.
import type { NextApiRequest, NextApiResponse } from "next";

// Server-side fetches: on Windows, Node resolves "localhost" to the IPv6
// address ::1 first, but `php artisan serve` only listens on 127.0.0.1, so
// the request fails with "fetch failed" (the browser silently falls back,
// which is why the site itself still works). Use the IPv4 loopback here.
const toIPv4 = (url: string) => url.replace(/^(https?:\/\/)localhost(?=[:/]|$)/i, "$1127.0.0.1");

const API_BASE = toIPv4(
  (process.env.CMS_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "").replace(/\/api$/, "")
);

const MAX_PATHS = 60;

async function isCmsAdmin(authorization: string): Promise<boolean | "unreachable"> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      headers: { Authorization: authorization, Accept: "application/json" },
    });
    if (!res.ok) return false;
    const body = await res.json();
    const admin = body?.data ?? body?.admin ?? body;
    if (!admin) return false;
    if (admin.is_super_admin) return true;
    return Array.isArray(admin.permissions) && admin.permissions.includes("cms");
  } catch (e) {
    console.error(`[revalidate] Can't reach ${API_BASE}/api/admin/me:`, (e as Error).message);
    return "unreachable";
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authorization = req.headers.authorization;
  const check = authorization?.startsWith("Bearer ") ? await isCmsAdmin(authorization) : false;
  if (check === "unreachable") {
    return res.status(503).json({ message: `The site server can't reach the API at ${API_BASE}. Is Laravel running?` });
  }
  if (!check) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const paths: unknown = req.body?.paths;
  if (!Array.isArray(paths) || paths.length === 0) {
    return res.status(422).json({ message: "Provide a non-empty `paths` array." });
  }

  const clean = Array.from(
    new Set(
      paths
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim())
        // Only site-relative paths; never let this be pointed elsewhere.
        .filter((p) => p.startsWith("/") && !p.startsWith("//") && p.length < 200 && !p.startsWith("/admin") && !p.startsWith("/api"))
    )
  ).slice(0, MAX_PATHS);

  const revalidated: string[] = [];
  const failed: { path: string; error: string }[] = [];

  for (const path of clean) {
    try {
      await res.revalidate(path);
      revalidated.push(path);
    } catch (e) {
      failed.push({ path, error: (e as Error).message });
    }
  }

  return res.status(failed.length && !revalidated.length ? 500 : 200).json({ revalidated, failed });
}
