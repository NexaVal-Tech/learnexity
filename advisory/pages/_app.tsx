// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={GeistSans.variable}>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </main>
  );
}
