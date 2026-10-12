import { StaticPage } from "@/components/layout/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/site.config";

export const metadata = pageMetadata({ title: "Contact", description: `Contact the ${SITE.name} team with bug reports, feature requests or questions about the free 3D printing tools.`, path: "/contact" });

export default function Contact() {
  return (
    <StaticPage title="Contact" path="/contact">
      <p>
        Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> with bug reports, feature requests or
        questions.
      </p>
      <p>
        If a file does not convert the way you expect, describe the settings you used. Please only attach the file if you
        are comfortable sharing it — the tools themselves never send your files anywhere.
      </p>
    </StaticPage>
  );
}
