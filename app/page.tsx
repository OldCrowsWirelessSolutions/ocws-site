import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HeroAnimation from './components/HeroAnimation'
import { PlayStoreBadge } from './components/PlayStoreBadge'

// TODO: Update to your actual Play Store listing URL once published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.oldcrowswireless.corvus'

export const metadata: Metadata = {
  title: 'Crow\'s Eye by OCWS — AI Wireless Diagnostics',
  description:
    'AI-powered wireless diagnostics built on 17 years of U.S. Navy Electronic Warfare experience. Download Crow\'s Eye and get your WiFi Health Report from Corvus.',
}

export default function HomePage() {
  return (
    <main style={{ background: '#0D1520' }}>

      {/* ── SECTION 1: HERO ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#0D1520', paddingTop: '80px', paddingBottom: '96px' }}
      >
        {/* Radial glow above circuit */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,214,220,0.07), transparent)',
          }}
        />

        <div className="ocws-container relative text-center" style={{ zIndex: 2 }}>
          <HeroAnimation />

          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
          >
            Crow&rsquo;s Eye &middot; Powered by Corvus AI
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Your Wi-Fi Is Lying To You.
          </h1>

          <p className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#8AAABB' }}>
            Corvus finds what your ISP won&rsquo;t tell you &mdash; channel conflicts, security gaps,
            dead zones &mdash; and tells you exactly how to fix them. Built on 17 years of
            U.S. Navy Electronic Warfare expertise.
          </p>

          <div className="flex flex-col items-center gap-3 mb-5">
            <PlayStoreBadge href={PLAY_STORE_URL} size="lg" />
            <Link
              href="/crows-eye"
              className="text-sm"
              style={{ color: 'rgba(34,214,220,0.65)', textDecoration: 'none' }}
            >
              Use on web instead &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TESTIMONIAL TILES ──────────────────────────────────── */}
      <section
        style={{
          background: '#0A111C',
          borderTop: '1px solid rgba(34,214,220,0.15)',
          borderBottom: '1px solid rgba(34,214,220,0.15)',
          padding: '48px 0',
        }}
      >
        <div className="ocws-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Tile 1 — Mike Arbouret */}
            <div
              className="rounded-xl p-6"
              style={{
                background: '#1A2332',
                borderLeft: '3px solid #22D6DC',
              }}
            >
              <p className="text-sm leading-relaxed text-white mb-4 italic">
                &ldquo;As an IBM Field CTO I&rsquo;ve evaluated a lot of enterprise tools.
                Corvus does in 60 seconds what takes my team hours. This is the real deal.&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-white">Mike Arbouret</p>
                <p className="text-xs mt-0.5" style={{ color: '#6A8A9A' }}>IBM Field CTO</p>
              </div>
            </div>

            {/* Tile 2 — Kyle Pitts */}
            <div
              className="rounded-xl p-6"
              style={{
                background: '#1A2332',
                borderLeft: '3px solid #22D6DC',
              }}
            >
              <p className="text-sm leading-relaxed text-white mb-4 italic">
                &ldquo;I&rsquo;m not an IT guy but Corvus told me exactly what was wrong with my
                network and exactly how to fix it. First time I&rsquo;ve ever actually understood
                my Wi-Fi.&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-white">Kyle Pitts</p>
                <p className="text-xs mt-0.5" style={{ color: '#6A8A9A' }}>U.S. Navy Veteran</p>
              </div>
            </div>

            {/* Tile 3 — Eric Mims */}
            <div
              className="rounded-xl p-6"
              style={{
                background: '#1A2332',
                borderLeft: '3px solid #22D6DC',
              }}
            >
              <p className="text-sm leading-relaxed text-white mb-4 italic">
                &ldquo;As an IT leader with over 30 years of experience in enterprise networking,
                I&rsquo;ve found that Crow&rsquo;s Eye by Corvus effectively condenses a
                week&rsquo;s worth of manual engineering into a single afternoon.&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold text-white">Eric Mims</p>
                <p className="text-xs mt-0.5" style={{ color: '#6A8A9A' }}>
                  30-Year IT Network Architect &amp; Cyber Veteran &middot; Houston, TX
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: HACK THE COAST URGENCY ────────────────────────────── */}
      <section
        style={{
          background: '#0D6E7A',
          borderTop: '2px solid #D8AC32',
          borderBottom: '2px solid #D8AC32',
          padding: '40px 0',
        }}
      >
        <div className="ocws-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Left: event info */}
            <div>
              <p
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: '#D8AC32', fontFamily: "'Share Tech Mono', monospace" }}
              >
                Meet Corvus Live
              </p>
              <p className="text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Hack the Coast Cybersecurity Conference &middot; May 9, 2026 &middot; Cowork Annex, Pensacola FL
              </p>
            </div>

            {/* Right: offer + CTA */}
            <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
              <p className="text-sm font-semibold text-white text-center md:text-right">
                First 20 signups get 3 free WiFi Health Reports.
              </p>
              <Link
                href="/hack-the-coast"
                className="w-full md:w-auto text-center rounded-xl px-6 py-3 text-sm font-bold transition"
                style={{
                  background: '#22D6DC',
                  color: '#0D1520',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Claim Your Free Reports &rarr;
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 4: PRICING TIERS ────────────────────────────────────────── */}
      <section style={{ background: '#0D1520', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              Plans &amp; Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pick your altitude.
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: '#888' }}>
              Every tier includes Corvus analysis. Scale as your needs grow.
            </p>
          </div>

          {/* Subscription tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              {
                emoji: '🐣',
                name: 'Fledgling',
                price: '$10',
                period: '/mo',
                border: 'rgba(34,214,220,0.35)',
                features: ['3 WiFi Health Reports / month', '1 Small Whole-Home Survey', 'Corvus chat access'],
              },
              {
                emoji: '🪺',
                name: 'Nest',
                price: '$20',
                period: '/mo',
                border: '#22D6DC',
                features: ['5 WiFi Health Reports / month', '1 Small Whole-Home Survey', '2 device seats'],
                highlight: true,
              },
              {
                emoji: '🐦',
                name: 'Flock',
                price: '$100',
                period: '/mo',
                border: 'rgba(34,214,220,0.35)',
                features: ['15 WiFi Health Reports / month', '3 Small + 1 Standard Whole-Home Survey', '5 device seats'],
              },
              {
                emoji: '🪽',
                name: 'Murder',
                price: '$950',
                period: '/mo',
                border: '#D8AC32',
                features: ['Unlimited WiFi Health Reports', 'Unlimited Small + 10 Standard', '20 device seats'],
                gold: true,
              },
            ].map(({ emoji, name, price, period, border, features, highlight, gold }) => (
              <div
                key={name}
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  background: highlight ? 'rgba(34,214,220,0.05)' : '#1A2332',
                  border: `1px solid ${border}`,
                  boxShadow: highlight ? `0 0 24px rgba(34,214,220,0.12)` : 'none',
                }}
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: gold ? '#D8AC32' : '#22D6DC', fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {name}
                </div>
                <div className="flex items-baseline gap-0.5 mb-4">
                  <span className="text-3xl font-bold text-white">{price}</span>
                  <span className="text-sm" style={{ color: '#888' }}>{period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#8AAABB' }}>
                      <span style={{ color: gold ? '#D8AC32' : '#22D6DC', flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center rounded-xl py-2.5 text-sm font-semibold transition ${gold ? 'hover:bg-amber-500/10' : 'hover:bg-cyan-500/10'}`}
                  style={{
                    border: `1px solid ${gold ? '#D8AC32' : 'rgba(34,214,220,0.4)'}`,
                    color: gold ? '#D8AC32' : '#22D6DC',
                    background: 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>

          {/* Verdict one-time + Enterprise row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Single Verdict */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #22D6DC' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    Single WiFi Health Report
                  </p>
                  <p className="text-2xl font-bold text-white">$50</p>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ border: '1px solid rgba(34,214,220,0.3)', color: '#22D6DC' }}
                >
                  No subscription needed
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: '#7A9AAB' }}>
                One full Corvus analysis with PDF report. No account required. Perfect for a one-time fix.
              </p>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl px-5 py-2.5 text-sm font-semibold"
                style={{
                  background: '#22D6DC',
                  color: '#0D1520',
                  textDecoration: 'none',
                }}
              >
                Get the App
              </a>
            </div>

            {/* Enterprise */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#1A2332', border: '1px solid rgba(216,172,50,0.3)', borderLeft: '3px solid #D8AC32' }}
            >
              <div className="mb-3">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: '#D8AC32', fontFamily: "'Share Tech Mono', monospace" }}
                >
                  Enterprise / Campus
                </p>
                <p className="text-2xl font-bold text-white">Custom</p>
              </div>
              <p className="text-sm mb-4" style={{ color: '#7A9AAB' }}>
                Institutional pricing for universities, hospitals, government, and multi-site MSP deployments.
                Volume discounts and dedicated support available.
              </p>
              <a
                href="mailto:joshua@oldcrowswireless.com?subject=Enterprise%20Pricing%20Inquiry"
                className="inline-block rounded-xl px-5 py-2.5 text-sm font-semibold"
                style={{
                  border: '1px solid #D8AC32',
                  color: '#D8AC32',
                  background: 'transparent',
                  textDecoration: 'none',
                }}
              >
                Contact for Pricing
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ background: '#1A2332', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Three steps to your WiFi Health Report.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Scan',
                body: 'Open the app. Corvus detects your network and scans the WiFi environment automatically.',
                icon: '📡',
              },
              {
                n: '02',
                title: 'Analyze',
                body: 'AI analysis identifies channel conflicts, security gaps, coverage issues, and interference patterns.',
                icon: '🧠',
              },
              {
                n: '03',
                title: 'Report',
                body: 'Receive a branded PDF WiFi Health Report with prioritized findings and step-by-step fix instructions.',
                icon: '📋',
              },
            ].map(({ n, title, body, icon }) => (
              <div
                key={n}
                className="rounded-2xl p-8"
                style={{
                  background: '#0D1520',
                  borderTop: '3px solid #22D6DC',
                }}
              >
                <div
                  className="text-5xl font-bold mb-4"
                  style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", opacity: 0.4 }}
                >
                  {n}
                </div>
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7A9AAB' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CORVUS INTRODUCTION ────────────────────────────────── */}
      <section style={{ background: '#0D1520', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">

            {/* Text */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
              >
                Meet the Engine
              </p>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Meet Corvus.
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#8AAABB' }}>
                WiFi intelligence engine. Wireless diagnostician. The only AI built on 17 years
                of U.S. Navy Electronic Warfare experience. He doesn&rsquo;t guess.
                He delivers WiFi Health Reports.
              </p>

              {/* Gold quote card */}
              <div
                className="rounded-xl px-6 py-5 mb-8"
                style={{ border: '1px solid #D8AC32', background: 'rgba(216,172,50,0.06)' }}
              >
                <p className="text-sm italic leading-relaxed" style={{ color: '#D8AC32' }}>
                  &ldquo;I found 4 problems. Three of them are embarrassing.&rdquo;
                </p>
                <p className="mt-2 text-xs" style={{ color: 'rgba(216,172,50,0.5)' }}>— Corvus</p>
              </div>

              <PlayStoreBadge href={PLAY_STORE_URL} size="sm" />
            </div>

            {/* Corvus visual */}
            <div className="flex items-center justify-center">
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: '#0D1520',
                  border: '1px solid rgba(34,214,220,0.2)',
                  width: '100%',
                  maxWidth: 320,
                  aspectRatio: '1',
                  position: 'relative',
                }}
              >
                {/* Circuit trace radial */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(34,214,220,0.06), transparent 70%)',
                  }}
                />
                <div style={{ position: 'relative', width: 180, height: 180 }}>
                  <Image
                    src="/corvus_still.png"
                    alt="Corvus AI"
                    fill
                    sizes="180px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 7: USE CASES ──────────────────────────────────────────── */}
      <section style={{ background: '#1A2332', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              Who Uses Corvus
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Every environment. One WiFi Health Report.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: '🏥', label: 'Healthcare', desc: 'Patient network reliability and HIPAA-aware segmentation.' },
              { icon: '🎓', label: 'Education', desc: 'High-density classroom and campus Wi-Fi diagnostics.' },
              { icon: '🏨', label: 'Hospitality', desc: 'Guest network performance and channel congestion fixes.' },
              { icon: '🏢', label: 'Enterprise', desc: 'Multi-floor deployments, coverage audits, and interference mapping.' },
              { icon: '🛒', label: 'Retail', desc: 'POS reliability and guest Wi-Fi optimization.' },
              { icon: '🏛️', label: 'Government', desc: 'Secure, segmented network verification and audit trails.' },
              { icon: '🔧', label: 'MSPs', desc: 'Scalable diagnostics across your entire client base.' },
              { icon: '⛪', label: 'Houses of Worship', desc: 'Venue-wide coverage for services and live events.' },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl p-5"
                style={{
                  background: '#0D1520',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: '3px solid #22D6DC',
                }}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <p className="font-semibold text-white text-sm mb-1">{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#7A9AAB' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CASE STUDIES PREVIEW ──────────────────────────────── */}
      <section style={{ background: '#0D1520', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              Reports in the Wild
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Real scans. Real findings. Real fixes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {[
              {
                name: "Pilchers Barbershop",
                context: "Retail · Pensacola, FL",
                findings: 5,
                critical: 2,
                summary: "Dense ISP-congested 2.4 GHz environment. CoxWiFi co-channel interference degrading POS throughput.",
                slug: "pilchers-barbershop",
              },
              {
                name: "Olive Baptist Church",
                context: "Large Venue · Pensacola, FL",
                findings: 5,
                critical: 3,
                summary: "Guest Wi-Fi active for congregation, Channel 6 congestion detected, staff and guest traffic sharing the same network segment.",
                slug: "olive-baptist-church",
              },
            ].map(({ name, context, findings, critical, summary }) => (
              <div
                key={name}
                className="rounded-2xl p-6"
                style={{
                  background: '#1A2332',
                  borderTop: '3px solid #22D6DC',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#888' }}>{context}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span
                      className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                    >
                      {critical} critical
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#7A9AAB' }}>{summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#888' }}>{findings} findings total</span>
                  <Link
                    href="/case-studies"
                    className="text-sm font-semibold"
                    style={{ color: '#22D6DC', textDecoration: 'none' }}
                  >
                    View Full Report &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
              style={{ border: '1px solid rgba(34,214,220,0.4)', color: '#22D6DC', textDecoration: 'none' }}
            >
              View All Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA ──────────────────────────────────────────── */}
      <section
        style={{ background: '#111928', padding: '96px 0' }}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(34,214,220,0.07), transparent)',
          }}
        />
        <div className="ocws-container relative text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
          >
            Crow&rsquo;s Eye &middot; Available Now on Android
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Stop Guessing.<br />Start Knowing.
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#8AAABB' }}>
            Download Crow&rsquo;s Eye and get your WiFi Health Report from Corvus.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PlayStoreBadge href={PLAY_STORE_URL} size="lg" />
          </div>

          <p className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Already have an account?{' '}
            <Link href="/dashboard" style={{ color: 'rgba(34,214,220,0.5)' }}>
              Access your dashboard
            </Link>
          </p>
        </div>
      </section>

    </main>
  )
}
