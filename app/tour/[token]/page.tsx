'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CorvusTourPlayer from '@/app/components/CorvusTourPlayer';
import { TourLevel } from '@/lib/corvusTour';
import Image from 'next/image';

type TourData = {
  token: string;
  level: TourLevel;
  visitorName?: string;
  expiresAt: number;
};

export default function TourPage() {
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [reason, setReason] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/tour/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setTourData(data.tour);
          setStatus('valid');
        } else {
          setReason(data.reason || 'Invalid tour link.');
          setStatus('invalid');
        }
      })
      .catch(() => {
        setReason('Unable to load tour. Check your connection.');
        setStatus('invalid');
      });
  }, [token]);

  if (status === 'loading') return (
    <div style={s.page}>
      <div style={s.center}>
        <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={72} height={72} />
        <p style={s.loadingText}>Preparing your tour...</p>
      </div>
    </div>
  );

  if (status === 'invalid') return (
    <div style={s.page}>
      <div style={s.center}>
        <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" width={72} height={72} />
        <h2 style={s.errorTitle}>Tour Unavailable</h2>
        <p style={s.errorSub}>{reason}</p>
        <a href="/" style={s.homeLink}>Return to oldcrowswireless.com →</a>
      </div>
    </div>
  );

  if (started && tourData) {
    return (
      <CorvusTourPlayer
        level={tourData.level}
        visitorName={tourData.visitorName}
        onComplete={() => setStarted(false)}
        inline={false}
      />
    );
  }

  const name = tourData?.visitorName?.split(' ')[0];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Image src="/corvus_still_clean.png" alt="Corvus" width={100} height={140} style={{ objectFit: 'contain' }} />
        <div style={s.badge}>CORVUS · PERSONAL TOUR</div>
        <h1 style={s.title}>
          {name ? `${name}, Corvus is ready for you.` : 'Corvus is ready for you.'}
        </h1>
        <p style={s.sub}>
          An AI-powered walkthrough of exactly what Corvus does — personalized, voiced, and built for you.
        </p>
        <div style={s.levelBadge}>
          {getLevelLabel(tourData!.level)}
        </div>
        <button style={s.startBtn} onClick={() => setStarted(true)}>
          Begin Tour →
        </button>
        <p style={s.fine}>
          Powered by Old Crows Wireless Solutions · oldcrowswireless.com
        </p>
      </div>
    </div>
  );
}

function getLevelLabel(level: TourLevel) {
  const labels: Record<string, string> = {
    nest: '🪺 Homeowner Tour',
    flock: '🐦‍⬛ MSP / IT Tour',
    murder: '💀 RF Engineer Tour',
    full: '🦅 Full Platform Tour',
    verdict: "📄 Corvus' Verdict Deep Dive",
    reckoning: '🗺️ Full Reckoning Deep Dive',
    compare: '⚔️ Competitive Comparison',
  };
  return labels[level] || 'Corvus Tour';
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0D1520', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  center: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  card: { background: '#1A2332', border: '1px solid rgba(0,194,199,0.2)', borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '460px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  badge: { color: '#00C2C7', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.15em' },
  title: { color: '#F4F6F8', fontSize: '1.35rem', fontWeight: 700, margin: 0, lineHeight: 1.3 },
  sub: { color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 },
  levelBadge: { background: 'rgba(0,194,199,0.1)', border: '1px solid rgba(0,194,199,0.25)', borderRadius: '20px', padding: '5px 16px', color: '#00C2C7', fontSize: '0.88rem' },
  startBtn: { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 36px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '0.5rem' },
  fine: { color: '#555', fontSize: '0.75rem', margin: 0 },
  loadingText: { color: '#888', fontSize: '0.9rem' },
  errorTitle: { color: '#e05555', fontSize: '1.3rem', fontWeight: 700, margin: 0 },
  errorSub: { color: '#888', fontSize: '0.9rem' },
  homeLink: { color: '#00C2C7', fontSize: '0.9rem', textDecoration: 'none' },
};
