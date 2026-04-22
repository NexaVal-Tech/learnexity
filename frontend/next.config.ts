import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Remove output: "export" — switching to Next.js server mode
  images: {
    unoptimized: true,
  },
  basePath: "",
  assetPrefix: "/",
};

export default nextConfig;