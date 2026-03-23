// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import TiersSection from "./components/TiersSection";
import FAQPreview from "./components/FAQPreview";

export const metadata = {
  title: "Old Crows Wireless Solutions — Corvus sees what your ISP won't tell you.",
  description:
    "Upload your Wi-Fi scanner screenshots. Corvus reads your RF environment and tells you exactly what's wrong. Free instant analysis.",
};

export default function HomePage() {
  return (
    <>
      {/* ── SECTION 1: HERO ── */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "#0D1520" }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Corvus video */}
          <div className="mb-8 mx-auto" style={{ maxWidth: "480px" }}>
            <video
              src="/corvus.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-2xl"
              style={{ border: "2px solid #00C2C7", background: "#0D1520", display: "block" }}
            />
          </div>

          {/* Eyebrow */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#00C2C7", letterSpacing: "0.2em" }}
          >
            Crow&rsquo;s Eye by Corvus
          </p>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Corvus sees what your ISP won&rsquo;t tell you.
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: "#aaa" }}>
            Got slow Wi-Fi, dead zones, or drops that never get explained? Upload your scanner
            screenshots. Corvus reads your environment and tells you exactly what&rsquo;s wrong.
            Free instant analysis. Full Verdict for $50.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/crows-eye"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-bold transition min-w-[200px]"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              Get Corvus&rsquo; Verdict — Free
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition min-w-[200px]"
              style={{ border: "1px solid #00C2C7", color: "#00C2C7", background: "transparent" }}
            >
              See How It Works
            </Link>
          </div>

          {/* Corvus quote */}
          <div
            className="rounded-2xl px-6 py-4 mx-auto max-w-lg"
            style={{ border: "1px solid #B8922A" }}
          >
            <p className="text-sm italic" style={{ color: "#B8922A" }}>
              &ldquo;I&rsquo;ve already rendered my Verdict. You&rsquo;re just here for the sentencing.&rdquo;
            </p>
            <p className="mt-2 text-xs" style={{ color: "#666" }}>— Corvus</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <section className="py-20" style={{ background: "#1A2332" }}>
        <div className="ocws-container">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Three screenshots. One Verdict.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Download WiFi Analyzer",
                desc: "Free from Google Play or App Store. Green icon. No account required.",
              },
              {
                step: "2",
                title: "Take three screenshots",
                desc: "Access Points list, 2.4 GHz Channel Graph, 5 GHz Channel Graph. We show you exactly how.",
              },
              {
                step: "3",
                title: "Upload to Crow's Eye",
                desc: "Corvus analyzes every network in your environment and renders his Verdict.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-2xl p-6 flex flex-col items-start"
                style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="flex items-center justify-center rounded-full text-base font-bold mb-4"
                  style={{ width: "40px", height: "40px", background: "#00C2C7", color: "#0D1520", flexShrink: 0 }}
                >
                  {step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#888" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: MEET CORVUS ── */}
      <section className="py-20" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Image */}
            <div className="shrink-0 w-full md:w-auto flex justify-center">
              <Image
                src="/corvus_still_clean.png"
                alt="Corvus"
                width={380}
                height={480}
                className="rounded-2xl object-cover"
                style={{ maxWidth: "380px", width: "100%", height: "auto" }}
              />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#00C2C7", letterSpacing: "0.18em" }}
              >
                Crow&rsquo;s Eye · RF Intelligence Engine
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Meet Corvus.
              </h2>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
                Corvus is the AI intelligence engine behind Crow&rsquo;s Eye. He has read thousands of
                wireless environments. He knows what your ISP isn&rsquo;t telling you. He has opinions
                about your router. He will share them.
              </p>
              <p className="text-base leading-relaxed mb-6" style={{ color: "#aaa" }}>
                Corvus reads your scanner screenshots, identifies every network in your environment,
                cross-references MAC addresses against known vendors, and delivers a complete diagnosis
                with step-by-step fix instructions specific to your exact equipment. He does not guess.
                He does not generalize. He renders Verdicts.
              </p>

              {/* Personality note */}
              <div
                className="rounded-xl px-5 py-4 mb-8"
                style={{ border: "1px solid #0D6E7A" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
                  Impatient. Theatrical. Always correct. Warm underneath. Built by a Navy electronic
                  warfare specialist who spent 17 years hunting signals across 55 countries.
                </p>
              </div>

              <Link
                href="/crows-eye"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition"
                style={{ background: "#00C2C7", color: "#0D1520" }}
              >
                See Corvus in Action
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TIERS (client component for modal) ── */}
      <TiersSection />

      {/* ── SECTION 5: CASE STUDIES ── */}
      <section className="py-20" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Corvus&rsquo; Verdicts in the wild.
          </h2>
          <p className="text-base mb-10" style={{ color: "#888" }}>
            Real scans. Real findings. Real fixes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "#1A2332", borderTop: "3px solid #B8922A" }}
            >
              <h3 className="text-lg font-bold text-white mb-1">Pilchers Barbershop</h3>
              <p className="text-xs mb-4" style={{ color: "#888" }}>Retail · Pensacola FL</p>
              <ul className="space-y-2 mb-5">
                <li className="text-sm" style={{ color: "#ef4444" }}>● CoxWiFi co-channel on CH 11</li>
                <li className="text-sm" style={{ color: "#f59e0b" }}>● Three networks competing for airtime</li>
                <li className="text-sm" style={{ color: "#f59e0b" }}>● POS system throughput degraded</li>
              </ul>
              <Link href="/case-studies" className="text-sm font-semibold" style={{ color: "#00C2C7" }}>
                View Corvus&rsquo; Verdict →
              </Link>
            </div>

            {/* Card 2 */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "#1A2332", borderTop: "3px solid #B8922A" }}
            >
              <h3 className="text-lg font-bold text-white mb-1">Olive Baptist Church</h3>
              <p className="text-xs mb-4" style={{ color: "#888" }}>Church · Pensacola FL</p>
              <ul className="space-y-2 mb-5">
                <li className="text-sm" style={{ color: "#ef4444" }}>● Open network — zero security on both bands</li>
                <li className="text-sm" style={{ color: "#ef4444" }}>● Channel 6 carrying 7+ competing networks</li>
                <li className="text-sm" style={{ color: "#f59e0b" }}>● No guest network separation</li>
              </ul>
              <Link href="/case-studies" className="text-sm font-semibold" style={{ color: "#00C2C7" }}>
                View Corvus&rsquo; Verdict →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ON-SITE ASSESSMENTS ── */}
      <section
        className="py-20"
        style={{ background: "#1A2332", borderLeft: "4px solid #0D6E7A" }}
      >
        <div className="ocws-container">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need boots on the ground?
          </h2>
          <p className="text-base mb-10 max-w-2xl" style={{ color: "#aaa" }}>
            Crow&rsquo;s Eye tells you what&rsquo;s wrong. Sometimes you need someone to come fix it.
            Joshua Turner personally conducts every on-site RF assessment and certifies every report.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="rounded-2xl p-6"
              style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}
            >
              <h3 className="text-base font-bold text-white mb-1">Pensacola Metro Area</h3>
              <p className="text-xs mb-3" style={{ color: "#888" }}>Escambia County + Santa Rosa County</p>
              <div className="text-3xl font-bold mb-1" style={{ color: "#00C2C7" }}>$250 flat</div>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}
            >
              <h3 className="text-base font-bold text-white mb-1">Northwest FL to Mobile AL</h3>
              <p className="text-xs mb-3" style={{ color: "#888" }}>Outside Pensacola metro</p>
              <div className="text-3xl font-bold mb-1" style={{ color: "#00C2C7" }}>$375</div>
              <p className="text-xs" style={{ color: "#888" }}>($250 base + $125 travel fee)</p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h3 className="text-base font-bold mb-1" style={{ color: "#888" }}>Outside Service Area</h3>
              <p className="text-xs mb-3" style={{ color: "#666" }}>Not available</p>
              <p className="text-sm" style={{ color: "#666" }}>Crow&rsquo;s Eye Verdict recommended instead</p>
            </div>
          </div>

          <p className="text-xs mb-6" style={{ color: "#B8922A" }}>
            Service area covers Pensacola metro (Escambia + Santa Rosa Counties) through Northwest
            Florida to Mobile AL. Travel fee of $125 applies for locations requiring more than 50
            miles round trip from Pensacola.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition"
            style={{ background: "#00C2C7", color: "#0D1520" }}
          >
            Request an Assessment
          </Link>
        </div>
      </section>

      {/* ── SECTION 7: FOUNDER ── */}
      <section className="py-20" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
            Built from a house fire.
          </h2>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Photo placeholder */}
            <div className="shrink-0 flex justify-center w-full md:w-auto">
              <div
                className="rounded-2xl flex flex-col items-center justify-center"
                style={{
                  width: "300px",
                  height: "400px",
                  background: "#1A2332",
                  border: "2px solid #B8922A",
                }}
              >
                <span className="text-5xl font-bold" style={{ color: "#B8922A" }}>JT</span>
                <span className="mt-3 text-xs" style={{ color: "#555" }}>Add photo</span>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Joshua Turner</h3>
              <p className="text-sm font-semibold mb-5" style={{ color: "#00C2C7" }}>
                Built on 17 years of U.S. Navy Electronic Warfare experience
              </p>

              <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
                In October 2025 our house caught fire. My wife couldn&rsquo;t get a cell signal to
                call for help. I explained that superheated metal wiring changes the magnetic field.
                She asked how I knew. The Navy taught me. Old Crows Wireless Solutions was born that
                night.
              </p>
              <p className="text-base leading-relaxed mb-6" style={{ color: "#aaa" }}>
                The name is a homage to the Association of Old Crows — the fraternal organization of
                electronic warfare professionals. We have operated in over 55 countries. We know RF.
              </p>

              {/* Faith box */}
              <div
                className="rounded-xl px-5 py-4"
                style={{ borderLeft: "3px solid #B8922A" }}
              >
                <p className="text-sm italic" style={{ color: "#B8922A" }}>
                  &ldquo;God opened this door. We walked through it.&rdquo;
                </p>
                <p className="mt-1 text-xs" style={{ color: "#666" }}>
                  — Joshua Turner, Managing Member, OCWS LLC
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ PREVIEW (client component) ── */}
      <FAQPreview />

      {/* ── SECTION 9: CTA BANNER ── */}
      <section className="py-20 text-center" style={{ background: "#0D6E7A" }}>
        <div className="ocws-container">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Your Wi-Fi has problems.
          </h2>
          <p className="text-lg font-semibold mb-2" style={{ color: "#00C2C7" }}>
            Corvus already knows what they are.
          </p>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>
            Free instant analysis. No account required.
          </p>
          <Link
            href="/crows-eye"
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold transition"
            style={{ background: "#0D1520", color: "white" }}
          >
            Get Corvus&rsquo; Verdict
          </Link>
        </div>
      </section>
    </>
  );
}
