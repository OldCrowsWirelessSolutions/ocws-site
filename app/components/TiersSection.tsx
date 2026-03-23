// app/components/TiersSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type Tier = "Nest" | "Flock" | "Murder";

function WaitlistModal({
  tier,
  onClose,
}: {
  tier: Tier;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setStatus("error");
      setErrorMsg("Name and email are required.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, tier, message, honeypot }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setStatus("sent");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "#1A2332", border: "1px solid #0D6E7A" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Join the Waitlist — {tier}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {status === "sent" ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-3">🐦‍⬛</p>
            <p className="text-white font-semibold text-lg">You&rsquo;re on the list.</p>
            <p className="mt-2 text-sm" style={{ color: "#888" }}>
              Corvus will be in touch when your tier launches.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-semibold"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Full name <span style={{ color: "#00C2C7" }}>*</span>
              </label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Email <span style={{ color: "#00C2C7" }}>*</span>
              </label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                type="email"
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">Tier</label>
              <input
                value={tier}
                readOnly
                className="w-full rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", color: "#00C2C7" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Anything you want us to know? <span style={{ color: "#888" }}>(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {status === "error" && (
              <div className="rounded-xl px-4 py-3 text-sm text-white" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60 transition"
              style={{ background: "#00C2C7", color: "#0D1520" }}
            >
              {status === "sending" ? "Reserving…" : "Reserve My Spot"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const tiers = [
  {
    id: "Nest" as Tier,
    emoji: "🪺",
    name: "NEST",
    price: "$19/mo",
    priceAlt: "or $149/yr",
    tagline: "For homeowners and small businesses",
    features: [
      "Unlimited Corvus Verdicts",
      "Signal List analysis",
      "Channel congestion detection",
      "Router-specific fix instructions",
      "Step-by-step repair guide",
      "PDF report download",
      "Email support",
    ],
    featured: false,
  },
  {
    id: "Flock" as Tier,
    emoji: "🐦‍⬛",
    name: "FLOCK",
    price: "$99/mo",
    priceAlt: "or $899/yr",
    tagline: "For MSPs and IT consultants",
    features: [
      "Everything in Nest",
      "Multi-seat up to 5 users",
      "White-label PDF reports",
      "The Full Reckoning multi-site surveys",
      "Priority support",
      "Client management dashboard",
    ],
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "Murder" as Tier,
    emoji: "💀",
    name: "MURDER",
    price: "$249/mo",
    priceAlt: "or $1,999/yr",
    tagline: "For RF engineers and power users",
    features: [
      "Everything in Flock",
      "Unlimited seats",
      "Full design suite",
      "Custom report branding",
      "API access",
      "Dedicated support",
      "OCWS certified training",
    ],
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
  const [openModal, setOpenModal] = useState<Tier | null>(null);

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* First 3 tiers */}
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="relative flex flex-col rounded-2xl p-6"
              style={{
                background: "#0D1520",
                border: `1px solid ${tier.featured ? "#00C2C7" : "#0D6E7A"}`,
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

              <ul className="flex-1 space-y-2 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#aaa" }}>
                    <span style={{ color: "#00C2C7", flexShrink: 0, marginTop: "2px" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setOpenModal(tier.id)}
                className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition"
                style={{
                  background: tier.featured ? "#00C2C7" : "transparent",
                  color: tier.featured ? "#0D1520" : "#00C2C7",
                  border: tier.featured ? "none" : "1px solid #00C2C7",
                }}
              >
                Join Waitlist
              </button>
            </div>
          ))}

          {/* OCWS Pro card */}
          <div
            className="flex flex-col rounded-2xl p-6"
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
              className="w-full inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition"
              style={{ background: "transparent", color: "#B8922A", border: "1px solid #B8922A" }}
            >
              Request Assessment
            </a>
          </div>
        </div>
      </div>

      {openModal && (
        <WaitlistModal tier={openModal} onClose={() => setOpenModal(null)} />
      )}
    </section>
  );
}
