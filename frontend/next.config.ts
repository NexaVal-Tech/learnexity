import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  output: "export", // enables static export with /out folder
  images: {
    unoptimized: true, // allow <Image /> without needing Next.js image optimizer
  },
  basePath: "", // set to subfolder if needed
  assetPrefix: "/",
};

export default nextConfig;
