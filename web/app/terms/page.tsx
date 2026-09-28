import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "../components/ContentPage";
import { pageMetadata } from "../lib/seo";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_NAME } from "../lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The simple terms for using Cursed Hamster, the free hamster meme webcam filter.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Use"
      path="/terms"
      updated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          By using {SITE_NAME} you agree to these terms. They&apos;re short, we promise. If you
          don&apos;t agree, please don&apos;t use the site.
        </p>
      }
    >
      <h2>The service</h2>
      <p>
        {SITE_NAME} is a free, just-for-fun website that shows a hamster meme matching the faces and
        gestures you make on your webcam. It&apos;s provided for entertainment only.
      </p>

      <h2>Using it nicely</h2>
      <p>When using {SITE_NAME}, please don&apos;t:</p>
      <ul>
        <li>film or share other people without their permission;</li>
        <li>use photos or clips from the site to bully, harass or embarrass anyone;</li>
        <li>use the site for anything illegal;</li>
        <li>try to break, overload or misuse the site.</li>
      </ul>

      <h2>Your photos and clips</h2>
      <p>
        Photos and clips you make are created on your device and belong to you. You&apos;re
        responsible for what you save and share, and for following the rules of any app you share
        them to.
      </p>

      <h2>The hamster memes</h2>
      <p>
        The hamster meme drawings are popular internet memes and remain the property of their
        original creators. {SITE_NAME} uses them for fun and does not claim to own them. If you
        created one of these images and would like to be credited, or would like it removed, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll sort it out quickly.
      </p>
      <p>The site&apos;s own code, design and text are owned by {SITE_NAME}.</p>

      <h2>No guarantees</h2>
      <p>
        The site is provided &quot;as is&quot;. We do our best, but we can&apos;t promise it will
        always be available, work on every device, or detect every gesture correctly. To the extent
        the law allows, we aren&apos;t liable for any loss or damage from using the site.
      </p>

      <h2>Privacy</h2>
      <p>
        Your camera is processed only on your device. See our <Link href="/privacy">Privacy Policy</Link>{" "}
        for the details.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The &quot;last updated&quot; date above shows
        when they last changed. Continuing to use the site means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ContentPage>
  );
}
