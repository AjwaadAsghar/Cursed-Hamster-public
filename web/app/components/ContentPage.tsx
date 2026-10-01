import Link from "next/link";
import type { ReactNode } from "react";
import JsonLd from "./JsonLd";
import SiteFooter from "./SiteFooter";
import { SITE_NAME, TOOLBOX_NAME, TOOLBOX_URL, absoluteUrl } from "../lib/site";

// Shared shell for text pages (about, privacy, terms): breadcrumb, heading,
// readable column, footer.
export default function ContentPage({
  title,
  path,
  intro,
  updated,
  children,
}: {
  title: string;
  path: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: title, item: absoluteUrl(path) },
    ],
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(160deg, #ffd6e8 0%, #ffb6d5 45%, #ff9ccb 100%)" }}
    >
      <JsonLd data={breadcrumbs} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm font-medium text-pink-900/70">
          <a href={TOOLBOX_URL} className="inline-block py-1.5 hover:text-pink-700 hover:underline">
            {TOOLBOX_NAME}
          </a>{" "}
          ›{" "}
          <Link href="/" className="inline-block py-1.5 hover:text-pink-700 hover:underline">
            {SITE_NAME}
          </Link>{" "}
          › <span className="text-pink-900">{title}</span>
        </nav>
        <article className="prose-hamster mt-4 rounded-3xl bg-white/85 p-5 shadow-xl shadow-pink-900/10 backdrop-blur sm:mt-6 sm:p-10">
          <h1 className="font-display text-[2.1rem] font-bold leading-tight tracking-tight text-pink-900 sm:text-4xl">{title}</h1>
          {updated && <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>}
          {intro && <div className="mt-4 text-base leading-relaxed text-zinc-700 sm:text-lg">{intro}</div>}
          <div className="mt-6">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
