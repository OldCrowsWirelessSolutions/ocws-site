// app/testimonials/page.tsx
"use client";

import { useMemo, useState } from "react";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
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

        {/* Empty state */}
        <div
          className="rounded-2xl p-10 text-center mb-16 mt-8"
          style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-5xl mb-4">🐦‍⬛</p>
          <p className="text-xl font-bold text-white mb-2">
            Verdicts are being rendered.
          </p>
          <p className="text-base" style={{ color: "#888" }}>
            Testimonials coming soon. Corvus doesn&rsquo;t rush. Neither do we.
          </p>
        </div>

        {/* Submission form */}
        <div className="max-w-2xl">
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
