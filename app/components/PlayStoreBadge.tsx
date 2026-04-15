'use client'

// Reusable Play Store + iOS Coming Soon badges — interactive (requires client)

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 3.27L12.73 12L2 20.73V3.27Z" fill="#4285F4" />
      <path d="M2 3.27L16.5 7.5L12.73 12L2 3.27Z" fill="#EA4335" />
      <path d="M2 20.73L12.73 12L16.5 16.5L2 20.73Z" fill="#FBBC04" />
      <path d="M16.5 7.5L22 12L16.5 16.5L12.73 12L16.5 7.5Z" fill="#34A853" />
    </svg>
  )
}

export function PlayStoreBadge({ href, size = 'lg' }: { href: string; size?: 'lg' | 'sm' }) {
  const padding = size === 'lg' ? '12px 24px' : '9px 18px'
  const iconSize = size === 'lg' ? 24 : 20
  const titleSize = size === 'lg' ? '11px' : '9px'
  const nameSize = size === 'lg' ? '20px' : '16px'
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        background: '#000',
        color: '#fff',
        borderRadius: '10px',
        padding,
        border: '1px solid rgba(255,255,255,0.2)',
        textDecoration: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={e => {
        const el = e.currentTarget
        el.style.borderColor = '#00C2C7'
        el.style.boxShadow = '0 0 16px rgba(0,194,199,0.25)'
      }}
      onMouseOut={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(255,255,255,0.2)'
        el.style.boxShadow = 'none'
      }}
    >
      <PlayIcon size={iconSize} />
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontSize: titleSize, letterSpacing: '0.08em', opacity: 0.75 }}>GET IT ON</div>
        <div style={{ fontSize: nameSize, fontWeight: 600 }}>Google Play</div>
      </div>
    </a>
  )
}

export function IOSBadge({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const padding = size === 'lg' ? '12px 24px' : '9px 18px'
  const nameSize = size === 'lg' ? '18px' : '14px'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.35)',
        borderRadius: '10px',
        padding,
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'not-allowed',
        userSelect: 'none',
      }}
      title="iOS app coming soon"
    >
      <svg width={size === 'lg' ? 22 : 18} height={size === 'lg' ? 26 : 22} viewBox="0 0 22 26" fill="none">
        <path
          d="M18.5 13.8C18.5 11.1 20 9.6 21 8.9C19.9 7.2 18.1 6.2 16.2 6.1C14.2 5.9 12.3 7.2 11.3 7.2C10.3 7.2 8.6 6.1 7 6.1C4.8 6.2 2.7 7.4 1.6 9.3C-0.7 13.2 1 18.9 3.2 22C4.3 23.6 5.6 25.3 7.3 25.2C8.9 25.2 9.6 24.2 11.5 24.2C13.4 24.2 14 25.2 15.8 25.2C17.5 25.2 18.6 23.6 19.7 22C20.5 20.9 21.1 19.6 21.5 18.3C19.2 17.3 18.5 15.7 18.5 13.8Z"
          fill="currentColor"
        />
        <path
          d="M15 3.5C15.9 2.4 16.5 0.9 16.3 -0.5C15 -0.4 13.5 0.4 12.6 1.5C11.7 2.5 11 4 11.3 5.4C12.7 5.5 14.1 4.6 15 3.5Z"
          fill="currentColor"
        />
      </svg>
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontSize: size === 'lg' ? '11px' : '9px', letterSpacing: '0.08em' }}>COMING SOON ON</div>
        <div style={{ fontSize: nameSize, fontWeight: 600 }}>App Store</div>
      </div>
    </span>
  )
}
