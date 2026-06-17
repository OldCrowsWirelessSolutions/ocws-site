// app/components/TiersSection.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

type Tier = "Fledgling" | "Nest" | "Flock" | "Murder";

const tiers = [
  {
    id: "Fledgling" as Tier,
    emoji: "🐦",
    name: "FLEDGLING",
    price: "$10/mo",
    priceAlt: "or $96/yr",
    monthlyProduct: "fledgling-monthly",
    annualProduct: "fledgling-annual",
    monthlyLabel: "Monthly — $10/mo",
    annualLabel: "Annual — $96/yr",
    tagline: "Try Corvus with one free WiFi Health Report",
    features: [
      "1 free WiFi Health Report included (one-time)",
      "Unlimited Ask Corvus chat",
      "Corvus voice assistant",
      "Help & Training tours",
      "Dashboard access",
      "Upgrade to Nest anytime",
    ],
    note: "Chat and voice available immediately. WiFi Health Report credit is one-time and does not renew.",
    featured: false,
    goldStyle: true,
    seatOptions: null as null,
  },
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
      "3 WiFi Health Reports per month included",
      "Extra WiFi Health Reports available at $15 each",
      "1 Small Whole-Home Survey included per month (up to 5 locations)",
      "Additional Small Whole-Home Surveys: $50 each",
      "Signal List analysis",
      "Channel congestion detection",
      "Router-specific fix instructions",
      "Step-by-step repair guide",
      "PDF report download",
      "No report history — download immediately",
      "Unlimited Ask Corvus chat",
      "Corvus voice assistant",
      "Help & Training tours",
      "Email support",
      "1 seat — upgrade to Flock for team access",
    ],
    note: "3-month minimum on monthly plan ($60 minimum charge) · Cancel anytime after 90 days",
    featured: false,
    seatOptions: null as null,
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
      "15 WiFi Health Reports per month included",
      "Extra WiFi Health Reports at $10 each",
      "3 Small Whole-Home Surveys included per month",
      "1 Standard Whole-Home Survey included per month (up to 15 locations)",
      "Additional Small Whole-Home Surveys: $35 each",
      "Additional Standard Whole-Home Surveys: $75 each",
      "Commercial Whole-Home Survey: $200 additional",
      "Everything in Nest",
      "Unlimited Ask Corvus chat",
      "Corvus voice assistant",
      "Help & Training tours",
      "6-month report history",
      "1 seat included — add up to 4 more from $25/mo",
      "6+ seats requires Murder subscription",
      "White-label PDF reports 🥚",
      "Priority support",
      "Client management dashboard 🥚",
    ],
    note: "3-month minimum on monthly plan",
    featured: true,
    badge: "Most Popular",
    seatOptions: [
      { seats: 1, monthlyAdd: 0,  annualAdd: 0 },
      { seats: 2, monthlyAdd: 25, annualAdd: 240 },
      { seats: 3, monthlyAdd: 45, annualAdd: 432 },
      { seats: 4, monthlyAdd: 60, annualAdd: 576 },
      { seats: 5, monthlyAdd: 75, annualAdd: 720 },
    ],
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
      "Unlimited WiFi Health Reports",
      "Unlimited Small Whole-Home Surveys",
      "10 Standard Whole-Home Surveys per month",
      "3 Commercial Whole-Home Surveys per month",
      "Additional Standard Whole-Home Surveys: $90 each",
      "Additional Commercial Whole-Home Surveys: $250 each",
      "5 seats included — add up to 10 more from $75/mo",
      "15 seat maximum",
      "Everything in Flock",
      "Unlimited Ask Corvus chat",
      "Corvus voice assistant",
      "Help & Training tours",
      "12-month report history",
      "API access 🥚",
      "Dedicated support",
      "Custom report branding 🥚",
      "OCWS certified training 🥚",
      "Pro Certified Whole-Home Survey: custom quoted",
    ],
    note: "3-month minimum on monthly plan ($2,850 minimum charge)",
    featured: false,
    seatOptions: [
      { seats: 5, monthlyAdd: 0,   annualAdd: 0 },
      { seats: 6, monthlyAdd: 75,  annualAdd: 720 },
      { seats: 7, monthlyAdd: 140, annualAdd: 1344 },
      { seats: 8, monthlyAdd: 195, annualAdd: 1872 },
      { seats: 9, monthlyAdd: 240, annualAdd: 2304 },
      { seats: 10, monthlyAdd: 275, annualAdd: 2640 },
      { seats: 11, monthlyAdd: 300, annualAdd: 2880 },
      { seats: 12, monthlyAdd: 315, annualAdd: 3024 },
      { seats: 13, monthlyAdd: 320, annualAdd: 3072 },
      { seats: 14, monthlyAdd: 325, annualAdd: 3120 },
      { seats: 15, monthlyAdd: 330, annualAdd: 3168 },
    ],
  },
];

const OcwsProSeal = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
    <circle cx="26" cy="26" r="24" stroke="#D8AC32" strokeWidth="2" />
    <circle cx="26" cy="26" r="19" stroke="#D8AC32" strokeWidth="1" strokeDasharray="3 2" />
    <text x="26" y="23" textAnchor="middle" fill="#D8AC32" fontSize="7" fontFamily="Arial" fontWeight="bold">OCWS</text>
    <text x="26" y="32" textAnchor="middle" fill="#D8AC32" fontSize="5.5" fontFamily="Arial">CERTIFIED</text>
  </svg>
);

interface SeatModal {
  tier: Tier;
  product: string; // e.g. "flock-monthly"
  isAnnual: boolean;
}

export default function TiersSection() {
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [seatModal, setSeatModal] = useState<SeatModal | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(1);

  async function handleCheckout(product: string, additionalSeats = 0) {
    setCheckingOut(product);
    setSeatModal(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, additionalSeats }),
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

  function openSeatModal(tier: Tier, product: string, isAnnual: boolean) {
    const t = tiers.find(t => t.id === tier);
    if (!t?.seatOptions) {
      // Nest or no seat options — go straight to checkout
      handleCheckout(product);
      return;
    }
    const defaultSeats = tier === "Murder" ? 5 : 1;
    setSelectedSeats(defaultSeats);
    setSeatModal({ tier, product, isAnnual });
  }

  const modalTier = seatModal ? tiers.find(t => t.id === seatModal.tier) : null;
  const seatOption = modalTier?.seatOptions?.find(o => o.seats === selectedSeats);
  const baseMonthly = seatModal?.tier === "Flock" ? 100 : 950;
  const baseAnnual  = seatModal?.tier === "Flock" ? 900 : 9500;
  const totalMonthly = baseMonthly + (seatOption?.monthlyAdd ?? 0);
  const totalAnnual  = baseAnnual  + (seatOption?.annualAdd  ?? 0);
  const includedSeats = seatModal?.tier === "Murder" ? 5 : 1;
  const additionalSeats = Math.max(0, selectedSeats - includedSeats);

  return (
    <section className="py-20" style={{ background: "#1A2332" }}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Crow&rsquo;s Eye for everyone.
          </h2>
          <p className="mt-3 text-base" style={{ color: "#888" }}>
            From the frustrated homeowner to the WiFi engineer.
          </p>
          <p className="mt-3 text-xs" style={{ color: "#555", fontFamily: "'Share Tech Mono', monospace" }}>
            🥚 = Coming soon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
          {/* Subscription tiers */}
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="relative flex flex-col rounded-2xl p-6 ocws-card-glow"
              style={{
                background: "#0D1520",
                border: ("goldStyle" in tier && tier.goldStyle) ? "1px solid rgba(216,172,50,0.5)" : "1px solid #0D6E7A",
                boxShadow: ("goldStyle" in tier && tier.goldStyle) ? "0 0 20px rgba(216,172,50,0.08)" : undefined,
              }}
            >
              {tier.featured && "badge" in tier && tier.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#22D6DC", color: "#0D1520" }}
                >
                  {tier.badge}
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-3xl">{tier.emoji}</span>
                <h3 className="mt-2 text-base font-bold text-white tracking-widest">{tier.name}</h3>
                <div className="mt-1 text-2xl font-bold" style={{ color: ("goldStyle" in tier && tier.goldStyle) ? "#D8AC32" : "#22D6DC" }}>{tier.price}</div>
                <div className="text-xs" style={{ color: "#888" }}>{tier.priceAlt}</div>
                <p className="mt-2 text-xs" style={{ color: "#888" }}>{tier.tagline}</p>
              </div>

              <ul className="flex-1 space-y-2 mb-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#aaa" }}>
                    <span style={{ color: ("goldStyle" in tier && tier.goldStyle) ? "#D8AC32" : "#22D6DC", flexShrink: 0, marginTop: "2px" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {"note" in tier && tier.note && (
                <p className="text-[10px] mb-4 leading-relaxed" style={{ color: "#666" }}>
                  {tier.note as string}
                </p>
              )}

              {/* Checkout buttons */}
              {(() => {
                const isGold = "goldStyle" in tier && tier.goldStyle;
                const accentColor = isGold ? "#D8AC32" : "#22D6DC";
                const accentBg = isGold ? "rgba(216,172,50,0.12)" : "transparent";
                const accentBorder = isGold ? "rgba(216,172,50,0.4)" : "rgba(34,214,220,0.35)";
                return (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openSeatModal(tier.id, tier.monthlyProduct, false)}
                      disabled={checkingOut !== null}
                      className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition"
                      style={{
                        background: isGold ? "#D8AC32" : "#22D6DC",
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
                      onClick={() => openSeatModal(tier.id, tier.annualProduct, true)}
                      disabled={checkingOut !== null}
                      className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition"
                      style={{
                        background: accentBg,
                        color: accentColor,
                        border: `1px solid ${accentBorder}`,
                        opacity: checkingOut !== null && checkingOut !== tier.annualProduct ? 0.5 : 1,
                        cursor: checkingOut !== null ? "not-allowed" : "pointer",
                      }}
                    >
                      {checkingOut === tier.annualProduct ? "Redirecting…" : tier.annualLabel}
                    </button>
                  </div>
                );
              })()}
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
              <div className="mt-1 text-2xl font-bold" style={{ color: "#22D6DC" }}>$750</div>
              <div className="text-xs" style={{ color: "#888" }}>per report</div>
              <p className="mt-2 text-xs" style={{ color: "#D8AC32", fontStyle: "italic" }}>
                Joshua Turner certifies every report
              </p>
            </div>

            <ul className="flex-1 space-y-2 mb-6">
              {[
                "Full on-site walk survey",
                "Personally certified by Joshua Turner",
                "OCWS Pro Certified Whole-Home Survey available — $1,500",
                "Any size facility, Joshua certifies every finding",
                "Compliance and insurance grade",
                "Board presentation ready",
                "Signed PDF deliverable",
                "Valid for vendor quotes and insurance",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#aaa" }}>
                  <span style={{ color: "#D8AC32", flexShrink: 0, marginTop: "2px" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/contact"
              className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition ocws-glow-hover-gold"
              style={{ background: "transparent", color: "#D8AC32", border: "1px solid #D8AC32" }}
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#22D6DC", letterSpacing: "0.15em" }}>
            The Whole-Home Survey — No Subscription Required
          </p>
          <p className="text-sm mb-5" style={{ color: "#888" }}>
            Need a site-wide assessment without a subscription? Purchase a Whole-Home Survey directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { name: "Small Whole-Home Survey", size: "Up to 5 locations", price: "$150", href: "/crows-eye?reckoning=small" },
              { name: "Standard Whole-Home Survey", size: "6–15 locations", price: "$350", href: "/crows-eye?reckoning=standard" },
              { name: "Commercial Whole-Home Survey", size: "16+ locations", price: "$750", href: "/crows-eye?reckoning=commercial" },
              { name: "Pro Certified Whole-Home Survey", size: "Any size · Joshua certifies", price: "$1,500", gold: true, href: "/crows-eye?reckoning=pro" },
            ].map((r) => (
              <Link
                key={r.name}
                href={r.href}
                className={`block rounded-xl p-4 cursor-pointer ${r.gold ? "ocws-glow-hover-gold" : "ocws-card-glow"}`}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${r.gold ? "#D8AC32" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <p className="text-sm font-bold text-white mb-0.5">{r.name}</p>
                <p className="text-xs mb-2" style={{ color: "#888" }}>{r.size}</p>
                <p className="text-xl font-bold" style={{ color: r.gold ? "#D8AC32" : "#22D6DC" }}>{r.price}</p>
                <p className="text-xs mt-2 font-semibold" style={{ color: r.gold ? "rgba(216,172,50,0.7)" : "rgba(34,214,220,0.6)" }}>
                  Start here →
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Chat top-ups — when you burn your monthly Corvus questions */}
        <div
          className="mt-10 rounded-2xl p-6"
          style={{ background: "#0D1520", border: "1px solid #0D6E7A" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#22D6DC", letterSpacing: "0.15em" }}>
            Out of questions? Keep Corvus talking.
          </p>
          <p className="text-sm mb-5" style={{ color: "#888" }}>
            Every plan includes Corvus questions each month. Burn through them and don&rsquo;t need a full upgrade? Top up à la carte — no plan change, no commitment. You&rsquo;ll see these in chat the moment you run low.
            {" "}<span style={{ color: "#D8AC32" }}>Murder includes unlimited Corvus, always.</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { name: "25 Questions",   sub: "A few more answers",        price: "$4" },
              { name: "100 Questions",  sub: "A full evening",            price: "$12" },
              { name: "300 Questions",  sub: "Best value per question",   price: "$25" },
              { name: "Day Pass",       sub: "Unlimited · 24 hours",      price: "$9",  gold: true },
              { name: "Week Pass",      sub: "Unlimited · 7 days",        price: "$35", gold: true },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${t.gold ? "rgba(216,172,50,0.4)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <p className="text-sm font-bold text-white mb-0.5">{t.name}</p>
                <p className="text-xs mb-2" style={{ color: "#888" }}>{t.sub}</p>
                <p className="text-xl font-bold" style={{ color: t.gold ? "#D8AC32" : "#22D6DC" }}>{t.price}</p>
              </div>
            ))}
          </div>
        </div>

      {/* Seat selection modal */}
      {seatModal && modalTier && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#0D1520", border: "1px solid rgba(34,214,220,0.25)", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "440px" }}>
            <p style={{ color: "#22D6DC", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
              {modalTier.name} — {seatModal.isAnnual ? "Annual" : "Monthly"}
            </p>
            <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              How many seats do you need?
            </h3>
            <p style={{ color: "#888888", fontSize: "12px", marginBottom: "16px", lineHeight: 1.6 }}>
              {seatModal.tier === "Flock"
                ? "Flock includes 1 seat. Add up to 4 more for your team."
                : "Murder includes 5 seats. Add up to 10 more for your team."}
            </p>

            {/* Seat selector */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))", gap: "8px", marginBottom: "20px" }}>
              {modalTier.seatOptions?.map((opt) => (
                <button
                  key={opt.seats}
                  type="button"
                  onClick={() => setSelectedSeats(opt.seats)}
                  style={{
                    padding: "10px 4px", borderRadius: "8px", cursor: "pointer", textAlign: "center",
                    background: selectedSeats === opt.seats ? "rgba(34,214,220,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedSeats === opt.seats ? "rgba(34,214,220,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: selectedSeats === opt.seats ? "#22D6DC" : "#888888",
                  }}
                >
                  <div style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1 }}>{opt.seats}</div>
                  <div style={{ fontSize: "10px", marginTop: "2px" }}>seat{opt.seats !== 1 ? "s" : ""}</div>
                  {opt.monthlyAdd > 0 && (
                    <div style={{ fontSize: "9px", color: selectedSeats === opt.seats ? "rgba(34,214,220,0.7)" : "#555", marginTop: "2px" }}>
                      +${seatModal.isAnnual ? opt.annualAdd + "/yr" : opt.monthlyAdd + "/mo"}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Price summary */}
            <div style={{ background: "#1A2332", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888888", fontSize: "13px" }}>
                  {selectedSeats} seat{selectedSeats !== 1 ? "s" : ""} · {seatModal.isAnnual ? "Annual" : "Monthly"}
                </span>
                <span style={{ color: "#22D6DC", fontSize: "20px", fontWeight: 800 }}>
                  ${seatModal.isAnnual ? totalAnnual.toLocaleString() + "/yr" : totalMonthly + "/mo"}
                </span>
              </div>
              {additionalSeats > 0 && (
                <p style={{ color: "#555555", fontSize: "11px", marginTop: "4px" }}>
                  Base + {additionalSeats} additional seat{additionalSeats !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handleCheckout(seatModal.product, additionalSeats)}
                disabled={checkingOut !== null}
                style={{
                  flex: 1, background: "#22D6DC", color: "#0D1520", border: "none", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 700, padding: "12px", cursor: checkingOut ? "not-allowed" : "pointer",
                }}
              >
                {checkingOut ? "Redirecting…" : "Continue to Checkout →"}
              </button>
              <button
                type="button"
                onClick={() => setSeatModal(null)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#888888", fontSize: "13px", padding: "12px 16px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
