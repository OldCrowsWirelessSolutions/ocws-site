'use client';

import { useState } from 'react';

interface AnnualUpsellProps {
  tier: string;
  code?: string;
}

const PLAN_DATA: Record<string, {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  annualTotal: number;
  savings: number;
  features: string[];
}> = {
  nest: {
    name: 'Nest',
    monthlyPrice: 29,
    annualPrice: 24,
    annualTotal: 290,
    savings: 58,
    features: ['3 Verdicts / month', '1 Small Reckoning / month', '1 seat'],
  },
  flock: {
    name: 'Flock',
    monthlyPrice: 79,
    annualPrice: 66,
    annualTotal: 790,
    savings: 158,
    features: ['15 Verdicts / month', 'Small + Standard Reckonings', '5 seats', 'Corvus chat'],
  },
  murder: {
    name: 'Murder',
    monthlyPrice: 199,
    annualPrice: 166,
    annualTotal: 1990,
    savings: 398,
    features: ['Unlimited Verdicts', 'All Reckoning sizes', '15 seats', 'Priority access'],
  },
};

export default function AnnualUpsell({ tier, code = '' }: AnnualUpsellProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLAN_DATA[tier];

  const handleUpgrade = async () => {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscriptions/upgrade-annual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, tier }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Failed to start upgrade. Please try again.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  const monthlyCost = plan.monthlyPrice;
  const annualMonthlyCost = plan.annualPrice;
  const savingsPercent = Math.round((plan.savings / (plan.monthlyPrice * 12)) * 100);

  return (
    <div style={{
      background: 'rgba(13,21,32,0.9)',
      border: '1px solid rgba(184,146,42,0.25)',
      borderRadius: 12,
      padding: 24,
      marginTop: 24,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
      }}>
        <div style={{
          background: 'rgba(184,146,42,0.12)',
          border: '1px solid rgba(184,146,42,0.25)',
          borderRadius: 8,
          padding: '6px 10px',
          color: '#B8922A',
          fontFamily: 'monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          Save {savingsPercent}%
        </div>
        <div style={{
          color: 'rgba(244,246,248,0.8)',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
        }}>
          Switch to Annual — Pay for 10, get 12
        </div>
      </div>

      {/* Comparison grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 20,
      }}>
        {/* Monthly column */}
        <div style={{
          background: 'rgba(13,21,32,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: 16,
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.55rem',
            color: '#888',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Current · Monthly
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '2rem',
              color: 'rgba(244,246,248,0.5)',
              fontWeight: 700,
              lineHeight: 1,
            }}>
              ${monthlyCost}
            </span>
            <span style={{ color: 'rgba(244,246,248,0.3)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              /mo
            </span>
          </div>

          <div style={{
            color: 'rgba(244,246,248,0.35)',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            marginBottom: 12,
          }}>
            ${monthlyCost * 12}/year
          </div>

          <ul style={{
            margin: 0,
            paddingLeft: 14,
            color: 'rgba(244,246,248,0.4)',
            fontSize: '0.68rem',
            lineHeight: 1.8,
            fontFamily: 'monospace',
          }}>
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* Annual column */}
        <div style={{
          background: 'rgba(184,146,42,0.06)',
          border: '1px solid rgba(184,146,42,0.3)',
          borderRadius: 10,
          padding: 16,
          position: 'relative',
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.55rem',
            color: '#B8922A',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Annual · Best Value
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '2rem',
              color: '#B8922A',
              fontWeight: 700,
              lineHeight: 1,
            }}>
              ${annualMonthlyCost}
            </span>
            <span style={{ color: 'rgba(184,146,42,0.6)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
              /mo
            </span>
          </div>

          <div style={{
            color: 'rgba(244,246,248,0.55)',
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            marginBottom: 4,
          }}>
            ${plan.annualTotal} billed annually
          </div>

          <div style={{
            color: '#4ade80',
            fontFamily: 'monospace',
            fontSize: '0.6rem',
            marginBottom: 12,
          }}>
            You save ${plan.savings}/year
          </div>

          <ul style={{
            margin: 0,
            paddingLeft: 14,
            color: 'rgba(244,246,248,0.75)',
            fontSize: '0.68rem',
            lineHeight: 1.8,
            fontFamily: 'monospace',
          }}>
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#f87171',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          marginBottom: 14,
        }}>
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          width: '100%',
          padding: '13px 0',
          background: loading
            ? 'rgba(184,146,42,0.2)'
            : 'linear-gradient(135deg, #B8922A 0%, #9A7520 100%)',
          border: 'none',
          borderRadius: 9,
          color: loading ? 'rgba(184,146,42,0.4)' : '#ffffff',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          cursor: loading ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
        }}
      >
        {loading ? 'Redirecting...' : `Switch ${plan.name} to Annual — Save $${plan.savings}`}
      </button>

      <div style={{
        marginTop: 10,
        color: 'rgba(244,246,248,0.3)',
        fontFamily: 'monospace',
        fontSize: '0.58rem',
        textAlign: 'center',
        letterSpacing: '0.08em',
      }}>
        Secure checkout via Stripe · Annual billing starts today
      </div>
    </div>
  );
}
