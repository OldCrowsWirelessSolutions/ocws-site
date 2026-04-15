import TiersSection from "@/app/components/TiersSection";
import type { Metadata } from "next";
import Link from "next/link";

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

      {/* Comparison block */}
      <section className="py-16" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            The Old Way vs. The Corvus Way
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* The Old Way */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: "#555" }}
              >
                The Old Way
              </p>
              <ul className="space-y-3">
                {[
                  "Call your ISP. Wait 45 minutes. Get told \"it's your router.\"",
                  "Hire an IT consultant at $150/hr to hear what you already suspected.",
                  "Buy a new router. Same problems. No explanation why.",
                  "Google which channel to use. Guess. Try again next week.",
                  "Submit a ticket. Get a callback in 3–5 business days.",
                  "No written report. No proof. Start over from scratch.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#666" }}>
                    <span style={{ color: "#444", flexShrink: 0, marginTop: "1px" }}>✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* The Corvus Way */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-5"
                style={{ color: "#00C2C7" }}
              >
                The Corvus Way
              </p>
              <ul className="space-y-3">
                {[
                  "Scan your network with the app. Corvus reads your RF environment in seconds.",
                  "Plain English diagnosis. No jargon. No condescension.",
                  "Specific fix instructions for your exact router and network.",
                  "Channel congestion mapped. Interference sources identified.",
                  "Signed PDF report you can hand to your ISP, landlord, or IT team.",
                  "One Verdict: $50. Subscribe and run as many as you need.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#aaa" }}>
                    <span style={{ color: "#00C2C7", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers + pay-per-use */}
      <TiersSection />

      {/* Bottom CTA */}
      <section
        className="py-16 text-center"
        style={{ background: "#0D1520", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="ocws-container">
          <p className="text-sm mb-5" style={{ color: "#8AAABB" }}>
            Not ready to subscribe? Buy a single Verdict directly — no subscription required.
          </p>
          <Link
            href="/get-credits?product=verdict"
            className="inline-block rounded-2xl px-10 py-4 text-base font-bold"
            style={{ background: "linear-gradient(135deg, #0D6E7A, #00C2C7)", color: "#fff" }}
          >
            Buy a Verdict &mdash; $50
          </Link>
          <p className="text-xs mt-4" style={{ color: "#555" }}>
            Need a Reckoning instead?{" "}
            <Link href="/get-credits?product=reckoning" style={{ color: "rgba(0,194,199,0.6)" }}>
              Purchase a Reckoning &rarr;
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
