"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm font-semibold text-ocws-gold">Message sent</div>
        <p className="mt-2 text-sm text-white/75">
          Thanks — we’ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-ocws-gold">Name</label>
        <input
          required
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-ocws-cyan"
          placeholder="Your name"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-ocws-gold">Email</label>
        <input
          required
          type="email"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-ocws-cyan"
          placeholder="you@email.com"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-ocws-gold">Message</label>
        <textarea
          required
          rows={5}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-ocws-cyan"
          placeholder="How can we help?"
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex items-center justify-center rounded-xl bg-ocws-gold px-6 py-3 text-sm font-semibold text-ocws-midnight hover:bg-ocws-goldSoft ocws-glow-hover-gold"
      >
        Send
      </button>
    </form>
  );
}
