// app/learn/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn | Old Crows Wireless Solutions",
  description:
    "Practical RF and wireless education: interference, coverage, Wi-Fi basics, and how to interpret signal quality.",
};

type ArticleCard = {
  href: string;
  title: string;
  description: string;
  tag?: string;
};

const ARTICLES: ArticleCard[] = [
  {
    href: "/learn/signal-strength-vs-quality",
    title: "Signal Strength vs Signal Quality",
    description:
      "Why “bars” lie: RSSI/RSRP vs SINR, noise floor, and what actually predicts performance.",
    tag: "Core concept",
  },
  {
    href: "/learn/why-bars-but-bad-service",
    title: "Why You Have Bars But Calls/Data Are Bad",
    description:
      "Quality, load, band selection, and the environment—how to diagnose the real cause.",
  },
  {
    href: "/learn/wifi-congestion-channel-planning",
    title: "Wi-Fi Congestion & Channel Planning",
    description:
      "Co-channel interference, channel width, and why “auto” settings fail in dense environments.",
  },
  {
    href: "/learn/hidden-interference-rfi",
    title: "Hidden Interference (RFI) Basics",
    description:
      "Non-Wi-Fi noise sources, telltale symptoms, and what a proper RFI hunt looks like.",
  },
  {
    href: "/learn/coverage-materials-layout",
    title: "Coverage, Building Materials, and Layout",
    description:
      "How walls, glass, metal, and geometry create dead zones—and why moving an AP 8 feet can matter.",
  },
  {
    href: "/learn/what-you-get-deliverables",
    title: "What You Get From an OCWS Engagement",
    description:
      "Deliverables, validation, and how to turn findings into a defensible plan of action.",
    tag: "Client-ready",
  },
];

export default function LearnPage() {
  return (
    <main className="relative">
      <section className="ocws-container pt-10 pb-16">
        <div className="ocws-tile px-5 py-6 md:px-8 md:py-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Learn
            </h1>
            <p className="text-sm md:text-base ocws-muted2 max-w-3xl leading-6">
              Clear, field-driven explanations of what impacts wireless performance—signal
              quality, interference, congestion, and practical diagnostics.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {ARTICLES.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group rounded-2xl border border-white/10 bg-black/20 px-5 py-5 hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-semibold text-white">
                    {a.title}
                  </div>
                  {a.tag ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/70">
                      {a.tag}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm leading-6 text-white/75">
                  {a.description}
                </div>
                <div className="mt-4 text-sm text-white/70 group-hover:text-white transition">
                  Read → 
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="text-sm font-semibold text-white">
              Want this applied to your site?
            </div>
            <div className="mt-1 text-sm ocws-muted2">
              We can turn these concepts into measured findings and a clear action plan.
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
