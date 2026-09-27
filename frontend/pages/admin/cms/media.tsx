// pages/admin/cms/media.tsx — CMS media library.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { MediaLibrary } from "@/components/admin/cms/MediaLibrary";

export default function CmsMediaPage() {
  return (
    <AdminRouteGuard requiredPermission="cms">
      <AdminLayout>
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          <Link href="/admin/cms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
            <ArrowLeft size={15} /> Website CMS
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Media library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Images, logos, icons and videos used across the website. Click a file to copy its link, add a description, or delete it.
          </p>
          <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-xl p-5 min-h-[60vh] flex flex-col">
            <MediaLibrary kind="all" />
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
