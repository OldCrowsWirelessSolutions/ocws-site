"use client";

import { useMemo, useState } from "react";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

const SUBJECT_OPTIONS = [
  "General inquiry",
  "Request on-site assessment",
  "Technical question",
  "Press/media",
  "Other",
];

export default function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validationError = useMemo(() => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    if (!isEmail(email)) return "Please enter a valid email address.";
    if (!message.trim()) return "Please enter a message.";
    return "";
  }, [name, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validationError) {
      setStatus("error");
      setErrorMsg(validationError);
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message, address, company: honeypot }),
      });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to send message.");
      setStatus("sent");
      setName(""); setEmail(""); setPhone(""); setSubject("");
      setMessage(""); setAddress(""); setHoneypot("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message.");
    }
  }

  return (
    <main style={{ background: "#0D1520", minHeight: "100vh" }}>
      <section className="ocws-container py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#00C2C7", letterSpacing: "0.18em" }}>
            Old Crows Wireless Solutions
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-base mb-10" style={{ color: "#888" }}>
            For on-site assessment requests please include your address so we can confirm service
            area and any travel fee.
          </p>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl p-6 space-y-5"
            style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">
                  Full name <span style={{ color: "#00C2C7" }}>*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (status !== "sent") setStatus("idle"); }}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
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
                  onChange={(e) => { setEmail(e.target.value); if (status !== "sent") setStatus("idle"); }}
                  type="email"
                  className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Phone <span style={{ color: "#888" }}>(optional)</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <option value="">Select a subject…</option>
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Message <span style={{ color: "#00C2C7" }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); if (status !== "sent") setStatus("idle"); }}
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                placeholder="Describe what you're seeing, your environment, and what success looks like."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Address{" "}
                <span style={{ color: "#888" }}>(optional — required for assessment requests)</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
                placeholder="Street address, city, state"
                autoComplete="street-address"
              />
            </div>

            {status === "sent" && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-white"
                style={{ background: "rgba(13,110,122,0.2)", border: "1px solid #0D6E7A" }}
              >
                Message received. Joshua will respond within 1 business day.
              </div>
            )}

            {status === "error" && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-white"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs" style={{ color: "#555" }}>
                We don&rsquo;t sell your info. No spam.
              </p>
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-60 transition"
                style={{ background: "#00C2C7", color: "#0D1520" }}
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
