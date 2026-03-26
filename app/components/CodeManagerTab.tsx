'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

type Role = 'admin' | 'vip' | 'team_lead';

type CodeEntry = {
  code: string;
  type: string;
  tier?: string;
  name?: string;
  email?: string;
  status: string;
  useCount: number;
  expiresAt?: number;
  createdAt: number;
  notes?: string;
  discountPct?: number;
  credits?: number | null;
  lastActiveAt?: number;
};

type ScanRecord = {
  id: string;
  product: string;
  client?: string;
  createdAt: number;
  findings?: number;
  critical?: number;
  severity?: string;
  reportId?: string;
};

type LifetimeStats = {
  totalScans: number;
  verdicts: number;
  reckonings: number;
  proReports: number;
  creditsConsumed: number;
  creditsPurchased: number;
  creditsGifted: number;
  creditsRefunded: number;
  lastScanAt?: number;
};

type SubscriberProfile = {
  code: string;
  name?: string;
  email?: string;
  tier: string;
  status: string;
  credits: number | null;
  maxCredits: number | null;
  unlimitedCredits?: boolean;
  createdAt: number;
  lastActiveAt?: number;
  notes?: string;
};

type Props = {
  authKey: string;
  role: Role;
};

const TYPE_COLORS: Record<string, string> = {
  vip: '#B8922A',
  subscriber: '#00C2C7',
  demo: '#0D6E7A',
  tour: '#0D6E7A',
  promo: '#888',
  military: '#888',
  subordinate: '#555',
  team_lead: '#B8922A',
};

const TIER_COLORS: Record<string, string> = {
  nest: '#0D6E7A',
  flock: '#00C2C7',
  murder: '#B8922A',
  vip: '#B8922A',
  team_lead: '#00C2C7',
};

export default function CodeManagerTab({ authKey, role }: Props) {
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [profile, setProfile] = useState<SubscriberProfile | null>(null);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lifetime, setLifetime] = useState<LifetimeStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [creditView, setCreditView] = useState<'current' | 'lifetime'>('current');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [addingCredits, setAddingCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState(1);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCodes = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch('/api/code-manager/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, query: q }),
      });
      const data = await res.json();
      if (data.codes) setCodes(data.codes);
    } catch { /* silent */ }
    setLoading(false);
  }, [authKey]);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => loadCodes(query), 250);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [query, loadCodes]);

  async function loadProfile(code: string) {
    setSelectedCode(code);
    setProfileLoading(true);
    setProfile(null);
    setScans([]);
    setLifetime(null);
    setNotes('');
    setCreditView('current');
    setShowAddCredits(false);
    try {
      const res = await fetch('/api/code-manager/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authKey, action: 'lookup', code }),
      });
      const data = await res.json();
      if (data.found) {
        setProfile(data.subscriber);
        setScans(data.scans || []);
        setLifetime(data.lifetime || null);
        setNotes(data.subscriber.notes || '');
      }
    } catch { /* silent */ }
    setProfileLoading(false);
  }

  async function saveNotes() {
    if (!selectedCode || role !== 'admin') return;
    setSavingNotes(true);
    await fetch('/api/code-manager/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authKey, action: 'update_notes', code: selectedCode, notes }),
    });
    setSavingNotes(false);
  }

  async function handleAddCredits() {
    if (!selectedCode || role !== 'admin') return;
    setAddingCredits(true);
    await fetch('/api/code-manager/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authKey, action: 'add_credits', code: selectedCode, credits: creditAmount }),
    });
    setAddingCredits(false);
    setShowAddCredits(false);
    loadProfile(selectedCode);
    loadCodes(query);
  }

  function formatDate(ts?: number) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderCreditBadge(sub: SubscriberProfile) {
    if (sub.unlimitedCredits) {
      return (
        <div style={s.creditBadge}>
          <span style={{ color: '#B8922A', fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>∞</span>
          <span style={s.creditBadgeLabel}>UNLIMITED</span>
        </div>
      );
    }
    const pct = sub.maxCredits ? ((sub.credits || 0) / sub.maxCredits) * 100 : 0;
    const color = (sub.credits || 0) === 0 ? '#E05555' : (sub.credits || 0) <= 2 ? '#B8922A' : '#00C2C7';
    return (
      <div style={s.creditBadge}>
        <span style={{ color, fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>{sub.credits ?? 0}</span>
        <span style={s.creditBadgeLabel}>/ {sub.maxCredits ?? '—'} credits</span>
        <div style={s.creditBar}>
          <div style={{ ...s.creditBarFill, width: `${pct}%`, background: color }} />
        </div>
      </div>
    );
  }

  function renderLifetimeStats(lt: LifetimeStats) {
    const rows = [
      { label: 'Total Scans', value: lt.totalScans, color: '#00C2C7' },
      { label: 'Verdicts Run', value: lt.verdicts, color: '#00C2C7' },
      { label: 'Reckonings Run', value: lt.reckonings, color: '#B8922A' },
      { label: 'Pro Reports', value: lt.proReports, color: '#B8922A' },
      { label: 'Credits Consumed', value: lt.creditsConsumed, color: '#888' },
      { label: 'Credits Purchased', value: lt.creditsPurchased, color: '#0D6E7A' },
      { label: 'Credits Gifted', value: lt.creditsGifted, color: '#0D6E7A' },
      { label: 'Credits Refunded', value: lt.creditsRefunded, color: '#888' },
    ];
    return (
      <div style={s.lifetimeGrid}>
        {rows.map(r => (
          <div key={r.label} style={s.lifetimeStat}>
            <div style={{ ...s.lifetimeNum, color: r.color }}>{r.value}</div>
            <div style={s.lifetimeLabel}>{r.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      {/* Left panel — scrolling list */}
      <div style={s.leftPanel}>
        <div style={s.searchWrap}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search by code or email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button style={s.clearBtn} onClick={() => setQuery('')}>✕</button>
          )}
        </div>

        <div style={s.statsBar}>
          <span style={s.statsText}>{loading ? 'Loading...' : `${codes.length} ${codes.length === 1 ? 'entry' : 'entries'}`}</span>
          <button style={s.refreshBtn} onClick={() => loadCodes(query)}>↻</button>
        </div>

        <div style={s.list}>
          {codes.length === 0 && !loading ? (
            <p style={s.emptyMsg}>{query ? 'No results found.' : 'No codes yet.'}</p>
          ) : (
            codes.map(entry => (
              <div
                key={entry.code}
                style={{
                  ...s.row,
                  background: selectedCode === entry.code ? 'rgba(0,194,199,0.08)' : '#0D1520',
                  borderColor: selectedCode === entry.code ? '#00C2C7' : 'transparent',
                }}
                onClick={() => loadProfile(entry.code)}
              >
                <div style={{
                  ...s.statusDot,
                  background: entry.status === 'active' ? '#00C2C7' : entry.status === 'expired' ? '#555' : '#E05555',
                }} />

                <div style={s.rowMain}>
                  <div style={s.rowTop}>
                    <span style={s.rowCode}>{entry.code}</span>
                    <span style={{
                      ...s.typeBadge,
                      color: TYPE_COLORS[entry.type] || '#888',
                      borderColor: (TYPE_COLORS[entry.type] || '#888') + '40',
                    }}>
                      {entry.type}
                    </span>
                  </div>
                  <div style={s.rowBottom}>
                    {entry.name && <span style={s.rowName}>{entry.name}</span>}
                    {entry.email && <span style={s.rowEmail}>{entry.email}</span>}
                    {!entry.name && !entry.email && <span style={s.rowEmail}>—</span>}
                  </div>
                </div>

                <div style={s.rowRight}>
                  {entry.tier && (
                    <span style={{ ...s.tierChip, color: TIER_COLORS[entry.tier] || '#888' }}>
                      {entry.tier}
                    </span>
                  )}
                  <span style={s.rowCredits}>
                    {entry.credits === null || entry.credits === Infinity
                      ? <span style={{ color: '#B8922A', fontWeight: 900 }}>∞</span>
                      : entry.credits ?? '—'}
                  </span>
                  {entry.discountPct && (
                    <span style={s.discountChip}>{entry.discountPct}% off</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel — profile */}
      <div style={s.rightPanel}>
        {!selectedCode ? (
          <div style={s.emptyProfile}>
            <div style={s.emptyIcon}>👁</div>
            <p style={s.emptyProfileText}>Select a code from the list to view the full profile.</p>
          </div>
        ) : profileLoading ? (
          <div style={s.emptyProfile}>
            <p style={s.emptyProfileText}>Loading profile...</p>
          </div>
        ) : !profile ? (
          <div style={s.emptyProfile}>
            <p style={s.emptyProfileText}>No profile data found for this code.</p>
          </div>
        ) : (
          <div style={s.profile}>
            <div style={s.profileHeader}>
              <div style={s.profileHeaderLeft}>
                <div style={s.profileName}>{profile.name || profile.code}</div>
                {profile.email && <div style={s.profileEmail}>{profile.email}</div>}
                <div style={s.profileMeta}>
                  <span style={{ ...s.tierChip, color: TIER_COLORS[profile.tier] || '#888' }}>{profile.tier}</span>
                  <span style={{ ...s.typeBadge, color: profile.status === 'active' ? '#00C2C7' : '#E05555', borderColor: 'rgba(0,194,199,0.2)' }}>{profile.status}</span>
                  <span style={s.profileSince}>since {formatDate(profile.createdAt)}</span>
                </div>
              </div>
              {renderCreditBadge(profile)}
            </div>

            <div style={s.creditToggleRow}>
              <div style={s.creditToggle}>
                <button
                  style={{ ...s.toggleBtn, ...(creditView === 'current' ? s.toggleActive : {}) }}
                  onClick={() => setCreditView('current')}
                >
                  Current Credits
                </button>
                <button
                  style={{ ...s.toggleBtn, ...(creditView === 'lifetime' ? s.toggleActive : {}) }}
                  onClick={() => setCreditView('lifetime')}
                >
                  Lifetime Stats
                </button>
              </div>
              {role === 'admin' && !profile.unlimitedCredits && (
                <button style={s.addCreditsBtn} onClick={() => setShowAddCredits(v => !v)}>
                  + Add Credits
                </button>
              )}
            </div>

            {showAddCredits && role === 'admin' && (
              <div style={s.addCreditsPanel}>
                <input
                  style={s.creditInput}
                  type="number"
                  min={1}
                  max={100}
                  value={creditAmount}
                  onChange={e => setCreditAmount(Number(e.target.value))}
                />
                <button style={s.confirmCreditsBtn} onClick={handleAddCredits} disabled={addingCredits}>
                  {addingCredits ? 'Adding...' : `Add ${creditAmount} Credit${creditAmount !== 1 ? 's' : ''}`}
                </button>
                <button style={s.cancelBtn} onClick={() => setShowAddCredits(false)}>Cancel</button>
              </div>
            )}

            {creditView === 'lifetime' && lifetime ? (
              renderLifetimeStats(lifetime)
            ) : creditView === 'current' ? (
              <div style={s.currentCreditsBox}>
                <div style={s.currentRow}>
                  <span style={s.currentLabel}>Available Verdicts</span>
                  <span style={s.currentVal}>
                    {profile.unlimitedCredits
                      ? <span style={{ color: '#B8922A', fontWeight: 900 }}>∞</span>
                      : profile.credits ?? 0}
                  </span>
                </div>
                <div style={s.currentRow}>
                  <span style={s.currentLabel}>Available Reckonings</span>
                  <span style={s.currentVal}>
                    {profile.unlimitedCredits
                      ? <span style={{ color: '#B8922A', fontWeight: 900 }}>∞</span>
                      : profile.tier === 'flock' || profile.tier === 'murder'
                      ? profile.credits ?? 0
                      : '✗'}
                  </span>
                </div>
                <div style={s.currentRow}>
                  <span style={s.currentLabel}>Last Active</span>
                  <span style={s.currentVal}>{formatDate(profile.lastActiveAt)}</span>
                </div>
                {lifetime && (
                  <div style={s.currentRow}>
                    <span style={s.currentLabel}>Last Scan</span>
                    <span style={s.currentVal}>{formatDate(lifetime.lastScanAt)}</span>
                  </div>
                )}
              </div>
            ) : null}

            <div style={s.scanSection}>
              <div style={s.scanSectionLabel}>SCAN HISTORY</div>
              {scans.length === 0 ? (
                <p style={s.noScans}>No scans run yet.</p>
              ) : (
                <div style={s.scanList}>
                  {scans.map(scan => (
                    <div key={scan.id} style={s.scanRow}>
                      <div style={s.scanLeft}>
                        <span style={{
                          ...s.productChip,
                          color: scan.product === 'verdict' ? '#00C2C7' : scan.product === 'reckoning' ? '#B8922A' : '#888',
                        }}>
                          {scan.product}
                        </span>
                        <div>
                          <div style={s.scanClient}>{scan.client || 'Unnamed scan'}</div>
                          <div style={s.scanDate}>{formatDate(scan.createdAt)}</div>
                        </div>
                      </div>
                      <div style={s.scanRight}>
                        {scan.findings !== undefined && (
                          <span style={s.scanFindings}>
                            {scan.findings} finding{scan.findings !== 1 ? 's' : ''}
                            {scan.critical ? <span style={{ color: '#E05555' }}> · {scan.critical} critical</span> : ''}
                          </span>
                        )}
                        {scan.reportId && (
                          <a href={`/reports/${scan.reportId}`} style={s.reportLink} target="_blank" rel="noopener noreferrer">
                            View →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {role === 'admin' && (
              <div style={s.notesSection}>
                <div style={s.scanSectionLabel}>NOTES</div>
                <textarea
                  style={s.notesInput}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this subscriber..."
                  rows={3}
                />
                <button style={s.saveNotesBtn} onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            )}

            <div style={s.codeFooter}>
              <span style={s.codeFooterLabel}>CODE</span>
              <span style={s.codeFooterValue}>{profile.code}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem', height: '600px', color: '#F4F6F8' },

  leftPanel: { display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#1A2332', borderRadius: '12px', overflow: 'hidden' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem', borderBottom: '1px solid rgba(0,194,199,0.1)', position: 'relative' },
  searchInput: { flex: 1, background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', color: '#F4F6F8', padding: '8px 10px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' },
  clearBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.85rem', cursor: 'pointer', padding: '4px' },
  statsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.75rem' },
  statsText: { color: '#555', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace' },
  refreshBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.85rem', cursor: 'pointer' },
  list: { flex: 1, overflowY: 'auto', padding: '0 0.4rem 0.4rem' },
  emptyMsg: { color: '#555', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center' },

  row: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '3px', border: '1px solid', transition: 'background 0.15s, border-color 0.15s' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  rowMain: { flex: 1, minWidth: 0 },
  rowTop: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' },
  rowCode: { color: '#B8922A', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' },
  typeBadge: { fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace', border: '1px solid', borderRadius: '8px', padding: '1px 6px', flexShrink: 0 },
  rowBottom: { display: 'flex', gap: '0.4rem', overflow: 'hidden' },
  rowName: { color: '#ccc', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowEmail: { color: '#555', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 },
  tierChip: { fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' },
  rowCredits: { color: '#888', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem' },
  discountChip: { color: '#00C2C7', fontSize: '0.62rem', fontFamily: 'Share Tech Mono, monospace' },

  rightPanel: { background: '#1A2332', borderRadius: '12px', overflow: 'auto' },
  emptyProfile: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem' },
  emptyIcon: { fontSize: '2.5rem', opacity: 0.3 },
  emptyProfileText: { color: '#555', fontSize: '0.88rem', textAlign: 'center' },

  profile: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  profileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,194,199,0.1)' },
  profileHeaderLeft: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  profileName: { color: '#F4F6F8', fontSize: '1.15rem', fontWeight: 700 },
  profileEmail: { color: '#888', fontSize: '0.85rem' },
  profileMeta: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  profileSince: { color: '#555', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace' },

  creditBadge: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', background: '#0D1520', borderRadius: '10px', padding: '0.6rem 0.9rem', border: '1px solid rgba(0,194,199,0.12)' },
  creditBadgeLabel: { color: '#555', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.08em' },
  creditBar: { width: '80px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' },
  creditBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.4s ease' },

  creditToggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  creditToggle: { display: 'flex', background: '#0D1520', borderRadius: '8px', padding: '3px', gap: '2px' },
  toggleBtn: { background: 'transparent', border: 'none', color: '#888', borderRadius: '6px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' },
  toggleActive: { background: '#1A2332', color: '#00C2C7' },
  addCreditsBtn: { background: 'rgba(0,194,199,0.1)', border: '1px solid rgba(0,194,199,0.25)', color: '#00C2C7', borderRadius: '6px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer' },

  addCreditsPanel: { display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#0D1520', borderRadius: '8px', padding: '0.6rem 0.75rem' },
  creditInput: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', color: '#F4F6F8', padding: '5px 8px', fontSize: '0.88rem', width: '60px' },
  confirmCreditsBtn: { background: '#0D6E7A', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.8rem', cursor: 'pointer' },

  currentCreditsBox: { background: '#0D1520', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  currentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  currentLabel: { color: '#888', fontSize: '0.82rem' },
  currentVal: { color: '#F4F6F8', fontSize: '0.88rem', fontFamily: 'Share Tech Mono, monospace' },

  lifetimeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' },
  lifetimeStat: { background: '#0D1520', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', border: '1px solid rgba(0,194,199,0.08)' },
  lifetimeNum: { fontSize: '1.35rem', fontWeight: 900, fontFamily: 'Share Tech Mono, monospace', lineHeight: 1 },
  lifetimeLabel: { color: '#555', fontSize: '0.68rem', marginTop: '3px', lineHeight: 1.3 },

  scanSection: {},
  scanSectionLabel: { color: '#555', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem' },
  noScans: { color: '#555', fontSize: '0.82rem', fontStyle: 'italic' },
  scanList: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' },
  scanRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D1520', borderRadius: '6px', padding: '7px 10px' },
  scanLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  productChip: { fontFamily: 'Share Tech Mono, monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 },
  scanClient: { color: '#ccc', fontSize: '0.82rem' },
  scanDate: { color: '#555', fontSize: '0.72rem' },
  scanRight: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  scanFindings: { color: '#888', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace' },
  reportLink: { color: '#00C2C7', fontSize: '0.75rem', textDecoration: 'none' },

  notesSection: {},
  notesInput: { width: '100%', background: '#0D1520', border: '1px solid rgba(0,194,199,0.15)', borderRadius: '6px', color: '#F4F6F8', padding: '8px 10px', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '0.4rem' },
  saveNotesBtn: { background: '#0D6E7A', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 },

  codeFooter: { display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' },
  codeFooterLabel: { color: '#555', fontSize: '0.68rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' },
  codeFooterValue: { color: '#B8922A', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.82rem' },
};
