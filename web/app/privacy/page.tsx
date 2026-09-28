import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "../components/ContentPage";
import { pageMetadata } from "../lib/seo";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_NAME } from "../lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Cursed Hamster handles your privacy: your camera is processed only on your device, never uploaded or stored. No accounts, no tracking cookies.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      path="/privacy"
      updated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          The short version: <strong>your camera never leaves your device.</strong> {SITE_NAME} works
          entirely in your web browser. We don&apos;t upload, record or store your video, and we
          don&apos;t ask for an account, your name or your email.
        </p>
      }
    >
      <h2>Who we are</h2>
      <p>
        {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) is a free hamster meme webcam filter run by an
        independent developer. If you have any questions about this policy, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Your camera</h2>
      <ul>
        <li>
          When you open the camera page, your browser asks for permission to use your camera. You can
          say no, and you can turn it off at any time in your browser settings.
        </li>
        <li>
          The video is analysed <strong>locally on your device</strong> by open-source tracking
          models (Google&apos;s{" "}
          <a href="https://ai.google.dev/edge/mediapipe/solutions/guide" rel="noopener noreferrer" target="_blank">
            MediaPipe
          </a>
          ) that run inside your browser. They estimate where your hands, face and body are so the
          site can pick a matching hamster.
        </li>
        <li>
          Your video, and the hand, face and body positions worked out from it, are{" "}
          <strong>never sent to us or anyone else</strong>, never recorded by us and never stored.
          They exist only in your browser&apos;s memory while the page is open.
        </li>
        <li>
          We don&apos;t identify who you are. There is no facial recognition, and no face data or
          other biometric information is collected, kept or shared.
        </li>
      </ul>

      <h2>Photos and clips you make</h2>
      <p>
        When you press &quot;Snap photo&quot; or &quot;Record 5s&quot;, the image or video is
        created on your device. We never receive it. It&apos;s only saved or shared if you choose to
        (for example with the Save or Share buttons). If you share it to another app, such as
        Instagram, TikTok or WhatsApp, that app&apos;s own privacy policy applies.
      </p>

      <h2>What&apos;s stored on your device</h2>
      <p>
        To remember which hamsters you&apos;ve found, the site saves a short list of hamster names in
        your browser&apos;s local storage. It stays on your device and is never sent to us. You can
        clear it with &quot;reset my progress&quot; on the camera page or by clearing your browser&apos;s
        site data.
      </p>
      <p>
        {SITE_NAME} does not currently set any cookies, and we don&apos;t use analytics or advertising
        trackers.
      </p>

      <h2>Information we don&apos;t collect</h2>
      <p>
        We don&apos;t have accounts or sign-ups, so we don&apos;t collect names, email addresses,
        phone numbers, locations or payment details. If you email us, we&apos;ll only use your email
        to reply to you.
      </p>

      <h2>Services that help run the site</h2>
      <p>
        Like every website, the services that deliver our pages to your browser receive basic
        technical information, such as your IP address, browser type and the page requested, in
        order to serve the page and keep it secure:
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> hosts the website (
          <a href="https://vercel.com/legal/privacy-policy" rel="noopener noreferrer" target="_blank">
            Vercel privacy policy
          </a>
          ).
        </li>
        <li>
          <strong>jsDelivr</strong> delivers the tracking engine files to your browser (
          <a
            href="https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net"
            rel="noopener noreferrer"
            target="_blank"
          >
            jsDelivr privacy policy
          </a>
          ). These files run on your device; your video is not sent to jsDelivr.
        </li>
      </ul>
      <p>We don&apos;t sell or share any personal information.</p>

      <h2>Advertising</h2>
      <p>
        {SITE_NAME} doesn&apos;t show ads right now. If we add advertising in the future, we&apos;ll
        update this policy before it goes live to explain what that involves (including any cookies
        and how to opt out), and ask for your consent where the law requires it.
      </p>

      <h2>Children</h2>
      <p>
        {SITE_NAME} is a general-audience website and is not directed at children under 13. We
        don&apos;t knowingly collect personal information from anyone, including children. If you
        think a child has sent us personal information (for example by email), contact us and
        we&apos;ll delete it.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example under the GDPR in the UK and EU, or US state laws
        such as the CCPA), you may have rights to access, correct or delete personal information
        about you. Because we don&apos;t collect personal information through the site, there is
        normally nothing for us to access or delete, but you can always contact us and we&apos;ll
        help.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change how the site works in a way that affects your privacy, we&apos;ll update this
        page and the &quot;last updated&quot; date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or concerns? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also
        our <Link href="/terms">Terms of Use</Link>.
      </p>
    </ContentPage>
  );
}
