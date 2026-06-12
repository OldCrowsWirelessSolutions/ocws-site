import type { Metadata } from 'next'
import Link from 'next/link'
import EventCodeRedemption from '@/app/components/EventCodeRedemption'

export const metadata: Metadata = {
  title: 'Hack the Coast 2026 — Free Corvus Access',
  description:
    'Enter your Hack the Coast event code to get a free WiFi Health Report and 24 hours of Talk to Corvus access.',
}

export default function HackTheCoastPage() {
  return (
    <main style={{ background: '#0D1520', minHeight: '100vh' }}>

      {/* Hero */}
      <section
        className="py-16"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="ocws-container text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#22D6DC', letterSpacing: '0.18em', fontFamily: "'Share Tech Mono', monospace" }}
          >
            Hack the Coast 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Your event code unlocks<br />a real WiFi Health Report.
          </h1>
          <p className="text-base max-w-xl mx-auto mb-4" style={{ color: '#8AAABB' }}>
            Download Crow&rsquo;s Eye and let Corvus scan your network. He reads your WiFi data and
            tells you exactly what&rsquo;s wrong — and how to fix it — in plain English.
          </p>
          <p className="text-sm" style={{ color: '#555' }}>
            Code valid through May 10, 2026.
          </p>
        </div>
      </section>

      {/* What you get + form */}
      <section className="py-16">
        <div className="ocws-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">

            {/* What you get */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-6"
                style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace" }}
              >
                What&rsquo;s included
              </p>
              <ul className="space-y-5">
                {[
                  {
                    title: '1 WiFi Health Report',
                    body: 'Download Crow\'s Eye on Android, tap Scan, and Corvus automatically reads your WiFi environment and delivers a signed PDF report.',
                  },
                  {
                    title: '24 Hours of Talk to Corvus',
                    body: 'Ask follow-up questions, get clarification on your results, or run a second opinion on any wireless problem — all through Corvus chat.',
                  },
                  {
                    title: 'Plain English. No jargon.',
                    body: 'No IT degree required. Corvus explains what\'s wrong, why it matters, and exactly what to do about it.',
                  },
                ].map(({ title, body }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 mt-0.5 text-xs font-bold"
                      style={{ color: '#22D6DC', marginTop: 3 }}
                    >
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">{title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#7A9AAB' }}>{body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div
                className="mt-8 rounded-xl px-5 py-4 text-sm"
                style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.06)', color: '#7A9AAB', lineHeight: 1.7 }}
              >
                Corvus is built by{' '}
                <Link href="/about" style={{ color: '#22D6DC' }}>Old Crows Wireless Solutions</Link>
                {' '}— a wireless consultancy. This isn&rsquo;t a toy.
                It&rsquo;s the same diagnostic engine we use in professional site surveys.
              </div>
            </div>

            {/* Redemption form */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-6"
                style={{ color: '#22D6DC', fontFamily: "'Share Tech Mono', monospace" }}
              >
                Redeem your code
              </p>
              <EventCodeRedemption defaultCode="HACKTHECOAST2026" />
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-16"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="ocws-container max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-8">Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How does Corvus scan my network?',
                a: 'Download the Crow\'s Eye app on Android, open it, and tap Scan. Corvus handles the WiFi scanning automatically — no screenshots or third-party apps needed.',
              },
              {
                q: 'Does this require account creation?',
                a: 'No. Enter your name, email, and event code. Corvus accesses your granted credits by email when you run a WiFi Health Report.',
              },
              {
                q: 'Can I use my WiFi Health Report after the event?',
                a: 'WiFi Health Report credits and chat access expire May 10, 2026. Use them before then.',
              },
              {
                q: 'What if I want more after my free WiFi Health Report?',
                a: 'WiFi Health Reports are $50 each, or subscribe starting at $20/month for a bundle. See pricing.',
              },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem' }}>
                <p className="font-semibold text-white mb-2 text-sm">{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#7A9AAB' }}>{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="text-sm"
              style={{ color: '#22D6DC' }}
            >
              View full pricing →
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
