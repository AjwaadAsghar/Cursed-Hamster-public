import Link from "next/link";
import { HAMSTERS, hamsterPath } from "../lib/hamsters";

// Crawlable internal links to every hamster page, on every content page.
export default function SiteFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-pink-200 bg-pink-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-display text-2xl font-bold text-pink-800">
            Cursed Hamster 🐹
          </Link>
          <nav aria-label="Main" className="flex flex-wrap gap-4 text-sm font-semibold text-pink-900/80">
            <Link href="/" className="hover:text-pink-700">
              Home
            </Link>
            <Link href="/camera" className="hover:text-pink-700">
              Hamster webcam filter
            </Link>
            <Link href="/hamsters" className="hover:text-pink-700">
              All hamster memes
            </Link>
          </nav>
        </div>
        <nav aria-label="Hamster memes">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-pink-700/80">Hamster memes</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-pink-950/70">
            {HAMSTERS.map((h) => (
              <li key={h.slug}>
                <Link href={hamsterPath(h)} className="hover:text-pink-700 hover:underline">
                  {h.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-pink-950/55">
          Cursed Hamster is a free hamster meme webcam filter. It runs entirely in your browser; your
          camera is never uploaded.
        </p>
      </div>
    </footer>
  );
}
