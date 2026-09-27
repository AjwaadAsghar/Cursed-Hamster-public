import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Models (~17 MB) and meme images rarely change - let browsers keep them
  // instead of revalidating on every visit (Vercel's default is max-age=0).
  async headers() {
    const longCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=604800, stale-while-revalidate=2592000",
      },
    ];
    return [
      { source: "/models/:path*", headers: longCache },
      { source: "/memes/:path*", headers: longCache },
    ];
  },
};

export default nextConfig;
