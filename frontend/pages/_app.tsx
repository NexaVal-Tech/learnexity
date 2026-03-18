// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "@/components/layouts/AppLayout";
import { GeistSans } from "geist/font/sans";
import { useRouter } from "next/router";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
// import useAuthTokenSync from "@/hooks/useAuthTokenSync";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith("/admin");
  const isUserRoute = router.pathname.startsWith("/user");

  // ✅ Only sync USER tokens on USER routes
  // if (isUserRoute) {
  //   useAuthTokenSync();
  // }

  return (
    <main className={GeistSans.variable}>
      {isAdminRoute ? (
        // 🔐 ADMIN ONLY
        <AdminAuthProvider>
          <Component {...pageProps} />
        </AdminAuthProvider>
      ) : (
        // 👤 USER + PUBLIC
        <AuthProvider>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </AuthProvider>
      )}
    </main>
  );
}
