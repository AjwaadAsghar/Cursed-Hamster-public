import Link from "next/link";
import type { ReactNode } from "react";
import JsonLd from "./JsonLd";
import SiteFooter from "./SiteFooter";
import { SITE_NAME, absoluteUrl } from "../lib/site";

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
          <Link href="/" className="hover:text-pink-700 hover:underline">
            {SITE_NAME}
          </Link>{" "}
          › <span className="text-pink-900">{title}</span>
        </nav>
        <article className="prose-hamster mt-6 rounded-3xl bg-white/85 p-6 shadow-xl shadow-pink-900/10 backdrop-blur sm:p-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-pink-900">{title}</h1>
          {updated && <p className="mt-2 text-sm text-zinc-500">Last updated: {updated}</p>}
          {intro && <div className="mt-4 text-lg leading-relaxed text-zinc-700">{intro}</div>}
          <div className="mt-6">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
