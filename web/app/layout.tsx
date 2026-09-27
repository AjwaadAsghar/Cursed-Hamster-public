import type { Metadata } from "next";
import { Fredoka, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hammy-hamster-webcam-public.vercel.app"),
  title: "Cursed Hamster",
  description: "Pull faces and gestures at your webcam - a hamster meme reacts live.",
  openGraph: {
    title: "Cursed Hamster",
    description: "Pull faces and gestures at your webcam - a hamster meme reacts live.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursed Hamster",
    description: "Pull faces and gestures at your webcam - a hamster meme reacts live.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
