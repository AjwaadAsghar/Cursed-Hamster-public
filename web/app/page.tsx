import Link from "next/link";
import FloatingEmojis from "./components/FloatingEmojis";
import PrefetchModels from "./components/PrefetchModels";
import JsonLd from "./components/JsonLd";
import SiteFooter from "./components/SiteFooter";
import { HAMSTERS, hamsterPath } from "./lib/hamsters";
import { withBase } from "./lib/site";

const HAMSTER_COUNT = HAMSTERS.length;

const FAQ = [
  {
    q: "What is Cursed Hamster?",
    a: `Cursed Hamster is a free hamster meme webcam filter. Turn on your camera, pull a face or make a gesture, and the matching cursed hamster meme copies you live. There are ${HAMSTER_COUNT} hamsters to find, from the poker face hamster to the finger gun hamster.`,
  },
  {
    q: "Is Cursed Hamster free?",
    a: "Yes. It's completely free, with no sign-up and no app to install. It works right in your web browser.",
  },
  {
    q: "Is my camera recorded or uploaded anywhere?",
    a: "No. All the face, hand and body tracking runs locally in your browser. Your camera feed never leaves your device. Photos and clips are only made when you press the button, and they're saved on your device.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. It works in modern browsers on iPhone, Android, laptops and desktops. Just allow camera access when your browser asks.",
  },
  {
    q: "Can I share my hamster?",
    a: "Yes. Snap a photo or record a 5 second clip of you next to your hamster, then share it straight to Instagram, TikTok or your group chat.",
  },
  {
    q: "Why isn't the hamster changing?",
    a: "Make sure you're well lit and your hands are in frame, then hold the pose for about a second. The gesture list on the camera page shows exactly how to do each one.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const POLAROIDS = [
  { src: withBase("/memes/hug.jpg"), top: "5%", left: "3%", rotate: -12, size: 132 },
  { src: withBase("/memes/thumbs_up.jpg"), top: "9%", right: "4%", rotate: 10, size: 116 },
  { src: withBase("/memes/thinking.jpg"), bottom: "12%", left: "2%", rotate: 8, size: 124 },
  { src: withBase("/memes/poker_face.jpg"), bottom: "5%", right: "3%", rotate: -8, size: 136 },
];

// Small strip of hamsters shown on phones, where the polaroids are hidden.
const STRIP = [withBase("/memes/side_eye.jpg"), withBase("/memes/nerd.jpg"), withBase("/memes/bicep.jpg"), withBase("/memes/sad.jpg")];

const STEPS = [
  { emoji: "📸", text: "Allow your camera" },
  { emoji: "🤞", text: "Pull a face or gesture" },
  { emoji: "🐹", text: "A hamster copies you" },
];

export default function Home() {
  return (
    <>
    <JsonLd data={faqJsonLd} />
    <div
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-10 text-center sm:px-6 sm:py-16"
      style={{
        background:
          "linear-gradient(160deg, #ffd6e8 0%, #ffb6d5 35%, #ff8fc4 70%, #ff6fb0 100%)",
      }}
    >
      <FloatingEmojis />
      <PrefetchModels />

      {/* Soft glow behind the hero */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 65%)" }}
      />

      {/* Decorative polaroid hamsters, desktop/tablet only */}
      {POLAROIDS.map((p, i) => (
        <div
          key={i}
          className="polaroid absolute z-0 hidden rounded-lg bg-white p-2 pb-6 shadow-xl sm:block"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt=""
            width={p.size}
            height={p.size}
            style={{ width: p.size, height: p.size, objectFit: "cover", borderRadius: 4 }}
          />
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center">
        <span className="rounded-full bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-pink-700 shadow-sm backdrop-blur">
          {HAMSTER_COUNT} gestures · {HAMSTER_COUNT} hamsters
        </span>

        <div className="relative mt-5 sm:mt-6">
          <div className="h-32 w-32 overflow-hidden rounded-full shadow-2xl ring-8 ring-white/70 sm:h-44 sm:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBase("/memes/shy.jpg")}
              alt="A shy hamster"
              width={176}
              height={176}
              className="h-full w-full object-cover"
            />
          </div>
          <span
            className="absolute -right-3 -top-1 text-4xl"
            style={{ animation: "wobble 2.4s ease-in-out infinite" }}
          >
            ✨
          </span>
        </div>

        <h1
          className="font-display mt-5 text-[2.6rem] font-bold leading-tight tracking-tight sm:mt-6 sm:text-6xl"
          style={{ color: "#a3145a", textShadow: "0 3px 0 rgba(255,255,255,0.7)" }}
        >
          Cursed Hamster
        </h1>
        <p className="mt-3 max-w-sm text-base font-medium text-pink-950/75">
          Point your webcam at yourself and pull faces. Become the hamster.
        </p>
        <p className="mt-1 text-sm font-semibold text-pink-800/70">The hamster meme webcam filter</p>

        <ol className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-7">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1.5 text-[13px] font-semibold text-pink-900/85 shadow-sm backdrop-blur sm:gap-2 sm:px-3.5 sm:text-sm"
            >
              <span>{s.emoji}</span>
              {s.text}
            </li>
          ))}
        </ol>

        <Link
          href="/camera"
          className="btn-shine font-display mt-7 rounded-full px-10 py-4 text-xl font-semibold text-white shadow-xl shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95 sm:mt-9"
          style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
        >
          Start the camera 📸
        </Link>

        <p className="mt-3 max-w-xs text-center text-xs font-medium text-pink-950/60 sm:max-w-none">
          🔒 Runs entirely in your browser. Nothing is uploaded.{" "}
          <Link href="/privacy" className="inline-block px-1 py-2 underline hover:text-pink-700">
            Privacy
          </Link>
        </p>

        {/* Phone-only meme strip */}
        <div className="mt-6 flex gap-2 sm:hidden">
          {STRIP.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt="Cursed hamster meme"
              width={64}
              height={64}
              className="rounded-xl bg-white p-1 shadow-lg"
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>

    <main className="relative w-full bg-pink-50/95 px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 sm:gap-16">
        <section className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[1.75rem] font-bold leading-tight text-pink-900 sm:text-4xl">
            What is Cursed Hamster?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700 sm:text-lg">
            Cursed Hamster is a free <strong>hamster meme webcam filter</strong>. Instead of putting a
            filter on your face, it finds the <strong>cursed hamster meme</strong> that matches what
            you&apos;re doing: give a thumbs up and you get the thumbs up hamster, make finger guns and
            you become the finger gun hamster, look away and the side eye hamster judges you back.
            There are {HAMSTER_COUNT} hamsters to collect. Can you become them all?
          </p>
        </section>

        <section aria-labelledby="all-hamsters">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="all-hamsters" className="font-display text-3xl font-bold text-pink-900">
              Every hamster meme you can become
            </h2>
            <Link href="/hamsters" className="inline-block py-2 text-sm font-semibold text-pink-700 underline hover:text-pink-500">
              See all hamster memes →
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
            {HAMSTERS.map((h) => (
              <li key={h.slug}>
                <Link
                  href={hamsterPath(h)}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl bg-white p-2 text-center shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.image}
                    alt={`${h.name} meme`}
                    width={120}
                    height={120}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <span className="text-xs font-semibold leading-tight text-pink-900 group-hover:text-pink-600">
                    {h.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-it-works" className="grid gap-4 sm:grid-cols-3">
          <h2 id="how-it-works" className="font-display text-3xl font-bold text-pink-900 sm:col-span-3">
            How the hamster filter works
          </h2>
          {[
            {
              t: "1. Allow your camera",
              d: "Open the hamster filter and let your browser use your webcam. Nothing is uploaded; it all runs on your device.",
            },
            {
              t: "2. Pull a face or gesture",
              d: "Thumbs up, finger guns, hands on your cheeks, a flex, a side eye. Hold it for a second.",
            },
            {
              t: "3. Become the hamster",
              d: "The matching hamster meme appears next to you live. Snap a photo or a clip and share it.",
            },
          ].map((step) => (
            <div key={step.t} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-display text-lg font-semibold text-pink-800">{step.t}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-700">{step.d}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl">
          <h2 id="faq" className="font-display text-3xl font-bold text-pink-900">
            Frequently asked questions
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white shadow-sm open:shadow-md">
                <summary className="cursor-pointer list-none p-5 font-semibold text-pink-900 marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span className="text-pink-400 transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-zinc-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="font-display text-3xl font-bold text-pink-900">Ready to become the hamster?</h2>
          <Link
            href="/camera"
            className="btn-shine font-display mt-6 inline-block rounded-full px-10 py-4 text-xl font-semibold text-white shadow-xl shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
          >
            Start the camera 📸
          </Link>
        </section>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
