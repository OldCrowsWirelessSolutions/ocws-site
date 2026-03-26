'use client'
import { useState } from 'react'
import RequestDemoModal from './RequestDemoModal'

type Props = {
  label?: string
  variant?: 'primary' | 'outline' | 'ghost'
  showShareUrl?: boolean
  className?: string
}

export default function LiveDemoButton({ label = 'Request a Live Demo', variant = 'primary', showShareUrl = false }: Props) {
  const [open, setOpen] = useState(false)

  const btnStyle: React.CSSProperties =
    variant === 'outline'
      ? { background: 'transparent', border: '1px solid rgba(0,194,199,0.4)', color: '#00C2C7', borderRadius: '8px', padding: '12px 24px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }
      : variant === 'ghost'
      ? { background: 'transparent', border: 'none', color: '#00C2C7', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }
      : { background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px 28px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }

  return (
    <>
      <button style={btnStyle} onClick={() => setOpen(true)}>
        {label}
      </button>
      {showShareUrl && (
        <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.5rem', fontFamily: 'Share Tech Mono, monospace' }}>
          oldcrowswireless.com/corvus-demo
        </p>
      )}
      {open && <RequestDemoModal onClose={() => setOpen(false)} />}
    </>
  )
}
