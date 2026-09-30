import type { NextConfig } from "next";
import { BASE_PATH } from "./app/lib/site";

const nextConfig: NextConfig = {
  // Served at ajtoolbox.com/cursed-hamster (ajtoolbox.com rewrites that path
  // here), so every route and asset lives under it.
  basePath: BASE_PATH,
  // Models (~17 MB) and meme images rarely change - let browsers keep them
  // instead of revalidating on every visit (Vercel's default is max-age=0).
  // Header sources get the basePath prepended automatically.
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
  // Old links to the bare vercel.app deployment move to the real address.
  async redirects() {
    const target = `https://ajtoolbox.com${BASE_PATH}`;
    return [
      { source: "/", destination: target, basePath: false, permanent: true },
      {
        source: "/:page(camera|hamsters|about|privacy|terms)",
        destination: `${target}/:page`,
        basePath: false,
        permanent: true,
      },
      {
        source: "/hamsters/:slug",
        destination: `${target}/hamsters/:slug`,
        basePath: false,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
