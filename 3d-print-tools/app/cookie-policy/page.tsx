import { StaticPage } from "@/components/layout/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/site.config";

export const metadata = pageMetadata({ title: "Cookie Policy", description: `Cookies and local storage used by ${SITE.name}.`, path: "/cookie-policy" });

export default function CookiePolicy() {
  return (
    <StaticPage title="Cookie policy" path="/cookie-policy" updated="2026-10-12">
      <table>
        <thead>
          <tr><th>Name / type</th><th>Set by</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td>Local storage: theme, tool settings</td><td>{SITE.name}</td><td>Remembers light/dark theme and the last settings you used in each tool. Never leaves your browser.</td></tr>
          <tr><td>Consent choice (e.g. FCCDCF, FCNEC)</td><td>Google consent platform</td><td>Stores your advertising consent decision (EEA, UK and Switzerland).</td></tr>
          <tr><td>Advertising cookies (e.g. __gads, __gpi)</td><td>Google AdSense</td><td>Ad delivery, frequency capping and, with consent, personalisation.</td></tr>
          <tr><td>Analytics cookies (e.g. _ga, _ga_*)</td><td>Google Analytics</td><td>Counts visits and tool usage anonymously, when enabled and consented to.</td></tr>
        </tbody>
      </table>
      <p>
        You can change your advertising consent at any time using the privacy link shown by the consent banner, or by
        clearing cookies for this site in your browser.
      </p>
    </StaticPage>
  );
}
