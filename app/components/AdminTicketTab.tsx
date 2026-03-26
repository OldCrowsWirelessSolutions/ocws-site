'use client'
import { useState, useEffect } from 'react'

type Ticket = {
  id: string
  createdAt: number
  updatedAt: number
  status: string
  priority: string
  product: string
  description: string
  submitterEmail: string
  submitterName?: string
  tier?: string
  adminNotes?: string
  resolvedAt?: number
}

type Props = {
  authKey: string
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#e05555', high: '#B8922A', normal: '#00C2C7',
}
const STATUS_COLORS: Record<string, string> = {
  open: '#e05555', in_progress: '#B8922A', resolved: '#00C2C7', closed: '#555',
}

export default function AdminTicketTab({ authKey }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('open')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchTickets() }, [filter])

  async function fetchTickets() {
    setLoading(true)
    try {
      const res = await fetch('/api/support/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, status: filter === 'all' ? undefined : filter }),
      })
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(ticketId: string, status: string) {
    setSaving(true)
    try {
      await fetch('/api/support/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, ticketId, updates: { status, adminNotes: notes } }),
      })
      await fetchTickets()
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  const criticalOpen = tickets.filter(t => t.priority === 'critical' && t.status === 'open').length

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>Support Tickets</div>
        {criticalOpen > 0 && (
          <div style={s.criticalBadge}>{criticalOpen} CRITICAL</div>
        )}
        <button style={s.refreshBtn} onClick={fetchTickets}>↻ Refresh</button>
      </div>

      <div style={s.filterRow}>
        {['open', 'in_progress', 'resolved', 'closed', 'all'].map(f => (
          <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }} onClick={() => setFilter(f)}>
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.loading}>Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div style={s.empty}>No {filter === 'all' ? '' : filter} tickets.</div>
      ) : (
        <div style={s.list}>
          {tickets.map(t => (
            <div key={t.id} style={s.ticketCard} onClick={() => { setSelected(t); setNotes(t.adminNotes || '') }}>
              <div style={s.ticketTop}>
                <div style={s.ticketId}>{t.id}</div>
                <div style={{ ...s.priorityBadge, color: PRIORITY_COLORS[t.priority], borderColor: PRIORITY_COLORS[t.priority] + '40' }}>{t.priority.toUpperCase()}</div>
                <div style={{ ...s.statusBadge, color: STATUS_COLORS[t.status] }}>{t.status.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div style={s.ticketMeta}>{t.submitterEmail} · {t.product.replace(/_/g, ' ')}{t.tier ? ` · ${t.tier}` : ''}</div>
              <div style={s.ticketDesc}>{t.description.slice(0, 120)}{t.description.length > 120 ? '...' : ''}</div>
              <div style={s.ticketTime}>{new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.detailModal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <div style={s.detailId}>{selected.id}</div>
            <div style={s.detailRow}>
              <span style={{ color: PRIORITY_COLORS[selected.priority] }}>{selected.priority.toUpperCase()}</span>
              <span style={{ color: '#555' }}>·</span>
              <span style={{ color: STATUS_COLORS[selected.status] }}>{selected.status.replace('_', ' ').toUpperCase()}</span>
              <span style={{ color: '#555' }}>·</span>
              <span style={{ color: '#888' }}>{selected.product.replace(/_/g, ' ')}</span>
            </div>
            <div style={s.detailMeta}>From: {selected.submitterEmail}{selected.submitterName ? ` (${selected.submitterName})` : ''}{selected.tier ? ` · Tier: ${selected.tier}` : ''}</div>
            <div style={s.detailDesc}>{selected.description}</div>
            <div style={s.notesLabel}>Admin Notes</div>
            <textarea style={s.notesInput} value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Internal notes..." />
            <div style={s.actionRow}>
              {selected.status !== 'in_progress' && <button style={s.actionBtn} onClick={() => updateStatus(selected.id, 'in_progress')} disabled={saving}>Mark In Progress</button>}
              {selected.status !== 'resolved' && <button style={{ ...s.actionBtn, background: 'rgba(0,194,199,0.15)', color: '#00C2C7' }} onClick={() => updateStatus(selected.id, 'resolved')} disabled={saving}>Mark Resolved</button>}
              {selected.status !== 'closed' && <button style={{ ...s.actionBtn, background: 'rgba(85,85,85,0.15)', color: '#888' }} onClick={() => updateStatus(selected.id, 'closed')} disabled={saving}>Close</button>}
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
  criticalBadge: { background: 'rgba(224,85,85,0.12)', color: '#e05555', border: '1px solid rgba(224,85,85,0.3)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace' },
  refreshBtn: { background: 'transparent', border: '1px solid rgba(0,194,199,0.2)', color: '#00C2C7', borderRadius: '6px', padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(0,194,199,0.1)', color: '#00C2C7', borderColor: '#00C2C7' },
  loading: { color: '#555', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' },
  empty: { color: '#555', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  ticketCard: { background: '#0D1520', borderRadius: '10px', padding: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: 'border-color 0.2s' },
  ticketTop: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' },
  ticketId: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.78rem' },
  priorityBadge: { fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', border: '1px solid', borderRadius: '10px', padding: '1px 7px' },
  statusBadge: { fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace' },
  ticketMeta: { color: '#666', fontSize: '0.75rem', marginBottom: '0.3rem' },
  ticketDesc: { color: '#aaa', fontSize: '0.82rem', lineHeight: 1.4 },
  ticketTime: { color: '#444', fontSize: '0.72rem', marginTop: '0.4rem', fontFamily: 'Share Tech Mono, monospace' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' },
  detailModal: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '12px', padding: '1.5rem', maxWidth: '520px', width: '100%', position: 'relative', maxHeight: '85vh', overflowY: 'auto' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#555', fontSize: '1rem', cursor: 'pointer' },
  detailId: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.82rem', marginBottom: '0.5rem' },
  detailRow: { display: 'flex', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'Share Tech Mono, monospace', marginBottom: '0.5rem', flexWrap: 'wrap' },
  detailMeta: { color: '#666', fontSize: '0.78rem', marginBottom: '0.75rem' },
  detailDesc: { background: '#0D1520', borderRadius: '8px', padding: '0.75rem', color: '#ccc', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' },
  notesLabel: { color: '#555', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' },
  notesInput: { width: '100%', background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#F4F6F8', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '1rem' },
  actionRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  actionBtn: { background: 'rgba(184,146,42,0.12)', color: '#B8922A', border: '1px solid rgba(184,146,42,0.3)', borderRadius: '6px', padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer' },
}
