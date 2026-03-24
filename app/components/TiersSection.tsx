// app/components/TiersSection.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

type Tier = "Nest" | "Flock" | "Murder";

const tiers = [
  {
    id: "Nest" as Tier,
    emoji: "🪺",
    name: "NEST",
    price: "$20/mo",
    priceAlt: "or $160/yr",
    monthlyProduct: "nest-monthly",
    annualProduct: "nest-annual",
    monthlyLabel: "Monthly — $20/mo",
    annualLabel: "Annual — $160/yr",
    tagline: "For homeowners and small businesses",
    features: [
      "3 Verdicts per month included",
      "Extra Verdicts available at $15 each",
      "1 Small Reckoning included per month (up to 5 locations)",
      "Additional Small Reckonings: $50 each",
      "Signal List analysis",
      "Channel congestion detection",
      "Router-specific fix instructions",
      "Step-by-step repair guide",
      "PDF report download",
      "Email support",
    ],
    note: "3-month minimum on monthly plan ($60 minimum charge) · Cancel anytime after 90 days",
    featured: false,
  },
  {
    id: "Flock" as Tier,
    emoji: "🐦‍⬛",
    name: "FLOCK",
    price: "$100/mo",
    priceAlt: "or $900/yr",
    monthlyProduct: "flock-monthly",
    annualProduct: "flock-annual",
    monthlyLabel: "Monthly — $100/mo",
    annualLabel: "Annual — $900/yr",
    tagline: "For MSPs, IT consultants, and growing teams",
    features: [
      "15 Verdicts per month included",
      "Extra Verdicts at $10 each",
      "3 Small Reckonings included per month",
      "1 Standard Reckoning included per month (up to 15 locations)",
      "Additional Small Reckonings: $35 each",
      "Additional Standard Reckonings: $75 each",
      "Commercial Reckoning: $200 additional",
      "Everything in Nest",
      "Multi-seat up to 5 users",
      "White-label PDF reports 🥚",
      "Priority support",
      "Client management dashboard 🥚",
    ],
    note: "3-month minimum on monthly plan",
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "Murder" as Tier,
    emoji: "🐦‍⬛🐦‍⬛🐦‍⬛",
    name: "MURDER",
    price: "$950/mo",
    priceAlt: "or $9,500/yr",
    monthlyProduct: "murder-monthly",
    annualProduct: "murder-annual",
    monthlyLabel: "Monthly — $950/mo",
    annualLabel: "Annual — $9,500/yr",
    tagline: "For enterprise networks, multi-site operators, and mission-critical environments",
    features: [
      "Unlimited Verdicts",
      "Unlimited Small Reckonings",
      "10 Standard Reckonings per month",
      "3 Commercial Reckonings per month",
      "Additional Standard Reckonings: $90 each",
      "Additional Commercial Reckonings: $250 each",
      "3 seats included",
      "Additional seats: $75/user/month",
      "Everything in Flock",
      "API access 🥚",
      "Dedicated support",
      "Custom report branding 🥚",
      "OCWS certified training 🥚",
      "Pro Certified Reckoning: custom quoted",
    ],
    note: "3-month minimum on monthly plan ($2,850 minimum charge)",
    featured: false,
  },
];

const OcwsProSeal = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
    <circle cx="26" cy="26" r="24" stroke="#B8922A" strokeWidth="2" />
    <circle cx="26" cy="26" r="19" stroke="#B8922A" strokeWidth="1" strokeDasharray="3 2" />
    <text x="26" y="23" textAnchor="middle" fill="#B8922A" fontSize="7" fontFamily="Arial" fontWeight="bold">OCWS</text>
    <text x="26" y="32" textAnchor="middle" fill="#B8922A" fontSize="5.5" fontFamily="Arial">CERTIFIED</text>
  </svg>
);

export default function TiersSection() {
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  async function handleCheckout(product: string) {
    setCheckingOut(product);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout failed. Please try again.");
        setCheckingOut(null);
      }
    } catch {
      alert("Connection error. Please try again.");
      setCheckingOut(null);
    }
  }

  return (
    <section className="py-20" style={{ background: "#1A2332" }}>
      <div className="ocws-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Crow&rsquo;s Eye for everyone.
          </h2>
          <p className="mt-3 text-base" style={{ color: "#888" }}>
            From the frustrated homeowner to the RF engineer.
          </p>
          <p className="mt-3 text-xs" style={{ color: "#555", fontFamily: "'Share Tech Mono', monospace" }}>
            🥚 = Coming soon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* First 3 tiers */}
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="relative flex flex-col rounded-2xl p-6 ocws-card-glow"
              style={{
                background: "#0D1520",
                border: "1px solid #0D6E7A",
              }}
            >
              {tier.featured && tier.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#00C2C7", color: "#0D1520" }}
                >
                  {tier.badge}
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-3xl">{tier.emoji}</span>
                <h3 className="mt-2 text-base font-bold text-white tracking-widest">{tier.name}</h3>
                <div className="mt-1 text-2xl font-bold" style={{ color: "#00C2C7" }}>{tier.price}</div>
                <div className="text-xs" style={{ color: "#888" }}>{tier.priceAlt}</div>
                <p className="mt-2 text-xs" style={{ color: "#888" }}>{tier.tagline}</p>
              </div>

              <ul className="flex-1 space-y-2 mb-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#aaa" }}>
                    <span style={{ color: "#00C2C7", flexShrink: 0, marginTop: "2px" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {"note" in tier && tier.note && (
                <p className="text-[10px] mb-4 leading-relaxed" style={{ color: "#666" }}>
                  {tier.note as string}
                </p>
              )}

              {/* Stripe checkout buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckout(tier.monthlyProduct)}
                  disabled={checkingOut !== null}
                  className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition ocws-glow-hover"
                  style={{
                    background: "#00C2C7",
                    color: "#0D1520",
                    border: "none",
                    opacity: checkingOut !== null && checkingOut !== tier.monthlyProduct ? 0.5 : 1,
                    cursor: checkingOut !== null ? "not-allowed" : "pointer",
                  }}
                >
                  {checkingOut === tier.monthlyProduct ? "Redirecting…" : tier.monthlyLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout(tier.annualProduct)}
                  disabled={checkingOut !== null}
                  className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition hover:bg-[#00C2C7]/10 ocws-glow-hover"
                  style={{
                    background: "transparent",
                    color: "#00C2C7",
                    border: "1px solid rgba(0,194,199,0.35)",
                    opacity: checkingOut !== null && checkingOut !== tier.annualProduct ? 0.5 : 1,
                    cursor: checkingOut !== null ? "not-allowed" : "pointer",
                  }}
                >
                  {checkingOut === tier.annualProduct ? "Redirecting…" : tier.annualLabel}
                </button>
              </div>
            </div>
          ))}

          {/* OCWS Pro card */}
          <div
            className="flex flex-col rounded-2xl p-6 ocws-card-glow"
            style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}
          >
            <div className="text-center mb-4">
              <OcwsProSeal />
              <h3 className="mt-2 text-base font-bold text-white tracking-widest">OCWS PRO</h3>
              <div className="mt-1 text-2xl font-bold" style={{ color: "#00C2C7" }}>$750</div>
              <div className="text-xs" style={{ color: "#888" }}>per report</div>
              <p className="mt-2 text-xs" style={{ color: "#B8922A", fontStyle: "italic" }}>
                Joshua Turner certifies every report
              </p>
            </div>

            <ul className="flex-1 space-y-2 mb-6">
              {[
                "Full on-site walk survey",
                "Personally certified by Joshua Turner",
                "OCWS Pro Certified Reckoning available — $1,500",
                "Any size facility, Joshua certifies every finding",
                "Compliance and insurance grade",
                "Board presentation ready",
                "Signed PDF deliverable",
                "Valid for vendor quotes and insurance",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#aaa" }}>
                  <span style={{ color: "#B8922A", flexShrink: 0, marginTop: "2px" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/contact"
              className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition ocws-glow-hover-gold"
              style={{ background: "transparent", color: "#B8922A", border: "1px solid #B8922A" }}
            >
              Request Assessment
            </a>
          </div>
        </div>
      </div>

        {/* Standalone Full Reckoning pricing */}
        <div
          className="mt-10 rounded-2xl p-6"
          style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.15em" }}>
            The Full Reckoning — No Subscription Required
          </p>
          <p className="text-sm mb-5" style={{ color: "#888" }}>
            Need a site-wide assessment without a subscription? Purchase a Full Reckoning directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { name: "Small Reckoning", size: "Up to 5 locations", price: "$150", href: "/crows-eye?reckoning=small" },
              { name: "Standard Reckoning", size: "6–15 locations", price: "$350", href: "/crows-eye?reckoning=standard" },
              { name: "Commercial Reckoning", size: "16+ locations", price: "$750", href: "/crows-eye?reckoning=commercial" },
              { name: "Pro Certified Reckoning", size: "Any size · Joshua certifies", price: "$1,500", gold: true, href: "/crows-eye?reckoning=pro" },
            ].map((r) => (
              <Link
                key={r.name}
                href={r.href}
                className={`block rounded-xl p-4 cursor-pointer ${r.gold ? "ocws-glow-hover-gold" : "ocws-card-glow"}`}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${r.gold ? "#B8922A" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <p className="text-sm font-bold text-white mb-0.5">{r.name}</p>
                <p className="text-xs mb-2" style={{ color: "#888" }}>{r.size}</p>
                <p className="text-xl font-bold" style={{ color: r.gold ? "#B8922A" : "#00C2C7" }}>{r.price}</p>
                <p className="text-xs mt-2 font-semibold" style={{ color: r.gold ? "rgba(184,146,42,0.7)" : "rgba(0,194,199,0.6)" }}>
                  Start here →
                </p>
              </Link>
            ))}
          </div>
        </div>

    </section>
  );
}
