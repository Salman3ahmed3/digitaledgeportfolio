import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/site.config";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE.name} handles your data. Files you open in the tools are processed on your device and never uploaded.`,
  path: "/privacy",
});

export default function Privacy() {
  return (
    <StaticPage title="Privacy policy" path="/privacy" updated="2026-10-12">
      <p>
        This policy explains what information {SITE.name} ({SITE.url}) collects and why. Please have it reviewed by a
        qualified adviser for your jurisdiction before relying on it.
      </p>
      <h2>Your files</h2>
      <p>
        Images, SVGs and 3D models you open in our tools are processed entirely in your browser. They are not uploaded to
        our servers or sent to any third party, and we cannot see them. Tool settings you choose may be saved in your
        browser&apos;s local storage so they are remembered next time; you can clear this at any time in your browser
        settings.
      </p>
      <h2>Analytics</h2>
      <p>
        We may use Google Analytics 4 to understand which tools are used. We send anonymous events such as &quot;a PNG file
        was opened in Image to STL&quot; or &quot;an STL was downloaded&quot;. We never send file names, file contents or
        text you type. Where required, analytics cookies are only set after you give consent.
      </p>
      <h2>Advertising</h2>
      <p>
        The site is funded by Google AdSense. Google and its partners may use cookies or similar technologies to show ads
        based on your visits to this and other websites. Visitors in the European Economic Area, the United Kingdom and
        Switzerland are asked for consent through a Google-certified consent management platform before personalised ads
        are shown. You can learn more at{" "}
        <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">
          How Google uses information from sites that use its services
        </a>{" "}
        and manage ad personalisation at <a href="https://adssettings.google.com" rel="noopener">Google Ad Settings</a>.
      </p>
      <h2>Server logs</h2>
      <p>
        Our hosting provider may keep standard request logs (IP address, browser type, page requested, time) for security
        and reliability. These logs do not contain your files.
      </p>
      <h2>Your rights</h2>
      <p>
        Depending on where you live you may have rights to access, correct or delete personal data and to withdraw consent.
        Because we do not hold accounts or files, we usually hold no personal data about you. Contact{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> with any request. See also our{" "}
        <Link href="/cookie-policy">cookie policy</Link>.
      </p>
    </StaticPage>
  );
}
