import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Gzip/Brotli-compress responses — helps most on slow connections where
  // transfer time (not just latency) dominates load time.
  compress: true,

  // Drop the X-Powered-By response header — no functional effect on speed,
  // just avoids leaking framework info on every response.
  poweredByHeader: false,

  images: {
    // REQUIRES "sharp" installed in the frontend's production dependencies
    // (npm install sharp) before this is deployed — Next.js's built-in
    // image optimization endpoint (/_next/image) needs sharp to resize/
    // convert images in a self-hosted (non-Vercel) production build, and
    // will error on image requests without it. Safe locally in `next dev`
    // either way, but install sharp before shipping this to production.
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.learnexity.org",
      },
    ],
  },

  // Static files under /public (images, fonts, etc.) aren't hashed by
  // filename, so Next doesn't cache them aggressively by default — repeat
  // visits on a slow connection re-download them every time. A day of
  // "fresh" caching plus a week of stale-while-revalidate lets the browser
  // reuse them without risking long-term staleness if an asset is swapped.
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/thumbnails/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  basePath: "",
  assetPrefix: "/",
};

export default nextConfig;