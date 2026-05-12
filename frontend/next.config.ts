import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.learnexity.org",
      },
    ],
  },

  basePath: "",
  assetPrefix: "/",
};

export default nextConfig;