// pages/admin/cms/emails/index.tsx — Website CMS → Emails: every email the site sends.
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2, Mail, Search } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { apiErrorMessage, emailTemplatesAdmin, type EmailTemplateListItem } from "@/lib/cms/adminClient";

export default function CmsEmailsPage() {
  const [items, setItems] = useState<EmailTemplateListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    emailTemplatesAdmin
      .list()
      .then((r) => setItems(r.templates))
      .catch((e) => setError(apiErrorMessage(e, "Couldn't load emails.")));
  }, []);

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const map = new Map<string, EmailTemplateListItem[]>();
    (items ?? [])
      .filter((t) => !term || `${t.label} ${t.description}`.toLowerCase().includes(term))
      .forEach((t) => map.set(t.group, [...(map.get(t.group) ?? []), t]));
    return Array.from(map.entries());
  }, [items, q]);

  return (
    <AdminRouteGuard requiredPermission="cms">
      <AdminLayout>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <Link href="/admin/cms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4">
            <ArrowLeft size={15} /> Website CMS
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emails</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Change the subject and wording of the emails the site sends. Emails you haven&apos;t customised are sent with their original design.
          </p>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search emails"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-[#0f0f14] text-sm text-gray-900 dark:text-white"
            />
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {!items && !error && (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" /></div>
          )}

          <div className="space-y-8">
            {groups.map(([group, list]) => (
              <section key={group}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{group}</h2>
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f14] divide-y divide-gray-100 dark:divide-white/10">
                  {list.map((t) => (
                    <Link key={t.key} href={`/admin/cms/emails/${t.key}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                      <Mail size={16} className="text-indigo-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{t.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.description}</p>
                      </div>
                      {t.customized && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {t.customize_body ? "Custom text" : "Custom subject"}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
