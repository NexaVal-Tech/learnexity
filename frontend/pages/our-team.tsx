import Head from "next/head";
import AppLayout from "@/components/layouts/AppLayout";
import Footer from "@/components/footer/Footer";
import Link from "next/link";

export default function Team() {
  return (
    <>
      <Head>
        <title>Our Team - Learnexity</title>
        <meta
          name="description"
          content="Meet the passionate team behind Learnexity, dedicated to revolutionizing education through technology."
        />
      </Head>

      <AppLayout>
        {/* Page content goes here */}

        <Footer />
      </AppLayout>
    </>
  );
}