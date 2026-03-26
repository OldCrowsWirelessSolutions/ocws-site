'use client';

export default function SubscriptionUpsell({ reportId }: { reportId: string }) {
  const handleSubscribeClick = (tier: string) => {
    try {
      sessionStorage.setItem('corvus_presub_report', reportId);
    } catch {}
    window.location.href = `/#pricing?highlight=${tier}`;
  };

  const plans = [
    {
      tier: 'nest',
      name: 'Nest',
      price: '$29',
      period: '/mo',
      features: ['3 Verdicts / month', '1 Small Reckoning / month', '1 seat'],
      featured: false,
    },
    {
      tier: 'flock',
      name: 'Flock',
      price: '$79',
      period: '/mo',
      features: ['15 Verdicts / month', 'Small + Standard Reckonings', '5 seats', 'Corvus chat included'],
      featured: true,
    },
    {
      tier: 'murder',
      name: 'Murder',
      price: '$199',
      period: '/mo',
      features: ['Unlimited Verdicts', 'All Reckoning sizes', '15 seats', 'Priority access'],
      featured: false,
    },
  ];

  return (
    <div style={{
      background: 'rgba(13,21,32,0.9)',
      border: '1px solid rgba(0,194,199,0.25)',
      borderRadius: 12,
      padding: 24,
      marginTop: 24,
    }}>
      {/* Corvus callout line */}
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: 'rgba(0,194,199,0.05)',
        border: '1px solid rgba(0,194,199,0.15)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
      }}>
        <img
          src="/corvus_still.png"
          style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, marginTop: 2 }}
          alt="Corvus"
        />
        <div>
          <div style={{
            color: '#00C2C7',
            fontFamily: 'monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 5,
          }}>
            Corvus
          </div>
          <div style={{
            color: 'rgba(244,246,248,0.85)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            fontFamily: 'monospace',
          }}>
            You just saw what I can do. Subscribe and get this every month — regular Verdicts, deeper Reckonings, and direct access to me when you have questions.
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: '0.6rem',
        color: '#888',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}>
        Choose Your Plan
      </div>

      {/* Tier cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {plans.map(plan => (
          <div
            key={plan.tier}
            style={{
              background: plan.featured ? 'rgba(0,194,199,0.05)' : '#1A2332',
              border: plan.featured
                ? '1px solid rgba(0,194,199,0.35)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {plan.featured && (
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.5rem',
                color: '#00C2C7',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                Most Popular
              </div>
            )}

            <div style={{
              color: '#F4F6F8',
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '1rem',
            }}>
              {plan.name}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{
                color: plan.featured ? '#00C2C7' : 'rgba(244,246,248,0.8)',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '1.4rem',
                fontWeight: 700,
              }}>
                {plan.price}
              </span>
              <span style={{
                color: 'rgba(244,246,248,0.4)',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
              }}>
                {plan.period}
              </span>
            </div>

            <ul style={{
              margin: 0,
              paddingLeft: 14,
              color: 'rgba(244,246,248,0.6)',
              fontSize: '0.68rem',
              lineHeight: 1.9,
              fontFamily: 'monospace',
              flexGrow: 1,
            }}>
              {plan.features.map((feature, fi) => (
                <li key={fi}>{feature}</li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribeClick(plan.tier)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#00C2C7',
                color: '#0D1520',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 'auto',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14,
        color: 'rgba(244,246,248,0.35)',
        fontFamily: 'monospace',
        fontSize: '0.6rem',
        textAlign: 'center',
        letterSpacing: '0.08em',
      }}>
        Cancel anytime · Credits reset monthly · No contracts
      </div>
    </div>
  );
}
