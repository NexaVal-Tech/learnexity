// _app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "../components/layouts/AppLayout";
import { GeistSans } from "geist/font/sans";
import { useRouter } from "next/router";
import useAuthTokenSync from "@/hooks/useAuthTokenSync";
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

export default function App({ Component, pageProps }: AppProps) {
  useAuthTokenSync(); 
  const router = useRouter();
  const isUserRoute = router.pathname.startsWith("/user");

  return (
    <main className={GeistSans.variable}>
      {/* Nest BOTH providers - order matters! */}
      <AuthProvider>
        <AdminAuthProvider>
          {isUserRoute ? (
            // User routes handle their own layout
            <Component {...pageProps} />
          ) : (
            // Public and admin routes use default layout
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          )}
        </AdminAuthProvider>
      </AuthProvider>
    </main>
  );
}