// app/faq/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Old Crows Wireless Solutions",
  description:
    "Answers to common questions about Crow's Eye, Corvus, on-site assessments, pricing, and what to expect from OCWS.",
};

const FAQS = [
  {
    q: "What is Crow's Eye?",
    a: "Crow's Eye is an AI-powered wireless diagnostic tool built by Old Crows Wireless Solutions. You upload screenshots from a free Wi-Fi scanner app and Corvus — our RF intelligence engine — analyzes every network visible in your environment and tells you exactly what's wrong and how to fix it.",
  },
  {
    q: "What scanner app do I need?",
    a: "WiFi Analyzer open source — free, green icon, available on Google Play. iPhone users can use WiFi Analyzer by Zoltán Palághy from the App Store. No account required on either.",
  },
  {
    q: "How much does Corvus' Verdict cost?",
    a: "The initial analysis is free. Corvus will tell you how many problems he found and give you a teaser of what he saw. The full Verdict — all findings, all fixes, step-by-step router instructions specific to your equipment, and a branded PDF — is $50.",
  },
  {
    q: "What is The Full Reckoning?",
    a: "The Full Reckoning is Crow's Eye's multi-location site survey mode. You upload scanner screenshots from multiple rooms or areas and Corvus synthesizes the findings across your entire property — identifying patterns, dead zones, and systemic issues that a single-point scan would miss. Starting at $150.",
  },
  {
    q: "Will this work for my home?",
    a: "Absolutely. Most of our users are homeowners frustrated with Wi-Fi performance that their ISP can't explain. Corvus was designed from the ground up to give real people real answers — not vague advice like 'try restarting your router.'",
  },
  {
    q: "Will this work for my business?",
    a: "Yes. Crow's Eye works for any environment — restaurants, churches, offices, RV parks, marinas, schools, medical facilities. Corvus adjusts his analysis based on your environment type and delivers business-grade findings.",
  },
  {
    q: "What router brands does Corvus know?",
    a: "Corvus identifies router vendors from MAC address OUI data and SSID naming patterns. He has specific fix instructions for Cox/Vantiva, Netgear, TP-Link, ASUS, Linksys, Arris, Motorola, Eero, Google/Nest, Xfinity/Comcast, AT&T, Spectrum/Sagemcom, and most other common consumer and ISP-provided equipment.",
  },
  {
    q: "What if I can't log into my router?",
    a: "Every finding that requires router access includes login instructions for your specific equipment, including factory default credentials. If those have been changed by your ISP or a previous technician, Corvus will note that and recommend contacting your ISP or calling OCWS for professional assistance.",
  },
  {
    q: "How accurate is Corvus?",
    a: "Corvus analyzes what is physically present in your scanner screenshots — every visible network, signal level, channel, and MAC address. His findings are based on measurable RF data, not guesses. He is as accurate as the data you provide. Better screenshots mean better analysis.",
  },
  {
    q: "What is the OCWS Pro tier?",
    a: "OCWS Pro is our highest service tier — $750 per report. Joshua Turner personally conducts an on-site walk survey, analyzes your environment hands-on, and certifies every finding. The resulting report is compliance and insurance grade, board-presentation ready, and valid for vendor quotes. Every OCWS Pro report is signed by Joshua.",
  },
  {
    q: "Where does OCWS do on-site assessments?",
    a: "OCWS serves Pensacola metro (Escambia and Santa Rosa Counties) at the standard rate. We extend service through Northwest Florida to Mobile, AL with a travel fee. Outside that area, Crow's Eye remote analysis is the recommended alternative.",
  },
  {
    q: "How much does an on-site assessment cost?",
    a: "$250 flat for Pensacola metro (Escambia + Santa Rosa Counties). $375 for locations in Northwest Florida through Mobile, AL — that's $250 base plus a $125 travel fee. The travel fee applies for locations requiring more than 50 miles round trip from Pensacola.",
  },
  {
    q: "What are the subscription tiers?",
    a: "Crow's Eye will offer three subscription tiers: Nest ($19/mo or $149/yr) for homeowners and small businesses, Flock ($99/mo or $899/yr) for MSPs and IT consultants, and Murder ($249/mo or $1,999/yr) for RF engineers and power users. All tiers are currently in development — join the waitlist to be notified at launch.",
  },
  {
    q: "How do I join the waitlist?",
    a: "Click 'Join Waitlist' on any tier card on the homepage or visit the Crow's Eye page. You'll be asked for your name, email, and which tier you're interested in. We'll notify you when your tier launches.",
  },
  {
    q: "Is my data safe?",
    a: "Your scanner screenshots are sent to Corvus for analysis and are not stored permanently. We do not sell your data, share it with third parties, or use it to train models beyond the analysis you requested. Your contact information is used only to respond to your inquiry.",
  },
];

export default function FAQPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Crow&rsquo;s Eye · OCWS
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Common questions.
          </h1>
          <p className="text-base" style={{ color: "#888" }}>
            Everything you want to know before you let Corvus read your network.
          </p>
        </div>

        <div className="space-y-3 mb-12">
          {FAQS.map((item) => (
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
              Try Crow&rsquo;s Eye Free
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
