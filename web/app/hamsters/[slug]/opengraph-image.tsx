import { ImageResponse } from "next/og";
import { HAMSTERS, getHamster } from "../../lib/hamsters";
import { OG_BG, OG_SIZE, publicImageDataUrl } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Cursed hamster meme";

export function generateStaticParams() {
  return HAMSTERS.map((h) => ({ slug: h.slug }));
}

export default async function HamsterOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hamster = getHamster(slug) ?? HAMSTERS[0];
  const src = await publicImageDataUrl(hamster.image);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 72px",
          background: OG_BG,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "#fff",
            padding: 12,
            borderRadius: 32,
            transform: "rotate(-4deg)",
            boxShadow: "0 16px 40px rgba(120,10,60,0.3)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={420} height={420} style={{ objectFit: "cover", borderRadius: 22 }} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#c2185b", letterSpacing: 2 }}>CURSED HAMSTER</div>
          <div style={{ marginTop: 10, fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#a3145a" }}>
            {`${hamster.name} Meme`}
          </div>
          <div style={{ marginTop: 22, fontSize: 32, fontWeight: 600, color: "rgba(80,10,40,0.75)" }}>
            Become it live on your webcam 📸
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
