import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { api } from '@/lib/api';
import type { AchievementBadge, Certificate } from '@/lib/types';
import { Award, Download, Eye, Loader2, Lock, CreditCard } from 'lucide-react';
import CertificatePreviewModal from '@/components/achievements/CertificatePreviewModal';
import BadgePreviewModal from '@/components/achievements/BadgePreviewModal';

export default function AchievementsPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  // course_id -> { payment_status, enrollment_id } — used to gate certificate
  // downloads on completed payment (installment payers must finish all
  // installments, not just have has_access from a partial payment).
  const [enrollmentByCourse, setEnrollmentByCourse] = useState<Record<string, { paymentStatus: string; enrollmentId: number }>>({});
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [previewBadge, setPreviewBadge] = useState<AchievementBadge | null>(null);

  useEffect(() => {
    Promise.all([
      api.achievements.myBadges().catch(() => []),
      api.achievements.myCertificates().catch(() => []),
      api.enrollment.getUserEnrollments().catch(() => ({ enrollments: [] })),
    ]).then(([b, c, enrollRes]) => {
      setBadges(b);
      setCertificates(c);

      const map: Record<string, { paymentStatus: string; enrollmentId: number }> = {};
      (enrollRes.enrollments || []).forEach((e: any) => {
        map[String(e.course_id)] = { paymentStatus: e.payment_status, enrollmentId: e.id };
      });
      setEnrollmentByCourse(map);

      setLoading(false);
    });
  }, []);

  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pt-25">
        <h1 className="text-2xl font-bold text-gray-900">Badges &amp; Certificates</h1>
        <p className="mt-1 text-gray-500 text-sm">Achievements you've earned across your courses.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
        ) : (
          <>
           <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Badges */}
              <section>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  Badges
                </h2>

                {badges.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-6 text-gray-400 text-sm">
                    <Lock size={16} /> No badges unlocked yet — keep progressing through your course.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {badges.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setPreviewBadge(b)}
                        className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col items-center text-center shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
                      >
                        <span
                          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                          style={{
                            background: `${b.badge_color}22`,
                            color: b.badge_color,
                          }}
                        >
                          <Award size={22} />
                        </span>

                        <div className="text-sm font-semibold text-gray-900">
                          {b.name}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {b.description}
                        </div>

                        {b.unlocked_at && (
                          <div className="text-[11px] text-gray-400 mt-2">
                            {new Date(b.unlocked_at).toLocaleDateString()}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Certificates */}
              <section>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  Certificates
                </h2>

                {certificates.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-6 text-gray-400 text-sm">
                    <Lock size={16} /> No certificates yet — finish a course to earn one automatically.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((c) => {
                      const enrollment = enrollmentByCourse[String(c.course_id)];
                      const paymentCompleted = enrollment?.paymentStatus === 'completed';
                      const downloadUrl =
                        c.download_url ||
                        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${c.certificate_uid}/download`;

                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm gap-3"
                        >
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {c.course_title}
                            </div>

                            <div className="text-xs text-gray-500 mt-0.5">
                              Issued {new Date(c.issued_at).toLocaleDateString()}
                              {c.revoked_at && (
                                <span className="ml-2 text-red-600 font-medium">
                                  Revoked
                                </span>
                              )}
                            </div>
                          </div>

                          {!c.revoked_at && (
                            c.pdf_path ? (
                              paymentCompleted ? (
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <button
                                    onClick={() => setPreviewCert(c)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                                  >
                                    <Eye size={15} />
                                    Preview
                                  </button>
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900"
                                  >
                                    <Download size={15} />
                                    Download
                                  </a>
                                </div>
                              ) : (
                                <button
                                  onClick={() => enrollment && router.push(`/user/payment/${enrollment.enrollmentId}`)}
                                  className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 flex-shrink-0"
                                  title="Your certificate is ready, but payment for this course must be completed first"
                                >
                                  <CreditCard size={13} />
                                  Complete payment to unlock
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                Preparing PDF…
                              </span>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>

      <CertificatePreviewModal
        open={!!previewCert}
        onClose={() => setPreviewCert(null)}
        pdfUrl={
          previewCert
            ? previewCert.download_url ||
              `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${previewCert.certificate_uid}/download`
            : ''
        }
        title={previewCert?.course_title || 'Certificate'}
        subtitle={previewCert ? `Issued ${new Date(previewCert.issued_at).toLocaleDateString()}` : undefined}
      />

      <BadgePreviewModal
        open={!!previewBadge}
        onClose={() => setPreviewBadge(null)}
        name={previewBadge?.name || ''}
        description={previewBadge?.description || ''}
        badgeColor={previewBadge?.badge_color || '#4A3AFF'}
        unlockedAt={previewBadge?.unlocked_at}
      />
    </UserDashboardLayout>
  );
}
