'use client';

import { useState, useEffect } from 'react';

interface Props {
  subscriptionCode: string;
  onComplete?: () => void;
}

const STEPS = [
  {
    icon: '📡',
    title: "I've been waiting.",
    body: "You've landed in Crow's Eye — my domain. I'm Corvus. I analyze wireless environments. I render Verdicts. Let me show you how this works.",
    hint: null,
  },
  {
    icon: '📱',
    title: "Step one: scan your network.",
    body: "Open AirPort Utility on iOS or WiFiman on Android. Run a scan. Export or screenshot the results. That file is my raw material.",
    hint: "iOS: AirPort Utility → WiFi Scan → Scan  ·  Android: WiFiman → Networks",
  },
  {
    icon: '📤',
    title: "Upload what you found.",
    body: "Drop your scan files into the upload slots. Signal list, 2.4 GHz, 5 GHz — give me everything. More data means a sharper Verdict.",
    hint: "All three slots are optional — but I work better with all three.",
  },
  {
    icon: '🔍',
    title: "I analyze. You wait.",
    body: "I'll examine your RF environment: interference sources, channel conflicts, signal overlap, security gaps, and everything your router manufacturer hoped you'd never notice.",
    hint: null,
  },
  {
    icon: '📄',
    title: "The Verdict drops.",
    body: "You'll see my findings ranked by severity. Download the PDF — it's branded, client-ready, and signed by me. Your network's sins, documented.",
    hint: "Murder tier subscribers get full design suite on the PDF.",
  },
  {
    icon: '💬',
    title: "Ask me anything.",
    body: "The chat panel is live after your Verdict. Ask me to explain a finding, compare your channels, or tell you what to do next. I don't guess. I know.",
    hint: null,
  },
];

export default function OnboardingWalkthrough({ subscriptionCode, onComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const key = `corvus_onboarded_${subscriptionCode}`;
    const done = localStorage.getItem(key);
    if (!done) setVisible(true);
  }, [subscriptionCode]);

  function handleComplete() {
    localStorage.setItem(`corvus_onboarded_${subscriptionCode}`, '1');
    setVisible(false);
    onComplete?.();
  }

  function handleSkip() {
    localStorage.setItem(`corvus_onboarded_${subscriptionCode}`, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,21,32,0.92)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#1A2332', borderRadius: '16px', maxWidth: '480px', width: '100%',
        overflow: 'hidden', border: '1px solid #0D6E7A', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Progress bar */}
        <div style={{ background: '#0D1520', height: '4px' }}>
          <div style={{
            background: 'linear-gradient(90deg, #0D6E7A, #00C2C7)',
            height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ padding: '32px' }}>
          {/* Icon */}
          <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>{current.icon}</div>

          {/* Title */}
          <div style={{
            color: '#00C2C7', fontSize: '20px', fontFamily: 'Share Tech Mono, monospace',
            marginBottom: '12px', textAlign: 'center', lineHeight: 1.3,
          }}>
            {current.title}
          </div>

          {/* Body */}
          <div style={{
            color: '#F4F6F8', fontSize: '14px', lineHeight: 1.7,
            textAlign: 'center', marginBottom: current.hint ? '16px' : '32px',
          }}>
            {current.body}
          </div>

          {/* Hint */}
          {current.hint && (
            <div style={{
              background: '#0D1520', borderRadius: '8px', padding: '10px 14px',
              color: '#888', fontSize: '12px', fontFamily: 'Share Tech Mono, monospace',
              textAlign: 'center', marginBottom: '32px', lineHeight: 1.5,
            }}>
              {current.hint}
            </div>
          )}

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? '20px' : '6px', height: '6px',
                borderRadius: '3px', transition: 'all 0.3s',
                background: i === step ? '#00C2C7' : i < step ? '#0D6E7A' : '#0D1520',
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                flex: 1, background: 'transparent', border: '1px solid #1A2332',
                color: '#888', borderRadius: '8px', padding: '12px',
                cursor: 'pointer', fontSize: '13px',
              }}>← Back</button>
            )}
            <button
              onClick={isLast ? handleComplete : () => setStep(s => s + 1)}
              style={{
                flex: 2, background: 'linear-gradient(135deg, #0D6E7A, #00C2C7)',
                border: 'none', color: '#0D1520', borderRadius: '8px', padding: '12px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                fontFamily: 'Share Tech Mono, monospace', letterSpacing: '0.05em',
              }}
            >
              {isLast ? "LET'S GO" : 'NEXT →'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>
              Skip intro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
