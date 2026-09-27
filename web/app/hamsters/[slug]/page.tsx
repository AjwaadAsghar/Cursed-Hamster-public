import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "../../components/JsonLd";
import SiteFooter from "../../components/SiteFooter";
import { HAMSTERS, getHamster, hamsterPath } from "../../lib/hamsters";
import { pageMetadata } from "../../lib/seo";
import { SITE_NAME, absoluteUrl } from "../../lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return HAMSTERS.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps<"/hamsters/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const h = getHamster(slug);
  if (!h) return {};
  const lower = h.name.toLowerCase();
  return pageMetadata({
    title: `${h.name} Meme: Become It on Your Webcam`,
    description: `${h.tagline} Become the ${lower} live on your webcam with this free hamster meme filter.`,
    path: hamsterPath(h),
    keywords: [`${lower} meme`, lower, `${lower} meme template`, "cursed hamster", "hamster meme"],
    image: { url: `${hamsterPath(h)}/opengraph-image`, alt: `${h.name} meme` },
  });
}

export default async function HamsterPage({ params }: PageProps<"/hamsters/[slug]">) {
  const { slug } = await params;
  const h = getHamster(slug);
  if (!h) notFound();

  const index = HAMSTERS.indexOf(h);
  const more = Array.from({ length: 6 }, (_, i) => HAMSTERS[(index + 1 + i) % HAMSTERS.length]).filter(
    (m) => m.slug !== h.slug
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Hamster memes", item: absoluteUrl("/hamsters") },
          { "@type": "ListItem", position: 3, name: h.name, item: absoluteUrl(hamsterPath(h)) },
        ],
      },
      {
        "@type": "ImageObject",
        name: `${h.name} meme`,
        description: h.tagline,
        contentUrl: absoluteUrl(h.image),
        url: absoluteUrl(hamsterPath(h)),
        isPartOf: { "@id": absoluteUrl("/#website") },
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
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-pink-700 hover:underline">
                {SITE_NAME}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/hamsters" className="hover:text-pink-700 hover:underline">
                Hamster memes
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-pink-900">
              {h.name}
            </li>
          </ol>
        </nav>

        <article className="mt-6 grid gap-8 md:grid-cols-[minmax(0,420px)_1fr] md:items-start">
          <figure className="rounded-3xl bg-white p-3 shadow-2xl shadow-pink-900/15 ring-4 ring-white/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={h.image}
              alt={`${h.name} meme: ${h.tagline}`}
              width={420}
              height={420}
              className="aspect-square w-full rounded-2xl object-cover"
            />
            <figcaption className="px-1 pt-2 text-center text-xs font-medium text-zinc-500">
              The {h.name.toLowerCase()} meme
            </figcaption>
          </figure>

          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-pink-900 sm:text-5xl">
              {h.name} Meme
            </h1>
            <p className="mt-3 text-lg font-medium text-pink-950/80">{h.tagline}</p>

            <Link
              href="/camera"
              className="btn-shine font-display mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-lg font-semibold text-white shadow-xl shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
            >
              Become the {h.name.toLowerCase()} 📸
            </Link>
            <p className="mt-2 text-xs text-pink-950/60">Free, no app, your camera never leaves your browser.</p>

            <section className="mt-8 rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
              <h2 className="font-display text-xl font-semibold text-pink-900">
                How to become the {h.name.toLowerCase()}
              </h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-zinc-800">
                {h.howTo.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          </div>
        </article>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
            <h2 className="font-display text-xl font-semibold text-pink-900">About the {h.name.toLowerCase()} meme</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-800">{h.about}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
            <h2 className="font-display text-xl font-semibold text-pink-900">When to use it</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {h.useItFor.map((u) => (
                <li key={u} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-800">
                  {u}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-pink-900">More cursed hamster memes</h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {more.map((m) => (
              <li key={m.slug}>
                <Link
                  href={hamsterPath(m)}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-transform hover:-translate-y-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={`${m.name} meme`}
                    width={240}
                    height={240}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                  <span className="px-3 py-2 text-sm font-semibold text-pink-900 group-hover:text-pink-600">
                    {m.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5">
            <Link href="/hamsters" className="font-semibold text-pink-800 underline hover:text-pink-600">
              See all {HAMSTERS.length} hamster memes →
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
