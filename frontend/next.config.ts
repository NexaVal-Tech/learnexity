import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  basePath: "",
  assetPrefix: "/",
};

export default nextConfig;