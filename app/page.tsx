// app/page.tsx
import Link from "next/link";
import Hero from "./components/Hero";
import IndustryTiles from "./components/IndustryTiles";
import PreferredPricingCallout from "./components/PreferredPricingCallout";

export const metadata = {
  title: "Old Crows Wireless Solutions (OCWS)",
  description: "Strategic RF Engineering & Wireless Intelligence",
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="ocws-container py-12 md:py-16">
        {/* INDUSTRIES FIRST (IndustryTiles renders its own heading/subheading/button) */}
        <IndustryTiles />

        {/* SERVICES UNDER INDUSTRIES */}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                Core services
              </h2>
              <p className="mt-2 ocws-muted text-sm md:text-base">
                Start with the service that matches your environment and goals.
              </p>
            </div>

            <Link href="/services" className="ocws-btn ocws-btn-ghost">
              View all
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/services/premium-home-rf-optimization"
              className="ocws-tile ocws-tile-hover p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Premium Home & Home Office RF Optimization
                </h3>
                <span className="text-white/40" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm ocws-muted leading-relaxed">
                Diagnose interference and performance bottlenecks with a clear, evidence-driven action plan.
              </p>
              <div className="mt-4 text-xs ocws-muted2">Most popular</div>
            </Link>

            {/* Small Business service (RESTORED) */}
            <Link
              href="/services/small-business-rf-assessment"
              className="ocws-tile ocws-tile-hover p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Small Business Connectivity & RF Assessment
                </h3>
                <span className="text-white/40" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm ocws-muted leading-relaxed">
                Improve reliability for staff, customers, and critical devices with evidence-driven findings.
              </p>
              <div className="mt-4 text-xs ocws-muted2">Small business-ready</div>
            </Link>

            <Link href="/services/rfi-hunting" className="ocws-tile ocws-tile-hover p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Radio Frequency Interference (RFI) Hunting
                </h3>
                <span className="text-white/40" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm ocws-muted leading-relaxed">
                Locate and characterize disruptive RF sources impacting critical wireless systems or electronics.
              </p>
              <div className="mt-4 text-xs ocws-muted2">Advanced diagnostics</div>
            </Link>

            <Link href="/services/p25-survey" className="ocws-tile ocws-tile-hover p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Public Safety (P25) ERRC Survey
                </h3>
                <span className="text-white/40" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm ocws-muted leading-relaxed">
                Grid testing and reporting to support AHJ / Fire Marshal review and compliance workflows.
              </p>
              <div className="mt-4 text-xs ocws-muted2">Compliance-ready evidence</div>
            </Link>

            <Link href="/services/cellular-das-design" className="ocws-tile ocws-tile-hover p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Cellular / DAS Survey & Design Blueprint
                </h3>
                <span className="text-white/40" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm ocws-muted leading-relaxed">
                Donor signal survey + in-building gap analysis + blueprint outputs to guide integrators and budgeting.
              </p>
              <div className="mt-4 text-xs ocws-muted2">Commercial environments</div>
            </Link>
          </div>
        </section>

        {/* PREFERRED PRICING (Subtle) */}
        <PreferredPricingCallout />

        <section className="mt-14 ocws-tile px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
                Ready to stop guessing?
              </h2>
              <p className="mt-2 ocws-muted text-sm md:text-base">
                Tell us what you’re seeing and we’ll recommend the right starting point.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/services" className="ocws-btn ocws-btn-primary">
                Explore Services
              </Link>
              <Link href="/learn" className="ocws-btn ocws-btn-ghost">
                Learn
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
