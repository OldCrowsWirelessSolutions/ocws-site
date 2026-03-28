'use client';
import { useState } from 'react';
import CorvusTourPlayer from './CorvusTourPlayer';
import { TourLevel } from '@/lib/corvusTour';
import { TOUR_LEVEL_LABELS, TOUR_LEVEL_DURATIONS } from '@/lib/corvusTourScript';
import { unlockAudio } from '@/lib/corvusAudio';

type Props = {
  authKey: string;
  isAdmin?: boolean;
};

export default function CorvusTourManager({ authKey, isAdmin = false }: Props) {
  const [playLevel, setPlayLevel] = useState<TourLevel>('full');
  const [playName, setPlayName] = useState('');
  const [playing, setPlaying] = useState(false);

  const [shareLevel, setShareLevel] = useState<TourLevel>('nest');
  const [shareName, setShareName] = useState('');
  const [shareLabel, setShareLabel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ url: string; token: string; level: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [genError, setGenError] = useState('');

  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const tourLevels = Object.keys(TOUR_LEVEL_LABELS) as TourLevel[];

  async function handleShare() {
    setGenerating(true);
    setGenerated(null);
    setGenError('');
    const nameSnapshot = shareName;
    try {
      const res = await fetch('/api/tour/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authKey,
          level: shareLevel,
          visitorName: shareName || undefined,
          label: shareLabel || (shareName ? `Tour for ${shareName}` : 'Shared tour'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerated({ url: data.url, token: data.token, level: data.level, name: nameSnapshot });
        setShareName('');
        setShareLabel('');
        setShowEmailInput(false);
        setSent(false);
        setEmailTo('');
      } else {
        setGenError(data.error || 'Failed to generate link. Check auth key or Redis connection.');
      }
    } catch {
      setGenError('Network error — could not reach the server.');
    }
    setGenerating(false);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendEmail(url: string) {
    if (!emailTo) {
      setShowEmailInput(true);
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/tour/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authKey,
          toEmail: emailTo,
          toName: generated?.name || undefined,
          tourUrl: url,
          tourLevel: generated?.level ?? shareLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setEmailTo('');
        setShowEmailInput(false);
        setTimeout(() => setSent(false), 4000);
      } else {
        setGenError(data.error || 'Failed to send email.');
      }
    } catch {
      setGenError('Network error — could not send email.');
    }
    setSending(false);
  }

  return (
    <>
      {playing && (
        <CorvusTourPlayer
          level={playLevel}
          visitorName={playName || undefined}
          onComplete={() => setPlaying(false)}
          inline={false}
        />
      )}

      <div style={s.wrap}>
        <h3 style={s.heading}>🎬 Corvus Tour</h3>

        {/* PLAY SECTION */}
        <div style={s.section}>
          <div style={s.sectionLabel}>PLAY ON THIS DEVICE</div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Tour Level</label>
              <select style={s.select} value={playLevel} onChange={e => setPlayLevel(e.target.value as TourLevel)}>
                {tourLevels.map(l => (
                  <option key={l} value={l}>{TOUR_LEVEL_LABELS[l]} · {TOUR_LEVEL_DURATIONS[l]}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Viewer Name (optional)</label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Nathanael"
                value={playName}
                onChange={e => setPlayName(e.target.value)}
              />
            </div>
          </div>
          <button style={s.playBtn} onClick={() => { unlockAudio(); setPlaying(true); }}>
            ▶ Play Tour Now
          </button>
          <p style={s.playHint}>Launches fullscreen on this device instantly. Hand it to them.</p>
        </div>

        <div style={s.divider} />

        {/* SHARE SECTION */}
        <div style={s.section}>
          <div style={s.sectionLabel}>GENERATE SHAREABLE LINK</div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Tour Level</label>
              <select style={s.select} value={shareLevel} onChange={e => setShareLevel(e.target.value as TourLevel)}>
                {tourLevels.map(l => (
                  <option key={l} value={l}>{TOUR_LEVEL_LABELS[l]}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Recipient Name (optional)</label>
              <input
                style={s.input}
                type="text"
                placeholder='e.g. "Nathanael Farrelly"'
                value={shareName}
                onChange={e => setShareName(e.target.value)}
              />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Label (optional)</label>
            <input
              style={s.input}
              type="text"
              placeholder='e.g. "AfroTech contact"'
              value={shareLabel}
              onChange={e => setShareLabel(e.target.value)}
            />
          </div>
          <button style={s.shareBtn} onClick={handleShare} disabled={generating}>
            {generating ? 'Generating...' : '🔗 Generate Tour Link'}
          </button>

          {genError && (
            <div style={s.errorBox}>
              <span style={{ color: '#e05555', fontSize: '0.82rem' }}>⚠ {genError}</span>
            </div>
          )}

          {generated && (
            <div style={s.result}>
              <p style={s.resultLabel}>✓ Tour Link Ready</p>
              <div style={s.urlRow}>
                <input
                  style={s.urlInput}
                  type="text"
                  readOnly
                  value={generated.url}
                  onFocus={e => e.target.select()}
                />
                <button style={s.copyBtn} onClick={() => copyUrl(generated.url)}>
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>

              {!showEmailInput && !sent && (
                <button style={s.emailBtn} onClick={() => setShowEmailInput(true)}>
                  📧 Send as Email
                </button>
              )}

              {showEmailInput && (
                <div style={s.emailRow}>
                  <input
                    style={s.emailInput}
                    type="email"
                    placeholder="recipient@email.com"
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendEmail(generated.url)}
                    autoFocus
                  />
                  <button
                    style={s.sendBtn}
                    onClick={() => handleSendEmail(generated.url)}
                    disabled={sending || !emailTo}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    style={s.cancelEmailBtn}
                    onClick={() => { setShowEmailInput(false); setEmailTo(''); }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {sent && (
                <p style={s.sentConfirm}>✓ Email sent with clickable tour link</p>
              )}

              <p style={s.resultMeta}>
                {generated.level} tour · Expires in 7 days ·{' '}
                {generated.name ? `Personalized for ${generated.name}` : 'No name set'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { background: '#1A2332', borderRadius: '12px', padding: '1.5rem', color: '#F4F6F8' },
  heading: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '1rem', margin: '0 0 1.25rem' },
  section: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  sectionLabel: { color: '#555', fontSize: '0.72rem', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.75rem', color: '#888', fontFamily: 'Share Tech Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', color: '#F4F6F8', padding: '8px 10px', fontSize: '0.85rem' },
  input: { background: '#0D1520', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '6px', color: '#F4F6F8', padding: '8px 10px', fontSize: '0.85rem' },
  playBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' },
  playHint: { color: '#555', fontSize: '0.78rem', margin: 0, fontStyle: 'italic' },
  divider: { height: '1px', background: 'rgba(0,194,199,0.1)', margin: '1rem 0' },
  shareBtn: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.35)', color: '#00C2C7', borderRadius: '8px', padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' },
  errorBox: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: '8px', padding: '0.6rem 0.85rem' },
  result: { background: 'rgba(0,194,199,0.07)', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  resultLabel: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.78rem', margin: 0 },
  urlRow: { display: 'flex', gap: '0.4rem' },
  urlInput: { flex: 1, background: '#0D1520', border: '1px solid rgba(0,194,199,0.3)', borderRadius: '6px', color: '#F4F6F8', padding: '9px 12px', fontSize: '0.82rem', fontFamily: 'monospace', cursor: 'text' },
  copyBtn: { background: '#0D6E7A', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  emailBtn: { background: 'rgba(184,146,42,0.12)', border: '1px solid rgba(184,146,42,0.3)', color: '#B8922A', borderRadius: '6px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' },
  emailRow: { display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' },
  emailInput: { flex: 1, background: '#0D1520', border: '1px solid rgba(0,194,199,0.25)', borderRadius: '6px', color: '#F4F6F8', padding: '6px 10px', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', minWidth: '180px' },
  sendBtn: { background: '#0D6E7A', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
  cancelEmailBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.85rem', cursor: 'pointer', padding: '4px' },
  sentConfirm: { color: '#00C2C7', fontSize: '0.78rem', fontFamily: 'Share Tech Mono, monospace', margin: 0 },
  resultMeta: { color: '#555', fontSize: '0.75rem', margin: 0, fontFamily: 'Share Tech Mono, monospace' },
};
