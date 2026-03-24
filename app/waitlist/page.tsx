// app/waitlist/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const TIER_OPTIONS = ["Nest", "Flock", "Murder", "Not sure yet"];

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, tier, honeypot }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main style={{ background: "#0D1520", minHeight: "100vh" }}>
        <section className="ocws-container py-20 text-center">
          <p className="text-6xl mb-6">🐦‍⬛</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            You&rsquo;re on the list.
          </h1>
          <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "#888" }}>
            Corvus will be in touch.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition"
            style={{ background: "#00C2C7", color: "#0D1520" }}
          >
            Back to Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-20">
        <div className="max-w-md mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4 text-center"
            style={{ color: "#00C2C7", letterSpacing: "0.18em" }}
          >
            Crow&rsquo;s Eye &middot; Mobile App
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
            Join the Waitlist
          </h1>
          <p className="text-sm mb-10 text-center" style={{ color: "#888" }}>
            Crow&rsquo;s Eye is coming to iOS and Android. Be first to know when it launches.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ display: "none" }}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-white/60">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{
                  background: "#1A2332",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-white/60">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{
                  background: "#1A2332",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-white/60">
                Tier preference <span style={{ color: "#555" }}>(optional)</span>
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{
                  background: "#1A2332",
                  border: "1px solid rgba(255,255,255,0.10)",
                  appearance: "none",
                }}
              >
                <option value="">Select a tier…</option>
                {TIER_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-xl py-3 text-sm font-bold transition ocws-glow-hover"
              style={{
                background: "#00C2C7",
                color: "#0D1520",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {loading ? "Submitting…" : "Join the Waitlist"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
