import * as React from "react";

import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Section 13 — FAQ (accordion, 8 questions).
 * Answers are sensible defaults — TODO(user): tune wording to match your real
 * policies (minimum spend, guarantees, industries).
 */
const faqs = [
  {
    q: "How quickly will I see results?",
    a: "Paid channels often show early signal within 2–4 weeks as we test and optimize, with meaningful, compounding results by the 60–90 day mark. SEO is a longer game — typically 3–6 months for durable ranking and traffic gains. We set clear 30/60/90-day expectations up front so you always know what \"on track\" looks like.",
  },
  {
    q: "What's your minimum ad spend requirement?",
    a: "It varies by channel and goals, but our paid plans are designed for brands able to invest meaningfully in media on top of management. On your free audit we'll tell you honestly whether your current budget is enough to hit your targets — and if it isn't, we'll say so.",
  },
  {
    q: "Do you require long-term contracts?",
    a: "No. Every plan is month-to-month with no 6- or 12-month lock-ins. We'd rather earn your business every month than trap you in a contract. If it's not working, you're free to leave.",
  },
  {
    q: "Which industries do you specialize in?",
    a: "We do our best work with e-commerce brands, service businesses, coaches, and real estate. That said, our systems are channel- and industry-agnostic — if you have a clear offer and room to grow, we can likely help. We'll be candid if we're not the right fit.",
  },
  {
    q: "Who actually works on my account?",
    a: "Senior operators — not junior account managers. You get a dedicated strategist who owns your results, supported by specialists in paid media, CRO, and creative. The people who plan your strategy are the people who execute it.",
  },
  {
    q: "How do you report on results?",
    a: "Revenue-first. You get transparent reporting tied to the metrics that matter — revenue, ROAS, CPL, and pipeline — not vanity impressions. Weekly updates, a monthly strategy review, and a live dashboard you can check any time.",
  },
  {
    q: "What if I'm not happy with the work?",
    a: "Because we're month-to-month, you're never stuck. If something's off, we'll make it right — and if we're genuinely not the right partner, we'll tell you and help you transition cleanly. Your audit and action plan are yours to keep regardless.",
  },
  {
    q: "How is Digital Edge different from other agencies?",
    a: "Three things: senior people on the actual work, revenue-first reporting with real transparency, and no long lock-in contracts. We optimize for your outcomes, not our retainer — and we concede where we're not the best fit rather than overselling.",
  },
];

export function FAQ() {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you're probably wondering before booking a call."
        />

        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}
