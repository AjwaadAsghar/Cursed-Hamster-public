import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "../components/ContentPage";
import { HAMSTERS } from "../lib/hamsters";
import { pageMetadata } from "../lib/seo";
import { CONTACT_EMAIL, SITE_NAME } from "../lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About & Contact",
  description:
    "About Cursed Hamster, the free hamster meme webcam filter: how it works, how your privacy is protected, and how to get in touch.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ContentPage
      title="About & Contact"
      path="/about"
      intro={
        <p>
          {SITE_NAME} is a free hamster meme webcam filter. Pull a face or make a gesture and the
          matching cursed hamster meme copies you, live. There are {HAMSTERS.length} hamsters to find
          (and counting).
        </p>
      }
    >
      <h2>Why it exists</h2>
      <p>
        It started as a small side project and turned into something everyone can play with. The
        idea is simple: instead of putting a filter on your face, the site finds the hamster meme that
        matches what you&apos;re doing, so you can become the hamster.
      </p>

      <h2>How it works</h2>
      <p>
        The site uses open-source tracking models that run directly in your browser to estimate
        where your hands, face and body are. A set of simple rules then turns those positions into a
        gesture, like a thumbs up, finger guns or a side eye, and shows the matching hamster. You can
        see every hamster and how to do each pose on the{" "}
        <Link href="/hamsters">hamster memes page</Link>.
      </p>

      <h2>Your privacy</h2>
      <p>
        Everything happens on your device. Your camera is never uploaded, recorded or stored, and
        there are no accounts. Read the full <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>The hamster memes</h2>
      <p>
        The hamster drawings are much-loved internet memes and belong to their original creators. If
        one of them is yours, we&apos;d love to credit you properly. Get in touch below.
      </p>

      <h2>Contact</h2>
      <p>
        Ideas for new hamsters, bug reports, credits or anything else: email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ContentPage>
  );
}
