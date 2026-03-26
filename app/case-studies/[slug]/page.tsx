'use client'
import { useParams } from 'next/navigation'
import { getCaseStudyBySlug } from '@/lib/caseStudies'
import Link from 'next/link'
import { useState } from 'react'

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#e05555', high: '#B8922A', moderate: '#00C2C7', info: '#888',
}
const SEVERITY_BG: Record<string, string> = {
  critical: 'rgba(224,85,85,0.1)', high: 'rgba(184,146,42,0.1)', moderate: 'rgba(0,194,199,0.08)', info: 'rgba(136,136,136,0.08)',
}
const COMFORT_LABELS: Record<number, string> = {
  1: 'Complete Beginner', 2: 'Curious Non-Technical', 3: 'Comfortable with Tech', 4: 'IT Proficient', 5: 'Network Engineer',
}

export default function CaseStudyPage() {
  const params = useParams()
  const slug = params?.slug as string
  const cs = getCaseStudyBySlug(slug)
  const [activeLevel, setActiveLevel] = useState(1)

  if (!cs) return (
    <div style={s.page}><p style={{ color: '#888', textAlign: 'center', padding: '4rem' }}>Case study not found.</p></div>
  )

  const criticalCount = cs.findings.filter(f => f.severity === 'critical').length
  const highCount = cs.findings.filter(f => f.severity === 'high').length

  return (
    <div style={s.page}>
      <div style={s.breadcrumb}>
        <Link href="/case-studies" style={s.breadLink}>Case Studies</Link>
        <span style={s.breadSep}>/</span>
        <span style={s.breadCurrent}>{cs.client}</span>
      </div>

      <div style={s.header}>
        <div style={s.headerMeta}>
          <span style={s.metaTag}>{cs.type}</span>
          <span style={s.metaTag}>{cs.location}</span>
          <span style={s.metaTag}>{cs.product === 'reckoning' ? `Full Reckoning — ${cs.locations} Locations` : "Corvus' Verdict"}</span>
        </div>
        <h1 style={s.clientName}>{cs.client}</h1>
        <p style={s.date}>{cs.date}</p>
      </div>

      <div style={s.statsBar}>
        <div style={s.stat}><div style={s.statNum}>{cs.findings.length}</div><div style={s.statLabel}>Findings</div></div>
        {criticalCount > 0 && <div style={s.stat}><div style={{ ...s.statNum, color: '#e05555' }}>{criticalCount}</div><div style={s.statLabel}>Critical</div></div>}
        {highCount > 0 && <div style={s.stat}><div style={{ ...s.statNum, color: '#B8922A' }}>{highCount}</div><div style={s.statLabel}>High Priority</div></div>}
        <div style={s.stat}><div style={{ ...s.statNum, color: '#00C2C7' }}>{'< 5 min'}</div><div style={s.statLabel}>Time to Verdict</div></div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>EXECUTIVE SUMMARY</div>
        <div style={s.corvusBlock}>
          <div style={s.corvusBlockLabel}>CORVUS · CROW'S EYE</div>
          <p style={s.corvusText}>"{cs.executive}"</p>
        </div>
      </div>

      {cs.findings.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLabel}>FINDINGS</div>
          <div style={s.findingsList}>
            {cs.findings.map(f => (
              <div key={f.number} style={{ ...s.findingCard, background: SEVERITY_BG[f.severity], borderColor: SEVERITY_COLORS[f.severity] + '40' }}>
                <div style={s.findingHeader}>
                  <span style={{ ...s.severityBadge, color: SEVERITY_COLORS[f.severity], borderColor: SEVERITY_COLORS[f.severity] + '40' }}>{f.severity.toUpperCase()}</span>
                  <span style={s.findingNum}>Finding {f.number}</span>
                </div>
                <h3 style={s.findingTitle}>{f.title}</h3>
                <p style={s.findingDesc}>{f.description}</p>
                {f.fix && (
                  <div style={s.fixBlock}>
                    <span style={s.fixLabel}>CORVUS RECOMMENDS: </span>
                    <span style={s.fixText}>{f.fix}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cs.comfortLevels && cs.comfortLevels.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLabel}>ONE BUILDING · FIVE PERSPECTIVES</div>
          <p style={s.comfortIntro}>This Full Reckoning was run five times — one at each comfort level. Same building. Same problems. Watch how Corvus adapts his voice.</p>
          <div style={s.levelTabs}>
            {cs.comfortLevels.map(cl => (
              <button key={cl.level} style={{ ...s.levelTab, ...(activeLevel === cl.level ? s.levelTabActive : {}) }} onClick={() => setActiveLevel(cl.level)}>Level {cl.level}</button>
            ))}
          </div>
          {cs.comfortLevels.filter(cl => cl.level === activeLevel).map(cl => (
            <div key={cl.level}>
              <div style={s.levelLabel}>{COMFORT_LABELS[cl.level]}</div>
              <div style={s.corvusBlock}>
                <div style={s.corvusBlockLabel}>CORVUS · COMFORT LEVEL {cl.level}</div>
                <p style={s.corvusText}>"{cl.excerpt}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.section}>
        <div style={s.sectionLabel}>OUTCOME</div>
        <p style={s.outcomeText}>{cs.outcome}</p>
      </div>

      {cs.testimonial && (
        <div style={s.section}>
          <div style={s.testimonialBlock}>
            <p style={s.testimonialText}>"{cs.testimonial}"</p>
            <div style={s.testimonialAuthor}>— {cs.testimonialAuthor}</div>
          </div>
        </div>
      )}

      {cs.pdfFile && (
        <div style={s.section}>
          <a href={`/${cs.pdfFile}`} target="_blank" rel="noopener noreferrer" style={s.pdfBtn}>📄 Download Full Verdict PDF</a>
        </div>
      )}

      <div style={s.cta}>
        <h3 style={s.ctaTitle}>Ready for your own Verdict?</h3>
        <p style={s.ctaSub}>Corvus finds what others miss. In under 5 minutes. For $50.</p>
        <a href="/crows-eye" style={s.ctaBtn}>Run Corvus on Your Network →</a>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#0D1520', color: '#F4F6F8', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingBottom: '4rem' },
  breadcrumb: { padding: '1.5rem 2rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' },
  breadLink: { color: '#00C2C7', fontSize: '0.82rem', textDecoration: 'none' },
  breadSep: { color: '#555', fontSize: '0.82rem' },
  breadCurrent: { color: '#888', fontSize: '0.82rem' },
  header: { padding: '2rem 2rem 1rem', maxWidth: '800px', margin: '0 auto' },
  headerMeta: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  metaTag: { background: 'rgba(0,194,199,0.08)', border: '1px solid rgba(0,194,199,0.2)', color: '#00C2C7', borderRadius: '12px', padding: '3px 10px', fontSize: '0.75rem', fontFamily: 'Share Tech Mono, monospace' },
  clientName: { fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: '#F4F6F8', margin: '0 0 0.25rem', letterSpacing: '-0.02em' },
  date: { color: '#555', fontSize: '0.85rem', margin: 0, fontFamily: 'Share Tech Mono, monospace' },
  statsBar: { display: 'flex', maxWidth: '800px', margin: '0 auto', padding: '0 2rem' },
  stat: { flex: 1, textAlign: 'center', padding: '1rem', background: '#1A2332', borderRight: '1px solid rgba(255,255,255,0.05)' },
  statNum: { fontSize: '1.5rem', fontWeight: 900, color: '#F4F6F8', fontFamily: 'Share Tech Mono, monospace' },
  statLabel: { color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' },
  section: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  sectionLabel: { color: '#555', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' },
  corvusBlock: { background: '#1A2332', borderLeft: '3px solid #00C2C7', padding: '1.25rem', borderRadius: '0 8px 8px 0' },
  corvusBlockLabel: { color: '#00C2C7', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.12em', marginBottom: '0.5rem' },
  corvusText: { color: '#ccc', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' },
  findingsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  findingCard: { borderRadius: '10px', padding: '1.25rem', border: '1px solid' },
  findingHeader: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' },
  severityBadge: { fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', border: '1px solid', borderRadius: '10px', padding: '2px 8px' },
  findingNum: { color: '#555', fontSize: '0.75rem', fontFamily: 'Share Tech Mono, monospace' },
  findingTitle: { color: '#F4F6F8', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem' },
  findingDesc: { color: '#aaa', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 },
  fixBlock: { marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' },
  fixLabel: { color: '#00C2C7', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.08em' },
  fixText: { color: '#ccc', fontSize: '0.85rem' },
  comfortIntro: { color: '#888', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' },
  levelTabs: { display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  levelTab: { background: 'transparent', border: '1px solid rgba(0,194,199,0.2)', color: '#888', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', cursor: 'pointer' },
  levelTabActive: { background: 'rgba(0,194,199,0.12)', color: '#00C2C7', borderColor: '#00C2C7' },
  levelLabel: { color: '#555', fontSize: '0.78rem', fontFamily: 'Share Tech Mono, monospace', marginBottom: '0.75rem' },
  outcomeText: { color: '#ccc', fontSize: '0.95rem', lineHeight: 1.7 },
  testimonialBlock: { background: '#1A2332', borderRadius: '10px', padding: '1.5rem', border: '1px solid rgba(184,146,42,0.2)' },
  testimonialText: { color: '#ccc', fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 0.75rem' },
  testimonialAuthor: { color: '#B8922A', fontSize: '0.82rem', fontFamily: 'Share Tech Mono, monospace' },
  pdfBtn: { display: 'inline-block', background: 'rgba(0,194,199,0.08)', border: '1px solid rgba(0,194,199,0.25)', color: '#00C2C7', borderRadius: '8px', padding: '12px 20px', textDecoration: 'none', fontSize: '0.9rem' },
  cta: { textAlign: 'center', padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' },
  ctaTitle: { color: '#F4F6F8', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' },
  ctaSub: { color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', borderRadius: '8px', padding: '13px 28px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' },
}
