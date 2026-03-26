'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { getTourScript, TourStage, TOUR_LEVEL_LABELS } from '@/lib/corvusTourScript';
import { TourLevel } from '@/lib/corvusTour';

type Props = {
  level: TourLevel;
  visitorName?: string;
  onComplete?: () => void;
  inline?: boolean;
};

export default function CorvusTourPlayer({ level, visitorName, onComplete, inline = false }: Props) {
  const script = getTourScript(level, visitorName);
  const [phase, setPhase] = useState<'opening' | 'stages' | 'closing'>('opening');
  const [stageIndex, setStageIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStage: TourStage | null = phase === 'stages' ? script.stages[stageIndex] : null;

  const playAudio = useCallback(async (text: string) => {
    if (muted) return;
    try {
      const res = await fetch('/api/elevenlabs/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.replace(/["""]/g, '') }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
        setAudioPlaying(true);
      }
    } catch { /* silent */ }
  }, [muted]);

  // Opening phase
  useEffect(() => {
    if (phase !== 'opening') return;
    playAudio(script.openingLine);
    const t = setTimeout(() => {
      setPhase('stages');
      setStageIndex(0);
    }, 4500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Stage phase — auto-advance
  useEffect(() => {
    if (phase !== 'stages' || !currentStage) return;
    playAudio(currentStage.corvusLine);
    if (currentStage.duration > 0) {
      autoAdvanceRef.current = setTimeout(() => {
        advanceStage();
      }, currentStage.duration * 1000 + 1500);
    }
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stageIndex]);

  // Closing phase
  useEffect(() => {
    if (phase !== 'closing') return;
    playAudio(script.closingLine);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function advanceStage() {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (stageIndex < script.stages.length - 1) {
      setStageIndex(prev => prev + 1);
    } else {
      setPhase('closing');
    }
  }

  const wrapStyle: React.CSSProperties = inline
    ? { background: '#0D1520', borderRadius: '12px', overflow: 'hidden', width: '100%', minHeight: '500px' }
    : { position: 'fixed', inset: 0, background: '#0D1520', zIndex: 9999, display: 'flex', flexDirection: 'column' };

  return (
    <div style={wrapStyle}>
      <audio ref={audioRef} onEnded={() => setAudioPlaying(false)} style={{ display: 'none' }} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={28} height={28} />
          <span style={s.headerLabel}>CORVUS · {TOUR_LEVEL_LABELS[level].toUpperCase()}</span>
        </div>
        <div style={s.headerRight}>
          <button style={s.muteBtn} onClick={() => setMuted(m => !m)}>
            {muted ? '🔇' : '🔊'}
          </button>
          {phase === 'stages' && currentStage && (
            <span style={s.progress}>
              {stageIndex + 1} / {script.stages.length}
            </span>
          )}
          {onComplete && (
            <button style={s.closeBtn} onClick={onComplete}>✕</button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {phase === 'stages' && (
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${((stageIndex + 1) / script.stages.length) * 100}%` }} />
        </div>
      )}

      {/* Main content */}
      <div style={s.main}>

        {phase === 'opening' && (
          <div style={s.openingWrap}>
            <Image src="/corvus_still_clean.png" alt="Corvus" width={160} height={220} style={{ objectFit: 'contain', marginBottom: '1.5rem' }} />
            <div style={s.openingLine}>{script.openingLine}</div>
            <div style={s.audioIndicator}>
              {audioPlaying && <span style={s.audioDot} />}
              <span style={{ color: '#555', fontSize: '0.78rem' }}>
                {audioPlaying ? 'Corvus speaking...' : 'Loading...'}
              </span>
            </div>
          </div>
        )}

        {phase === 'stages' && currentStage && (
          <div style={s.stageWrap}>
            <div style={s.stageLeft}>
              <Image src="/corvus_still_clean.png" alt="Corvus" width={120} height={168} style={{ objectFit: 'contain' }} />
              <div style={s.stageCorvusBox}>
                <div style={s.corvusLabel}>CORVUS</div>
                <p style={s.corvusQuote}>{currentStage.corvusLine}</p>
              </div>
              {audioPlaying && (
                <div style={s.audioWave}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ ...s.wavebar, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>

            <div style={s.stageRight}>
              <div style={s.stageTitleRow}>
                <h2 style={s.stageTitle}>{currentStage.title}</h2>
              </div>
              <p style={s.stageBody}>{currentStage.bodyText}</p>

              {renderVisual(currentStage)}

              {currentStage.visualType === 'cta' && currentStage.ctaUrl && (
                <a href={currentStage.ctaUrl} style={s.ctaBtn}>
                  {currentStage.ctaText} →
                </a>
              )}

              {currentStage.visualType !== 'cta' && (
                <button style={s.nextBtn} onClick={advanceStage}>
                  {stageIndex < script.stages.length - 1 ? 'Next →' : 'Finish'}
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'closing' && (
          <div style={s.closingWrap}>
            <Image src="/corvus_still_clean.png" alt="Corvus" width={140} height={196} style={{ objectFit: 'contain', marginBottom: '1.5rem' }} />
            <p style={s.closingLine}>{script.closingLine}</p>
            <div style={s.closingActions}>
              <a href={script.ctaUrl} style={s.closingCta}>{script.ctaText} →</a>
              <a href="/pricing" style={s.closingSecondary}>See all plans</a>
              {onComplete && (
                <button style={s.closingDismiss} onClick={onComplete}>Close Tour</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderVisual(stage: TourStage) {
  const d = stage.visualData;
  if (!d) return null;

  switch (stage.visualType) {
    case 'stats':
      return (
        <div style={v.statsGrid}>
          {(d.stats as Array<{ num: string; label: string }>).map(stat => (
            <div key={stat.label} style={v.statBox}>
              <div style={v.statNum}>{stat.num}</div>
              <div style={v.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      );

    case 'scan':
      return (
        <div style={v.stepList}>
          {(d.steps as string[]).map((step, i) => (
            <div key={i} style={v.step}>
              <div style={v.stepNum}>{i + 1}</div>
              <span style={v.stepText}>{step}</span>
            </div>
          ))}
        </div>
      );

    case 'verdict':
      return (
        <div style={v.verdictBox}>
          <div style={v.verdictHeader}>
            <span style={v.verdictLabel}>CORVUS&apos; VERDICT</span>
            <span style={v.verdictClient}>{d.client as string}</span>
          </div>
          {!!d.locations && <div style={v.verdictMeta}>{d.locations as number} locations scanned</div>}
          <div style={v.findingsRow}>
            {!!d.findings && <div style={v.findingStat}><span style={{ color: '#00C2C7' }}>{d.findings as number}</span> findings</div>}
            {!!d.critical && <div style={v.findingStat}><span style={{ color: '#e05555' }}>{d.critical as number}</span> critical</div>}
          </div>
          {d.topFinding && (
            <div style={v.topFinding}>
              <div style={v.tfLabel}>TOP FINDING</div>
              <div style={v.tfText}>{d.topFinding as string}</div>
            </div>
          )}
          {d.fix && (
            <div style={v.fixBox}>
              <div style={v.fixLabel}>THE FIX</div>
              <div style={v.fixText}>{d.fix as string}</div>
            </div>
          )}
          {d.excerpt && (
            <div style={v.excerptBox}>
              <div style={v.excerptLabel}>LEVEL {d.level} EXCERPT</div>
              <div style={v.excerptText}>{d.excerpt as string}</div>
            </div>
          )}
        </div>
      );

    case 'comparison':
      if (d.level1) {
        return (
          <div style={v.comfortWrap}>
            <div style={{ ...v.comfortBox, borderColor: '#888' }}>
              <div style={v.comfortLabel}>LEVEL 1</div>
              <p style={v.comfortText}>{d.level1 as string}</p>
            </div>
            <div style={{ ...v.comfortBox, borderColor: '#00C2C7' }}>
              <div style={{ ...v.comfortLabel, color: '#00C2C7' }}>LEVEL 5</div>
              <p style={v.comfortText}>{d.level5 as string}</p>
            </div>
          </div>
        );
      }
      if (d.rows) {
        return (
          <div style={v.compareTable}>
            <div style={v.compareHeader}>
              <div style={v.compareCell} />
              <div style={{ ...v.compareCell, color: '#00C2C7', fontWeight: 700 }}>Corvus</div>
              <div style={v.compareCell}>{(d.competitorName as string) || 'Competitor'}</div>
            </div>
            {(d.rows as Array<{ label: string; corvus: string; competitor: string }>).map(row => (
              <div key={row.label} style={v.compareRow}>
                <div style={v.compareCell}>{row.label}</div>
                <div style={{ ...v.compareCell, color: row.corvus === '✓' ? '#00C2C7' : '#F4F6F8' }}>{row.corvus}</div>
                <div style={{ ...v.compareCell, color: row.competitor === '✗' ? '#e05555' : '#888' }}>{row.competitor}</div>
              </div>
            ))}
          </div>
        );
      }
      return null;

    case 'dashboard':
      if (d.features) {
        return (
          <div style={v.featureList}>
            {(d.features as string[]).map((f, i) => (
              <div key={i} style={v.featureItem}>
                <span style={v.featureCheck}>✓</span>
                <span style={v.featureText}>{f}</span>
              </div>
            ))}
          </div>
        );
      }
      if (d.tiers) {
        return (
          <div style={v.tierList}>
            {(d.tiers as Array<{ name: string; desc: string; price: string }>).map(t => (
              <div key={t.name} style={v.tierRow}>
                <span style={v.tierName}>{t.name}</span>
                <span style={v.tierDesc}>{t.desc}</span>
                <span style={v.tierPrice}>{t.price}</span>
              </div>
            ))}
          </div>
        );
      }
      return null;

    case 'character':
      return (
        <div style={v.characterBox}>
          {d.quote && <p style={v.characterQuote}>{d.quote as string}</p>}
          <div style={v.characterMeta}>
            Built on 17 years of U.S. Navy Electronic Warfare experience.
            ElevenLabs voice. Adaptive intelligence. No competitor has this.
          </div>
        </div>
      );

    default:
      return null;
  }
}

const s: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', background: '#1A2332', borderBottom: '1px solid rgba(0,194,199,0.15)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  headerLabel: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.1em' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  muteBtn: { background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer' },
  progress: { color: '#555', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.78rem' },
  closeBtn: { background: 'transparent', border: 'none', color: '#555', fontSize: '1rem', cursor: 'pointer' },
  progressBar: { height: '3px', background: '#1A2332' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #0D6E7A, #00C2C7)', transition: 'width 0.5s ease' },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflow: 'auto' },
  openingWrap: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '560px' },
  openingLine: { color: '#F4F6F8', fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem' },
  audioIndicator: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  audioDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#00C2C7', animation: 'pulse 1s infinite' },
  stageWrap: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', width: '100%', maxWidth: '900px', alignItems: 'start' },
  stageLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  stageCorvusBox: { background: '#1A2332', borderLeft: '3px solid #00C2C7', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', width: '100%' },
  corvusLabel: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', marginBottom: '0.3rem' },
  corvusQuote: { color: '#ccc', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },
  audioWave: { display: 'flex', gap: '3px', alignItems: 'flex-end', height: '20px' },
  wavebar: { width: '4px', background: '#00C2C7', borderRadius: '2px', animation: 'wave 0.8s ease-in-out infinite', height: '100%' },
  stageRight: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  stageTitleRow: { borderBottom: '1px solid rgba(0,194,199,0.15)', paddingBottom: '0.5rem' },
  stageTitle: { color: '#F4F6F8', fontSize: '1.3rem', fontWeight: 700, margin: 0 },
  stageBody: { color: '#aaa', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 },
  nextBtn: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.3)', color: '#00C2C7', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '0.5rem' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', borderRadius: '8px', padding: '13px 28px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem', alignSelf: 'flex-start' },
  closingWrap: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '520px' },
  closingLine: { color: '#F4F6F8', fontSize: '1.2rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 },
  closingActions: { display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' },
  closingCta: { display: 'block', background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', borderRadius: '8px', padding: '13px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', textAlign: 'center' },
  closingSecondary: { display: 'block', color: '#00C2C7', fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center' },
  closingDismiss: { background: 'transparent', border: 'none', color: '#555', fontSize: '0.85rem', cursor: 'pointer' },
};

const v: Record<string, React.CSSProperties> = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' },
  statBox: { background: '#0D1520', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', border: '1px solid rgba(0,194,199,0.12)' },
  statNum: { color: '#00C2C7', fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Share Tech Mono, monospace' },
  statLabel: { color: '#888', fontSize: '0.78rem', marginTop: '2px' },
  stepList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  step: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  stepNum: { width: '26px', height: '26px', borderRadius: '50%', background: '#0D6E7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 },
  stepText: { color: '#ccc', fontSize: '0.9rem' },
  verdictBox: { background: '#0D1520', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(0,194,199,0.15)', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  verdictHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  verdictLabel: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em' },
  verdictClient: { color: '#F4F6F8', fontWeight: 700, fontSize: '0.95rem' },
  verdictMeta: { color: '#888', fontSize: '0.8rem' },
  findingsRow: { display: 'flex', gap: '1rem' },
  findingStat: { color: '#888', fontSize: '0.85rem', fontFamily: 'Share Tech Mono, monospace' },
  topFinding: { background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem' },
  tfLabel: { color: '#e05555', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', marginBottom: '3px' },
  tfText: { color: '#F4F6F8', fontSize: '0.88rem' },
  fixBox: { background: 'rgba(0,194,199,0.06)', borderLeft: '3px solid #00C2C7', padding: '0.5rem 0.75rem' },
  fixLabel: { color: '#00C2C7', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', marginBottom: '3px' },
  fixText: { color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5 },
  excerptBox: { background: '#1A2332', borderLeft: '3px solid #B8922A', padding: '0.5rem 0.75rem' },
  excerptLabel: { color: '#B8922A', fontSize: '0.65rem', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.1em', marginBottom: '3px' },
  excerptText: { color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5, fontStyle: 'italic' },
  comfortWrap: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  comfortBox: { background: '#0D1520', borderRadius: '8px', padding: '0.75rem 1rem', border: '1px solid' },
  comfortLabel: { color: '#888', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: '0.3rem' },
  comfortText: { color: '#ccc', fontSize: '0.88rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' },
  compareTable: { border: '1px solid rgba(0,194,199,0.15)', borderRadius: '8px', overflow: 'hidden' },
  compareHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', background: '#0D6E7A' },
  compareRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.05)' },
  compareCell: { padding: '7px 10px', color: '#aaa', fontSize: '0.82rem', fontFamily: 'Share Tech Mono, monospace' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  featureItem: { display: 'flex', gap: '0.6rem', alignItems: 'center' },
  featureCheck: { color: '#00C2C7', fontWeight: 700, flexShrink: 0 },
  featureText: { color: '#ccc', fontSize: '0.9rem' },
  tierList: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  tierRow: { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '0.5rem', background: '#0D1520', borderRadius: '6px', padding: '7px 10px', alignItems: 'center' },
  tierName: { color: '#00C2C7', fontWeight: 700, fontSize: '0.88rem' },
  tierDesc: { color: '#888', fontSize: '0.82rem' },
  tierPrice: { color: '#B8922A', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.82rem', textAlign: 'right' },
  characterBox: { background: '#0D1520', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(184,146,42,0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  characterQuote: { color: '#ccc', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 },
  characterMeta: { color: '#666', fontSize: '0.82rem', lineHeight: 1.5 },
};
