import Head from "next/head";

import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";

export default function Refer$Earn() {
  return (
    <>
      <Head>
        <title>Refer & Earn - be a part of our referral program and earn</title>
        <meta
          name="description"
          content="be a part of our referral program and earn."
        />
        <link rel="canonical" href="https://learnexity.org/refer&earn" />
      </Head>

      <AppLayout>
        {/* Coming Soon Section */}
        <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Refer & Earn
          </h1>

          <p className="text-lg md:text-xl text-gray-400">
            🚀 Coming Soon
          </p>
        </section>

        <Footer />
      </AppLayout>
    </>
  );
}