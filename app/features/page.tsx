import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Old Crows Wireless Solutions",
  description:
    "What Crow's Eye and Corvus can do: WiFi analysis, WiFi Health Reports, Whole-Home Surveys, voice assistant, team intel, and OCWS Pro certification.",
};

const capabilities = [
  { icon: "📡", label: "WiFi Analysis", desc: "Scans your live wireless environment, identifies every network, cross-references MAC vendors against a global OUI database." },
  { icon: "💬", label: "Ask Corvus", desc: "Chat with Corvus about Wi-Fi, interference — he answers like he was there for the scan." },
  { icon: "🎙️", label: "Voice Assistant", desc: "Corvus speaks. Briefings, analysis narration, dashboard greetings — all in his voice." },
  { icon: "🎓", label: "Guided Tours", desc: "Interactive walkthroughs of every dashboard feature with live glowing indicators." },
  { icon: "📊", label: "Whole-Home Surveys", desc: "Multi-location site assessments with remediation plans and compliance-ready PDFs." },
  { icon: "🔔", label: "Team Intel", desc: "Team activity reporting, Corvus briefings, and scan history for every member." },
];

const comparison = [
  ["Show you channel graphs", "Delivers a complete WiFi Health Report"],
  ["Require technical knowledge to interpret", "Adapts to your level — Level 1 to White Hat"],
  ["Leave you with raw data", "Gives you step-by-step fix instructions"],
  ["$2,400+/year for professional grade", "Starts at $50 · Subscriptions from $20/mo"],
  ["Need a trained engineer to operate", "Works for anyone — grandmother to CISO"],
  ["Silent output", "Speaks in his own voice"],
  ["Generic recommendations", "Router-specific instructions for your exact equipment"],
  ["No certification available", "Joshua Turner certifies every Pro report"],
  ["Tools you use once and forget", "Platform with daily engagement and team features"],
];

export default function FeaturesPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>

      {/* ── Page header ── */}
      <section
        className="py-16"
        style={{ background: "#0D1520", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="ocws-container text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#22D6DC", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Crow&rsquo;s Eye &middot; WiFi Intelligence Engine
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Corvus Can Do
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "#8AAABB" }}>
            Corvus reads your wireless environment and tells you exactly what&rsquo;s wrong, why it&rsquo;s wrong,
            and exactly how to fix it on your specific equipment. He does not guess. He does not generalize.
            He delivers WiFi Health Reports.
          </p>
        </div>
      </section>

      {/* ── Who is Corvus ── */}
      <section className="py-16" style={{ background: "#0D1520" }}>
        <div className="ocws-container" style={{ maxWidth: "860px" }}>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#B8CCD8" }}>
            Corvus is the AI intelligence engine behind Crow&rsquo;s Eye. He has read thousands of
            wireless environments. He knows what your internet provider isn&rsquo;t telling you. He has opinions
            about your router. He will share them.
          </p>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#B8CCD8" }}>
            Corvus scans your live wireless environment, identifies every network in range,
            cross-references MAC addresses against known vendors, and delivers a complete diagnosis
            with step-by-step fix instructions specific to your exact equipment.
          </p>
          <div
            className="rounded-xl px-6 py-5 mb-12"
            style={{ border: "1px solid #0D6E7A", background: "rgba(13,110,122,0.06)" }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "#B8CCD8" }}>
              Impatient. Theatrical. Always correct. Warm underneath. Built by a Navy electronic
              warfare specialist who spent 17 years hunting signals across 55 countries.
            </p>
          </div>

          {/* Capabilities grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map(({ icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl p-5"
                style={{ background: "rgba(34,214,220,0.04)", border: "1px solid rgba(34,214,220,0.1)" }}
              >
                <p className="text-base mb-2">
                  {icon} <span className="text-sm font-bold text-white">{label}</span>
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#7A9AAB" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section className="py-16" style={{ background: "#1A2332" }}>
        <div className="ocws-container">
          <div className="text-center mb-12">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#22D6DC", letterSpacing: "0.18em" }}
            >
              Products
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Three ways Corvus works for you
            </h2>
          </div>

          <div className="space-y-6">

            {/* Corvus' Verdict */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0D1520", borderTop: "3px solid #22D6DC" }}>
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">WiFi Health Report</h3>
                    <p className="text-sm font-semibold" style={{ color: "#22D6DC" }}>
                      Single-location analysis &middot; $50 one-time or included with subscription
                    </p>
                  </div>
                  <Link
                    href="/crows-eye"
                    className="shrink-0 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold ocws-glow-hover"
                    style={{ background: "#22D6DC", color: "#0D1520" }}
                  >
                    Get Your WiFi Health Report
                  </Link>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#aaa" }}>
                  Open Crow&rsquo;s Eye and tap Scan. Corvus reads your entire WiFi environment —
                  every channel, every network, every signal — and tells you exactly what&rsquo;s wrong,
                  why it&rsquo;s wrong, and exactly how to fix it on your specific router. Every finding.
                  Every step. Branded PDF you keep forever.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Full AI WiFi environment diagnosis",
                    "Channel saturation and interference analysis",
                    "Router vendor identification from MAC OUI",
                    "Step-by-step fix instructions per router",
                    "Security posture assessment",
                    "Branded PDF report — yours to keep",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm" style={{ color: "#ccc" }}>
                      <span style={{ color: "#22D6DC", flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* The Full Reckoning */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0D1520", borderTop: "3px solid #D8AC32" }}>
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">The Whole-Home Survey</h3>
                    <p className="text-sm font-semibold" style={{ color: "#D8AC32" }}>
                      Multi-location site survey &middot; From $150
                    </p>
                  </div>
                  <Link
                    href="/crows-eye"
                    className="shrink-0 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold"
                    style={{ border: "1px solid #D8AC32", color: "#D8AC32", background: "transparent" }}
                  >
                    Start a Whole-Home Survey
                  </Link>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#aaa" }}>
                  Corvus moving through your entire facility — room by room, floor by floor, building to
                  building. Corvus scans each location in the app. He synthesizes everything into one
                  unified report covering every dead zone, every interference source, every structural gap.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { tier: "Small Site", locs: "Up to 5 locations", price: "$150" },
                    { tier: "Standard Site", locs: "6–15 locations", price: "$350" },
                    { tier: "Commercial Site", locs: "16+ locations", price: "$750" },
                  ].map(({ tier, locs, price }) => (
                    <div key={tier} className="rounded-xl p-4 text-center" style={{ background: "#1A2332", border: "1px solid rgba(216,172,50,0.25)" }}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#D8AC32" }}>{tier}</p>
                      <p className="text-xs mb-2" style={{ color: "#888" }}>{locs}</p>
                      <p className="text-2xl font-bold" style={{ color: "#D8AC32" }}>{price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OCWS Pro */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#0D1520", borderTop: "3px solid #D8AC32" }}>
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">OCWS Pro Certified Whole-Home Survey</h3>
                    <p className="text-sm font-semibold" style={{ color: "#D8AC32" }}>
                      Joshua certifies every finding &middot; $1,500 &middot; Any size facility
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="shrink-0 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold"
                    style={{ border: "1px solid rgba(216,172,50,0.5)", color: "#D8AC32", background: "transparent" }}
                  >
                    Request Pro Survey
                  </Link>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#aaa" }}>
                  Joshua Turner personally reviews and certifies every finding. Valid for compliance
                  documentation, insurance claims, board presentations, and vendor quotes. Built on
                  17 years of U.S. Navy Electronic Warfare experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Full Whole-Home Survey — all locations included",
                    "Personal certification by Joshua Turner",
                    "Valid for compliance and legal documentation",
                    "Insurance claim and vendor quote support",
                    "Board-ready professional report format",
                    "17 years Navy EW expertise behind every cert",
                  ].map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm" style={{ color: "#ccc" }}>
                      <span style={{ color: "#D8AC32", flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Why Corvus comparison ── */}
      <section className="py-16" style={{ background: "#0D1520" }}>
        <div className="ocws-container" style={{ maxWidth: "900px" }}>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#22D6DC", letterSpacing: "0.18em" }}>
              Why Choose Corvus
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Other tools show you the data. Corvus tells you what it means.
            </h2>
          </div>

          <div style={{ border: "1px solid rgba(34,214,220,0.2)", borderRadius: "12px", overflow: "hidden", marginBottom: "40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", background: "#1A2332", padding: "16px 24px", alignItems: "center" }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: "#8AAABB", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Traditional Wi-Fi Tools
              </span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", color: "#D8AC32", textAlign: "center", padding: "0 20px" }}>
                VS
              </span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: "#22D6DC", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "right" }}>
                Corvus
              </span>
            </div>
            {comparison.map(([traditional, corvus], i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderBottom: i < comparison.length - 1 ? "1px solid rgba(34,214,220,0.06)" : "none",
                  background: i % 2 === 0 ? "rgba(13,21,32,0.6)" : "rgba(26,35,50,0.4)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", fontSize: "0.85rem", color: "rgba(244,246,248,0.5)", borderRight: "1px solid rgba(34,214,220,0.08)" }}>
                  <span style={{ color: "#E05555", fontSize: "1rem", flexShrink: 0 }}>✗</span>
                  {traditional}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", fontSize: "0.85rem", color: "#F4F6F8" }}>
                  <span style={{ color: "#22D6DC", fontSize: "1rem", flexShrink: 0 }}>✓</span>
                  {corvus}
                </div>
              </div>
            ))}
          </div>

          {/* Joshua quote */}
          <div style={{ background: "rgba(13,21,32,0.8)", border: "1px solid rgba(216,172,50,0.3)", borderLeft: "4px solid #D8AC32", borderRadius: "0 12px 12px 0", padding: "24px 28px", marginBottom: "56px" }}>
            <p className="text-sm italic mb-3 leading-relaxed" style={{ color: "#F4F6F8", lineHeight: 1.8 }}>
              &ldquo;I&rsquo;ve seen what professional WiFi analysis costs at the enterprise level. I built Corvus so that a barbershop owner, a church administrator, and a hospital IT director could all get the same quality of diagnosis — without needing a $2,400 subscription or a trained engineer.&rdquo;
            </p>
            <p className="text-sm italic leading-relaxed" style={{ color: "#F4F6F8", lineHeight: 1.8 }}>
              &ldquo;Your internet provider will always say everything is fine on their end. Corvus will tell you the truth.&rdquo;
            </p>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: "#D8AC32", letterSpacing: "0.12em", marginTop: "16px" }}>
              — Joshua Turner · 17 Years U.S. Navy Electronic Warfare
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/crows-eye"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3 text-sm font-bold ocws-glow-hover"
              style={{ background: "#22D6DC", color: "#0D1520" }}
            >
              Get Your First WiFi Health Report
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3 text-sm font-semibold"
              style={{ color: "#22D6DC", border: "1px solid rgba(34,214,220,0.3)", background: "transparent" }}
            >
              See Pricing →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
