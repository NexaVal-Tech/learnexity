import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layouts/AppLayout";

export default function Consultation() {
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setShowPopup(true);
    }, 1000); // 1-second load
  }, []);

  return (
    <AppLayout>
      <h1>this is the consultation page</h1>

      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}

      {/* Popup Overlay */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Coming Soon
            </h2>
            <p className="text-gray-800 mb-5">
              Please bear with us, our consultation page will soon be completely functional, meanwhile you can browse more about all the courses we offer on our courses page.
            </p>

            <button
              onClick={() => router.push("/courses/courses")}
              className="px-5 py-2 bg-[#6C63FF] text-white rounded-xl hover:bg-gray-800 transition-all"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </AppLayout>
  );
}
