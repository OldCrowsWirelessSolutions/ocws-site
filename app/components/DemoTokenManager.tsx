'use client'
import { useState, useEffect } from 'react'
import QRCodeDisplay from './QRCodeDisplay'

type DemoToken = {
  token: string
  accessLevel: string
  createdAt: number
  expiresAt: number
  maxUses: number
  useCount: number
  createdBy: string
  label?: string
  allowPDF: boolean
  allowReckoning: boolean
  revoked: boolean
  lastUsedAt?: number
  lockedSSID?: string
  locationLabel?: string
}

type Props = {
  authKey: string
  isAdmin?: boolean
}

const ACCESS_LEVELS = ['fledgling', 'nest', 'flock', 'full']
const EXPIRY_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
  { value: 168, label: '1 week' },
]

const LEVEL_COLORS: Record<string, string> = {
  fledgling: '#888', nest: '#B8922A', flock: '#00C2C7', full: '#e05555',
}

export default function DemoTokenManager({ authKey, isAdmin = false }: Props) {
  const [tokens, setTokens] = useState<DemoToken[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [accessLevel, setAccessLevel] = useState('fledgling')
  const [expiresInHours, setExpiresInHours] = useState(24)
  const [maxUses, setMaxUses] = useState(1)
  const [label, setLabel] = useState('')
  const [clientName, setClientName] = useState('')
  const [lockedSSID, setLockedSSID] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [allowPDF, setAllowPDF] = useState(false)
  const [allowReckoning, setAllowReckoning] = useState(false)
  const [error, setError] = useState('')
  const [newTokenUrl, setNewTokenUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrToken, setQrToken] = useState<string | null>(null)

  useEffect(() => { fetchTokens() }, [])

  async function fetchTokens() {
    setLoading(true)
    try {
      const res = await fetch('/api/demo/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey }),
      })
      const data = await res.json()
      setTokens(data.tokens || [])
    } catch {
      setTokens([])
    } finally {
      setLoading(false)
    }
  }

  async function generateToken() {
    setGenerating(true); setError(''); setNewTokenUrl('')
    if (!clientName.trim()) {
      setError('Please enter the recipient name in the Issued To field.');
      setGenerating(false);
      return;
    }
    try {
      const res = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, accessLevel, expiresInHours, maxUses, label: label || undefined, clientName: clientName || undefined, allowPDF, allowReckoning, lockedSSID: lockedSSID.trim() || undefined, locationLabel: locationLabel.trim() || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setNewTokenUrl(data.url)
        setLabel('')
        setClientName('')
        setLockedSSID('')
        setLocationLabel('')
        await fetchTokens()
      } else {
        setError(data.error || 'Failed to generate token')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  async function revokeToken(token: string) {
    if (!confirm('Revoke this demo token? It will immediately stop working.')) return
    try {
      await fetch('/api/demo/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, token }),
      })
      await fetchTokens()
    } catch {
      setError('Failed to revoke token.')
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const now = Date.now()
  const activeTokens = tokens.filter(t => !t.revoked && t.expiresAt > now)
  const expiredOrRevoked = tokens.filter(t => t.revoked || t.expiresAt <= now)

  return (
    <div style={s.container}>
      <div style={s.genSection}>
        <div style={s.sectionTitle}>Generate Demo Token</div>
        <div style={s.genGrid}>
          <div style={s.field}>
            <label style={s.label}>Access Level</label>
            <select style={s.select} value={accessLevel} onChange={e => setAccessLevel(e.target.value)}>
              {(isAdmin ? ACCESS_LEVELS : ['fledgling', 'nest']).map(l => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Expires In</label>
            <select style={s.select} value={expiresInHours} onChange={e => setExpiresInHours(Number(e.target.value))}>
              {EXPIRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Max Uses (0 = unlimited)</label>
            <input style={s.input} type="number" min={0} max={100} value={maxUses} onChange={e => setMaxUses(Number(e.target.value))} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Label (optional)</label>
            <input style={s.input} type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional — e.g. John Smith for Acme Co)" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Issued To (required)</label>
            <input
              style={{ ...s.input, borderColor: !clientName.trim() ? 'rgba(248,113,113,0.4)' : 'rgba(0,194,199,0.2)' }}
              type="text"
              placeholder="Issued To — recipient full name (required)"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Location Label <span style={{color:'#888',fontSize:'11px'}}>(optional)</span></label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. Suite 3B, East Wing Floor 2"
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Lock to SSID <span style={{color:'#888',fontSize:'11px'}}>(optional — pre-fills and locks the network field)</span></label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. Smith_Office_WiFi"
              value={lockedSSID}
              onChange={e => setLockedSSID(e.target.value)}
            />
          </div>
        </div>
        {isAdmin && (
          <div style={s.checkRow}>
            <label style={s.checkLabel}>
              <input type="checkbox" checked={allowPDF} onChange={e => setAllowPDF(e.target.checked)} style={{ marginRight: '0.4rem' }} />
              Allow PDF Download
            </label>
            <label style={s.checkLabel}>
              <input type="checkbox" checked={allowReckoning} onChange={e => setAllowReckoning(e.target.checked)} style={{ marginRight: '0.4rem' }} />
              Allow Full Reckoning
            </label>
          </div>
        )}
        {error && <p style={s.error}>{error}</p>}
        {newTokenUrl && (
          <div style={s.newTokenBox}>
            <div style={s.newTokenLabel}>TOKEN GENERATED</div>
            <div style={s.newTokenUrl}>{newTokenUrl}</div>
            <button style={s.copyBtn} onClick={() => copyUrl(newTokenUrl)}>{copied ? '✓ Copied!' : 'Copy URL'}</button>
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(0,194,199,0.15)', paddingTop: 16 }}>
              <QRCodeDisplay url={newTokenUrl} label="Scan to access demo" size={180} />
            </div>
          </div>
        )}
        <button style={{ ...s.genBtn, opacity: generating ? 0.6 : 1 }} onClick={generateToken} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Token →'}
        </button>
      </div>

      <div style={s.listSection}>
        <div style={s.sectionTitle}>Active Tokens ({activeTokens.length})</div>
        {loading ? (
          <div style={s.loading}>Loading...</div>
        ) : activeTokens.length === 0 ? (
          <div style={s.empty}>No active tokens.</div>
        ) : (
          <div style={s.tokenList}>
            {activeTokens.map(t => {
              const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://oldcrowswireless.com'}/demo/${t.token}`
              const timeLeft = t.expiresAt - now
              const hoursLeft = Math.floor(timeLeft / 3600000)
              const minutesLeft = Math.floor((timeLeft % 3600000) / 60000)
              const timeStr = hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`
              return (
                <div key={t.token} style={s.tokenCard}>
                  <div style={s.tokenTop}>
                    <div style={{ ...s.levelBadge, color: LEVEL_COLORS[t.accessLevel] }}>{t.accessLevel.toUpperCase()}</div>
                    {t.label && <div style={s.tokenLabel}>{t.label}</div>}
                    <div style={s.tokenTime}>⏱ {timeStr} left</div>
                  </div>
                  <div style={s.tokenCode}>{t.token}</div>
                  <div style={s.tokenMeta}>
                    Uses: {t.useCount}/{t.maxUses === 0 ? '∞' : t.maxUses}
                    {t.allowPDF && ' · PDF'}
                    {t.allowReckoning && ' · Reckoning'}
                    {t.createdBy !== 'admin' && ` · by ${t.createdBy}`}
                  </div>
                  {(t.locationLabel || t.lockedSSID) && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {t.locationLabel && (
                        <span style={{ color: '#B8922A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
                          📍 {t.locationLabel}
                        </span>
                      )}
                      {t.lockedSSID && (
                        <span style={{ color: '#00C2C7', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
                          🔒 SSID: {t.lockedSSID}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={s.tokenActions}>
                    <button style={s.copySmall} onClick={() => copyUrl(url)}>Copy URL</button>
                    <button
                      onClick={() => {
                        const newSSID = prompt('Update locked SSID (leave blank to clear):', t.lockedSSID || '');
                        const newLabel = prompt('Update location label (leave blank to clear):', t.locationLabel || '');
                        if (newSSID === null && newLabel === null) return;
                        fetch('/api/demo/update', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ authKey, token: t.token, lockedSSID: newSSID?.trim() || undefined, locationLabel: newLabel?.trim() || undefined }),
                        }).then(() => fetchTokens());
                      }}
                      style={{ background: 'transparent', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', color: '#00C2C7', fontSize: '11px', padding: '3px 8px', cursor: 'pointer' }}
                    >
                      ✏️ Edit Lock
                    </button>
                    <button
                      style={{ background: qrToken === t.token ? 'rgba(184,146,42,0.2)' : 'rgba(0,194,199,0.08)', border: `1px solid ${qrToken === t.token ? 'rgba(184,146,42,0.4)' : 'rgba(0,194,199,0.2)'}`, borderRadius: 6, color: qrToken === t.token ? '#B8922A' : '#00C2C7', padding: '5px 10px', fontSize: '0.68rem', fontFamily: 'monospace', cursor: 'pointer' }}
                      onClick={() => setQrToken(qrToken === t.token ? null : t.token)}
                    >
                      {qrToken === t.token ? '✕ QR' : '⊞ QR'}
                    </button>
                    {isAdmin && <button style={s.revokeBtn} onClick={() => revokeToken(t.token)}>Revoke</button>}
                  </div>
                  {qrToken === t.token && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,194,199,0.1)' }}>
                      <QRCodeDisplay url={url} label={`Demo — ${t.label || t.token}`} size={160} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {expiredOrRevoked.length > 0 && (
          <>
            <div style={{ ...s.sectionTitle, marginTop: '1.5rem', opacity: 0.5 }}>Expired / Revoked ({expiredOrRevoked.length})</div>
            <div style={s.tokenList}>
              {expiredOrRevoked.slice(0, 5).map(t => (
                <div key={t.token} style={{ ...s.tokenCard, opacity: 0.4 }}>
                  <div style={s.tokenTop}>
                    <div style={{ ...s.levelBadge, color: '#555' }}>{t.accessLevel.toUpperCase()}</div>
                    {t.label && <div style={s.tokenLabel}>{t.label}</div>}
                    <div style={s.tokenTime}>{t.revoked ? 'REVOKED' : 'EXPIRED'}</div>
                  </div>
                  <div style={s.tokenCode}>{t.token}</div>
                  <div style={s.tokenMeta}>Uses: {t.useCount}/{t.maxUses === 0 ? '∞' : t.maxUses}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  genSection: { background: '#1A2332', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  sectionTitle: { color: '#00C2C7', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em' },
  genGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { color: '#555', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', padding: '8px 10px', color: '#F4F6F8', fontSize: '0.85rem', outline: 'none' },
  select: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', padding: '8px 10px', color: '#F4F6F8', fontSize: '0.85rem', outline: 'none' },
  checkRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  checkLabel: { color: '#aaa', fontSize: '0.82rem', display: 'flex', alignItems: 'center', cursor: 'pointer' },
  error: { color: '#e05555', fontSize: '0.82rem', margin: 0 },
  newTokenBox: { background: '#0D1520', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(0,194,199,0.3)', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  newTokenLabel: { color: '#00C2C7', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em' },
  newTokenUrl: { color: '#ccc', fontSize: '0.8rem', wordBreak: 'break-all', fontFamily: 'Share Tech Mono, monospace' },
  copyBtn: { background: 'rgba(0,194,199,0.12)', border: '1px solid rgba(0,194,199,0.3)', color: '#00C2C7', borderRadius: '6px', padding: '5px 14px', fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-start' },
  genBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' },
  listSection: {},
  loading: { color: '#555', fontSize: '0.82rem', padding: '1rem', textAlign: 'center' },
  empty: { color: '#555', fontSize: '0.82rem', padding: '1rem', textAlign: 'center' },
  tokenList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' },
  tokenCard: { background: '#1A2332', borderRadius: '10px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.06)' },
  tokenTop: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' },
  levelBadge: { fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em' },
  tokenLabel: { color: '#888', fontSize: '0.75rem', flex: 1 },
  tokenTime: { color: '#B8922A', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace' },
  tokenCode: { color: '#ccc', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.78rem', marginBottom: '0.25rem', wordBreak: 'break-all' },
  tokenMeta: { color: '#555', fontSize: '0.72rem', marginBottom: '0.5rem' },
  tokenActions: { display: 'flex', gap: '0.4rem' },
  copySmall: { background: 'rgba(0,194,199,0.08)', border: '1px solid rgba(0,194,199,0.2)', color: '#00C2C7', borderRadius: '5px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer' },
  revokeBtn: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', color: '#e05555', borderRadius: '5px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer' },
}
