// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import TiersSection from "./components/TiersSection";
import FAQPreview from "./components/FAQPreview";
import CorvusClickableImage from "./components/CorvusClickableImage";
import { getApprovedEndorsements } from "@/lib/endorsements";

export const metadata = {
  title: "Old Crows Wireless Solutions — Corvus sees what your ISP won't tell you.",
  description:
    "Upload your Wi-Fi scanner screenshots. Corvus reads your RF environment and tells you exactly what's wrong. Free instant analysis.",
};

export default function HomePage() {
  const endorsements = getApprovedEndorsements();
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
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-bold ocws-glow-hover min-w-[200px]"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              Get Corvus&rsquo; Verdict — Free
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold ocws-glow-hover min-w-[200px]"
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
              {
                step: "★",
                title: "Need the whole picture?",
                desc: "The Full Reckoning maps your entire facility — room by room, floor by floor. From $150.",
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
              <CorvusClickableImage
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
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold ocws-glow-hover"
                style={{ background: "#00C2C7", color: "#0D1520" }}
              >
                See Corvus in Action
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3b: ENDORSEMENTS (only renders when endorsements exist) ── */}
      {endorsements.length > 0 && (
        <section className="py-20" style={{ background: "#1A2332" }}>
          <div className="ocws-container">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#B8922A", letterSpacing: "0.18em" }}>
                Professional Endorsements
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trusted by Professionals
              </h2>
              <p className="text-base" style={{ color: "#aaa" }}>
                The people who have seen what Corvus can do.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {endorsements.map((e) => {
                const initials = e.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div
                    key={e.id}
                    className="rounded-2xl p-6 flex flex-col"
                    style={{
                      background: "#0D1520",
                      border: "1px solid rgba(184,146,42,0.3)",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      {e.photoUrl ? (
                        <Image
                          src={e.photoUrl}
                          alt={e.name}
                          width={52}
                          height={52}
                          className="rounded-full object-cover shrink-0"
                          style={{ width: "52px", height: "52px" }}
                        />
                      ) : (
                        <div
                          className="rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{
                            width: "52px", height: "52px",
                            background: "linear-gradient(135deg, #B8922A, #D4AF37)",
                            color: "#0D1520",
                          }}
                        >
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold text-base leading-tight">{e.name}</p>
                          {e.linkedinUrl && (
                            <a
                              href={e.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${e.name} on LinkedIn`}
                              style={{ color: "#0077B5", flexShrink: 0 }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                        <p className="text-sm font-medium" style={{ color: "#00C2C7" }}>{e.title}</p>
                        <p className="text-xs" style={{ color: "#666" }}>{e.company}</p>
                      </div>
                    </div>

                    {/* Quote(s) */}
                    {'quotes' in e && e.quotes && e.quotes.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(e.quotes as {id: string; label: string; text: string}[]).map(q => (
                          <div key={q.id}>
                            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '0.55rem', color: '#00C2C7', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>{q.label}</p>
                            <blockquote className="text-sm leading-relaxed italic pl-4" style={{ color: "#cccccc", borderLeft: "3px solid #B8922A", margin: 0 }}>
                              &ldquo;{q.text}&rdquo;
                            </blockquote>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <blockquote
                        className="flex-1 text-sm leading-relaxed italic pl-4"
                        style={{
                          color: "#cccccc",
                          borderLeft: "3px solid #B8922A",
                        }}
                      >
                        &ldquo;{e.quote}&rdquo;
                      </blockquote>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                href="/endorsements"
                className="text-sm font-semibold"
                style={{ color: "#B8922A" }}
              >
                See all endorsements →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 3c: WHY CORVUS COMPARISON ── */}
      <section id="why-corvus" className="py-20" style={{ background: "#0D1520" }}>
        <div className="ocws-container" style={{ maxWidth: "900px" }}>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
              Why Choose Corvus
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Other tools show you the data. Corvus tells you what it means.
            </h2>
          </div>

          <div style={{ border: "1px solid rgba(0,194,199,0.2)", borderRadius: "12px", overflow: "hidden", marginBottom: "40px" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", background: "#1A2332", padding: "16px 24px", alignItems: "center" }}>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: "#888888", letterSpacing: "0.15em", textTransform: "uppercase" }}>Traditional Wi-Fi Tools</span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", color: "#B8922A", textAlign: "center", padding: "0 20px" }}>VS</span>
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: "#00C2C7", letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "right" }}>Corvus</span>
            </div>

            {[
              ["Show you channel graphs", "Renders a complete Verdict"],
              ["Require technical knowledge to interpret", "Adapts to your level — Level 1 to White Hat"],
              ["Leave you with raw data", "Gives you step-by-step fix instructions"],
              ["$2,400+/year for professional grade", "Starts at $50 · Subscriptions from $20/mo"],
              ["Need a trained engineer to operate", "Works for anyone — grandmother to CISO"],
              ["Silent output", "Speaks in his own voice"],
              ["Generic recommendations", "Router-specific instructions for your exact equipment"],
              ["No certification available", "Joshua Turner certifies every Pro report"],
              ["Tools you use once and forget", "Platform with daily engagement and team features"],
            ].map(([traditional, corvus], i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: i < 8 ? "1px solid rgba(0,194,199,0.06)" : "none",
                background: i % 2 === 0 ? "rgba(13,21,32,0.6)" : "rgba(26,35,50,0.4)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", fontSize: "0.85rem", color: "rgba(244,246,248,0.5)", borderRight: "1px solid rgba(0,194,199,0.08)" }}>
                  <span style={{ color: "#E05555", fontSize: "1rem", flexShrink: 0 }}>✗</span>
                  {traditional}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", fontSize: "0.85rem", color: "#F4F6F8" }}>
                  <span style={{ color: "#00C2C7", fontSize: "1rem", flexShrink: 0 }}>✓</span>
                  {corvus}
                </div>
              </div>
            ))}
          </div>

          {/* Joshua quote */}
          <div style={{ background: "rgba(13,21,32,0.8)", border: "1px solid rgba(184,146,42,0.3)", borderLeft: "4px solid #B8922A", borderRadius: "0 12px 12px 0", padding: "24px 28px" }}>
            <p className="text-sm italic mb-3 leading-relaxed" style={{ color: "#F4F6F8", lineHeight: 1.8 }}>
              &ldquo;I&rsquo;ve seen what professional RF analysis costs at the enterprise level. I built Corvus so that a barbershop owner, a church administrator, and a hospital IT director could all get the same quality of diagnosis — without needing a $2,400 subscription or a trained engineer.&rdquo;
            </p>
            <p className="text-sm italic mb-3 leading-relaxed" style={{ color: "#F4F6F8", lineHeight: 1.8 }}>
              &ldquo;The ISP will always say everything is fine on their end. Corvus will tell you the truth.&rdquo;
            </p>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: "#B8922A", letterSpacing: "0.12em", marginTop: "16px" }}>
              — Joshua Turner · 17 Years U.S. Navy Electronic Warfare
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: TIERS (client component for modal) ── */}
      <TiersSection />

      {/* ── SECTION 4b: APP COMING SOON ── */}
      <section className="py-20" style={{ background: "#0D1520" }}>
        <div className="ocws-container">
          <div className="max-w-2xl mx-auto text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#00C2C7", letterSpacing: "0.18em" }}
            >
              Crow&rsquo;s Eye &middot; Mobile App
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Crow&rsquo;s Eye &mdash; Coming to Your Phone
            </h2>
            <p className="text-base mb-10" style={{ color: "#888" }}>
              The full power of Corvus in your pocket. Launching on iOS and Android.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {/* Google Play badge */}
              <a
                href="/waitlist"
                className="inline-flex items-center gap-3 rounded-2xl px-6 py-4 transition min-w-[200px]"
                style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M4 3.5L16.5 14 4 24.5V3.5Z" fill="#00C2C7" />
                  <path d="M4 3.5L16.5 14 23 10.5 4 3.5Z" fill="#4ade80" />
                  <path d="M4 24.5L16.5 14 23 17.5 4 24.5Z" fill="#f87171" />
                  <path d="M23 10.5L16.5 14 23 17.5 26 14 23 10.5Z" fill="#fbbf24" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] font-medium" style={{ color: "#888" }}>Coming Soon on</div>
                  <div className="text-sm font-bold text-white">Google Play</div>
                </div>
              </a>

              {/* Apple App Store badge */}
              <a
                href="/waitlist"
                className="inline-flex items-center gap-3 rounded-2xl px-6 py-4 transition min-w-[200px]"
                style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true">
                  <path d="M20.5 21.5C19.3 23.3 18 25 16.2 25C14.5 25 13.8 24 12 24C10.2 24 9.4 25 7.7 25C6 25 4.7 23.2 3.5 21.4C1.8 18.9 0.5 14.8 1.9 11.8C2.7 10.1 4.5 9 6.5 9C8.2 9 9.2 10 11 10C12.8 10 13.6 9 15.6 9C17.4 9 19 9.9 20 11.4C16.5 13.3 17.1 18.5 20.5 21.5Z" fill="white" />
                  <path d="M15.5 3C15.8 5.5 13.4 7.5 11.2 7.5C10.9 5.1 13.3 3.1 15.5 3Z" fill="white" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] font-medium" style={{ color: "#888" }}>Coming Soon on the</div>
                  <div className="text-sm font-bold text-white">App Store</div>
                </div>
              </a>
            </div>

            <p className="text-sm italic mb-8" style={{ color: "#B8922A" }}>
              Be first when it launches. Join the waitlist.
            </p>

            <a
              href="/waitlist"
              className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold ocws-glow-hover"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              Join the App Waitlist
            </a>
          </div>
        </div>
      </section>

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

          <p className="text-xs mb-3" style={{ color: "#B8922A" }}>
            Service area covers Pensacola metro (Escambia + Santa Rosa Counties) through Northwest
            Florida to Mobile AL. Travel fee of $125 applies for locations requiring more than 50
            miles round trip from Pensacola.
          </p>
          <p className="text-xs mb-6" style={{ color: "#888" }}>
            Properties with detached structures, large outdoor areas, or complex multi-building layouts may require additional time. Discussed and confirmed before booking.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold ocws-glow-hover"
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
                className="rounded-2xl overflow-hidden"
                style={{ width: "300px", height: "400px", border: "2px solid #B8922A" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/bio-picture.jpg"
                  alt="Joshua Turner — Founder, Old Crows Wireless Solutions"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Joshua Turner</h3>
              <p className="text-sm font-semibold mb-5" style={{ color: "#00C2C7" }}>
                Built on 17 years of U.S. Navy Electronic Warfare experience
              </p>

              <p className="text-base leading-relaxed mb-4" style={{ color: "#aaa" }}>
                In October 2025 our house caught fire. During the cleanup, my wife noticed she
                couldn&rsquo;t get a cell signal anywhere near the structure. She didn&rsquo;t know
                why. I did &mdash; superheated metal wiring changes the magnetic field. The Navy
                taught me that. Old Crows Wireless Solutions was born that night.
              </p>
              <p className="text-base leading-relaxed mb-6" style={{ color: "#aaa" }}>
                The name is a homage to the Association of Old Crows — the fraternal organization of
                electronic warfare professionals. I have operated in over 55 countries &mdash; from
                the Strait of Magellan to the Arctic Circle. I have seen what RF does in every
                environment on earth. Corvus was built on that foundation.
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

      {/* ── SECTION 7b: TESTIMONIALS ── */}
      <section className="py-20" style={{ background: "#1A2332" }}>
        <div className="ocws-container">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
              Client Reviews
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              What clients are saying.
            </h2>
          </div>

          {/* Eric Mims — Featured pull quote */}
          <div
            className="rounded-2xl p-6 mb-8 max-w-4xl"
            style={{ background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.25)", borderLeft: "4px solid #B8922A" }}
          >
            <p className="text-base md:text-lg leading-relaxed italic mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
              &ldquo;In under 5 minutes it produced actionable guidance. Wish I&rsquo;d had this in 2003 rolling out 802.11g.&rdquo;
            </p>
            <p className="text-sm font-semibold" style={{ color: "#B8922A" }}>
              — Eric Mims, San Antonio TX &nbsp;&middot;&nbsp; 30+ years IT experience
            </p>
          </div>

          {/* Google review count */}
          <a
            href="https://www.google.com/search?q=old+crows+wireless+solutions#mpd=~4427280477076900275/customers/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-6 text-sm hover:underline"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <span>⭐⭐⭐⭐⭐</span>
            <span className="font-semibold text-white">5.0</span>
            <span>· 3 Google Reviews</span>
          </a>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl">
            {/* Eric Mims — Full testimonial */}
            <div
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderTop: "3px solid #B8922A" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#B8922A" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.14L8 10.25l-3.71 1.97.71-4.14L2 5.35l4.15-.6L8 1z"/>
                    </svg>
                  ))}
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(184,146,42,0.1)", border: "1px solid rgba(184,146,42,0.25)", color: "#B8922A" }}
                >
                  Crow&rsquo;s Eye
                </span>
              </div>
              <blockquote className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                &ldquo;Corvus impressed me. I&rsquo;ve been in IT &gt;30 years and in under 5 minutes it produced actionable guidance. It reads what&rsquo;s visible on-air, flags co-channel contention, explains impact, and recommends fixes. Wish I&rsquo;d had this in 2003 rolling out 802.11g. Hats off to Josh and Old Crows Wireless.&rdquo;
              </blockquote>
              <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">Eric Mims</p>
                  <p className="text-xs" style={{ color: "#B8922A" }}>San Antonio, TX · 30+ yrs IT</p>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>March 2026</p>
              </div>
            </div>

            {/* Nate Farrelly — Google Review */}
            <div
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderTop: "3px solid #B8922A" }}
            >
              {/* Stars + Google badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#B8922A" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.14L8 10.25l-3.71 1.97.71-4.14L2 5.35l4.15-.6L8 1z"/>
                    </svg>
                  ))}
                </div>
                {/* Google Reviews badge */}
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}
                >
                  {/* Google G color mark */}
                  <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google Review
                </span>
              </div>

              {/* Review text */}
              <blockquote className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                &ldquo;Josh was outstanding to work with. His WiFi detection service was thorough, professional, and extremely informative. He quickly identified issues that were impacting performance and provided clear, practical recommendations to optimize coverage and reliability. Communication was excellent throughout the process, and his technical expertise was evident from start to finish. If you need accurate WiFi diagnostics and solutions you can trust, I highly recommend Josh.&rdquo;
              </blockquote>

              {/* Reviewer */}
              <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">Nate Farrelly</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>March 2026</p>
                </div>
              </div>
            </div>

            {/* Kyle Pitts — Google Review · Local Guide */}
            <div
              className="rounded-2xl p-7 flex flex-col gap-4"
              style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderTop: "3px solid #B8922A" }}
            >
              {/* Stars + Google badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#B8922A" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.14L8 10.25l-3.71 1.97.71-4.14L2 5.35l4.15-.6L8 1z"/>
                    </svg>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Local Guide badge */}
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: "rgba(251,188,5,0.12)", border: "1px solid rgba(251,188,5,0.35)", color: "#FBBC05" }}
                  >
                    Local Guide
                  </span>
                  {/* Google badge */}
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </span>
                </div>
              </div>

              {/* Review text */}
              <blockquote className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                &ldquo;OCW&rsquo;s concept is strong and feels legit, especially with the background behind it. Their website flows well, and it&rsquo;s easy to understand what they are offering without overcomplicating it. It feels practical and not gimmicky. The app side is clean too. Nothing felt clunky. Straight forward &mdash; connect to your Wi-Fi, take some screenshots and submit it for real feedback and solutions. Something people could actually use without a learning curve. Even something as simple as recommending I move my router to a more central location, changing an SSID and moving channels will help to speed things up. They have a solid foundation.&rdquo;
              </blockquote>

              {/* Reviewer */}
              <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <p className="text-sm font-semibold text-white">Kyle Pitts</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>March 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            {/* Google Reviews link */}
            <a
              href="https://www.google.com/search?q=old+crows+wireless+solutions#mpd=~4427280477076900275/customers/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:underline"
              style={{ color: "#00C2C7" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              See all reviews on Google →
            </a>
            <Link
              href="/testimonials"
              className="text-sm transition"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              All testimonials
            </Link>
            <Link
              href="/testimonials#submit"
              className="text-sm transition"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Submit your own review
            </Link>
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
            Free instant analysis · Single Verdict $50 · Full Reckoning from $150
          </p>
          <Link
            href="/crows-eye"
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold ocws-glow-hover"
            style={{ background: "#0D1520", color: "white" }}
          >
            Get Corvus&rsquo; Verdict
          </Link>
        </div>
      </section>
    </>
  );
}
