// app/case-studies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies | Old Crows Wireless Solutions",
  description:
    "Real Crow's Eye Verdicts from real environments. Corvus in action at Pilchers Barbershop and Olive Baptist Church in Pensacola, FL.",
};

const cases = [
  {
    name: "Pilchers Barbershop",
    context: "Retail · Pensacola FL",
    summary:
      "A dense ISP-congested 2.4 GHz environment with co-channel interference from CoxWiFi networks and three competing SSIDs degrading POS system throughput.",
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
      { color: "#ef4444", text: "SSID visible to the parking lot and adjacent businesses" },
      { color: "#f59e0b", text: "No guest network separation from internal systems" },
      { color: "#f59e0b", text: "Signal levels adequate but channel saturation preventing performance" },
    ],
    verdict:
      "Corvus identified the router as an ASUS unit on an auto-assigned channel that coincided with the six highest-power neighboring networks. WPA3 enabled, channel moved to 11, guest SSID created with VLAN isolation. Security posture corrected in under 30 minutes.",
    pdfHref: "/Corvus_Verdict__Olive_Baptist_Church.pdf",
  },
];

export default function CaseStudiesPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Crow&rsquo;s Eye · Verdicts in the Wild
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Corvus&rsquo; Verdicts in the wild.
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
              className="rounded-2xl overflow-hidden"
              style={{ background: "#1A2332", borderTop: "3px solid #B8922A" }}
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{c.name}</h2>
                    <p className="text-sm" style={{ color: "#888" }}>{c.context}</p>
                  </div>
                  <a
                    href={c.pdfHref}
                    download
                    className="shrink-0 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ocws-glow-hover"
                    style={{ border: "1px solid #00C2C7", color: "#00C2C7", background: "transparent" }}
                  >
                    Download PDF Verdict
                  </a>
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
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#00C2C7" }}>
                    Corvus&rsquo; Verdict
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
          <p className="text-lg font-semibold text-white mb-2">More Verdicts coming soon.</p>
          <p className="text-sm" style={{ color: "#888" }}>
            Every environment Corvus analyzes adds to the record. Check back.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/crows-eye"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold ocws-glow-hover"
            style={{ background: "#00C2C7", color: "#0D1520" }}
          >
            Get Your Own Verdict
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
