// app/legal/refunds/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Old Crows Wireless Solutions LLC",
  description:
    "Refund policy for Corvus, Crow's Eye, and all products and services provided by Old Crows Wireless Solutions LLC.",
};

export default function RefundsPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Legal &middot; Old Crows Wireless Solutions LLC
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Refund Policy
          </h1>
          <p className="text-base" style={{ color: "#888" }}>
            Effective date: March 23, 2026 &middot; Applies to Corvus, Crow&rsquo;s Eye, and all products and services provided by Old Crows Wireless Solutions LLC
          </p>
        </div>

        <div className="space-y-6">

          {/* Overview */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#aaa" }}>
              Because Corvus, Crow&rsquo;s Eye, and other products and services of Old Crows Wireless Solutions LLC deliver digital outputs and analysis that are consumed immediately upon generation, our refund policy is structured around whether a service has been used. Once an output has been generated and delivered — whether a Verdict, a Reckoning, a monitoring result, or any other platform output — that service has been rendered.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              We are fair. If something is clearly wrong with an output before you have relied on it, we want to make it right. This policy defines exactly when refunds are available and when they are not.
            </p>
          </div>

          {/* Single Purchases */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Single Purchase Verdicts and Reckonings</h2>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <p>
                <strong className="text-white">7-Day Review Window.</strong> If you purchase a single Verdict or Reckoning and have a concern about the output — including that it fails to meet the Clarity Guarantee or Actionable Output Guarantee — you may contact OCWS within <strong className="text-white">7 days</strong> of delivery. OCWS will review the output and, where the concern is valid, offer a remedy as described in the Guarantee Policy, which may include a refund at OCWS&rsquo;s discretion.
              </p>
              <p>
                <strong className="text-white">No Refunds After Reliance.</strong> If you have implemented recommendations, shared the report with third parties, or otherwise relied on the output beyond initial review, no refund will be issued. The service has been consumed.
              </p>
              <p>
                <strong className="text-white">No Refunds for Unsatisfactory Findings.</strong> A refund is not available because the findings were unfavorable, the identified issues are difficult or costly to resolve, or the RF environment turned out to be more complex than anticipated. The Actionable Output Guarantee ensures you receive a useful output — not a favorable one.
              </p>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Subscription Plans (Nest, Flock, Murder)</h2>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <p>
                <strong className="text-white">3-Month Minimum Commitment.</strong> Monthly subscription plans require a minimum 3-month commitment. By enrolling, you agree that your first payment covers three months of service. No refund is available for the initial 3-month minimum period once the subscription is activated, unless a material service failure by OCWS prevents you from accessing the platform entirely.
              </p>
              <p>
                <strong className="text-white">Cancellation After Minimum Period.</strong> After the 3-month minimum period, you may cancel your monthly subscription at any time. Cancellation stops future billing. No refund is issued for the current billing period already paid.
              </p>
              <p>
                <strong className="text-white">Annual Plans.</strong> Annual subscriptions may be cancelled for a prorated refund of unused complete months, provided the cancellation request is submitted within the first 30 days of the annual term. After 30 days, annual plan fees are non-refundable. Credits for unused months may be issued at OCWS&rsquo;s discretion on a case-by-case basis.
              </p>
              <p>
                <strong className="text-white">Unused Allotments.</strong> Unused Verdicts, Reckoning allotments, or platform credits within a billing period do not carry monetary value and are not refundable. Purchased credit packs do roll over and are not forfeited at renewal.
              </p>
              <p>
                <strong className="text-white">Downgrade.</strong> Downgrading to a lower subscription tier takes effect at the next billing cycle. No refund is issued for the difference in the current period.
              </p>
            </div>
          </div>

          {/* Verdict Credits */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Verdict Credit Packs</h2>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <p>
                <strong className="text-white">No Expiration.</strong> Purchased Verdict credit packs do not expire and roll over month to month. They are not subject to forfeiture at subscription renewal.
              </p>
              <p>
                <strong className="text-white">No Refunds on Purchased Credits.</strong> Credit packs are non-refundable once purchased. If you have concerns about credit usage or believe credits were consumed in error, contact OCWS within 30 days for review.
              </p>
            </div>
          </div>

          {/* Premium Services */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-4">Premium and Certified Services</h2>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <p>
                <strong className="text-white">Pro Certified Reckoning.</strong> Pro Certified Reckoning engagements involve Joshua Turner&rsquo;s personal time and professional certification. Once work has commenced — including initial review of submitted materials — Pro Certified Reckoning fees are <strong className="text-white">non-refundable</strong>. If the engagement has not yet commenced, a cancellation request submitted before work begins may result in a full refund at OCWS&rsquo;s discretion.
              </p>
              <p>
                <strong className="text-white">On-Site RF Assessments.</strong> On-site assessment fees are non-refundable once the assessment has been conducted. If an assessment is cancelled by the customer more than 48 hours before the scheduled appointment, a full refund will be issued. Cancellations within 48 hours of the appointment may be subject to a cancellation fee of up to 50% of the assessment fee.
              </p>
              <p>
                <strong className="text-white">OCWS Pro Reports.</strong> OCWS Pro on-site reports are non-refundable once the on-site visit has occurred. If you have a concern about the content or quality of a Pro report, contact OCWS within 14 days of delivery for review and remediation options per the Guarantee Policy.
              </p>
            </div>
          </div>

          {/* Non-Refundable Summary */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Summary: Non-Refundable Items</h2>
            <p className="text-sm mb-4" style={{ color: "#aaa" }}>The following are non-refundable in all circumstances:</p>
            <ul className="space-y-2 text-sm" style={{ color: "#aaa" }}>
              {[
                "Verdicts and Reckonings that have been generated and delivered",
                "Monitoring outputs and platform usage already delivered through Crow's Eye",
                "The initial 3-month minimum on monthly subscription plans",
                "Annual subscription fees after the first 30 days",
                "Pro Certified Reckoning fees once work has commenced",
                "On-site assessment fees once the assessment has occurred",
                "Verdict credit packs once purchased",
                "Consumed features, seats, or platform access within a billing period",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span style={{ color: "#888", flexShrink: 0 }}>✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Request */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid #0D6E7A" }}>
            <h2 className="text-xl font-bold text-white mb-4">How to Request a Refund</h2>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <p>To request a refund or submit a billing concern, contact OCWS within the applicable window described above. Include:</p>
              <ul className="space-y-2 ml-4">
                {[
                  "Your name and email address on file",
                  "Your order reference, session ID, or subscription detail",
                  "A clear description of the concern and the remedy you are requesting",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "#00C2C7", flexShrink: 0 }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                OCWS will respond within 3 business days. Approved refunds are processed within 5–10 business days depending on your payment method.
              </p>
              <p className="mt-2">
                <Link href="/contact" className="ocws-glow-hover rounded-lg px-1 -ml-1" style={{ color: "#00C2C7" }}>
                  Contact OCWS &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Policy nav */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#888" }}>Related Policies</p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: "/legal/terms", label: "Terms of Service" },
                { href: "/legal/guarantee", label: "Guarantee Policy" },
                { href: "/legal/report-ownership", label: "Report Ownership & Usage" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold ocws-glow-hover"
                  style={{ border: "1px solid rgba(0,194,199,0.35)", color: "#00C2C7", background: "transparent" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
