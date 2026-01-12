"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function ContactClient({
  initialSubject = "",
}: {
  initialSubject?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(initialSubject || "");
  const [message, setMessage] = useState("");

  // Honeypot (hidden)
  const [company, setCompany] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  const validationError = useMemo(() => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    if (!isEmail(email)) return "Please enter a valid email address.";
    if (!message.trim()) return "Please enter a message.";
    return "";
  }, [name, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate (no disabled mystery)
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
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          company, // honeypot
        }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("sent");

      // Clear fields after successful send
      setName("");
      setEmail("");
      setPhone("");
      setSubject(initialSubject || "");
      setMessage("");
      setCompany("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Failed to send message.");
    }
  }

  return (
    <main className="ocws-container py-10">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Contact
        </h1>

        <p className="mt-3 text-white/75">
          Send a message and we’ll get back to you by email. If you’re ready to
          start, you can also use the intake form.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/request-quote" className="ocws-btn ocws-btn-primary">
            Request a Quote
          </Link>
          <Link href="/services" className="ocws-btn ocws-btn-ghost">
            View Services
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-8 ocws-tile p-6 space-y-5">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Name <span className="text-white/60">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (status !== "sent") setStatus("idle");
                }}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Email <span className="text-white/60">*</span>
              </label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "sent") setStatus("idle");
                }}
                type="email"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Phone (optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Subject (optional)
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="e.g., Clinic Wi-Fi drops, indoor LTE/5G weak zones…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Message <span className="text-white/60">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (status !== "sent") setStatus("idle");
              }}
              rows={6}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Briefly describe what you’re seeing, the environment, and what success looks like."
            />
          </div>

          <p className="text-xs text-white/60">
            By submitting, you consent to receive a reply from OCWS regarding
            your request. We don’t sell your info. No spam calls.
          </p>

          {status === "sent" ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white">
              ✅ Message sent. We’ll reply by email.
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-white">
              ❌ {errorMsg || "Please check the required fields and try again."}
            </div>
          ) : null}

          {/* Helpful hint when required fields aren’t filled */}
          {status !== "sending" && status !== "sent" && validationError ? (
            <div className="text-xs text-white/60">
              Required: Name, Email, Message.
            </div>
          ) : null}

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="
                inline-flex items-center justify-center
                rounded-2xl px-6 py-3
                font-semibold tracking-tight
                border border-white/15
                bg-white/10 text-white
                shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                hover:bg-white/15 hover:border-white/25
                active:translate-y-[1px]
                disabled:opacity-60 disabled:cursor-not-allowed
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                transition
              "
              title={validationError ? validationError : undefined}
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
