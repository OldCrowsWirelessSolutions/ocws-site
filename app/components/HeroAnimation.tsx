'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const CORVUS_LINE = "Four problems. Two of them are embarrassing."

type Phase = 'entering' | 'landing' | 'speaking' | 'perched'

export default function HeroAnimation() {
  const [phase, setPhase] = useState<Phase>('entering')
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('landing'), 100)
    const t2 = setTimeout(() => setPhase('speaking'), 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'speaking') return
    let i = 0
    const iv = setInterval(() => {
      i++
      setTyped(CORVUS_LINE.slice(0, i))
      if (i >= CORVUS_LINE.length) {
        clearInterval(iv)
        setTimeout(() => setPhase('perched'), 1400)
      }
    }, 35)
    return () => clearInterval(iv)
  }, [phase])

  const isPerched = phase === 'perched'

  return (
    <div
      className="relative flex items-center justify-center mb-8 select-none"
      style={{ height: '120px' }}
    >
      {/* Corvus sprite */}
      <div
        style={{
          position: 'absolute',
          transition: phase === 'entering'
            ? 'none'
            : isPerched
              ? 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: phase === 'entering'
            ? 'translateX(40vw) translateY(0) scale(1)'
            : isPerched
              ? 'translateX(44vw) translateY(-44px) scale(0.45)'
              : 'translateX(0) translateY(0) scale(1)',
          opacity: phase === 'entering' ? 0 : isPerched ? 0.65 : 1,
        }}
      >
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <Image
            src="/corvus_still.png"
            alt="Corvus"
            fill
            sizes="80px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Speech bubble */}
      {(phase === 'speaking' || (phase === 'perched' && typed)) && (
        <div
          className="absolute text-sm italic px-4 py-2 rounded-xl pointer-events-none"
          style={{
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(26,35,50,0.95)',
            border: '1px solid #D8AC32',
            color: '#D8AC32',
            whiteSpace: 'nowrap',
            fontSize: '0.8rem',
            opacity: phase === 'perched' ? 0 : 1,
            transition: 'opacity 0.4s',
          }}
        >
          &ldquo;{typed}&rdquo;
        </div>
      )}
    </div>
  )
}
