'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface Props {
  tip: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

export default function CorvusTooltip({ tip, position = 'top', children }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  const offsetMap = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  };

  const arrowMap = {
    top: { bottom: '-5px', left: '50%', transform: 'translateX(-50%)', borderTop: '5px solid #0D6E7A', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' },
    bottom: { top: '-5px', left: '50%', transform: 'translateX(-50%)', borderBottom: '5px solid #0D6E7A', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' },
    left: { right: '-5px', top: '50%', transform: 'translateY(-50%)', borderLeft: '5px solid #0D6E7A', borderTop: '5px solid transparent', borderBottom: '5px solid transparent' },
    right: { left: '-5px', top: '50%', transform: 'translateY(-50%)', borderRight: '5px solid #0D6E7A', borderTop: '5px solid transparent', borderBottom: '5px solid transparent' },
  };

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible(v => !v)}
    >
      {children}

      {visible && (
        <div style={{
          position: 'absolute', zIndex: 1000, pointerEvents: 'none',
          ...offsetMap[position],
        }}>
          <div style={{
            background: '#0D6E7A', color: '#F4F6F8', fontSize: '12px',
            padding: '8px 12px', borderRadius: '6px',
            maxWidth: '240px', whiteSpace: 'normal' as any, lineHeight: 1.5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            fontFamily: 'Share Tech Mono, monospace',
          }}>
            <span style={{ color: '#00C2C7', marginRight: '4px' }}>▸</span>
            {tip}
          </div>
          <div style={{ position: 'absolute', width: 0, height: 0, ...arrowMap[position] }} />
        </div>
      )}
    </div>
  );
}
