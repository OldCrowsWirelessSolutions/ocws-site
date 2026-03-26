'use client'
import { useState } from 'react'

type Props = {
  authKey?: string
  tier?: string
  submitterEmail?: string
  submitterName?: string
  onSuccess?: (ticketId: string) => void
}

const PRODUCTS = [
  { value: 'corvus_verdict', label: "Corvus' Verdict" },
  { value: 'full_reckoning', label: 'Full Reckoning' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'subscription', label: 'Subscription / Billing' },
  { value: 'pdf', label: 'PDF Report' },
  { value: 'other', label: 'Other' },
]

export default function SupportForm({ authKey, tier, submitterEmail = '', submitterName = '', onSuccess }: Props) {
  const [product, setProduct] = useState('corvus_verdict')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState(submitterEmail)
  const [name, setName] = useState(submitterName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [priority, setPriority] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !email.trim()) { setError('Description and email are required.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, description, submitterEmail: email, submitterName: name, authKey, tier, _hp: '' }),
      })
      const data = await res.json()
      if (data.success) {
        setTicketId(data.ticketId)
        setPriority(data.priority)
        setSubmitted(true)
        onSuccess?.(data.ticketId)
      } else {
        setError(data.error || 'Failed to submit ticket.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div style={s.successBox}>
      <div style={s.successIcon}>✓</div>
      <h3 style={s.successTitle}>Ticket Submitted</h3>
      <p style={s.successId}>{ticketId}</p>
      <p style={s.successSub}>
        Priority: <span style={{ color: priority === 'critical' ? '#e05555' : priority === 'high' ? '#B8922A' : '#00C2C7' }}>{priority?.toUpperCase()}</span>
      </p>
      <p style={s.successNote}>You'll receive a response at <strong>{email}</strong>. Critical tickets are addressed within 4 hours.</p>
      <button style={s.resetBtn} onClick={() => { setSubmitted(false); setDescription(''); setPriority('') }}>Submit Another</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <div style={s.field}>
        <label style={s.label}>Product / Area</label>
        <select style={s.select} value={product} onChange={e => setProduct(e.target.value)}>
          {PRODUCTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      {!submitterName && (
        <div style={s.field}>
          <label style={s.label}>Your Name (optional)</label>
          <input style={s.input} type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        </div>
      )}
      {!submitterEmail && (
        <div style={s.field}>
          <label style={s.label}>Email Address</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
      )}
      <div style={s.field}>
        <label style={s.label}>Describe the Issue</label>
        <textarea
          style={s.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What happened? What were you trying to do? Include any error messages."
          rows={5}
          required
        />
        <div style={s.hint}>Tip: mentioning "can't login", "payment", or "not working at all" flags your ticket as critical.</div>
      </div>
      {/* Honeypot */}
      <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      {error && <p style={s.error}>{error}</p>}
      <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Support Ticket'}
      </button>
    </form>
  )
}

const s: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#888', fontSize: '0.78rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#F4F6F8', fontSize: '0.9rem', outline: 'none' },
  select: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#F4F6F8', fontSize: '0.9rem', outline: 'none' },
  textarea: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#F4F6F8', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  hint: { color: '#555', fontSize: '0.72rem', lineHeight: 1.4 },
  error: { color: '#e05555', fontSize: '0.82rem' },
  submitBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  successIcon: { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,194,199,0.12)', border: '2px solid #00C2C7', color: '#00C2C7', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: '#F4F6F8', fontSize: '1.1rem', fontWeight: 700, margin: 0 },
  successId: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem', margin: 0 },
  successSub: { color: '#888', fontSize: '0.82rem', margin: 0 },
  successNote: { color: '#aaa', fontSize: '0.85rem', lineHeight: 1.5, margin: 0, maxWidth: '340px' },
  resetBtn: { background: 'transparent', border: '1px solid rgba(0,194,199,0.2)', color: '#00C2C7', borderRadius: '6px', padding: '8px 18px', fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.5rem' },
}
