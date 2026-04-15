'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()

  const returnUrl = searchParams.get('returnUrl') ?? ''
  const product = searchParams.get('product') ?? 'verdict'
  const userId = searchParams.get('userId') ?? ''

  const [countdown, setCountdown] = useState(3)
  const [redirected, setRedirected] = useState(false)

  const productLabel =
    product === 'reckoning-small'    ? 'Small Reckoning' :
    product === 'reckoning-standard' ? 'Standard Reckoning' :
    product === 'reckoning-commercial' ? 'Commercial Reckoning' :
    "Verdict"

  useEffect(() => {
    if (!returnUrl) return

    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(iv)
          // Build the deep link with success params
          const deepLink = buildDeepLink(returnUrl, product, userId)
          setRedirected(true)
          window.location.href = deepLink
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(iv)
  }, [returnUrl, product, userId])

  function buildDeepLink(base: string, p: string, uid: string): string {
    try {
      const url = new URL(base)
      url.searchParams.set('success', 'true')
      url.searchParams.set('product', p)
      if (uid) url.searchParams.set('userId', uid)
      return url.toString()
    } catch {
      // base is not a standard URL (e.g. corvus://...) — append params manually
      const sep = base.includes('?') ? '&' : '?'
      const uid_part = uid ? `&userId=${encodeURIComponent(uid)}` : ''
      return `${base}${sep}success=true&product=${encodeURIComponent(p)}${uid_part}`
    }
  }

  return (
    <div
      style={{
        background: '#0D1520',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        textAlign: 'center',
      }}
    >
      {/* Corvus logo */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 28 }}>
        <Image src="/corvus_still.png" alt="Corvus" fill sizes="80px" className="object-contain" priority />
      </div>

      {/* Success icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.12)',
          border: '2px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          fontSize: 24,
        }}
      >
        ✓
      </div>

      <p
        style={{
          color: '#00C2C7',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Purchase Complete
      </p>
      <h1 style={{ color: '#F4F6F8', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Your {productLabel} is ready.
      </h1>
      <p style={{ color: '#8AAABB', fontSize: 14, maxWidth: 320, marginBottom: 32, lineHeight: 1.6 }}>
        Payment confirmed. Corvus is loading your credit now.
      </p>

      {returnUrl ? (
        !redirected ? (
          <div>
            <div
              style={{
                background: 'rgba(0,194,199,0.08)',
                border: '1px solid rgba(0,194,199,0.25)',
                borderRadius: 12,
                padding: '16px 24px',
                marginBottom: 16,
                color: '#00C2C7',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Returning to Crow&rsquo;s Eye in {countdown}…
            </div>
            <p style={{ fontSize: 12, color: '#444' }}>
              Not redirecting?{' '}
              <a
                href={buildDeepLink(returnUrl, product, userId)}
                style={{ color: 'rgba(0,194,199,0.6)' }}
              >
                Tap here to return to the app
              </a>
            </p>
          </div>
        ) : (
          <p style={{ color: '#888', fontSize: 14 }}>Returning to Crow&rsquo;s Eye…</p>
        )
      ) : (
        <div>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              background: '#00C2C7',
              color: '#0D1520',
              borderRadius: 12,
              padding: '13px 32px',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              marginBottom: 12,
            }}
          >
            Go to Dashboard
          </Link>
          {userId && (
            <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
              Your credit has been added to{' '}
              <span style={{ fontFamily: "'Share Tech Mono', monospace", color: '#888' }}>
                {userId}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0D1520', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00C2C7', fontFamily: "'Share Tech Mono', monospace", fontSize: 14 }}>Loading…</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
