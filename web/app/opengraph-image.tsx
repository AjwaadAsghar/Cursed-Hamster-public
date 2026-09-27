import { ImageResponse } from "next/og";
import { HAMSTERS } from "./lib/hamsters";
import { OG_BG, OG_SIZE, publicImageDataUrl } from "./lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Cursed Hamster: become the hamster meme with your webcam";

const FEATURED = ["shy", "finger_gun", "fist_by_head", "side_eye", "bicep"];

export default async function OpengraphImage() {
  const featured = FEATURED.map((k) => HAMSTERS.find((h) => h.key === k)).filter(
    (h): h is (typeof HAMSTERS)[number] => !!h
  );
  const images = await Promise.all(featured.map((h) => publicImageDataUrl(h.image)));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: OG_BG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, color: "#a3145a", textShadow: "0 4px 0 rgba(255,255,255,0.6)" }}>
          Cursed Hamster
        </div>
        <div style={{ marginTop: 6, fontSize: 38, fontWeight: 600, color: "#8a1450" }}>
          Become the hamster meme with your webcam
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 44 }}>
          {images.map((src, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                background: "#fff",
                padding: 8,
                borderRadius: 22,
                transform: `rotate(${[-6, 4, -3, 5, -5][i]}deg)`,
                boxShadow: "0 12px 30px rgba(120,10,60,0.25)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} width={176} height={176} style={{ objectFit: "cover", borderRadius: 16 }} alt="" />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, fontSize: 28, fontWeight: 600, color: "rgba(80,10,40,0.7)" }}>
          {`${HAMSTERS.length} hamsters · free · runs in your browser`}
        </div>
      </div>
    ),
    { ...size }
  );
}
