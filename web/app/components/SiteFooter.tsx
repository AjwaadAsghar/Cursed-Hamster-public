import Link from "next/link";
import { HAMSTERS, hamsterPath } from "../lib/hamsters";
import { TOOLBOX_NAME, TOOLBOX_URL } from "../lib/site";

// Crawlable internal links to every hamster page, on every content page.
export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-pink-200 bg-pink-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-display text-2xl font-bold text-pink-800">
            Cursed Hamster 🐹
          </Link>
          <nav aria-label="Main" className="flex flex-wrap gap-x-4 text-sm font-semibold text-pink-900/80">
            <Link href="/" className="py-2 hover:text-pink-700">
              Home
            </Link>
            <Link href="/camera" className="py-2 hover:text-pink-700">
              Hamster webcam filter
            </Link>
            <Link href="/hamsters" className="py-2 hover:text-pink-700">
              All hamster memes
            </Link>
          </nav>
        </div>
        <nav aria-label="Hamster memes">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-pink-700/80">Hamster memes</p>
          <ul className="flex flex-wrap gap-x-4 text-sm text-pink-950/70">
            {HAMSTERS.map((h) => (
              <li key={h.slug}>
                <Link href={hamsterPath(h)} className="inline-block py-1.5 hover:text-pink-700 hover:underline">
                  {h.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-3 border-t border-pink-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-pink-950/55">
            Cursed Hamster is a free hamster meme webcam filter. It runs entirely in your browser; your
            camera is never uploaded. Part of{" "}
            <a href={TOOLBOX_URL} className="font-semibold text-pink-900/80 underline hover:text-pink-700">
              {TOOLBOX_NAME}
            </a>
            , free tools that run in your browser.
          </p>
          <nav aria-label="Legal" className="flex shrink-0 gap-4 text-xs font-semibold text-pink-900/70">
            <Link href="/about" className="py-2 hover:text-pink-700">
              About &amp; contact
            </Link>
            <Link href="/privacy" className="py-2 hover:text-pink-700">
              Privacy
            </Link>
            <Link href="/terms" className="py-2 hover:text-pink-700">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
