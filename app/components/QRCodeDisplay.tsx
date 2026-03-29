'use client';
import { useEffect, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  url: string;
  label?: string;
  size?: number;
}

export default function QRCodeDisplay({ url, label, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current!, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#0D1520',
          light: '#F4F6F8',
        },
      }, (err) => {
        if (err) { setError(true); return; }
        setReady(true);
      });
    }).catch(() => setError(true));
  }, [url, size]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `corvus-qr-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  if (error) return (
    <div style={{ color: '#E05555', fontSize: '0.75rem', fontFamily: 'monospace' }}>
      QR generation failed — copy URL manually
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {label && (
        <div style={{ color: '#00C2C7', fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}
      <div style={{
        background: '#F4F6F8',
        borderRadius: 8,
        padding: 8,
        border: '2px solid rgba(0,194,199,0.4)',
        opacity: ready ? 1 : 0.3,
        transition: 'opacity 0.3s',
      }}>
        <canvas ref={canvasRef} />
      </div>
      {ready && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleDownload}
            style={{ background: '#0D6E7A', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 14px', fontSize: '0.72rem', fontFamily: 'monospace', cursor: 'pointer', fontWeight: 700 }}>
            ↓ Download PNG
          </button>
          <button onClick={() => navigator.clipboard.writeText(url)}
            style={{ background: 'rgba(0,194,199,0.1)', border: '1px solid rgba(0,194,199,0.3)', borderRadius: 6, color: '#00C2C7', padding: '6px 14px', fontSize: '0.72rem', fontFamily: 'monospace', cursor: 'pointer' }}>
            Copy URL
          </button>
        </div>
      )}
      {ready && (
        <div style={{ color: '#7A9AAB', fontSize: '0.6rem', fontFamily: 'monospace', maxWidth: size, wordBreak: 'break-all', textAlign: 'center' }}>
          {url}
        </div>
      )}
    </div>
  );
}
