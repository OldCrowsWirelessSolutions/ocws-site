// app/legal/guarantee/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guarantee Policy | Old Crows Wireless Solutions LLC",
  description:
    "What Old Crows Wireless Solutions LLC guarantees — and what it does not — for Corvus, Crow's Eye, and all related products and services.",
};

export default function GuaranteePage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Legal &middot; Old Crows Wireless Solutions LLC
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Guarantee Policy
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
              Old Crows Wireless Solutions LLC stands behind the quality of Corvus, Crow&rsquo;s Eye, and all associated products and services. We make specific, limited guarantees about the <strong className="text-white">clarity and actionability</strong> of our outputs — not about network outcomes, performance results, or technical improvements.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              This policy describes exactly what we guarantee, what we do not, and how we address concerns when our outputs fall short of their stated purpose.
            </p>
          </div>

          {/* What We Guarantee */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-6">What We Guarantee</h2>

            <div className="space-y-6">

              {/* Clarity Guarantee */}
              <div className="rounded-xl p-5" style={{ background: "rgba(0,194,199,0.06)", border: "1px solid rgba(0,194,199,0.25)" }}>
                <h3 className="text-base font-bold mb-3" style={{ color: "#00C2C7" }}>The Clarity Guarantee</h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#aaa" }}>
                  Every Verdict, Reckoning, and output produced by Corvus, Crow&rsquo;s Eye, or any other OCWS product will be written in plain English that a non-engineer can understand. Findings will not be obscured in technical jargon. If you receive a Corvus output and the findings are not clearly explained in terms you can act on, contact us and we will clarify them at no additional charge.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
                  This guarantee covers the language, structure, and readability of the output itself — not the nature of the findings or whether the underlying RF issues are resolvable.
                </p>
              </div>

              {/* Actionable Output Guarantee */}
              <div className="rounded-xl p-5" style={{ background: "rgba(0,194,199,0.06)", border: "1px solid rgba(0,194,199,0.25)" }}>
                <h3 className="text-base font-bold mb-3" style={{ color: "#00C2C7" }}>The Actionable Output Guarantee</h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#aaa" }}>
                  Every Corvus output will include at least one specific, actionable recommendation derived from the data you submitted. If Corvus identifies a problem, he will tell you what to do about it. Recommendations will include specific steps, and where router access is required, Corvus will provide model-specific login and configuration instructions where that information is available for your equipment.
                </p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#aaa" }}>
                  This guarantee applies to Corvus-generated Verdicts and Reckonings. It applies to the existence and specificity of recommendations — not to the outcomes of implementing them, which depend on factors outside Corvus&rsquo;s control.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
                  If you receive a Corvus output that contains findings but no actionable recommendations, contact us within 7 days. We will review and, where the omission is confirmed, reprocess your output or issue a credit.
                </p>
              </div>

              {/* Certified Reckoning */}
              <div className="rounded-xl p-5" style={{ background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.25)" }}>
                <h3 className="text-base font-bold mb-3" style={{ color: "#B8922A" }}>Pro Certified Reckoning — Personal Certification Guarantee</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
                  For Pro Certified Reckoning engagements, Joshua Turner personally reviews every finding before certification. The resulting report will reflect his professional judgment and will be suitable for the stated purpose of compliance documentation, insurance claims, board presentations, or vendor quotes, as applicable. If a Pro Certified report fails to meet the documentation standard for which it was requested, contact OCWS within 14 days of delivery to discuss remediation options.
                </p>
              </div>

            </div>
          </div>

          {/* What We Do NOT Guarantee */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-2">What We Do Not Guarantee</h2>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#00C2C7" }}>
              Explicit limitations — applicable to Corvus, Crow&rsquo;s Eye, and all OCWS products
            </p>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">Improved Wi-Fi performance.</span> OCWS does not guarantee that implementing Corvus recommendations will result in faster speeds, stronger signal, reduced latency, or any other measurable performance improvement.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">Interference elimination.</span> RF interference from neighboring networks, building materials, or external sources may be identified but cannot be guaranteed to be resolvable through customer action alone.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">Coverage outcomes.</span> Recommendations for equipment placement, access point additions, or network reconfiguration are advisory. Actual coverage results depend on hardware capabilities, building construction, and environmental factors outside our control.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">Security outcomes.</span> Security findings and recommendations do not guarantee that implementing them will prevent unauthorized access, data breaches, or other security incidents.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">Monitoring completeness or continuity.</span> Crow&rsquo;s Eye monitoring outputs are based on what is observable from submitted scan data at the time of scanning. Continuous, real-time, or gap-free RF monitoring is not guaranteed.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">ISP or hardware responsiveness.</span> OCWS cannot guarantee that your ISP, router manufacturer, or hardware vendor will implement or support any configuration change recommended by Corvus.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#888" }}>✗</span>
                <div>
                  <span className="text-white font-semibold">Specific fix timelines.</span> OCWS does not guarantee how quickly identified issues can be resolved once recommendations are implemented.
                </div>
              </div>
            </div>
          </div>

          {/* Remedies */}
          <div className="rounded-2xl p-8" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-xl font-bold text-white mb-4">How to Request a Remedy</h2>
            <div className="space-y-3 text-sm" style={{ color: "#aaa" }}>
              <p>If you believe a Corvus or Crow&rsquo;s Eye output fails to meet the Clarity Guarantee or Actionable Output Guarantee described above, contact OCWS within <strong className="text-white">7 days</strong> of receiving the output. Include:</p>
              <ul className="space-y-2 ml-4">
                {[
                  "Your order or session reference",
                  "A description of the specific guarantee you believe was not met",
                  "What you expected versus what was delivered",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span style={{ color: "#00C2C7", flexShrink: 0 }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>OCWS will review the output and, where the concern is valid, offer one of the following remedies at our discretion: output clarification, reprocessing, account credit, or refund per the Refund Policy.</p>
            </div>
          </div>

          {/* Policy nav */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#888" }}>Related Policies</p>
            <div className="flex flex-wrap gap-3">
              {[
                { href: "/legal/terms", label: "Terms of Service" },
                { href: "/legal/refunds", label: "Refund Policy" },
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
