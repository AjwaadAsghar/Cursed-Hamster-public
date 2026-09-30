import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./site";

// Child `openGraph`/`twitter` objects replace the parent's instead of merging,
// so every page builds its full set here, including the share image (the
// root opengraph-image route unless the page passes its own).
const DEFAULT_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Cursed Hamster: become the hamster meme with your webcam",
};

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  keywords?: string[];
  image?: { url: string; alt: string };
}): Metadata {
  const { title, description, path, absoluteTitle, keywords } = opts;
  const image = opts.image ? { ...DEFAULT_IMAGE, ...opts.image } : DEFAULT_IMAGE;
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
