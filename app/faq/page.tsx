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
    a: "The initial analysis is free. Corvus will tell you how many problems he found and give you a teaser of what he saw. The full Verdict — all findings, all fixes, step-by-step router instructions specific to your equipment, and a branded PDF — is $50. Nest members ($19/mo) get 3 Verdicts per month included.",
  },
  {
    q: "How many Verdicts do I get per month?",
    a: "A single purchase gives you one Verdict immediately for $50. Nest membership includes 3 Verdicts per month. Flock includes 15 per month. Murder is unlimited. Extra credits are available for purchase at any time — $15 each for Nest members, $10 each for Flock members.",
  },
  {
    q: "Why does my first Nest Verdict take 24 hours?",
    a: "New Nest accounts unlock their first Verdict 24 hours after signup. This gives Corvus time to properly calibrate to your environment and ensures the best possible analysis. If you need an immediate Verdict, a single purchase is available for $50 — no waiting.",
  },
  {
    q: "Can I cancel my Nest membership?",
    a: "Monthly Nest plans require a 3-month minimum commitment — your first charge covers 3 months at $57. After 90 days you can cancel anytime with no penalty. The annual plan ($149/yr) has no minimum commitment and can be cancelled for a prorated refund.",
  },
  {
    q: "What if I need more than 3 Verdicts in a month?",
    a: "Buy extra Verdict credits anytime from your account dashboard. Single credits are $15 for Nest members. 6-pack is $75 (saves $15). 12-pack is $120 (saves $60). Credits never expire and roll over month to month.",
  },
  {
    q: "Why is a single Verdict $50 but extra credits are only $15 for Nest members?",
    a: "The $50 single Verdict is for people who need an immediate answer with no commitment. Nest members have already committed to the platform so extra credits are discounted to reward that loyalty. Think of it as the difference between a walk-in price and a member price.",
  },
  {
    q: "What is The Full Reckoning?",
    a: "The Full Reckoning is Corvus moving through your entire facility location by location. Unlike a single Verdict which analyzes one scan point, The Full Reckoning maps your entire wireless environment — every room, every floor, every outdoor area. You take the same three screenshots at each location and Corvus synthesizes everything into one unified report identifying site-wide patterns, dead zones, and facility-wide fixes. Small sites up to 5 locations are $150. Standard sites 6-15 locations are $350. Commercial sites 16+ locations are $750.",
  },
  {
    q: "How many locations can I include in a Full Reckoning?",
    a: "Up to 5 locations on a Small Reckoning ($150). Up to 15 on a Standard Reckoning ($350). Unlimited locations on a Commercial Reckoning ($750). Nest members get one Small Reckoning included per month. Flock members get three Small and one Standard per month. Murder members get unlimited Small and Standard Reckonings.",
  },
  {
    q: "How do I take screenshots for The Full Reckoning?",
    a: "Same process as a single Verdict but repeated at each location. Walk to each area of your facility and take three screenshots: the Access Points list, the 2.4 GHz Channel Graph, and the 5 GHz Channel Graph. Label each location clearly before moving to the next. Crow's Eye guides you through each location step by step.",
  },
  {
    q: "How long does The Full Reckoning take?",
    a: "About 3-5 minutes per location for scanning and uploading. A 5-location Small Reckoning takes roughly 20-30 minutes to set up. Corvus analysis takes 2-3 minutes after all locations are submitted. Plan for about 45 minutes total for a thorough small site survey.",
  },
  {
    q: "Can I get a certified Full Reckoning?",
    a: "Yes. The OCWS Pro Certified Reckoning includes Joshua Turner personally reviewing and certifying every finding. The certified report is valid for compliance documentation, insurance claims, board presentations, and vendor quotes. $1,500 for any size facility. Contact OCWS to request one.",
  },
  {
    q: "Can Crow's Eye handle properties with detached structures like garages, workshops, or man caves?",
    a: "Yes — this is exactly what The Full Reckoning was built for. Enable the Hybrid Property option when setting up your Reckoning, then add each structure as its own location group. Corvus analyzes signal relationships between all structures, identifies dead zones at thresholds and transition areas, and delivers specific recommendations for bridging coverage between buildings. Hybrid property surveys start at $350.",
  },
  {
    q: "I have a main house, a detached garage with a man cave, and a pool area. How do I set up my Reckoning?",
    a: "Enable Hybrid Property mode, then add locations for each area — Living Room, Kitchen, Master Bedroom for the main house; Man Cave, Garage Floor for the detached structure; Pool Deck, Patio for the outdoor area. Label each with its structure type. Corvus will map signal behavior across all three zones and tell you exactly where coverage breaks down and how to fix it. Standard Reckoning pricing applies ($350) plus $50 for each additional detached structure beyond the first.",
  },
  {
    q: "What is a transition zone?",
    a: "A transition zone is any area between two structures — a covered walkway, a breezeway, a doorway between a house and an attached garage, or the open air between a main building and a detached structure. These are where Wi-Fi coverage most commonly fails. Corvus specifically analyzes transition zones in hybrid surveys and tells you exactly where to place equipment to eliminate dead zones.",
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
