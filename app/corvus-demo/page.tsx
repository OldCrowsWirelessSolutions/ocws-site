'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const DEMO_LINES = [
  "I've already rendered my Verdict. You're just here for the sentencing.",
  "Full signal. Half the speed. I've seen this before — and I'm already annoyed on your behalf.",
  "I found 4 problems. Three of them are embarrassing.",
  "I've seen worse. Not much worse.",
  "Your router is doing its best. Its best is not good enough.",
  "Co-channel interference. Channel 6 has three networks on it. This is why we can't have nice things.",
  "Weak signal in the corner? That's not a mystery. That's physics. Let me explain.",
  "Open network. No password. Corvus is judging everyone who set this up.",
  "Two SSIDs fighting over the same channel. Only one of them is yours.",
  "I don't render reports. I render Verdicts. There's a difference. You'll understand shortly.",
]

const FEATURES = [
  { icon: '📡', title: 'Passive Scan Analysis', desc: "Upload your WiFi scan. Corvus reads every signal in the environment." },
  { icon: '🎯', title: 'Adaptive Intelligence', desc: 'Set your comfort level 1–5. Corvus speaks your language, not IT jargon.' },
  { icon: '⚡', title: 'Verdict in Under 5 Min', desc: 'No technician. No appointment. No $75 visit fee. Just answers.' },
  { icon: '🔧', title: 'Router-Specific Fixes', desc: 'Step-by-step instructions for your exact hardware. Not generic advice.' },
  { icon: '📄', title: 'PDF Verdict Report', desc: 'Branded, professional, shareable. Suitable for landlords and vendors.' },
  { icon: '🏢', title: 'Multi-Location Reckoning', desc: 'Up to 15 locations synthesized into one comprehensive analysis.' },
]

export default function CorvusDemoPage() {
  const [currentLine, setCurrentLine] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [showVerdict, setShowVerdict] = useState(false)
  const [lineVisible, setLineVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setLineVisible(false)
      setTimeout(() => { setCurrentLine(prev => (prev + 1) % DEMO_LINES.length); setLineVisible(true) }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function runDemoScan() {
    setScanning(true); setScanProgress(0); setShowVerdict(false)
    const steps = [
      { progress: 20 }, { progress: 40 }, { progress: 60 }, { progress: 80 }, { progress: 100 },
    ]
    steps.forEach((step, i) => {
      setTimeout(() => {
        setScanProgress(step.progress)
        if (i === steps.length - 1) setTimeout(() => { setScanning(false); setShowVerdict(true) }, 600)
      }, i * 900)
    })
  }

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={80} height={80} style={{ marginBottom: '1rem' }} />
        <h1 style={s.heroTitle}>Meet Corvus.</h1>
        <h2 style={s.heroSub}>The only AI that renders Verdicts on your wireless network.</h2>
        <div style={s.quoteBox}>
          <div style={s.quoteMark}>"</div>
          <p style={{ ...s.quoteLine, opacity: lineVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>{DEMO_LINES[currentLine]}</p>
          <div style={s.quoteAttrib}>— CORVUS · OLD CROWS WIRELESS SOLUTIONS</div>
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.sectionTitle}>What Corvus Does</h3>
        <div style={s.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.sectionTitle}>Watch Corvus Work</h3>
        <div style={s.scanCard}>
          {!scanning && !showVerdict && (
            <>
              <p style={s.scanDesc}>This is a demonstration with sample data from a real retail location. Hit the button and watch Corvus render a Verdict in real time.</p>
              <button style={s.scanBtn} onClick={runDemoScan}>Run Demo Scan →</button>
            </>
          )}
          {scanning && (
            <div style={s.scanProgress}>
              <div style={s.scanLabel}>CORVUS IS WORKING</div>
              <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${scanProgress}%` }} /></div>
              <div style={s.scanPct}>{scanProgress}%</div>
              <p style={s.scanProcessing}>
                {scanProgress < 40 ? 'Parsing signal environment...' : scanProgress < 60 ? 'Identifying channel conflicts...' : scanProgress < 80 ? 'Cross-referencing vendor signatures...' : 'Rendering Verdict...'}
              </p>
            </div>
          )}
          {showVerdict && (
            <div>
              <div style={s.verdictHeader}>
                <div style={s.verdictBadge}>⚠ IMMEDIATE ACTION REQUIRED</div>
                <div style={s.verdictTitle}>CORVUS' VERDICT</div>
                <div style={s.verdictClient}>Demo Retail Location · Pensacola FL</div>
              </div>
              <div style={s.verdictSummary}>"I found 3 problems. Two of them are actively costing you money every business day. The third is embarrassing but fixable in about four minutes."</div>
              <div style={s.findingsList}>
                {[
                  { n: 1, title: 'CoxWiFi Co-Channel Interference on CH 11', sev: 'critical' },
                  { n: 2, title: 'Business SSID on 2.4 GHz Only — No 5 GHz Offload', sev: 'high' },
                  { n: 3, title: 'Guest Network Broadcasting Same SSID as Business', sev: 'high' },
                ].map(f => (
                  <div key={f.n} style={s.finding}>
                    <div style={{ ...s.findingSev, color: f.sev === 'critical' ? '#e05555' : '#B8922A' }}>{f.sev.toUpperCase()}</div>
                    <div style={s.findingTitle}>{f.n}. {f.title}</div>
                  </div>
                ))}
              </div>
              <div style={s.verdictGate}>
                <p style={s.gateText}>Full fix instructions, router-specific steps, and PDF report unlock with a Verdict.</p>
                <a href="/crows-eye" style={s.gateBtn}>Run Corvus on Your Network — $50 →</a>
                <a href="/pricing" style={s.gateLink}>Or see subscription plans</a>
              </div>
              <button style={s.resetBtn} onClick={() => { setShowVerdict(false); setScanProgress(0) }}>Run Again</button>
            </div>
          )}
        </div>
      </div>

      <div style={s.cta}>
        <h3 style={s.ctaTitle}>Ready for your actual network?</h3>
        <p style={s.ctaSub}>Corvus doesn't do demos for fun. He does them so you'll understand what he finds in your building.</p>
        <a href="/crows-eye" style={s.ctaBtn}>Start Your Verdict — $50</a>
        <a href="/pricing" style={s.ctaLink}>See all plans</a>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#0D1520', color: '#F4F6F8', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  hero: { textAlign: 'center', padding: '4rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#F4F6F8', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  heroSub: { fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: '#888', margin: '0 0 2rem', fontWeight: 400, maxWidth: '600px' },
  quoteBox: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.25)', borderRadius: '12px', padding: '1.5rem 2rem', maxWidth: '600px', width: '100%' },
  quoteMark: { color: '#00C2C7', fontSize: '3rem', lineHeight: 1, fontFamily: 'Georgia, serif', marginBottom: '-0.5rem', opacity: 0.4 },
  quoteLine: { color: '#ccc', fontSize: '1rem', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 0.75rem' },
  quoteAttrib: { color: '#555', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em' },
  section: { padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  sectionTitle: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  featureCard: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.1)', borderRadius: '10px', padding: '1.25rem' },
  featureIcon: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  featureTitle: { color: '#F4F6F8', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' },
  featureDesc: { color: '#888', fontSize: '0.85rem', lineHeight: 1.5 },
  scanCard: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '12px', padding: '2rem', maxWidth: '580px' },
  scanDesc: { color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' },
  scanBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px 28px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  scanProgress: { textAlign: 'center' },
  scanLabel: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', letterSpacing: '0.15em', marginBottom: '1rem' },
  progressBar: { background: '#0D1520', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '0.5rem' },
  progressFill: { background: 'linear-gradient(90deg, #0D6E7A, #00C2C7)', height: '100%', transition: 'width 0.8s ease' },
  scanPct: { color: '#B8922A', fontFamily: 'Share Tech Mono, monospace', fontSize: '1.2rem', fontWeight: 700 },
  scanProcessing: { color: '#666', fontSize: '0.82rem', marginTop: '0.5rem', fontFamily: 'Share Tech Mono, monospace' },
  verdictHeader: { marginBottom: '1rem' },
  verdictBadge: { background: 'rgba(224,85,85,0.12)', color: '#e05555', border: '1px solid rgba(224,85,85,0.3)', borderRadius: '20px', display: 'inline-block', padding: '3px 12px', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', marginBottom: '0.5rem' },
  verdictTitle: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', letterSpacing: '0.15em' },
  verdictClient: { color: '#888', fontSize: '0.82rem', marginTop: '0.25rem' },
  verdictSummary: { background: '#0D1520', borderLeft: '3px solid #00C2C7', padding: '0.75rem 1rem', color: '#aaa', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem', borderRadius: '0 6px 6px 0' },
  findingsList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' },
  finding: { background: '#0D1520', borderRadius: '8px', padding: '10px 12px' },
  findingSev: { fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', marginBottom: '3px' },
  findingTitle: { color: '#F4F6F8', fontSize: '0.88rem' },
  verdictGate: { background: 'rgba(0,194,199,0.06)', border: '1px dashed rgba(0,194,199,0.2)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', marginBottom: '1rem' },
  gateText: { color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem' },
  gateBtn: { display: 'block', background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', borderRadius: '8px', padding: '12px', textDecoration: 'none', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' },
  gateLink: { color: '#00C2C7', fontSize: '0.82rem', textDecoration: 'none' },
  resetBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.82rem', cursor: 'pointer', padding: '4px' },
  cta: { textAlign: 'center', padding: '3rem 2rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' },
  ctaTitle: { color: '#F4F6F8', fontSize: '1.5rem', fontWeight: 700, margin: 0 },
  ctaSub: { color: '#888', fontSize: '0.9rem', maxWidth: '480px', lineHeight: 1.6 },
  ctaBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', borderRadius: '8px', padding: '14px 32px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' },
  ctaLink: { color: '#00C2C7', fontSize: '0.85rem', textDecoration: 'none' },
}
