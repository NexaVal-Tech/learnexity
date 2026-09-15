import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,

  images: {
    // REQUIRES "sharp" installed before this is deployed — same note as the
    // main frontend app's next.config.ts. Safe in `next dev` either way.
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
