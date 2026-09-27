// lib/cms/adminClient.ts — admin-side CMS API calls + page revalidation.
import { adminApi } from "@/lib/adminApi";
import type { CmsPage, CmsSection, CmsSeo } from "./types";

export interface CmsPageListItem {
  slug: string;
  title: string;
  path: string;
  is_system: boolean;
  is_published: boolean;
  is_customized: boolean;
  section_count: number | null;
  updated_at: string | null;
}

export interface CmsMediaItem {
  id: number;
  type: "image" | "video";
  path: string;
  url: string;
  mime_type: string;
  size: number;
  original_name: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface CmsRevisionItem {
  id: number;
  subject_type: "page" | "global";
  subject_key: string;
  created_at: string;
  admin?: { id: number; name: string; email: string } | null;
  snapshot?: any;
}

export const cmsAdmin = {
  listPages: () =>
    adminApi.get<{ system_pages: CmsPageListItem[]; custom_pages: CmsPageListItem[]; globals: { key: string; updated_at: string }[] }>(
      "/api/admin/cms/pages"
    ),

  getPage: (slug: string) =>
    adminApi.get<{ page: CmsPage | null; meta: { slug: string; is_system: boolean; is_customized: boolean; title: string; path: string } }>(
      `/api/admin/cms/pages/${encodeURIComponent(slug)}`
    ),

  createPage: (payload: { title: string; slug: string; sections?: CmsSection[] }) =>
    adminApi.post<{ page: CmsPage }>("/api/admin/cms/pages", payload),

  savePage: (
    slug: string,
    payload: {
      sections?: CmsSection[];
      seo?: CmsSeo;
      title?: string;
      is_published?: boolean;
      new_slug?: string;
      base_updated_at?: string | null;
    }
  ) => adminApi.put<{ message: string; page: CmsPage; old_path: string | null }>(`/api/admin/cms/pages/${encodeURIComponent(slug)}`, payload),

  deletePage: (slug: string) => adminApi.delete<{ message: string; path: string }>(`/api/admin/cms/pages/${encodeURIComponent(slug)}`),

  getGlobal: (key: string) => adminApi.get<{ key: string; data: any; updated_at: string | null }>(`/api/admin/cms/globals/${key}`),

  saveGlobal: (key: string, data: any, base_updated_at?: string | null) =>
    adminApi.put<{ key: string; data: any; updated_at: string }>(`/api/admin/cms/globals/${key}`, { data, base_updated_at }),

  resetGlobal: (key: string) => adminApi.delete(`/api/admin/cms/globals/${key}`),

  revisions: (type: "page" | "global", key: string) =>
    adminApi.get<{ revisions: CmsRevisionItem[] }>("/api/admin/cms/revisions", { params: { type, key } }),

  revision: (id: number) => adminApi.get<{ revision: CmsRevisionItem }>(`/api/admin/cms/revisions/${id}`),

  restoreRevision: (id: number) => adminApi.post<{ message: string }>(`/api/admin/cms/revisions/${id}/restore`, {}),

  listMedia: (params: { type?: "image" | "video"; search?: string; page?: number; per_page?: number }) =>
    adminApi.get<{ data: CmsMediaItem[]; current_page: number; last_page: number; total: number }>("/api/admin/cms/media", { params }),

  uploadMedia: (file: File, alt?: string, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append("file", file);
    if (alt) form.append("alt", alt);
    return adminApi.post<{ media: CmsMediaItem }>("/api/admin/cms/media", form, {
      timeout: 10 * 60 * 1000, // large videos on slow connections
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },

  updateMedia: (id: number, alt: string) => adminApi.patch<{ media: CmsMediaItem }>(`/api/admin/cms/media/${id}`, { alt }),

  deleteMedia: (id: number, force = false) =>
    adminApi.delete<{ message: string }>(`/api/admin/cms/media/${id}`, { params: force ? { force: 1 } : undefined }),
};

/**
 * Ask the Next.js server to re-render these public pages now (see
 * pages/api/revalidate.ts). Returns false if it couldn't — the pages then
 * update on their own within ~10 minutes.
 */
export async function revalidatePaths(paths: string[]): Promise<boolean> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (!token || paths.length === 0) return false;
  try {
    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paths }),
    });
    if (!res.ok) return false;
    const body = await res.json();
    return Array.isArray(body.failed) ? body.failed.length === 0 : true;
  } catch {
    return false;
  }
}

/** Every public CMS path (for navbar/footer saves, which affect all pages). */
export async function allCmsPaths(): Promise<string[]> {
  try {
    const list = await cmsAdmin.listPages();
    return [
      ...list.system_pages.map((p) => p.path),
      ...list.custom_pages.filter((p) => p.is_published).map((p) => p.path),
    ];
  } catch {
    return [];
  }
}

export function apiErrorMessage(e: any, fallback = "Something went wrong."): string {
  return e?.response?.data?.message || e?.friendlyMessage || e?.message || fallback;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
