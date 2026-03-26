'use client'
import { useState, useEffect } from 'react'

type DemoRequest = {
  id: string
  createdAt: number
  status: string
  name: string
  email: string
  company?: string
  problem?: string
  contactMethod: string
  phone?: string
  sentDemoUrl?: string
  adminNotes?: string
}

type Props = {
  authKey: string
}

const STATUS_COLORS: Record<string, string> = {
  new: '#e05555', contacted: '#B8922A', converted: '#00C2C7', closed: '#555',
}

export default function AdminDemoRequests({ authKey }: Props) {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DemoRequest | null>(null)
  const [notes, setNotes] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('new')

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    setLoading(true)
    try {
      const res = await fetch('/api/demo/requests-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey }),
      })
      const data = await res.json()
      setRequests(data.requests || [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  async function updateRequest(id: string, updates: Partial<DemoRequest>) {
    setSaving(true)
    try {
      await fetch('/api/demo/requests-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, action: 'update', id, updates }),
      })
      await fetchRequests()
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const newCount = requests.filter(r => r.status === 'new').length

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>Demo Requests</div>
        {newCount > 0 && <div style={s.newBadge}>{newCount} NEW</div>}
        <button style={s.refreshBtn} onClick={fetchRequests}>↻ Refresh</button>
      </div>

      <div style={s.filterRow}>
        {['new', 'contacted', 'converted', 'closed', 'all'].map(f => (
          <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.loading}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>No {filter === 'all' ? '' : filter} requests.</div>
      ) : (
        <div style={s.list}>
          {filtered.map(r => (
            <div key={r.id} style={s.card} onClick={() => { setSelected(r); setNotes(r.adminNotes || ''); setDemoUrl(r.sentDemoUrl || '') }}>
              <div style={s.cardTop}>
                <div style={s.cardId}>{r.id}</div>
                <div style={{ ...s.statusBadge, color: STATUS_COLORS[r.status] }}>{r.status.toUpperCase()}</div>
              </div>
              <div style={s.cardName}>{r.name}{r.company ? ` — ${r.company}` : ''}</div>
              <div style={s.cardContact}>{r.email}{r.phone ? ` · ${r.phone}` : ''} · Prefers: {r.contactMethod}</div>
              {r.problem && <div style={s.cardProblem}>{r.problem.slice(0, 100)}{r.problem.length > 100 ? '...' : ''}</div>}
              <div style={s.cardTime}>{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <div style={s.modalId}>{selected.id}</div>
            <div style={s.modalName}>{selected.name}</div>
            <div style={s.modalContact}>
              <a href={`mailto:${selected.email}`} style={s.emailLink}>{selected.email}</a>
              {selected.phone && <span> · {selected.phone}</span>}
              <span style={{ color: '#555' }}> · Prefers {selected.contactMethod}</span>
            </div>
            {selected.company && <div style={s.modalCompany}>Company: {selected.company}</div>}
            {selected.problem && (
              <div style={s.problemBlock}>
                <div style={s.problemLabel}>WHAT THEY'RE TRYING TO SOLVE</div>
                <p style={s.problemText}>{selected.problem}</p>
              </div>
            )}
            <div style={s.fieldLabel}>Demo URL Sent</div>
            <input style={s.input} type="text" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://oldcrowswireless.com/demo/CORVUS-DEMO-..." />
            <div style={s.fieldLabel}>Admin Notes</div>
            <textarea style={s.textarea} value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Contact notes, follow-up..." />
            <div style={s.actionRow}>
              {selected.status === 'new' && (
                <button style={s.actionBtn} onClick={() => updateRequest(selected.id, { status: 'contacted', adminNotes: notes, sentDemoUrl: demoUrl })} disabled={saving}>
                  Mark Contacted
                </button>
              )}
              <button style={{ ...s.actionBtn, background: 'rgba(0,194,199,0.12)', color: '#00C2C7' }} onClick={() => updateRequest(selected.id, { status: 'converted', adminNotes: notes, sentDemoUrl: demoUrl })} disabled={saving}>
                Mark Converted
              </button>
              <button style={{ ...s.actionBtn, background: 'rgba(85,85,85,0.12)', color: '#666' }} onClick={() => updateRequest(selected.id, { status: 'closed', adminNotes: notes })} disabled={saving}>
                Close
              </button>
              <button style={{ ...s.actionBtn, background: 'rgba(0,194,199,0.06)' }} onClick={() => updateRequest(selected.id, { adminNotes: notes, sentDemoUrl: demoUrl })} disabled={saving}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { padding: '1rem' },
  header: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' },
  title: { color: '#F4F6F8', fontWeight: 700, fontSize: '1rem', flex: 1 },
  newBadge: { background: 'rgba(224,85,85,0.12)', color: '#e05555', border: '1px solid rgba(224,85,85,0.3)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace' },
  refreshBtn: { background: 'transparent', border: '1px solid rgba(0,194,199,0.2)', color: '#00C2C7', borderRadius: '6px', padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(0,194,199,0.1)', color: '#00C2C7', borderColor: '#00C2C7' },
  loading: { color: '#555', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' },
  empty: { color: '#555', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  card: { background: '#0D1520', borderRadius: '10px', padding: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' },
  cardTop: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' },
  cardId: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', flex: 1 },
  statusBadge: { fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace' },
  cardName: { color: '#F4F6F8', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
  cardContact: { color: '#666', fontSize: '0.75rem', marginBottom: '0.3rem' },
  cardProblem: { color: '#aaa', fontSize: '0.78rem', lineHeight: 1.4, fontStyle: 'italic' },
  cardTime: { color: '#444', fontSize: '0.68rem', marginTop: '0.4rem', fontFamily: 'Share Tech Mono, monospace' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  modal: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '12px', padding: '1.5rem', maxWidth: '520px', width: '100%', position: 'relative', maxHeight: '85vh', overflowY: 'auto' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#555', fontSize: '1rem', cursor: 'pointer' },
  modalId: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', marginBottom: '0.5rem' },
  modalName: { color: '#F4F6F8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' },
  modalContact: { color: '#888', fontSize: '0.82rem', marginBottom: '0.5rem' },
  emailLink: { color: '#00C2C7', textDecoration: 'none' },
  modalCompany: { color: '#666', fontSize: '0.78rem', marginBottom: '0.75rem' },
  problemBlock: { background: '#0D1520', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' },
  problemLabel: { color: '#555', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.08em', marginBottom: '0.4rem' },
  problemText: { color: '#ccc', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' },
  fieldLabel: { color: '#555', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem', marginTop: '0.75rem' },
  input: { width: '100%', background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#F4F6F8', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginBottom: '0.5rem' },
  textarea: { width: '100%', background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#F4F6F8', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '1rem' },
  actionRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  actionBtn: { background: 'rgba(184,146,42,0.12)', color: '#B8922A', border: '1px solid rgba(184,146,42,0.3)', borderRadius: '6px', padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer' },
}
