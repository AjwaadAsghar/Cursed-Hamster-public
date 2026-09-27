import type { MetadataRoute } from "next";
import { HAMSTERS, hamsterPath } from "./lib/hamsters";
import { absoluteUrl } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/camera"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/hamsters"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...HAMSTERS.map((h) => ({
      url: absoluteUrl(hamsterPath(h)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [absoluteUrl(h.image)],
    })),
  ];
}
