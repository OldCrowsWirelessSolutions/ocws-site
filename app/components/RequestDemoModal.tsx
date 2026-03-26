'use client'
import { useState } from 'react'

type Props = {
  onClose: () => void
}

export default function RequestDemoModal({ onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [problem, setProblem] = useState('')
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'either'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/demo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, phone, problem, contactMethod, _hp: '' }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Failed to submit. Try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>

        {submitted ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>✓</div>
            <h3 style={s.successTitle}>Request Received</h3>
            <p style={s.successText}>We'll be in touch with you{name ? `, ${name.split(' ')[0]}` : ''}, at <strong>{email}</strong>.</p>
            <p style={s.successSub}>Typically within one business day.</p>
            <button style={s.closeBtn2} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={s.corvusIcon}>📡</div>
            <h2 style={s.title}>Request a Demo</h2>
            <p style={s.subtitle}>Tell us a little about your situation. We'll send you a personalized demo link and walk you through what Corvus found.</p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Your Name *</label>
                  <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First Last" required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email *</label>
                  <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
              </div>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Company / Property (optional)</label>
                  <input style={s.input} type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Building or business name" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone (optional)</label>
                  <input style={s.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(850) 555-0000" />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>What are you trying to solve?</label>
                <textarea
                  style={s.textarea}
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="Slow WiFi, POS disconnections, guest network issues, multi-site visibility..."
                  rows={3}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Preferred Contact Method</label>
                <div style={s.contactRow}>
                  {(['email', 'phone', 'either'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      style={{ ...s.contactBtn, ...(contactMethod === m ? s.contactBtnActive : {}) }}
                      onClick={() => setContactMethod(m)}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Honeypot */}
              <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
              {error && <p style={s.error}>{error}</p>}
              <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
                {loading ? 'Sending...' : 'Request Demo →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modal: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '16px', padding: '2rem', maxWidth: '540px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#555', fontSize: '1rem', cursor: 'pointer' },
  corvusIcon: { fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' },
  title: { color: '#F4F6F8', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', margin: '0 0 0.5rem' },
  subtitle: { color: '#888', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6, margin: '0 0 1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: { display: 'flex', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 },
  label: { color: '#888', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '9px 12px', color: '#F4F6F8', fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '9px 12px', color: '#F4F6F8', fontSize: '0.88rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  contactRow: { display: 'flex', gap: '0.5rem' },
  contactBtn: { flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '6px', padding: '8px', fontSize: '0.82rem', cursor: 'pointer' },
  contactBtnActive: { background: 'rgba(0,194,199,0.1)', color: '#00C2C7', borderColor: '#00C2C7' },
  error: { color: '#e05555', fontSize: '0.82rem', margin: 0 },
  submitBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' },
  successIcon: { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,194,199,0.12)', border: '2px solid #00C2C7', color: '#00C2C7', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#F4F6F8', fontSize: '1.2rem', fontWeight: 700, margin: 0 },
  successText: { color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 },
  successSub: { color: '#666', fontSize: '0.82rem', margin: 0 },
  closeBtn2: { background: 'rgba(0,194,199,0.1)', border: '1px solid rgba(0,194,199,0.2)', color: '#00C2C7', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' },
}
