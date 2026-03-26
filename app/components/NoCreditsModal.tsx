'use client'
import { useState } from 'react'

type Props = {
  onClose: () => void
  authKey?: string
  tier?: string
}

const CREDIT_OPTIONS = [
  {
    id: 'single',
    label: '1 Credit',
    price: '$50',
    desc: 'One Corvus Verdict or Full Reckoning run.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDIT_1_PRICE_ID,
  },
  {
    id: 'three',
    label: '3 Credits',
    price: '$135',
    desc: 'Three runs. Best for ongoing monitoring.',
    badge: 'SAVE $15',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDIT_3_PRICE_ID,
  },
  {
    id: 'five',
    label: '5 Credits',
    price: '$200',
    desc: 'Five runs. Best value for multi-site operators.',
    badge: 'SAVE $50',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDIT_5_PRICE_ID,
  },
]

export default function NoCreditsModal({ onClose, authKey, tier }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handlePurchase(option: typeof CREDIT_OPTIONS[0]) {
    if (!option.priceId) { setError('Price not configured. Contact support.'); return }
    setLoading(option.id)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: option.priceId,
          authKey,
          mode: 'payment',
          successUrl: `${window.location.origin}/api/stripe/credit-success?resume=true`,
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to start checkout.')
        setLoading(null)
      }
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(null)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        <div style={s.corvusIcon}>💀</div>
        <h2 style={s.title}>You're out of credits.</h2>
        <p style={s.subtitle}>
          {tier === 'flock' || tier === 'murder'
            ? "You've used all your monthly credits. Purchase additional runs or wait for your next reset."
            : "Purchase credits to run Corvus on your network."}
        </p>
        <div style={s.optionsList}>
          {CREDIT_OPTIONS.map(opt => (
            <div key={opt.id} style={s.option}>
              <div style={s.optionLeft}>
                <div style={s.optionLabel}>{opt.label}</div>
                <div style={s.optionDesc}>{opt.desc}</div>
              </div>
              <div style={s.optionRight}>
                {opt.badge && <div style={s.badge}>{opt.badge}</div>}
                <div style={s.optionPrice}>{opt.price}</div>
                <button
                  style={{ ...s.buyBtn, opacity: loading === opt.id ? 0.6 : 1 }}
                  onClick={() => handlePurchase(opt)}
                  disabled={!!loading}
                >
                  {loading === opt.id ? '...' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {error && <p style={s.error}>{error}</p>}
        <div style={s.footer}>
          <a href="/pricing" style={s.footerLink}>View subscription plans →</a>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modal: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '16px', padding: '2rem', maxWidth: '460px', width: '100%', position: 'relative' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#555', fontSize: '1rem', cursor: 'pointer' },
  corvusIcon: { fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' },
  title: { color: '#F4F6F8', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', margin: '0 0 0.5rem' },
  subtitle: { color: '#888', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.6, margin: '0 0 1.5rem' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' },
  option: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D1520', borderRadius: '10px', padding: '1rem', gap: '1rem' },
  optionLeft: { flex: 1 },
  optionLabel: { color: '#F4F6F8', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' },
  optionDesc: { color: '#666', fontSize: '0.78rem', lineHeight: 1.4 },
  optionRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' },
  badge: { background: 'rgba(184,146,42,0.15)', color: '#B8922A', border: '1px solid rgba(184,146,42,0.3)', borderRadius: '10px', padding: '1px 8px', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace' },
  optionPrice: { color: '#00C2C7', fontWeight: 700, fontSize: '1rem', fontFamily: 'Share Tech Mono, monospace' },
  buyBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' },
  error: { color: '#e05555', fontSize: '0.82rem', textAlign: 'center', marginBottom: '0.75rem' },
  footer: { textAlign: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' },
  footerLink: { color: '#00C2C7', fontSize: '0.82rem', textDecoration: 'none' },
}
