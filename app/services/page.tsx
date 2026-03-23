// app/services/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services | Old Crows Wireless Solutions",
  description:
    "Corvus\u2019 Verdict, The Full Reckoning, OCWS Pro Certified \u2014 AI-powered Wi-Fi diagnostics and on-site RF assessment from Old Crows Wireless Solutions.",
};

export default function ServicesPage() {
  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">

        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Old Crows Wireless Solutions
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Corvus Can Do For You
          </h1>
          <p className="text-base max-w-2xl" style={{ color: "#aaa" }}>
            Every service starts the same way: screenshots from your phone, read by Corvus.
            He already knows what&rsquo;s wrong. You just need to give him the data.
          </p>
        </div>

        {/* Service cards */}
        <div className="space-y-8 mb-16">

          {/* Corvus' Verdict */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1A2332", borderTop: "3px solid #00C2C7" }}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Corvus&rsquo; Verdict</h2>
                  <p className="text-sm font-semibold" style={{ color: "#00C2C7" }}>Single analysis &middot; $50 &middot; No account required</p>
                </div>
                <Link href="/crows-eye" className="shrink-0 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition" style={{ background: "#00C2C7", color: "#0D1520" }}>
                  Get Your Verdict
                </Link>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#aaa" }}>
                Upload three screenshots from WiFi Analyzer &mdash; the Signal List, the 2.4&nbsp;GHz Channel Graph, and the 5&nbsp;GHz Channel Graph.
                Corvus reads your entire RF environment and tells you exactly what&rsquo;s wrong, why it&rsquo;s wrong, and exactly how to fix it on
                your specific router. Every finding. Every step. Delivered as a branded PDF you keep forever.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Full AI RF environment diagnosis","Channel saturation and interference analysis","Router vendor identification from MAC OUI","Step-by-step fix instructions per router","Security posture assessment","Branded PDF report \u2014 yours to keep"].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm" style={{ color: "#ccc" }}>
                    <span style={{ color: "#00C2C7", flexShrink: 0 }}>✓</span><span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The Full Reckoning */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1A2332", borderTop: "3px solid #B8922A" }}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">The Full Reckoning</h2>
                  <p className="text-sm font-semibold" style={{ color: "#B8922A" }}>Multi-location site survey &middot; From $150</p>
                </div>
                <Link href="/crows-eye" className="shrink-0 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition" style={{ border: "1px solid #B8922A", color: "#B8922A", background: "transparent" }}>
                  Start a Reckoning
                </Link>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#aaa" }}>
                Corvus moving through your entire facility &mdash; room by room, floor by floor, building to building. You take three screenshots
                at each location. Corvus synthesizes everything into one unified report covering every dead zone, every interference source, every
                structural gap. Properties with detached structures get full cross-structure signal analysis.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                {[{tier:"Small Site",locs:"Up to 5 locations",price:"$150"},{tier:"Standard Site",locs:"6\u201315 locations",price:"$350"},{tier:"Commercial Site",locs:"16+ locations",price:"$750"}].map(({ tier, locs, price }) => (
                  <div key={tier} className="rounded-xl p-4 text-center" style={{ background: "#0D1520", border: "1px solid rgba(184,146,42,0.25)" }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#B8922A" }}>{tier}</p>
                    <p className="text-xs mb-2" style={{ color: "#888" }}>{locs}</p>
                    <p className="text-2xl font-bold" style={{ color: "#B8922A" }}>{price}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: "#888" }}>Properties with detached structures require a minimum Standard Reckoning ($350). Hybrid Property mode analyzes signal relationships between all structures.</p>
            </div>
          </div>

          {/* OCWS Pro Certified */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1A2332", borderTop: "3px solid #B8922A" }}>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">OCWS Pro Certified Reckoning</h2>
                  <p className="text-sm font-semibold" style={{ color: "#B8922A" }}>Joshua certifies every finding &middot; $1,500 &middot; Any size facility</p>
                </div>
                <Link href="/contact" className="shrink-0 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition" style={{ border: "1px solid rgba(184,146,42,0.5)", color: "#B8922A", background: "transparent" }}>
                  Request Pro Reckoning
                </Link>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#aaa" }}>
                Joshua Turner personally reviews and certifies every finding. Valid for compliance documentation, insurance claims, board presentations,
                and vendor quotes. Built on 17 years of U.S. Navy Electronic Warfare experience. Backed by the Association of Old Crows.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Full site Reckoning \u2014 all locations included","Personal certification by Joshua Turner","Valid for compliance and legal documentation","Insurance claim and vendor quote support","Board-ready professional report format","17 years Navy EW expertise behind every cert"].map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm" style={{ color: "#ccc" }}>
                    <span style={{ color: "#B8922A", flexShrink: 0 }}>✓</span><span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* On-Site Assessment */}
        <div className="rounded-2xl p-8 mb-12" style={{ background: "#1A2332", borderLeft: "4px solid #0D6E7A" }}>
          <h2 className="text-2xl font-bold text-white mb-2">On-Site RF Assessment</h2>
          <p className="text-sm mb-6" style={{ color: "#aaa" }}>
            Crow&rsquo;s Eye tells you what&rsquo;s wrong. Sometimes you need Joshua to come fix it. Every on-site assessment is conducted personally by Joshua Turner. No contractors. No handoffs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="rounded-xl p-5" style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}>
              <h3 className="text-sm font-bold text-white mb-1">Pensacola Metro Area</h3>
              <p className="text-xs mb-3" style={{ color: "#888" }}>Escambia + Santa Rosa Counties</p>
              <div className="text-2xl font-bold" style={{ color: "#00C2C7" }}>$250 flat</div>
            </div>
            <div className="rounded-xl p-5" style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}>
              <h3 className="text-sm font-bold text-white mb-1">Northwest FL to Mobile AL</h3>
              <p className="text-xs mb-3" style={{ color: "#888" }}>Outside Pensacola metro</p>
              <div className="text-2xl font-bold" style={{ color: "#00C2C7" }}>$375</div>
              <p className="text-xs mt-1" style={{ color: "#888" }}>($250 base + $125 travel fee)</p>
            </div>
            <div className="rounded-xl p-5" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-sm font-bold mb-1" style={{ color: "#888" }}>Outside Service Area</h3>
              <p className="text-xs mb-3" style={{ color: "#666" }}>Not available</p>
              <p className="text-sm" style={{ color: "#666" }}>Crow&rsquo;s Eye Verdict recommended instead</p>
            </div>
          </div>
          <p className="text-xs mb-1" style={{ color: "#B8922A" }}>Service area: Pensacola metro through Northwest FL to Mobile AL. $125 travel fee for locations more than 50 miles round trip from Pensacola.</p>
          <p className="text-xs mb-6" style={{ color: "#888" }}>Properties with detached structures, large outdoor areas, or complex multi-building layouts may require additional time. Discussed and confirmed before booking.</p>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition" style={{ background: "#00C2C7", color: "#0D1520" }}>
            Request an Assessment
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center py-12 rounded-2xl" style={{ background: "#0D6E7A" }}>
          <h2 className="text-3xl font-bold text-white mb-3">Start with a free scan.</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>Upload your screenshots. Corvus reads the environment in under 3 minutes.</p>
          <Link href="/crows-eye" className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold transition" style={{ background: "#0D1520", color: "white" }}>
            Get Corvus&rsquo; Verdict
          </Link>
        </div>

      </section>
    </main>
  );
}
