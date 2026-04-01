'use client';

import { useState, useEffect, useRef } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'follow-up' | 'closed';
  notes: string;
  reportIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReportRecord {
  reportId: string;
  locationName: string;
  createdAt: string;
  findingCount: number;
  severity: string;
  type: string;
}

interface Props {
  subscriptionCode: string;
  tier: string;
  reports?: ReportRecord[];
}

const STATUS_OPTIONS = ['active', 'follow-up', 'closed'] as const;
const STATUS_COLORS = {
  active: { color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  'follow-up': { color: '#fbbf24', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  closed: { color: '#888', bg: 'rgba(136,136,136,0.12)', border: 'rgba(136,136,136,0.35)' },
};

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', address: '', status: 'active' as const, notes: '' };

export default function ClientManagerTab({ subscriptionCode, tier, reports = [] }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Client | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'new' | 'edit'>('list');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailSending, setEmailSending] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState('');
  const [linkingReport, setLinkingReport] = useState(false);

  const isMurder = ['murder', 'vip'].includes(tier?.toLowerCase());

  useEffect(() => { loadClients(); }, [subscriptionCode]);

  async function loadClients() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?code=${encodeURIComponent(subscriptionCode)}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch { setError('Failed to load clients.'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (view === 'new') {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: subscriptionCode, client: form }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setClients(prev => [data.client, ...prev]);
        setSelected(data.client);
        setView('detail');
      } else if (view === 'edit' && selected) {
        const res = await fetch('/api/clients', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: subscriptionCode, clientId: selected.id, updates: form }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setClients(prev => prev.map(c => c.id === data.client.id ? data.client : c));
        setSelected(data.client);
        setView('detail');
      }
    } catch (err: any) { setError(err.message || 'Save failed.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(clientId: string) {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    try {
      await fetch('/api/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: subscriptionCode, clientId }),
      });
      setClients(prev => prev.filter(c => c.id !== clientId));
      setSelected(null);
      setView('list');
    } catch { setError('Delete failed.'); }
  }

  async function handleLinkReport(clientId: string, reportId: string) {
    setLinkingReport(true);
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;
      const reportIds = client.reportIds.includes(reportId)
        ? client.reportIds.filter(r => r !== reportId)
        : [...client.reportIds, reportId];
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: subscriptionCode, clientId, updates: { reportIds } }),
      });
      const data = await res.json();
      setClients(prev => prev.map(c => c.id === data.client.id ? data.client : c));
      setSelected(data.client);
    } catch { setError('Failed to link report.'); }
    finally { setLinkingReport(false); }
  }

  async function handleSendReport(client: Client, report: ReportRecord) {
    if (!client.email) { setEmailFeedback('No email on file for this client.'); return; }
    setEmailSending(true); setEmailFeedback('');
    try {
      const res = await fetch('/api/clients/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: subscriptionCode,
          clientEmail: client.email,
          clientName: client.name,
          reportId: report.reportId,
          locationName: report.locationName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmailFeedback(`Report sent to ${client.email}`);
    } catch (err: any) { setEmailFeedback(err.message || 'Send failed.'); }
    finally { setEmailSending(false); }
  }

  function handleExportCSV() {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'Status', 'Notes', 'Reports Linked', 'Created'];
    const rows = clients.map(c => [
      c.name, c.company, c.email, c.phone, c.address,
      c.status, c.notes.replace(/,/g, ';'),
      c.reportIds.length, new Date(c.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `OCWS_Clients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  function openNew() { setForm(EMPTY_FORM); setError(''); setView('new'); }
  function openEdit(c: Client) { setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, address: c.address, status: c.status, notes: c.notes }); setError(''); setView('edit'); }
  function openDetail(c: Client) { setSelected(c); setView('detail'); }

  const filtered = clients.filter(c => {
    const matchSearch = !search || [c.name, c.company, c.email].some(f => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inputStyle = {
    width: '100%', background: '#0D1520', border: '1px solid #0D6E7A',
    borderRadius: '6px', color: '#F4F6F8', padding: '8px 12px',
    fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block', color: '#888', fontSize: '11px',
    marginBottom: '4px', fontFamily: 'Share Tech Mono, monospace',
  };

  const btnPrimary = {
    background: '#0D6E7A', color: '#F4F6F8', border: 'none',
    borderRadius: '6px', padding: '9px 18px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 'bold' as const,
  };

  const btnGhost = {
    background: 'transparent', color: '#888', border: '1px solid #1A2332',
    borderRadius: '6px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px',
  };

  // ── FORM VIEW (new / edit) ─────────────────────────────────────────────────
  if (view === 'new' || view === 'edit') {
    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setView(selected ? 'detail' : 'list')} style={btnGhost}>← Back</button>
          <div style={{ color: '#F4F6F8', fontSize: '17px', fontWeight: 'bold' }}>
            {view === 'new' ? 'New Client' : `Edit — ${selected?.name}`}
          </div>
        </div>

        {error && <div style={{ background: '#FF444422', border: '1px solid #FF444466', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', color: '#FF4444', fontSize: '13px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          {[
            { key: 'name', label: 'NAME *', placeholder: "Pilcher's Barbershop" },
            { key: 'company', label: 'COMPANY', placeholder: 'Pilcher LLC' },
            { key: 'email', label: 'EMAIL', placeholder: 'owner@example.com' },
            { key: 'phone', label: 'PHONE', placeholder: '850-555-0100' },
            { key: 'address', label: 'ADDRESS', placeholder: '123 Main St, Pensacola FL' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                style={inputStyle}
                value={(form as any)[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label style={labelStyle}>STATUS</label>
            <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>NOTES</label>
          <textarea
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Network environment notes, contact preferences, follow-up reminders..."
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} disabled={saving} style={btnPrimary}>
            {saving ? 'Saving...' : view === 'new' ? 'Create Client' : 'Save Changes'}
          </button>
          <button onClick={() => setView(selected ? 'detail' : 'list')} style={btnGhost}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    const client = clients.find(c => c.id === selected.id) || selected;
    const linkedReports = reports.filter(r => client.reportIds.includes(r.reportId));
    const unlinkableReports = reports.filter(r => !client.reportIds.includes(r.reportId));
    const sc = STATUS_COLORS[client.status];

    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setView('list')} style={btnGhost}>← Clients</button>
            <div style={{ color: '#F4F6F8', fontSize: '17px', fontWeight: 'bold' }}>{client.name}</div>
            <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
              {client.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => openEdit(client)} style={btnPrimary}>Edit</button>
            <button onClick={() => handleDelete(client.id)} style={{ ...btnGhost, color: '#FF4444', borderColor: '#FF444433' }}>Delete</button>
          </div>
        </div>

        {/* Info block */}
        <div style={{ background: '#1A2332', borderRadius: '8px', padding: '16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'COMPANY', value: client.company },
            { label: 'EMAIL', value: client.email },
            { label: 'PHONE', value: client.phone },
            { label: 'ADDRESS', value: client.address },
            { label: 'ADDED', value: new Date(client.createdAt).toLocaleDateString() },
            { label: 'UPDATED', value: new Date(client.updatedAt).toLocaleDateString() },
          ].filter(({ value }) => value).map(({ label, value }) => (
            <div key={label}>
              <div style={{ color: '#888', fontSize: '10px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '3px' }}>{label}</div>
              <div style={{ color: '#F4F6F8', fontSize: '13px' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {client.notes && (
          <div style={{ background: '#1A2332', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ color: '#888', fontSize: '10px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '6px' }}>NOTES</div>
            <div style={{ color: '#F4F6F8', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{client.notes}</div>
          </div>
        )}

        {/* Linked Reports */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '10px' }}>
            LINKED REPORTS ({linkedReports.length})
          </div>

          {linkedReports.length === 0 && (
            <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>No reports linked yet.</div>
          )}

          {linkedReports.map(r => (
            <div key={r.reportId} style={{ background: '#1A2332', borderRadius: '6px', padding: '12px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ color: '#F4F6F8', fontSize: '13px', fontWeight: 'bold' }}>{r.locationName}</div>
                <div style={{ color: '#888', fontSize: '11px', marginTop: '3px' }}>{r.type} · {new Date(r.createdAt).toLocaleDateString()} · {r.findingCount} findings</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {emailFeedback && <span style={{ color: '#4ade80', fontSize: '11px' }}>{emailFeedback}</span>}
                <button
                  onClick={() => handleSendReport(client, r)}
                  disabled={emailSending || !client.email}
                  style={{ ...btnPrimary, padding: '6px 12px', fontSize: '11px' }}
                >
                  {emailSending ? '...' : '✉ Send'}
                </button>
                <button
                  onClick={() => handleLinkReport(client.id, r.reportId)}
                  style={{ ...btnGhost, padding: '6px 12px', fontSize: '11px', color: '#FF4444', borderColor: '#FF444433' }}
                >
                  Unlink
                </button>
              </div>
            </div>
          ))}

          {/* Link additional reports */}
          {unlinkableReports.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: '#888', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace', marginBottom: '8px' }}>LINK A REPORT</div>
              {unlinkableReports.slice(0, 5).map(r => (
                <div key={r.reportId} style={{ background: '#0D1520', borderRadius: '6px', padding: '10px 14px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ color: '#888', fontSize: '12px' }}>{r.locationName}</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => handleLinkReport(client.id, r.reportId)}
                    disabled={linkingReport}
                    style={{ ...btnPrimary, padding: '6px 12px', fontSize: '11px' }}
                  >
                    Link
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '12px', marginBottom: '4px' }}>CLIENT MANAGEMENT</div>
          <div style={{ color: '#F4F6F8', fontSize: '18px', fontWeight: 'bold' }}>{clients.length} Client{clients.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleExportCSV} disabled={!clients.length} style={btnGhost}>⬇ Export CSV</button>
          <button onClick={openNew} style={btnPrimary}>+ New Client</button>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: '180px' }}
          placeholder="Search by name, company, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...inputStyle, width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {error && <div style={{ background: '#FF444422', border: '1px solid #FF444466', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', color: '#FF4444', fontSize: '13px' }}>{error}</div>}

      {loading ? (
        <div style={{ color: '#888', fontSize: '13px', padding: '40px', textAlign: 'center' }}>Loading clients...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <div style={{ color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '14px', marginBottom: '8px' }}>
            {search || statusFilter !== 'all' ? 'No clients match your filter.' : 'No clients yet.'}
          </div>
          {!search && statusFilter === 'all' && (
            <div style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Add your first client to start tracking scan history and sending reports.</div>
          )}
          {!search && statusFilter === 'all' && (
            <button onClick={openNew} style={btnPrimary}>+ Add First Client</button>
          )}
        </div>
      ) : (
        <div>
          {filtered.map(c => {
            const sc = STATUS_COLORS[c.status];
            return (
              <div
                key={c.id}
                onClick={() => openDetail(c)}
                style={{
                  background: '#1A2332', borderRadius: '8px', padding: '14px 16px',
                  marginBottom: '8px', cursor: 'pointer', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '10px', border: '1px solid transparent',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0D6E7A')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                <div>
                  <div style={{ color: '#F4F6F8', fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>{c.name}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    {[c.company, c.email, c.phone].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {c.reportIds.length > 0 && (
                    <span style={{ color: '#0D6E7A', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
                      {c.reportIds.length} report{c.reportIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono, monospace' }}>
                    {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
