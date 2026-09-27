import type { Metadata } from "next";
import SiteFooter from "../components/SiteFooter";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hamster Meme Webcam Filter: Become the Hamster Live",
  description:
    "Turn on your webcam and become the hamster meme. Pull faces and gestures and the matching cursed hamster copies you in real time. Free, no app, runs in your browser.",
  path: "/camera",
});

export default function CameraLayout({ children }: LayoutProps<"/camera">) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
