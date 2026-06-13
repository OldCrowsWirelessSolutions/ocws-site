'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = 'verdict' | 'reckoning'
type ReckoningSize = 'small' | 'standard' | 'commercial'
type Step = 'validating' | 'auth' | 'purchase' | 'redirecting'
type AuthMode = 'login' | 'create'

const PRODUCT_LABELS: Record<string, string> = {
  verdict:               "WiFi Health Report",
  'reckoning-small':    "Whole-Home Survey \u2014 Small",
  'reckoning-standard': "Whole-Home Survey \u2014 Standard",
  'reckoning-commercial': "Whole-Home Survey \u2014 Commercial",
}

const PRODUCT_PRICES: Record<string, string> = {
  verdict:               '$50',
  'reckoning-small':    '$150',
  'reckoning-standard': '$350',
  'reckoning-commercial': '$750',
}

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  verdict:               'Full AI wireless diagnostic with signed PDF report. Single location.',
  'reckoning-small':    'Multi-location survey — up to 5 locations. Branded PDF report.',
  'reckoning-standard': 'Multi-location survey — up to 15 locations. Detailed coverage mapping.',
  'reckoning-commercial': 'Enterprise multi-location survey — up to 30 locations.',
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  padding: '12px 14px',
  color: '#F4F6F8',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryBtn: React.CSSProperties = {
  width: '100%',
  background: '#22D6DC',
  color: '#0D1520',
  border: 'none',
  borderRadius: 12,
  padding: '14px 0',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
}

const outlineBtn: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  color: '#22D6DC',
  border: '1px solid rgba(34,214,220,0.4)',
  borderRadius: 12,
  padding: '14px 0',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

const card: React.CSSProperties = {
  background: '#1A2332',
  border: '1px solid rgba(34,214,220,0.2)',
  borderRadius: 16,
  padding: '28px 24px',
  marginBottom: 16,
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GetCreditsClient() {
  const searchParams = useSearchParams()

  const rawProduct = searchParams.get('product') ?? 'verdict'
  const userId = searchParams.get('userId') ?? ''
  const returnUrl = searchParams.get('returnUrl') ?? ''
  const cancelled = searchParams.get('cancelled') === 'true'

  const [step, setStep] = useState<Step>('validating')
  const [subscriptionId, setSubscriptionId] = useState(userId)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  // Auth - login
  const [loginCode, setLoginCode] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Auth - create account
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  // Purchase
  const [selectedProduct, setSelectedProduct] = useState(
    rawProduct === 'reckoning' ? 'reckoning-small' : 'verdict'
  )
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')

  // ── Step 1: validate userId if present ──────────────────────────────────────

  useEffect(() => {
    if (!userId) {
      setStep('auth')
      return
    }

    // Validate the Corvus Code from the app
    fetch('/api/subscriptions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: userId }),
    })
      .then(r => r.json())
      .then((data: { valid?: boolean; type?: string }) => {
        if (data.valid && data.type === 'subscription') {
          setSubscriptionId(userId)
          setStep('purchase')
        } else {
          setStep('auth')
        }
      })
      .catch(() => setStep('auth'))
  }, [userId])

  // ── Login handler ────────────────────────────────────────────────────────────

  async function handleLogin() {
    setLoginError('')
    const code = loginCode.trim().toUpperCase()
    if (!code || !loginPassword) {
      setLoginError('Enter your Corvus Code and password.')
      return
    }
    setLoginLoading(true)
    try {
      // First identify the code type
      const identRes = await fetch('/api/auth/identify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const identData = await identRes.json() as { type?: string; subscriptionId?: string; passwordSet?: boolean }

      if (!identData.type || identData.type === 'invalid') {
        setLoginError('Corvus Code not found.')
        return
      }
      if (identData.type !== 'subscriber') {
        setLoginError('This ID type cannot be used here. Please use your Corvus Code.')
        return
      }

      const subId = identData.subscriptionId ?? code

      // Verify password
      const pwRes = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: subId, password: loginPassword }),
      })
      const pwData = await pwRes.json() as { valid?: boolean; rateLimited?: boolean }

      if (pwData.rateLimited) {
        setLoginError('Too many failed attempts. Try again in an hour.')
        return
      }
      if (!pwData.valid) {
        setLoginError('Incorrect password.')
        return
      }

      setSubscriptionId(subId)
      setStep('purchase')
    } catch {
      setLoginError('Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Create account handler ───────────────────────────────────────────────────

  async function handleCreateAccount() {
    setCreateError('')
    if (!createName.trim() || !createEmail.trim() || !createPassword) {
      setCreateError('All fields are required.')
      return
    }
    if (createPassword.length < 8) {
      setCreateError('Password must be at least 8 characters.')
      return
    }
    setCreateLoading(true)
    try {
      const res = await fetch('/api/app-account/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName.trim(), email: createEmail.trim(), password: createPassword }),
      })
      const data = await res.json() as { success?: boolean; subscriptionId?: string; error?: string }
      if (!res.ok || !data.success) {
        setCreateError(data.error ?? 'Account creation failed.')
        return
      }
      setSubscriptionId(data.subscriptionId!)
      setStep('purchase')
    } catch {
      setCreateError('Account creation failed. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  // ── Purchase handler ─────────────────────────────────────────────────────────

  async function handlePurchase() {
    setPurchaseError('')
    setPurchaseLoading(true)
    try {
      const res = await fetch('/api/app-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, product: selectedProduct, returnUrl }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setPurchaseError(data.error ?? 'Could not start checkout. Please try again.')
        setPurchaseLoading(false)
        return
      }
      setStep('redirecting')
      window.location.href = data.url
    } catch {
      setPurchaseError('Network error. Please try again.')
      setPurchaseLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: '#0D1520',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 80px',
        backgroundImage: `
          linear-gradient(rgba(34,214,220,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,214,220,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 480, width: '100%' }}>
        <div style={{ position: 'relative', width: 56, height: 56, margin: '0 auto 16px' }}>
          <Image src="/Crows_Eye_Logo.png" alt="Crow's Eye" fill sizes="56px" className="object-contain" />
        </div>
        <p
          style={{
            color: '#22D6DC',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Crow&rsquo;s Eye &middot; Purchase
        </p>
        <h1 style={{ color: '#F4F6F8', fontSize: 22, fontWeight: 700, margin: 0 }}>
          {step === 'auth'
            ? 'Sign in to continue'
            : step === 'purchase'
              ? 'Choose your product'
              : 'Redirecting to checkout…'}
        </h1>
      </div>

      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* ── Cancelled banner ──────────────────────────────────────────────── */}
        {cancelled && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#f87171',
              fontSize: 13,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Payment cancelled. You can try again below.
          </div>
        )}

        {/* ── Validating ────────────────────────────────────────────────────── */}
        {step === 'validating' && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '40px 0' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '3px solid rgba(34,214,220,0.2)',
                borderTopColor: '#22D6DC',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            Verifying your account…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Auth step ─────────────────────────────────────────────────────── */}
        {step === 'auth' && (
          <div>
            {/* Tab toggle */}
            <div
              style={{
                display: 'flex',
                background: '#1A2332',
                borderRadius: 12,
                padding: 4,
                marginBottom: 20,
              }}
            >
              {(['login', 'create'] as AuthMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setAuthMode(mode); setLoginError(''); setCreateError('') }}
                  style={{
                    flex: 1,
                    background: authMode === mode ? '#22D6DC' : 'transparent',
                    color: authMode === mode ? '#0D1520' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    borderRadius: 9,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {mode === 'login' ? 'Log In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Login form */}
            {authMode === 'login' && (
              <div style={card}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
                    Corvus Code
                  </label>
                  <input
                    type="text"
                    value={loginCode}
                    onChange={e => setLoginCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="OCWS-NEST-XXXXXXXX"
                    autoCapitalize="characters"
                    autoComplete="off"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Your password"
                    autoComplete="current-password"
                    style={inputStyle}
                  />
                </div>
                {loginError && (
                  <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{loginError}</p>
                )}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loginLoading}
                  style={{ ...primaryBtn, opacity: loginLoading ? 0.6 : 1 }}
                >
                  {loginLoading ? 'Verifying…' : 'Log In'}
                </button>
                <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#555' }}>
                  <Link href="/recover-code" style={{ color: 'rgba(34,214,220,0.6)' }}>
                    Forgot your Corvus Code?
                  </Link>
                </p>
              </div>
            )}

            {/* Create account form */}
            {authMode === 'create' && (
              <div style={card}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text', value: createName, setter: setCreateName, placeholder: 'Your name', autoComplete: 'name' },
                  { label: 'Email Address', key: 'email', type: 'email', value: createEmail, setter: setCreateEmail, placeholder: 'you@example.com', autoComplete: 'email' },
                  { label: 'Password', key: 'password', type: 'password', value: createPassword, setter: setCreatePassword, placeholder: 'At least 8 characters', autoComplete: 'new-password' },
                ].map(({ label, key, type, value, setter, placeholder, autoComplete }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <p style={{ fontSize: 11, color: '#555', marginBottom: 16, lineHeight: 1.5 }}>
                  Creating an account generates your Corvus Code. You&rsquo;ll use this ID
                  to log in across devices. Save it somewhere safe.
                </p>
                {createError && (
                  <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{createError}</p>
                )}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={createLoading}
                  style={{ ...primaryBtn, opacity: createLoading ? 0.6 : 1 }}
                >
                  {createLoading ? 'Creating Account…' : 'Create Account'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Purchase step ─────────────────────────────────────────────────── */}
        {step === 'purchase' && (
          <div>
            {subscriptionId && (
              <div
                style={{
                  background: 'rgba(34,214,220,0.06)',
                  border: '1px solid rgba(34,214,220,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 20,
                  fontSize: 12,
                  color: '#22D6DC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>✓</span>
                <span>Logged in as <strong style={{ fontFamily: "'Share Tech Mono', monospace" }}>{subscriptionId}</strong></span>
              </div>
            )}

            {/* Product selector */}
            {rawProduct === 'reckoning' ? (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 10, fontWeight: 600 }}>
                  Select Survey Size
                </p>
                {(['reckoning-small', 'reckoning-standard', 'reckoning-commercial'] as const).map((p) => (
                  <div
                    key={p}
                    onClick={() => setSelectedProduct(p)}
                    style={{
                      ...card,
                      borderColor: selectedProduct === p ? '#22D6DC' : 'rgba(255,255,255,0.08)',
                      borderLeft: selectedProduct === p ? '3px solid #22D6DC' : '3px solid transparent',
                      cursor: 'pointer',
                      marginBottom: 10,
                      padding: '16px 20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ color: '#F4F6F8', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                          {PRODUCT_LABELS[p]}
                        </p>
                        <p style={{ color: '#7A9AAB', fontSize: 12, lineHeight: 1.5 }}>
                          {PRODUCT_DESCRIPTIONS[p]}
                        </p>
                      </div>
                      <span style={{ color: '#22D6DC', fontSize: 18, fontWeight: 700, marginLeft: 16, flexShrink: 0 }}>
                        {PRODUCT_PRICES[p]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  ...card,
                  borderLeft: '3px solid #22D6DC',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: '#22D6DC',
                        fontFamily: "'Share Tech Mono', monospace",
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      One-Time Purchase
                    </p>
                    <p style={{ color: '#F4F6F8', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                      {PRODUCT_LABELS[selectedProduct]}
                    </p>
                    <p style={{ color: '#7A9AAB', fontSize: 13, lineHeight: 1.5 }}>
                      {PRODUCT_DESCRIPTIONS[selectedProduct]}
                    </p>
                  </div>
                  <span style={{ color: '#22D6DC', fontSize: 24, fontWeight: 700, marginLeft: 20, flexShrink: 0 }}>
                    {PRODUCT_PRICES[selectedProduct]}
                  </span>
                </div>
              </div>
            )}

            {purchaseError && (
              <p style={{ color: '#f87171', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
                {purchaseError}
              </p>
            )}

            <button
              type="button"
              onClick={handlePurchase}
              disabled={purchaseLoading}
              style={{ ...primaryBtn, opacity: purchaseLoading ? 0.6 : 1, marginBottom: 12 }}
            >
              {purchaseLoading
                ? 'Opening Checkout…'
                : `Pay ${PRODUCT_PRICES[selectedProduct]} — Secure Checkout`}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#444' }}>
              Secured by Stripe · Credit/debit cards accepted
            </p>

            {returnUrl && (
              <p style={{ textAlign: 'center', fontSize: 11, color: '#444', marginTop: 8 }}>
                You&rsquo;ll be returned to the app after payment.
              </p>
            )}
          </div>
        )}

        {/* ── Redirecting to Stripe ─────────────────────────────────────────── */}
        {step === 'redirecting' && (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '40px 0' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '3px solid rgba(34,214,220,0.2)',
                borderTopColor: '#22D6DC',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            Opening secure checkout…
          </div>
        )}

      </div>
    </div>
  )
}
