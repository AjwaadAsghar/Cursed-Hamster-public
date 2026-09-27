import Link from "next/link";
import FloatingEmojis from "./components/FloatingEmojis";

const POLAROIDS = [
  { src: "/memes/hug.jpg", top: "5%", left: "3%", rotate: -12, size: 132 },
  { src: "/memes/thumbs_up.jpg", top: "9%", right: "4%", rotate: 10, size: 116 },
  { src: "/memes/thinking.jpg", bottom: "12%", left: "2%", rotate: 8, size: 124 },
  { src: "/memes/default.jpg", bottom: "5%", right: "3%", rotate: -8, size: 136 },
];

// Small strip of hamsters shown on phones, where the polaroids are hidden.
const STRIP = ["/memes/side_eye.jpg", "/memes/nerd.jpg", "/memes/bicep.jpg", "/memes/sad.jpg"];

const STEPS = [
  { emoji: "📸", text: "Allow your camera" },
  { emoji: "🤞", text: "Pull a face or gesture" },
  { emoji: "🐹", text: "A hamster copies you" },
];

export default function Home() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
      style={{
        background:
          "linear-gradient(160deg, #ffd6e8 0%, #ffb6d5 35%, #ff8fc4 70%, #ff6fb0 100%)",
      }}
    >
      <FloatingEmojis />

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
          15 gestures · 15 hamsters
        </span>

        <div className="relative mt-6">
          <div
            className="overflow-hidden rounded-full shadow-2xl ring-8 ring-white/70"
            style={{ width: 176, height: 176 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/memes/shy.jpg"
              alt="A shy hamster"
              width={176}
              height={176}
              style={{ width: 176, height: 176, objectFit: "cover" }}
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
          className="font-display mt-6 text-5xl font-bold tracking-tight sm:text-6xl"
          style={{ color: "#a3145a", textShadow: "0 3px 0 rgba(255,255,255,0.7)" }}
        >
          Cursed Hamster
        </h1>
        <p className="mt-3 max-w-sm text-base font-medium text-pink-950/75">
          Point your webcam at yourself and pull faces. A hamster meme reacts live.
        </p>

        <ol className="mt-7 flex flex-wrap justify-center gap-2">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-full bg-white/55 px-3.5 py-1.5 text-sm font-semibold text-pink-900/85 shadow-sm backdrop-blur"
            >
              <span>{s.emoji}</span>
              {s.text}
            </li>
          ))}
        </ol>

        <Link
          href="/camera"
          className="btn-shine font-display mt-9 rounded-full px-10 py-4 text-xl font-semibold text-white shadow-xl shadow-pink-600/30 transition-transform hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(90deg, #ff6fb0, #ff3d94)" }}
        >
          Start the camera 📸
        </Link>

        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-pink-950/60">
          <span>🔒</span> Runs entirely in your browser. Nothing is uploaded.
        </p>

        {/* Phone-only meme strip */}
        <div className="mt-10 flex gap-2 sm:hidden">
          {STRIP.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
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
  );
}
