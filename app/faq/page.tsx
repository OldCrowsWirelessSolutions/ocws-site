// app/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Crow's Eye — Old Crows Wireless Solutions",
  description:
    "Answers to common questions about Crow's Eye, Corvus, pricing, subscriptions, and what to expect from OCWS.",
};

const FAQS: { section: string; items: { q: string; a: string }[] }[] = [
  {
    section: "The App",
    items: [
      {
        q: "What is Crow's Eye?",
        a: "Crow's Eye is an AI-powered wireless diagnostics app built on 17 years of U.S. Navy Electronic Warfare experience. Download it on Android to scan your network and get a Corvus Verdict — findings and fix steps in minutes.",
      },
      {
        q: "How do I get the app?",
        a: "Download Crow's Eye on Google Play. Search \"Crow's Eye\" or visit oldcrowswireless.com.",
      },
      {
        q: "What devices does it work on?",
        a: "Android phones and tablets running Android 10 or higher. iOS is coming soon.",
      },
      {
        q: "Does the app require internet?",
        a: "WiFi scanning works on-device. Verdict generation and Talk to Corvus require an active internet connection.",
      },
    ],
  },
  {
    section: "Verdicts & Reckonings",
    items: [
      {
        q: "What is a Corvus Verdict?",
        a: "A Verdict is Corvus's AI-generated analysis of your wireless environment. It identifies channel conflicts, security gaps, coverage issues, and interference patterns — then delivers prioritized fix steps with manufacturer-specific instructions.",
      },
      {
        q: "What is a Full Reckoning?",
        a: "A Full Reckoning is a multi-location wireless survey. You walk each room or area, Corvus scans each location, and delivers a comprehensive report covering every space — dead zones, site-wide patterns, and facility-level fixes.",
      },
      {
        q: "How long does a Verdict take?",
        a: "Corvus returns findings within a few minutes of completing the scan. The app guides you through the process step by step.",
      },
      {
        q: "What router brands does Corvus know?",
        a: "Corvus has specific fix instructions for Cox/Vantiva, Netgear, TP-Link, ASUS, Linksys, Arris, Motorola, Eero, Google/Nest, Xfinity/Comcast, AT&T, Spectrum/Sagemcom, and most other common consumer and ISP-provided equipment.",
      },
      {
        q: "How accurate is Corvus?",
        a: "Corvus analyzes what is physically present in your wireless environment — every visible network, signal level, channel, and MAC address. His findings are based on measurable RF data, not guesses.",
      },
    ],
  },
  {
    section: "Pricing & Subscriptions",
    items: [
      {
        q: "Is there a free version?",
        a: "Fledgling tier is $10/month and includes 3 Verdicts. A single Verdict is available for $50 with no subscription required.",
      },
      {
        q: "What are the subscription tiers?",
        a: "Fledgling ($10/mo) — 3 Verdicts, unlimited Talk to Corvus chat. Nest ($20/mo or $160/yr) — homeowners and small businesses. Flock ($100/mo or $900/yr) — MSPs, IT consultants, and growing teams. Murder ($950/mo or $9,500/yr) — enterprise networks, multi-site operators, and mission-critical environments.",
      },
      {
        q: "Can I cancel my subscription?",
        a: "Monthly Nest plans require a 3-month minimum commitment. After 90 days you can cancel anytime with no penalty. Annual plans can be cancelled for a prorated refund.",
      },
      {
        q: "What if I need more Verdicts than my plan includes?",
        a: "Buy extra Verdict credits anytime from your account dashboard. Credits never expire and roll over month to month.",
      },
    ],
  },
  {
    section: "Features",
    items: [
      {
        q: "What is Talk to Corvus?",
        a: "An AI chat interface where you can ask Corvus anything about wireless networking, RF interference, security, or your specific network environment. Available to all logged-in users.",
      },
      {
        q: "How current is Corvus's knowledge?",
        a: "Corvus's core knowledge base covers RF fundamentals through Wi-Fi 7 and current enterprise standards. His foundational RF expertise — propagation, interference, channel planning, MAC analysis — does not change with standards updates.",
      },
      {
        q: "What if I can't log into my router?",
        a: "Every finding that requires router access includes login instructions for your specific equipment, including factory default credentials. If those have been changed, Corvus will note that and recommend contacting your ISP or calling OCWS for professional assistance.",
      },
    ],
  },
  {
    section: "Enterprise & Pro",
    items: [
      {
        q: "What is the Enterprise tier?",
        a: "Enterprise accounts include team lead access codes, subordinate management, pre-configured scan profiles, and org-level dashboards. Contact us for institutional pricing.",
      },
      {
        q: "What is Campus Enterprise?",
        a: "Academic institutional licensing for universities. Includes student seats, faculty seats, and campus IT director access. Pricing from $1,500/year.",
      },
      {
        q: "Can I get a certified Full Reckoning?",
        a: "Yes. The OCWS Pro Certified Reckoning includes Joshua Turner personally reviewing and certifying every finding. The certified report is valid for compliance documentation, insurance claims, board presentations, and vendor quotes. $1,500 for any size facility. Contact OCWS to request one.",
      },
      {
        q: "Where does OCWS do on-site assessments?",
        a: "OCWS serves Pensacola metro (Escambia and Santa Rosa Counties) at the standard rate. We extend service through Northwest Florida to Mobile, AL with a travel fee. Outside that area, Crow's Eye remote analysis is the recommended alternative.",
      },
    ],
  },
  {
    section: "Security & Privacy",
    items: [
      {
        q: "Is my data secure?",
        a: "Scan data is processed via encrypted API calls. We do not sell user data. See our Privacy Policy for details.",
      },
      {
        q: "Who built Corvus?",
        a: "Joshua Turner, Managing Member of Old Crows Wireless Solutions LLC, a Navy Electronic Warfare veteran with 17 years of RF and signals intelligence experience.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}>
            Crow&rsquo;s Eye &middot; OCWS
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Common questions.
          </h1>
          <p className="text-base" style={{ color: "#888" }}>
            Everything you want to know before you let Corvus read your network.
          </p>
        </div>

        <div className="space-y-10 mb-12">
          {FAQS.map((section) => (
            <div key={section.section}>
              <h2
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "#00C2C7", letterSpacing: "0.18em", fontFamily: "'Share Tech Mono', monospace" }}
              >
                {section.section}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}
                  >
                    <summary className="cursor-pointer list-none flex items-center justify-between px-5 py-4">
                      <span className="text-white font-semibold pr-4">{item.q}</span>
                      <svg
                        className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                        style={{ color: "#00C2C7" }}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "#aaa" }}>
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: "#1A2332", border: "1px solid #0D6E7A" }}
        >
          <p className="text-white font-semibold mb-1">Still have questions?</p>
          <p className="text-sm mb-4" style={{ color: "#888" }}>
            Send a note and we&rsquo;ll point you in the right direction.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/crows-eye"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              Get the App
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "white", background: "transparent" }}
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
