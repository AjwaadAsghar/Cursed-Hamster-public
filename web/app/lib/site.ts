// Single source of truth for the public URL and core copy. When the custom
// domain goes live, set NEXT_PUBLIC_SITE_URL in Vercel (or change the
// fallback below) and every canonical URL, sitemap entry, OG tag and
// structured-data block follows.

// The app is served from ajtoolbox.com/cursed-hamster: ajtoolbox.com rewrites
// that path to this deployment, and Next's basePath puts every route there.
// basePath doesn't touch plain strings (<img src>, fetch, manifest), so those
// go through withBase().
export const BASE_PATH = "/cursed-hamster";

export function withBase(path: string): string {
  return `${BASE_PATH}${path}`;
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://ajtoolbox.com${BASE_PATH}`
).replace(/\/$/, "");

export const SITE_NAME = "Cursed Hamster";

export const CONTACT_EMAIL = "asgharajwaad@gmail.com";

// Bump when the privacy policy or terms change.
export const LEGAL_LAST_UPDATED = "September 28, 2026";

export const SITE_TITLE = "Cursed Hamster: The Hamster Meme Webcam Filter";

export const SITE_DESCRIPTION =
  "Become the hamster meme! A free hamster meme webcam filter: pull faces and gestures and a cursed hamster copies you live. No app, nothing uploaded.";

export const SITE_KEYWORDS = [
  "cursed hamster",
  "hamster meme",
  "hamster memes",
  "cursed hamster meme",
  "hamster meme filter",
  "hamster webcam filter",
  "hamster meme generator",
  "which hamster are you",
  "become the hamster",
  "funny hamster meme",
  "hamster reaction meme",
  "meme webcam filter",
  "gesture meme filter",
];

export function absoluteUrl(path = "/"): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// JSON-LD must not be able to break out of its <script> tag.
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
