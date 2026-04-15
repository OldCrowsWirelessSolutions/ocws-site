'use client'
import { useState } from 'react'

interface Props {
  defaultCode?: string
  onSuccess?: (grants: {
    verdicts: number
    chatAccess: boolean
    chatExpiresAt: string
    codeLabel: string
  }) => void
}

export default function EventCodeRedemption({ defaultCode = '', onSuccess }: Props) {
  const [code, setCode] = useState(defaultCode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [howHeard, setHowHeard] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [grants, setGrants] = useState<any>(null)

  const handleRedeem = async () => {
    setError('')
    if (!name.trim() || !email.trim() || !code.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/redeem-event-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), name: name.trim(), email: email.trim().toLowerCase(), howHeard })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Redemption failed.')
      } else {
        setGrants(data.grants)
        setSuccess(true)
        onSuccess?.(data.grants)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success && grants) {
    const expiry = new Date(grants.chatExpiresAt).toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZoneName: 'short'
    })
    return (
      <div style={{ background: '#0D1520', border: '1px solid #0D6E7A', borderRadius: 12, padding: '1.5rem', maxWidth: 440, color: '#F4F6F8' }}>
        <div style={{ color: '#00C2C7', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>✓ Code Activated — {grants.codeLabel}</div>
        <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.6 }}>
          Corvus is ready. You have <strong>1 Verdict credit</strong> and <strong>24 hours of Talk to Corvus</strong> access.
        </p>
        <div style={{ background: '#1A2332', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#888' }}>
          Chat access expires: <span style={{ color: '#F4F6F8' }}>{expiry}</span>
        </div>
        <a href="/crows-eye" style={{
          display: 'block', marginTop: 16, background: '#0D6E7A', color: '#F4F6F8',
          textAlign: 'center', padding: '10px 0', borderRadius: 8, textDecoration: 'none', fontWeight: 500
        }}>
          Run Your Verdict →
        </a>
      </div>
    )
  }

  return (
    <div style={{ background: '#0D1520', border: '1px solid #1A2332', borderRadius: 12, padding: '1.5rem', maxWidth: 440, color: '#F4F6F8' }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Enter your event code to activate your free Verdict + Corvus chat access.</div>

      {[
        { label: 'Event Code', value: code, setter: setCode, placeholder: 'HACKTHECOAST2026', type: 'text' },
        { label: 'Name', value: name, setter: setName, placeholder: 'Your name', type: 'text' },
        { label: 'Email', value: email, setter: setEmail, placeholder: 'you@example.com', type: 'email' },
      ].map(({ label, value, setter, placeholder, type }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</label>
          <input
            type={type}
            value={value}
            onChange={e => setter(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%', background: '#1A2332', border: '1px solid #0D6E7A33',
              borderRadius: 6, padding: '8px 12px', color: '#F4F6F8', fontSize: 14,
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 4 }}>How did you hear about us?</label>
        <select
          value={howHeard}
          onChange={e => setHowHeard(e.target.value)}
          style={{
            width: '100%', background: '#1A2332', border: '1px solid #0D6E7A33',
            borderRadius: 6, padding: '8px 12px', color: howHeard ? '#F4F6F8' : '#888',
            fontSize: 14, outline: 'none', boxSizing: 'border-box'
          }}
        >
          <option value="">Select one</option>
          <option value="hack-the-coast">Hack the Coast event</option>
          <option value="social-media">Social media</option>
          <option value="word-of-mouth">Word of mouth</option>
          <option value="web-search">Web search</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <button
        onClick={handleRedeem}
        disabled={loading}
        style={{
          width: '100%', background: loading ? '#1A2332' : '#0D6E7A',
          color: '#F4F6F8', border: 'none', borderRadius: 8,
          padding: '10px 0', fontSize: 15, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Activating...' : 'Activate Code'}
      </button>
    </div>
  )
}
