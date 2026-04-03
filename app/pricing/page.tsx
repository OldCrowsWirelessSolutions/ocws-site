import TiersSection from "@/app/components/TiersSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Old Crows Wireless Solutions",
  description:
    "Crow's Eye subscription plans and pay-per-use Reckoning pricing. Fledgling, Nest, Flock, Murder, and OCWS Pro.",
};

export default function PricingPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      {/* Page header */}
      <section
        className="py-16"
        style={{ background: "#0D1520", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="ocws-container text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#00C2C7", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Crow&rsquo;s Eye &middot; Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, honest pricing.
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#8AAABB" }}>
            No hidden fees. No annual lock-in on most plans. Start with one Verdict and scale
            when you&rsquo;re ready.
          </p>
        </div>
      </section>

      {/* Tiers + pay-per-use */}
      <TiersSection />
    </main>
  );
}
