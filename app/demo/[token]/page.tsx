'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

type DemoSession = {
  token: string
  accessLevel: string
  expiresAt: number
  allowPDF: boolean
  allowReckoning: boolean
  usesRemaining: number | 'unlimited'
  clientName?: string
}

const ACCESS_LABELS: Record<string, string> = {
  fledgling: '🐣 Fledgling Preview',
  nest: '🪺 Nest Access',
  flock: '🐦‍⬛ Flock Access',
  full: '💀 Full Platform Access',
}

const ACCESS_DESCRIPTIONS: Record<string, string> = {
  fledgling: "You'll see exactly what's wrong with your wireless — and how serious it is. Fix details unlock with a full Verdict.",
  nest: 'Full single-location Verdict. Corvus finds every problem and tells you exactly how to fix it.',
  flock: 'Full Verdict plus Full Reckoning for multi-location properties. PDF report included.',
  full: 'Complete platform access. Everything Corvus can do is yours.',
}

export default function DemoLandingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired'>('loading')
  const [session, setSession] = useState<DemoSession | null>(null)
  const [reason, setReason] = useState('')
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => { if (token) validateToken() }, [token])

  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => {
      const diff = session.expiresAt - Date.now()
      if (diff <= 0) { setStatus('expired'); clearInterval(interval); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(h > 0 ? `${h}h ${m}m remaining` : m > 0 ? `${m}m ${s}s remaining` : `${s}s remaining`)
    }, 1000)
    return () => clearInterval(interval)
  }, [session])

  async function validateToken() {
    try {
      const res = await fetch('/api/demo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.valid) {
        setSession(data.session)
        setStatus('valid')
        sessionStorage.setItem('corvus_demo_session', JSON.stringify(data.session))
      } else {
        setReason(data.reason || 'Invalid token')
        setStatus(data.reason?.includes('expired') ? 'expired' : 'invalid')
      }
    } catch {
      setReason('Unable to validate token. Check your connection.')
      setStatus('invalid')
    }
  }

  if (status === 'loading') return (
    <div style={s.page}><div style={s.card}>
      <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={80} height={80} />
      <p style={s.subtitle}>Validating your demo access...</p>
    </div></div>
  )

  if (status === 'invalid' || status === 'expired') return (
    <div style={s.page}><div style={s.card}>
      <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={80} height={80} />
      <h2 style={{ ...s.title, color: '#e05555' }}>{status === 'expired' ? 'Demo Expired' : 'Invalid Token'}</h2>
      <p style={s.subtitle}>{reason}</p>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>Need access? Visit <a href="https://oldcrowswireless.com" style={{ color: '#00C2C7' }}>oldcrowswireless.com</a></p>
    </div></div>
  )

  return (
    <div style={s.page}><div style={s.card}>
      <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={90} height={90} />
      <div style={s.badge}>{ACCESS_LABELS[session!.accessLevel]}</div>
      <h1 style={s.title}>
        {session!.clientName
          ? `You've been given access to Crow's Eye, ${session!.clientName}.`
          : "You've been given access to Crow's Eye."}
      </h1>
      <p style={s.description}>{ACCESS_DESCRIPTIONS[session!.accessLevel]}</p>
      <div style={s.meta}>
        <span style={s.timer}>⏱ {timeLeft}</span>
        {session!.usesRemaining !== 'unlimited' && (
          <span style={s.uses}>{session!.usesRemaining} use{session!.usesRemaining !== 1 ? 's' : ''} remaining</span>
        )}
      </div>
      <button style={s.launchBtn} onClick={() => router.push('/crows-eye?demo=true')}>
        Launch Crow's Eye →
      </button>
      <p style={s.footer}>
        Powered by <span style={{ color: '#00C2C7' }}>Old Crows Wireless Solutions</span><br />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>oldcrowswireless.com</span>
      </p>
    </div></div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0D1520', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '440px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  badge: { background: 'rgba(0,194,199,0.12)', border: '1px solid rgba(0,194,199,0.3)', color: '#00C2C7', borderRadius: '20px', padding: '4px 16px', fontSize: '0.85rem', fontFamily: 'Share Tech Mono, monospace' },
  title: { color: '#F4F6F8', fontSize: '1.3rem', fontWeight: 700, margin: 0, lineHeight: 1.3 },
  description: { color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 },
  meta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' },
  timer: { color: '#B8922A', fontSize: '0.85rem', fontFamily: 'Share Tech Mono, monospace' },
  uses: { color: '#888', fontSize: '0.85rem', fontFamily: 'Share Tech Mono, monospace' },
  launchBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 32px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' },
  footer: { color: '#666', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 },
  subtitle: { color: '#888', fontSize: '0.9rem' },
}
