import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HeroAnimation from './components/HeroAnimation'
import { PlayStoreBadge, IOSBadge } from './components/PlayStoreBadge'

// TODO: Update to your actual Play Store listing URL once published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.oldcrowswireless.corvus'

export const metadata: Metadata = {
  title: 'Crow\'s Eye by OCWS — AI Wireless Diagnostics',
  description:
    'AI-powered wireless diagnostics built on 17 years of U.S. Navy Electronic Warfare experience. Download Crow\'s Eye and let Corvus render your Verdict.',
}


// ── Circuit trace background SVG ──────────────────────────────────────────

const circuitBg: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(0,194,199,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,194,199,0.03) 1px, transparent 1px)
  `,
  backgroundSize: '48px 48px',
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main style={{ background: '#0D1520' }}>

      {/* ── SECTION 1: HERO ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ ...circuitBg, background: '#0D1520', paddingTop: '80px', paddingBottom: '96px' }}
      >
        {/* Radial glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,194,199,0.08), transparent)',
          }}
        />

        <div className="ocws-container relative text-center">
          <HeroAnimation />

          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
          >
            Crow&rsquo;s Eye &middot; Powered by Corvus AI
          </p>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-3">
            Your Wireless Network<br />Has Problems.
          </h1>
          <p className="text-3xl md:text-5xl font-bold mb-7" style={{ color: '#00C2C7' }}>
            Corvus Already Found Them.
          </p>

          <p className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#8AAABB' }}>
            AI-powered wireless diagnostics built on 17 years of U.S. Navy Electronic Warfare
            experience. Download the app and get your first Verdict in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <PlayStoreBadge href={PLAY_STORE_URL} size="lg" />
            <IOSBadge size="lg" />
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Or{' '}
            <Link href="/dashboard" style={{ color: 'rgba(0,194,199,0.6)' }}>
              access your account at oldcrowswireless.com/dashboard
            </Link>
          </p>
        </div>
      </section>

      {/* ── SECTION 2: SOCIAL PROOF BAR ────────────────────────────────────── */}
      <section
        style={{
          background: '#0A111C',
          borderTop: '1px solid #B8922A',
          borderBottom: '1px solid #B8922A',
          padding: '28px 0',
        }}
      >
        <div className="ocws-container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 text-center">
            {[
              { stat: '17 Years', label: 'Navy EW Expertise' },
              { stat: 'Minutes', label: 'Not Weeks' },
              { stat: 'Enterprise', label: 'Ready' },
            ].map(({ stat, label }, i) => (
              <div
                key={stat}
                className="flex-1"
                style={{
                  borderLeft: i > 0 ? '1px solid rgba(184,146,42,0.25)' : 'none',
                  paddingLeft: i > 0 ? '0' : '0',
                }}
              >
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: '#F4F6F8', fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {stat}
                </div>
                <div className="text-sm" style={{ color: '#888' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ────────────────────────────────────────── */}
      <section style={{ background: '#0D1520', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Three steps to your Verdict.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Scan',
                body: 'Open the app. Corvus detects your network and scans the RF environment automatically.',
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
                title: 'Verdict',
                body: 'Receive a branded PDF report with prioritized findings and step-by-step fix instructions.',
                icon: '📋',
              },
            ].map(({ n, title, body, icon }) => (
              <div
                key={n}
                className="rounded-2xl p-8"
                style={{
                  background: '#1A2332',
                  borderTop: '3px solid #00C2C7',
                }}
              >
                <div
                  className="text-5xl font-bold mb-4"
                  style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", opacity: 0.4 }}
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

      {/* ── SECTION 4: CORVUS INTRODUCTION ────────────────────────────────── */}
      <section style={{ background: '#0A111C', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">

            {/* Text */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
              >
                Meet the Engine
              </p>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Meet Corvus.
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#8AAABB' }}>
                RF intelligence engine. Wireless diagnostician. The only AI built on 17 years
                of U.S. Navy Electronic Warfare experience. He doesn&rsquo;t generate reports.
                He renders Verdicts.
              </p>

              {/* Gold quote card */}
              <div
                className="rounded-xl px-6 py-5 mb-8"
                style={{ border: '1px solid #B8922A', background: 'rgba(184,146,42,0.06)' }}
              >
                <p className="text-sm italic leading-relaxed" style={{ color: '#B8922A' }}>
                  &ldquo;I found 4 problems. Three of them are embarrassing.&rdquo;
                </p>
                <p className="mt-2 text-xs" style={{ color: 'rgba(184,146,42,0.5)' }}>— Corvus</p>
              </div>

              <PlayStoreBadge href={PLAY_STORE_URL} size="sm" />
            </div>

            {/* Corvus visual */}
            <div className="flex items-center justify-center">
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: '#0D1520',
                  border: '1px solid rgba(0,194,199,0.2)',
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(0,194,199,0.06), transparent 70%)',
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

      {/* ── SECTION 5: PRICING TIERS ────────────────────────────────────────── */}
      <section style={{ background: '#0D1520', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
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
                border: 'rgba(0,194,199,0.35)',
                features: ['3 Verdicts / month', '1 Small Reckoning', 'Corvus chat access'],
              },
              {
                emoji: '🪺',
                name: 'Nest',
                price: '$20',
                period: '/mo',
                border: '#00C2C7',
                features: ['5 Verdicts / month', '1 Small Reckoning', '2 device seats'],
                highlight: true,
              },
              {
                emoji: '🐦',
                name: 'Flock',
                price: '$100',
                period: '/mo',
                border: 'rgba(0,194,199,0.35)',
                features: ['15 Verdicts / month', '3 Small + 1 Standard Reckoning', '5 device seats'],
              },
              {
                emoji: '🪽',
                name: 'Murder',
                price: '$950',
                period: '/mo',
                border: '#B8922A',
                features: ['Unlimited Verdicts', 'Unlimited Small + 10 Standard', '20 device seats'],
                gold: true,
              },
            ].map(({ emoji, name, price, period, border, features, highlight, gold }) => (
              <div
                key={name}
                className="rounded-2xl p-6 flex flex-col"
                style={{
                  background: highlight ? 'rgba(0,194,199,0.05)' : '#1A2332',
                  border: `1px solid ${border}`,
                  boxShadow: highlight ? `0 0 24px rgba(0,194,199,0.12)` : 'none',
                }}
              >
                <div className="text-2xl mb-2">{emoji}</div>
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: gold ? '#B8922A' : '#00C2C7', fontFamily: "'Share Tech Mono', monospace" }}
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
                      <span style={{ color: gold ? '#B8922A' : '#00C2C7', flexShrink: 0 }}>✓</span>
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
                    border: `1px solid ${gold ? '#B8922A' : 'rgba(0,194,199,0.4)'}`,
                    color: gold ? '#B8922A' : '#00C2C7',
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
              style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid #00C2C7' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace" }}
                  >
                    Single Verdict
                  </p>
                  <p className="text-2xl font-bold text-white">$50</p>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ border: '1px solid rgba(0,194,199,0.3)', color: '#00C2C7' }}
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
                  background: '#00C2C7',
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
              style={{ background: '#1A2332', border: '1px solid rgba(184,146,42,0.3)', borderLeft: '3px solid #B8922A' }}
            >
              <div className="mb-3">
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: '#B8922A', fontFamily: "'Share Tech Mono', monospace" }}
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
                  border: '1px solid #B8922A',
                  color: '#B8922A',
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

      {/* ── SECTION 6: USE CASES ──────────────────────────────────────────── */}
      <section style={{ background: '#0A111C', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              Who Uses Corvus
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Every environment. One Verdict.
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
                  borderLeft: '3px solid #00C2C7',
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

      {/* ── SECTION 7: ERIC MIMS TESTIMONIAL ─────────────────────────────── */}
      <section
        style={{
          background: '#0D1520',
          padding: '80px 0',
          borderTop: '1px solid rgba(184,146,42,0.3)',
          borderBottom: '1px solid rgba(184,146,42,0.3)',
        }}
      >
        <div className="ocws-container max-w-3xl mx-auto text-center">
          <div className="text-3xl mb-6" style={{ color: '#B8922A', fontFamily: 'Georgia, serif' }}>
            &ldquo;
          </div>
          <p className="text-lg md:text-xl leading-relaxed text-white mb-8 italic">
            As an IT leader with over 30 years of experience in enterprise networking, I&rsquo;ve
            found that Crow&rsquo;s Eye by Corvus effectively condenses a week&rsquo;s worth of manual
            engineering into a single afternoon. It provides the granular visibility necessary to
            eliminate channel overlap and optimize signal strength across complex, multi-story
            environments.
          </p>
          <div className="flex flex-col items-center gap-1">
            <p className="font-bold text-white">Eric Mims</p>
            <p className="text-sm" style={{ color: '#00C2C7' }}>
              30-Year IT Network Architect &amp; Cyber Veteran
            </p>
            <p className="text-sm" style={{ color: '#888' }}>
              Senior IT Infrastructure and Security Professional &middot; Houston, TX
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: CASE STUDIES PREVIEW ──────────────────────────────── */}
      <section style={{ background: '#0A111C', padding: '96px 0' }}>
        <div className="ocws-container">
          <div className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
            >
              Verdicts in the Wild
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
                summary: "Completely open network, severe Channel 6 congestion, zero network segmentation between staff and guests.",
                slug: "olive-baptist-church",
              },
            ].map(({ name, context, findings, critical, summary, slug }) => (
              <div
                key={name}
                className="rounded-2xl p-6"
                style={{
                  background: '#1A2332',
                  borderTop: '3px solid #00C2C7',
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
                    href={`/case-studies`}
                    className="text-sm font-semibold"
                    style={{ color: '#00C2C7', textDecoration: 'none' }}
                  >
                    View Full Verdict →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold"
              style={{ border: '1px solid rgba(0,194,199,0.4)', color: '#00C2C7', textDecoration: 'none' }}
            >
              View All Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA ──────────────────────────────────────────── */}
      <section
        style={{ ...circuitBg, background: '#111928', padding: '96px 0' }}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,194,199,0.07), transparent)',
          }}
        />
        <div className="ocws-container relative text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.2em' }}
          >
            Crow&rsquo;s Eye &middot; Available Now on Android
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Stop Guessing.<br />Start Knowing.
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#8AAABB' }}>
            Download Crow&rsquo;s Eye and let Corvus render your Verdict.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PlayStoreBadge href={PLAY_STORE_URL} size="lg" />
            <IOSBadge size="lg" />
          </div>

          <p className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Already have an account?{' '}
            <Link href="/dashboard" style={{ color: 'rgba(0,194,199,0.5)' }}>
              Access your dashboard
            </Link>
          </p>
        </div>
      </section>

    </main>
  )
}
