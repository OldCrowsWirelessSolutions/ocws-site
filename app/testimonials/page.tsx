// app/testimonials/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

interface TestimonialRecord {
  id: string;
  name: string;
  location: string;
  testimonial: string;
  rating: number;
  submittedAt: string;
  approvedAt?: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={i < rating ? "#B8922A" : "#2a2a2a"} xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.14L8 10.25l-3.71 1.97.71-4.14L2 5.35l4.15-.6L8 1z"/>
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [tName, setTName] = useState("");
  const [tLocation, setTLocation] = useState("");
  const [tText, setTText] = useState("");
  const [tRating, setTRating] = useState(5);
  const [tEmail, setTEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Approved testimonials from Redis
  const [approved, setApproved] = useState<TestimonialRecord[]>([]);

  useEffect(() => {
    fetch("/api/testimonials/list")
      .then((r) => r.json())
      .then((d: { testimonials?: TestimonialRecord[] }) => setApproved(d.testimonials ?? []))
      .catch(() => {});
  }, []);

  const validationError = useMemo(() => {
    if (!tName.trim()) return "Please enter your name.";
    if (!tText.trim()) return "Please enter your testimonial.";
    if (tEmail && !isEmail(tEmail)) return "Please enter a valid email.";
    return "";
  }, [tName, tText, tEmail]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tName,
          location: tLocation,
          testimonial: tText,
          rating: tRating,
          email: tEmail,
          honeypot,
        }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || "Submission failed.");
      setStatus("sent");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        {/* Header */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Crow&rsquo;s Eye · OCWS
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            What clients are saying.
          </h1>
          <p className="text-sm" style={{ color: "#B8922A" }}>
            All testimonials are verified before posting.
          </p>
        </div>

        {/* Approved testimonials */}
        <div className="mt-10 mb-16 max-w-3xl space-y-6">

          {/* Eric Mims — Featured (always shown) */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "#1A2332", border: "1px solid rgba(184,146,42,0.35)", borderTop: "3px solid #B8922A" }}
          >
            {/* Stars + badge */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 16 16" fill="#B8922A" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.14L8 10.25l-3.71 1.97.71-4.14L2 5.35l4.15-.6L8 1z"/>
                  </svg>
                ))}
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(184,146,42,0.12)", border: "1px solid rgba(184,146,42,0.3)", color: "#B8922A" }}
              >
                ★ Featured
              </span>
            </div>

            {/* Pull quote */}
            <blockquote className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.82)" }}>
              &ldquo;Corvus impressed me. I&rsquo;ve been in IT &gt;30 years (including leading network infrastructure teams), and in under 5 minutes it ingested three Wi-Fi analyzer scans from my small-office WLAN and produced actionable guidance. It reads what&rsquo;s visible on-air&mdash;SSIDs/BSSIDs, RSSI, channels, and 2.4&thinsp;GHz vs 5&thinsp;GHz&mdash;flags likely co-channel contention, explains impact, and recommends fixes (e.g., channel/band changes). It also validates what&rsquo;s already solid so you can keep it stable. Wish I&rsquo;d had this in 2003 rolling out 802.11g. Hats off to Josh and Old Crows Wireless.&rdquo;
            </blockquote>

            {/* Reviewer */}
            <div className="flex items-end justify-between gap-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <p className="text-sm font-bold text-white">Eric Mims</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>San Antonio, TX</p>
                <p className="text-xs mt-1" style={{ color: "#B8922A" }}>30+ years IT experience · Network infrastructure lead</p>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>March 2026</p>
            </div>
          </div>

          {/* Approved testimonials from Redis */}
          {approved.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-7"
              style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderTop: "3px solid #0D6E7A" }}
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <StarRow rating={t.rating} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {new Date(t.approvedAt ?? t.submittedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
              <blockquote className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.78)" }}>
                &ldquo;{t.testimonial}&rdquo;
              </blockquote>
              <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-sm font-bold text-white">{t.name}</p>
                {t.location && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.location}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Submission form */}
        <div id="submit" className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Share your experience.</h2>
          <p className="text-sm mb-8" style={{ color: "#888" }}>
            Used Crow&rsquo;s Eye or worked with OCWS? We&rsquo;d love to hear about it.
          </p>

          {status === "sent" ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "#1A2332", border: "1px solid #0D6E7A" }}
            >
              <p className="text-xl font-bold text-white mb-2">
                Your testimonial has been submitted for review.
              </p>
              <p style={{ color: "#888" }}>Thank you.</p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="rounded-2xl p-6 space-y-5"
              style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">
                    Name <span style={{ color: "#00C2C7" }}>*</span>
                  </label>
                  <input
                    value={tName}
                    onChange={(e) => { setTName(e.target.value); setStatus("idle"); }}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">
                    Location <span style={{ color: "#888" }}>(city, state)</span>
                  </label>
                  <input
                    value={tLocation}
                    onChange={(e) => setTLocation(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                    placeholder="Pensacola, FL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Testimonial <span style={{ color: "#00C2C7" }}>*</span>
                </label>
                <textarea
                  value={tText}
                  onChange={(e) => { setTText(e.target.value); setStatus("idle"); }}
                  rows={4}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Tell us about your experience…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Star rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTRating(n)}
                      className="text-2xl transition"
                      style={{ color: n <= tRating ? "#B8922A" : "#444" }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Email <span style={{ color: "#888" }}>(not displayed publicly — optional)</span>
                </label>
                <input
                  value={tEmail}
                  onChange={(e) => { setTEmail(e.target.value); setStatus("idle"); }}
                  type="email"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {status === "error" && (
                <div
                  className="rounded-xl px-4 py-3 text-sm text-white"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-60 transition"
                  style={{ background: "#00C2C7", color: "#0D1520" }}
                >
                  {status === "sending" ? "Submitting…" : "Submit Testimonial"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
