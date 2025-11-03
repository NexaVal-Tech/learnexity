// _app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "../components/layouts/AppLayout";
import { GeistSans } from "geist/font/sans";
import { useRouter } from "next/router";
import useAuthTokenSync from "@/hooks/useAuthTokenSync";
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  useAuthTokenSync(); 
  const router = useRouter();
  const isUserRoute = router.pathname.startsWith("/user");

  return (
    <main className={GeistSans.variable}>
      {/* Wrap EVERYTHING with AuthProvider */}
      <AuthProvider>
        {isUserRoute ? (
          // User routes handle their own layout (UserDashboardLayout handles protection)
          <Component {...pageProps} />
        ) : (
          // Public routes use default layout
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        )}
      </AuthProvider>
    </main>
  );
}