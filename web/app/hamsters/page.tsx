import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "../components/JsonLd";
import SiteFooter from "../components/SiteFooter";
import { HAMSTERS, hamsterPath } from "../lib/hamsters";
import { pageMetadata } from "../lib/seo";
import { SITE_NAME, TOOLBOX_NAME, TOOLBOX_URL, absoluteUrl } from "../lib/site";

export const metadata: Metadata = pageMetadata({
  title: `All ${HAMSTERS.length} Cursed Hamster Memes`,
  description: `All ${HAMSTERS.length} cursed hamster memes in one place: poker face, finger gun, side eye, lollipop hamster and more. Pick one and become it on your webcam.`,
  path: "/hamsters",
  keywords: ["hamster memes", "cursed hamster memes", "hamster meme collection", "hamster reaction memes"],
});

export default function HamstersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `All cursed hamster memes`,
        url: absoluteUrl("/hamsters"),
        isPartOf: { "@id": absoluteUrl("/#website") },
      },
      {
        "@type": "ItemList",
        name: "Cursed hamster memes",
        numberOfItems: HAMSTERS.length,
        itemListElement: HAMSTERS.map((h, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${h.name} meme`,
          url: absoluteUrl(hamsterPath(h)),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Hamster memes", item: absoluteUrl("/hamsters") },
        ],
      },
    ],
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(160deg, #ffd6e8 0%, #ffb6d5 45%, #ff9ccb 100%)" }}
    >
      <JsonLd data={jsonLd} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm font-medium text-pink-900/70">
          <a href={TOOLBOX_URL} className="inline-block py-1.5 hover:text-pink-700 hover:underline">
            {TOOLBOX_NAME}
          </a>{" "}
          ›{" "}
          <Link href="/" className="inline-block py-1.5 hover:text-pink-700 hover:underline">
            {SITE_NAME}
          </Link>{" "}
          › <span className="text-pink-900">Hamster memes</span>
        </nav>

        <header className="mt-6 max-w-2xl">
          <h1 className="font-display text-[2.1rem] font-bold leading-tight tracking-tight text-pink-900 sm:text-5xl">
            All {HAMSTERS.length} cursed hamster memes
          </h1>
          <p className="mt-3 text-base text-pink-950/80 sm:text-lg">
            The full collection of cursed hamster memes, from the poker face hamster to the finger gun
            hamster. Tap one to see how to do the pose, then become that hamster live on your webcam.
          </p>
          <Link
            href="/camera"
            className="btn-shine font-display mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-lg font-semibold text-white shadow-xl shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
          >
            Try the hamster filter 📸
          </Link>
        </header>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {HAMSTERS.map((h, i) => (
            <li key={h.slug}>
              <Link
                href={hamsterPath(h)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-transform hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={h.image}
                  alt={`${h.name} meme`}
                  width={260}
                  height={260}
                  loading={i < 8 ? "eager" : "lazy"}
                  className="aspect-square w-full object-cover"
                />
                <span className="flex flex-col gap-0.5 px-3 py-2.5">
                  <span className="font-display text-base font-semibold text-pink-900 group-hover:text-pink-600">
                    {h.name}
                  </span>
                  <span className="text-xs leading-snug text-zinc-600">{h.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
