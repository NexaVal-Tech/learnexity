// pages/user/upgrade.tsx

"use client";
import { useEffect, useState } from "react";
import UserHeader from "@/components/header/userHeader";
import UpgradeModal from "@/components/header/upgradeModal";
import api, { handleApiError } from "@/lib/api";

export default function UpgradePage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.enrollment.getUserEnrollments()
      .then((res) => setEnrollments(
        res.enrollments.filter((e: any) => e.payment_status === "completed")
      ))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <UserHeader />
      <main className="pt-30 max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade your plan</h1>
        <p className="text-gray-500 text-sm mb-8">
          Select a course to see available upgrade options.
        </p>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#4A3AFF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && enrollments.length === 0 && (
          <p className="text-gray-400 text-sm">
            You don't have any active enrollments yet.
          </p>
        )}

        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4"
            >
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {enrollment.course_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {enrollment.learning_track?.replace(/_/g, " ")}
                </p>
              </div>
              <UpgradeModal
                courseId={enrollment.course_id}
                onUpgradeComplete={() =>
                  api.enrollment.getUserEnrollments().then((res) =>
                    setEnrollments(
                      res.enrollments.filter(
                        (e: any) => e.payment_status === "completed"
                      )
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}