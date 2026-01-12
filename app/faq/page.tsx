// app/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Old Crows Wireless Solutions",
  description:
    "Common questions about RF surveys, Wi-Fi optimization, interference hunting, deliverables, and what to expect working with OCWS.",
};

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "What does OCWS actually do?",
    a: "Old Crows Wireless Solutions (OCWS) diagnoses why wireless performance is failing—Wi-Fi, cellular, or RF noise—and delivers an evidence-driven action plan with clear next steps and validation options.",
  },
  {
    q: "Do you install equipment (access points, antennas, boosters)?",
    a: "OCWS is primarily an engineering, testing, and validation service. We can recommend solutions and coordinate with your IT team, electrician, or preferred installer. In some residential cases, limited installation can be included if agreed in writing.",
  },
  {
    q: "Why does my phone show good bars but my calls/data are bad?",
    a: "Bars are not the whole story. Real performance depends on signal quality (noise/interference), network load, band selection, and the RF environment. We measure what matters and show what’s driving the outcome.",
  },
  {
    q: "What’s the difference between signal strength and signal quality?",
    a: "Strength is how loud the signal is. Quality is how usable it is. You can have strong signal but poor performance if interference/noise is high or the channel is congested.",
  },
  {
    q: "Can you do surveys without specialized scanning hardware?",
    a: "Yes. Many projects can be completed using mobile survey tooling and modern devices. Specialized scanners add speed and deeper insight for certain environments, but they are not required for every engagement.",
  },
  {
    q: "What do I receive at the end of the service?",
    a: "A client-ready deliverable package: findings, measurements, annotated visuals where applicable, prioritized recommendations, and a defensible plan of action. Post-change validation can be added if needed.",
  },
  {
    q: "How do you price projects?",
    a: "Pricing depends on environment complexity, square footage, access constraints, and required deliverables. Some engagements are flat-rate; others use time-and-materials with clear scope and not-to-exceed options.",
  },
  {
    q: "Can you validate improvements after changes are made?",
    a: "Absolutely. Post-installation validation is one of the fastest ways to confirm ROI and ensure changes actually resolved the root cause.",
  },
];

export default function FAQPage() {
  return (
    <main className="relative">
      <section className="ocws-container pt-10 pb-16">
        <div className="ocws-tile px-5 py-6 md:px-8 md:py-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              FAQ
            </h1>
            <p className="text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
              Straight answers to the questions clients ask before booking an RF or wireless engagement.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <summary className="cursor-pointer list-none text-white font-semibold">
                  <span className="mr-2 inline-block text-white/60 transition group-open:rotate-90">
                    ▸
                  </span>
                  {item.q}
                </summary>
                <div className="mt-3 text-sm leading-6 text-white/75">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="text-sm font-semibold text-white">
              Still have questions?
            </div>
            <div className="mt-1 text-sm ocws-muted2">
              Send a quick note and we’ll point you in the right direction.
            </div>
            <div className="mt-4">
              <Link href="/request-quote" className="ocws-btn ocws-btn-primary">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
