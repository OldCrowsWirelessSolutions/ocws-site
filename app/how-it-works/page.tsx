import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "How It Works — Crow's Eye | OCWS",
  description:
    "Download Crow's Eye on Android. Corvus scans your wireless environment automatically and delivers a full WiFi Health Report in minutes — no screenshots, no third-party apps required.",
};

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.oldcrowswireless.corvus";

const STEPS = [
  {
    number: "01",
    title: "Download Crow's Eye",
    body: "Get the app on Google Play. Free to download. Sign in or create your account in under a minute.",
    detail: "Android 10 or higher. iOS coming soon.",
  },
  {
    number: "02",
    title: "Let Corvus Scan",
    body: "Open the app and tap Scan. Corvus reads every Wi-Fi network in your environment — channels, signal levels, security configs, interference patterns — automatically.",
    detail: "No screenshots. No third-party apps. The scanning is built in.",
  },
  {
    number: "03",
    title: "Get Your WiFi Health Report",
    body: "Corvus analyzes the data and delivers prioritized findings — what's wrong, how bad it is, and exactly how to fix it. Step-by-step instructions specific to your router.",
    detail: "Results in minutes. Plain English. No engineer required.",
  },
  {
    number: "04",
    title: "Download the PDF",
    body: "Every WiFi Health Report comes as a signed, branded PDF you can save, share with your IT team, or use for vendor quotes and insurance documentation.",
    detail: "Reports are stored in your account history and accessible any time.",
  },
];

const FEATURES = [
  {
    icon: "📡",
    title: "Live WiFi Scanning",
    body: "Corvus reads your wireless environment in real time — channels, signal strength, interference sources, and competing networks.",
  },
  {
    icon: "🧠",
    title: "AI-Powered Analysis",
    body: "Built on 17 years of U.S. Navy Electronic Warfare experience. Corvus identifies problems, not just symptoms.",
  },
  {
    icon: "📋",
    title: "Signed PDF WiFi Health Reports",
    body: "Every analysis produces a branded PDF with prioritized findings and step-by-step fix instructions.",
  },
  {
    icon: "🔒",
    title: "Security Gap Detection",
    body: "Open networks, weak encryption, exposed WiFi network names, and missing VLAN segmentation — flagged automatically.",
  },
  {
    icon: "📊",
    title: "Channel Congestion Maps",
    body: "See exactly which channels are saturated, which neighbors are causing interference, and where to move.",
  },
  {
    icon: "💬",
    title: "Talk to Corvus",
    body: "Ask follow-up questions, get clarification on findings, and dig deeper into any issue — in plain English.",
  },
];

export default function HowItWorksPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>

      {/* Page header */}
      <section
        style={{
          background: "#0D1520",
          padding: "80px 0 72px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: `
            linear-gradient(rgba(34,214,220,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,214,220,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      >
        <div className="ocws-container text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#22D6DC", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Crow&rsquo;s Eye &middot; How It Works
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Download the app.<br />Corvus does the rest.
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "#8AAABB" }}>
            No screenshots. No third-party scanner apps. Crow&rsquo;s Eye handles the WiFi scanning
            automatically — you get the findings in minutes.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-xl px-7 py-4 text-base font-bold"
            style={{ background: "linear-gradient(135deg, #0D6E7A, #22D6DC)", color: "#fff", textDecoration: "none" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 3.27L12.73 12L2 20.73V3.27Z" fill="#fff" opacity="0.9" />
              <path d="M2 3.27L16.5 7.5L12.73 12L2 3.27Z" fill="#fff" opacity="0.7" />
              <path d="M2 20.73L12.73 12L16.5 16.5L2 20.73Z" fill="#fff" opacity="0.8" />
              <path d="M16.5 7.5L22 12L16.5 16.5L12.73 12L16.5 7.5Z" fill="#fff" />
            </svg>
            Download on Google Play
          </a>
        </div>
      </section>

      {/* Step-by-step */}
      <section style={{ background: "#0D1520", padding: "80px 0" }}>
        <div className="ocws-container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Four steps. One WiFi Health Report.</h2>
            <p className="text-sm" style={{ color: "#888" }}>From download to findings in under ten minutes.</p>
          </div>

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 flex gap-8 items-start"
                style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="shrink-0 font-bold"
                  style={{
                    fontSize: "2.5rem",
                    lineHeight: 1,
                    color: "rgba(34,214,220,0.25)",
                    fontFamily: "'Share Tech Mono', monospace",
                    minWidth: "3.5rem",
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-base leading-relaxed mb-2" style={{ color: "#B8CCD8" }}>{step.body}</p>
                  <p className="text-sm" style={{ color: "#6A8A9A", fontStyle: "italic" }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section
        style={{
          background: "#0A111C",
          padding: "80px 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="ocws-container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What Corvus does inside the app.</h2>
            <p className="text-sm" style={{ color: "#888" }}>Every feature built around one goal: telling you exactly what&rsquo;s wrong with your wireless.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl p-6"
                style={{ background: "#1A2332", borderLeft: "3px solid #22D6DC" }}
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#7A9AAB" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Reckoning callout */}
      <section style={{ background: "#0D1520", padding: "80px 0" }}>
        <div className="ocws-container max-w-3xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#D8AC32", fontFamily: "'Share Tech Mono', monospace" }}
          >
            Multi-Location Survey
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">Need to cover the whole building?</h2>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "#8AAABB" }}>
            The Whole-Home Survey walks every room. Corvus analyzes each location and delivers a
            unified report covering every space — dead zones, site-wide patterns, and facility-level fixes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold"
              style={{ background: "#22D6DC", color: "#0D1520", textDecoration: "none" }}
            >
              See Pricing
            </Link>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
              style={{
                border: "1px solid rgba(34,214,220,0.3)",
                color: "#22D6DC",
                background: "transparent",
                textDecoration: "none",
              }}
            >
              Get the App
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
