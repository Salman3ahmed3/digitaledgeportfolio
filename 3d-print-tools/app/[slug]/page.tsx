import { notFound } from "next/navigation";
import { TOOLS, toolBySlug } from "@/content/tools";
import { ToolPageLayout } from "@/components/tool-page/ToolPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, faqLd, howToLd, pageMetadata, webAppLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = toolBySlug(slug);
  if (!t) return {};
  return pageMetadata({ title: t.title, description: t.metaDescription, path: `/${t.slug}`, ogImage: `/og/${t.slug}.png` });
}

export default async function ToolRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = toolBySlug(slug);
  if (!t) notFound();
  return (
    <>
      <JsonLd
        data={[
          webAppLd({ name: t.h1, description: t.metaDescription, path: `/${t.slug}` }),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: t.shortName, path: `/${t.slug}` }]),
          howToLd({ name: `How to use the ${t.shortName}`, steps: t.howTo }),
          faqLd(t.faq),
        ]}
      />
      <ToolPageLayout tool={t} />
    </>
  );
}
