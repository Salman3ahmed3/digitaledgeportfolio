import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { LogoBar } from "@/components/sections/LogoBar";
import { Problem } from "@/components/sections/Problem";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Comparison } from "@/components/sections/Comparison";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { About } from "@/components/sections/About";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { StickyMobileCTA } from "@/components/shared/StickyMobileCTA";
import { ExitIntentModal } from "@/components/shared/ExitIntentModal";
import { AnalyticsProvider } from "@/components/shared/AnalyticsProvider";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main id="main">
        <Hero />
        <LogoBar />
        <Problem />
        <Services />
        <Process />
        <CaseStudies />
        <Comparison />
        <Testimonials />
        <Pricing />
        <About />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />

      {/* Layered CTA system — floating + exit-intent (client-only) */}
      <StickyMobileCTA />
      <ExitIntentModal />

      {/* Fire-once scroll-depth analytics */}
      <AnalyticsProvider />
    </>
  );
}
