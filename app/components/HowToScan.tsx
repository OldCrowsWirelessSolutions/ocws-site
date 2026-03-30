'use client';
import { useState } from 'react';
import Link from 'next/link';

const STEPS = [
  {
    number: 1,
    title: 'Download WiFi Analyzer',
    instruction: 'Search "WiFi Analyzer open source" on Google Play. Free. Green icon. No ads. Install it.',
    detail: 'Android only. iPhone users: search "AirPort Utility" by Apple on the App Store — free, made by Apple. Then go to Settings → AirPort Utility → turn on WiFi Scanner.',
    img: 'https://vremsoftwaredevelopment.github.io/WiFiAnalyzer/images/feature-graphic.png',
    imgAlt: 'WiFi Analyzer app — available on Google Play',
    badge: {
      android: 'https://play.google.com/store/apps/details?id=com.vrem.wifianalyzer',
      ios: 'https://apps.apple.com/us/app/airport-utility/id427276530',
    },
  },
  {
    number: 2,
    title: 'Open the app and tap Access Points',
    instruction: 'You\'ll see every Wi-Fi network in range. Each one shows a name, signal number, and channel. This is your Signal List.',
    detail: 'Grant location permission if Android asks — it\'s required for Wi-Fi scanning. You\'re not being tracked.',
    img: 'https://vremsoftwaredevelopment.github.io/WiFiAnalyzer/images/feature-graphic.png',
    imgAlt: 'WiFi Analyzer Access Points screen showing nearby networks',
    corvusLine: 'That list of networks you\'re looking at? I can read every single one. Screenshot it.',
  },
  {
    number: 3,
    title: 'Screenshot the Access Points list',
    instruction: 'Take a screenshot of this screen. Every network visible here tells me something about your environment.',
    detail: 'This is the most important screenshot. Get all the networks on screen if you can.',
    img: 'https://vremsoftwaredevelopment.github.io/WiFiAnalyzer/images/feature-graphic.png',
    imgAlt: 'Screenshot of WiFi Analyzer Access Points list',
    corvusLine: 'This is your Signal List. This is where I find your router and everyone crowding your airspace.',
  },
  {
    number: 4,
    title: 'Tap Channel Graph → switch to 2.4 GHz',
    instruction: 'Tap Channel Graph at the bottom. Make sure the top right says "2.4 GHz". Screenshot the colored bars.',
    detail: 'The bars show channel congestion. Lots of overlap means your neighbors are competing with your signal.',
    img: 'https://vremsoftwaredevelopment.github.io/WiFiAnalyzer/images/feature-graphic.png',
    imgAlt: 'WiFi Analyzer 2.4 GHz Channel Graph showing channel congestion',
    corvusLine: 'That colorful mess is your 2.4 GHz band. I can see exactly who\'s crowding your channel.',
  },
  {
    number: 5,
    title: 'Switch to 5 GHz and screenshot again',
    instruction: 'Tap the "2.4 GHz" text in the top right — it switches to 5 GHz. Screenshot that view too.',
    detail: 'If the 5 GHz screen looks empty that\'s normal — it has shorter range and fewer networks show up.',
    img: 'https://vremsoftwaredevelopment.github.io/WiFiAnalyzer/images/feature-graphic.png',
    imgAlt: 'WiFi Analyzer 5 GHz Channel Graph',
    corvusLine: 'Empty 5 GHz? That tells me something too. Screenshot it anyway.',
  },
  {
    number: 6,
    title: 'You\'re ready. Upload all three.',
    instruction: 'Three screenshots: Signal List, 2.4 GHz graph, 5 GHz graph. That\'s everything Corvus needs.',
    detail: 'Not sure if you got it right? Upload what you have. Corvus works with whatever he can see.',
    img: null,
    imgAlt: '',
    corvusLine: 'Three screenshots. That\'s all I need to tell you everything that\'s wrong with your network.',
    isCTA: true,
  },
];

export default function HowToScan() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];

  return (
    <section style={{
      background: '#0D1520',
      padding: '80px 24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#00C2C7', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
            How It Works
          </p>
          <h2 style={{ color: '#F4F6F8', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            Three screenshots. That&rsquo;s it.
          </h2>
          <p style={{ color: '#8AAABB', fontSize: '1rem', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
            Download a free app, take three screenshots of your Wi-Fi environment, and Corvus does the rest.
          </p>
        </div>

        {/* Step pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: activeStep === i ? '1px solid rgba(0,194,199,0.6)' : '1px solid rgba(255,255,255,0.1)',
                background: activeStep === i ? 'rgba(0,194,199,0.12)' : 'transparent',
                color: activeStep === i ? '#00C2C7' : 'rgba(255,255,255,0.4)',
                fontSize: '13px',
                fontWeight: activeStep === i ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s.number}. {s.title.split(' ').slice(0, 3).join(' ')}{s.title.split(' ').length > 3 ? '…' : ''}
            </button>
          ))}
        </div>

        {/* Active step card */}
        <div style={{
          background: '#1A2332',
          border: '1px solid rgba(0,194,199,0.2)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: step.isCTA ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
          gap: 0,
        }}>

          {/* Left — content */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,194,199,0.12)',
              border: '1px solid rgba(0,194,199,0.3)',
              color: '#00C2C7',
              fontSize: '16px',
              fontWeight: 800,
              flexShrink: 0,
            }}>
              {step.number}
            </div>

            <h3 style={{ color: '#F4F6F8', fontSize: '1.3rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
              {step.title}
            </h3>

            <p style={{ color: '#D8E4F0', fontSize: '1rem', margin: 0, lineHeight: 1.7 }}>
              {step.instruction}
            </p>

            <p style={{ color: '#7A9AAB', fontSize: '0.88rem', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
              {step.detail}
            </p>

            {/* Corvus line */}
            {step.corvusLine && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,194,199,0.15)',
                borderLeft: '3px solid #00C2C7',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'rgba(244,246,248,0.75)',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}>
                &ldquo;{step.corvusLine}&rdquo; — Corvus
              </div>
            )}

            {/* Step 1 app badges */}
            {step.badge && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={step.badge.android} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    textDecoration: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
                  }}>
                  📱 Google Play
                </a>
                <a href={step.badge.ios} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    textDecoration: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
                  }}>
                  🍎 App Store
                </a>
              </div>
            )}

            {/* CTA step */}
            {step.isCTA && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
                <Link href="/crows-eye"
                  style={{
                    display: 'block', textAlign: 'center',
                    background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)',
                    color: '#fff', borderRadius: '12px', padding: '14px 28px',
                    fontSize: '1rem', fontWeight: 700, textDecoration: 'none',
                  }}>
                  Upload Screenshots &amp; Get Your Verdict →
                </Link>
                <p style={{ color: '#6A8A9A', fontSize: '0.8rem', textAlign: 'center' }}>
                  Free instant analysis · Full Verdict $50 · No account required
                </p>
              </div>
            )}

            {/* Nav buttons */}
            {!step.isCTA && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {activeStep > 0 && (
                  <button onClick={() => setActiveStep(prev => prev - 1)}
                    style={{
                      padding: '9px 18px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: '#8AAABB',
                      fontSize: '13px', cursor: 'pointer',
                    }}>
                    ← Back
                  </button>
                )}
                <button onClick={() => setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1))}
                  style={{
                    padding: '9px 20px', borderRadius: '8px',
                    border: '1px solid rgba(0,194,199,0.35)',
                    background: 'rgba(0,194,199,0.1)', color: '#00C2C7',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  }}>
                  {activeStep === STEPS.length - 2 ? 'Ready →' : 'Next Step →'}
                </button>
              </div>
            )}
          </div>

          {/* Right — screenshot */}
          {!step.isCTA && step.img && (
            <div style={{
              background: '#0D1520',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              minHeight: '320px',
            }}>
              <div style={{
                background: '#111',
                borderRadius: '24px',
                border: '2px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                maxWidth: '260px',
                width: '100%',
              }}>
                <img
                  src={step.img}
                  alt={step.imgAlt}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              style={{
                width: i === activeStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === activeStep ? '#00C2C7' : 'rgba(255,255,255,0.15)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                padding: 0,
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
