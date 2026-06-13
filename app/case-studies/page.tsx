// app/case-studies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies | Old Crows Wireless Solutions",
  description:
    "Real Crow's Eye WiFi Health Reports from real environments — Pilchers Barbershop and Olive Baptist Church in Pensacola, FL — plus Corvus field-tested by security professionals.",
};

const cases: {
  name: string;
  context: string;
  summary: string;
  findings: { color: string; text: string }[];
  verdict: string;
  pdfHref?: string;
  anchor?: string;
}[] = [
  {
    name: "Pilchers Barbershop",
    context: "Retail · Pensacola FL",
    summary:
      "A dense ISP-congested 2.4 GHz environment with co-channel interference from CoxWiFi networks and three competing WiFi networks degrading POS system throughput.",
    findings: [
      { color: "#ef4444", text: "CoxWiFi co-channel interference on CH 11" },
      { color: "#ef4444", text: "Router on non-standard channel 9 — maximum overlap" },
      { color: "#f59e0b", text: "Three networks competing for airtime on same channel" },
      { color: "#f59e0b", text: "POS system throughput degraded during peak hours" },
      { color: "#f59e0b", text: "No 5 GHz offload configured on client router" },
    ],
    verdict:
      "Corvus identified the Cox-provided gateway as a Vantiva unit broadcasting on a non-standard channel with three competing ISP networks in the same power level range. Channel change to 1, 5 GHz band steering enabled, and isolation of POS VLAN resolved throughput degradation.",
    pdfHref: "/Corvus_Verdict__Pilchers_Barbershop.pdf",
  },
  {
    name: "Olive Baptist Church",
    context: "Church · Pensacola FL",
    summary:
      "A large-venue environment with a completely open network, severe 2.4 GHz congestion on Channel 6, and no network segmentation between staff and guest traffic.",
    findings: [
      { color: "#ef4444", text: "Open network — zero encryption on both 2.4 and 5 GHz bands" },
      { color: "#ef4444", text: "Channel 6 carrying 7+ competing networks simultaneously" },
      { color: "#ef4444", text: "WiFi network name visible to the parking lot and adjacent businesses" },
      { color: "#f59e0b", text: "No guest network separation from internal systems" },
      { color: "#f59e0b", text: "Signal levels adequate but channel saturation preventing performance" },
    ],
    verdict:
      "Corvus identified the router as an ASUS unit on an auto-assigned channel that coincided with the six highest-power neighboring networks. WPA3 enabled, channel moved to 11, guest WiFi network created with VLAN isolation. Security posture corrected in under 30 minutes.",
    pdfHref: "/Corvus_Verdict__Olive_Baptist_Church.pdf",
  },
  {
    name: "Tested by Security Professionals",
    context: "Field Validation · Cybersecurity Conference · Pensacola FL · May 2026",
    anchor: "tested-by-pros",
    summary:
      "At a regional cybersecurity conference, IT security officers, red-team operators, and healthcare practitioners deliberately tested Corvus across ten substantive conversations — probing technical methodology, compliance knowledge, and scope boundaries. Zero failures.",
    findings: [
      { color: "#4ade80", text: "Enterprise security officer (ISSO): full briefing on methodology, severity taxonomy, and fit with formal security assessments — validated" },
      { color: "#4ade80", text: "Red-team operator: Corvus held to passive-observation scope and refused active-exploitation framing" },
      { color: "#4ade80", text: "Healthcare / telehealth: accurate on HIPAA PHI transmission and 45 CFR for clinical networks" },
      { color: "#4ade80", text: "Out-of-scope probe (data sanitization): answered “outside my lane” and cited NIST SP 800-88 — no fabrication" },
      { color: "#4ade80", text: "Security architecture: confirmed the app holds zero API keys — no client-side secret to steal" },
    ],
    verdict:
      "Across every adversarial test, Corvus stayed accurate and inside its lane. The takeaway from the room: the moat isn't a feature — it's knowledge accuracy plus scope integrity. A tool that knows its limits is one enterprises can trust.",
  },
];

export default function CaseStudiesPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#22D6DC", letterSpacing: "0.18em" }}>
            Crow&rsquo;s Eye · Reports in the Wild
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            WiFi Health Reports in the wild.
          </h1>
          <p className="text-base" style={{ color: "#888" }}>
            Real scans. Real findings. Real fixes.
          </p>
        </div>

        {/* Case study cards */}
        <div className="space-y-10 mb-16">
          {cases.map((c) => (
            <div
              key={c.name}
              id={c.anchor}
              className="rounded-2xl overflow-hidden"
              style={{ background: "#1A2332", borderTop: "3px solid #D8AC32" }}
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{c.name}</h2>
                    <p className="text-sm" style={{ color: "#888" }}>{c.context}</p>
                  </div>
                  {c.pdfHref && (
                    <a
                      href={c.pdfHref}
                      download
                      className="shrink-0 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ocws-glow-hover"
                      style={{ border: "1px solid #22D6DC", color: "#22D6DC", background: "transparent" }}
                    >
                      Download PDF Report
                    </a>
                  )}
                </div>

                <p className="text-sm leading-relaxed mb-6" style={{ color: "#aaa" }}>
                  {c.summary}
                </p>

                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#888" }}>
                    Findings
                  </p>
                  <ul className="space-y-2">
                    {c.findings.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-sm">
                        <span style={{ color: f.color, flexShrink: 0 }}>●</span>
                        <span style={{ color: "#ccc" }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="rounded-xl px-5 py-4"
                  style={{ border: "1px solid #0D6E7A", background: "rgba(13,110,122,0.08)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#22D6DC" }}>
                    Corvus&rsquo; Summary
                  </p>
                  <p className="text-sm leading-relaxed italic" style={{ color: "#aaa" }}>
                    {c.verdict}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder */}
        <div
          className="rounded-2xl p-8 text-center mb-12"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-lg font-semibold text-white mb-2">More WiFi Health Reports coming soon.</p>
          <p className="text-sm" style={{ color: "#888" }}>
            Every environment Corvus analyzes adds to the record. Check back.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/crows-eye"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold ocws-glow-hover"
            style={{ background: "#22D6DC", color: "#0D1520" }}
          >
            Get Your Own WiFi Health Report
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold ocws-glow-hover"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "white", background: "transparent" }}
          >
            Request On-Site Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
