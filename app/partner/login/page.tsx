"use client";

// app/partner/login/page.tsx
// Partner portal entry. Validates a CORVUS-PARTNER-* lead code and stores it
// locally; the code is the credential for every subsequent portal call.

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setPartnerCode, T, Panel } from "../_shared";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const c = code.trim().toUpperCase();
    if (!c) return;
    setBusy(true);
    try {
      const res = await fetch("/api/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = await res.json();
      if (!data?.valid) {
        setError("We don't recognize that partner code. Check it and try again.");
        return;
      }
      setPartnerCode(data.leadCode);
      router.replace("/partner/issue");
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Panel style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>
          Crow&apos;s Eye <span style={{ color: T.cyan }}>Partner</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 14, margin: "0 0 20px" }}>
          Sign in with your partner code to issue scan tokens and view reports.
        </p>
        <form onSubmit={submit}>
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CORVUS-PARTNER-XXXXXX"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 15,
              background: "rgba(0,0,0,0.25)", color: T.text,
              border: `1px solid ${T.border}`, outline: "none",
              fontFamily: "ui-monospace, monospace", letterSpacing: 1,
            }}
          />
          {error && <p style={{ color: "#f87171", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
          <button
            type="submit"
            disabled={busy || !code.trim()}
            style={{
              width: "100%", marginTop: 16, padding: "12px 14px", borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer",
              background: T.cyan, color: T.bg, border: "none", opacity: busy || !code.trim() ? 0.6 : 1,
            }}
          >{busy ? "Checking…" : "Sign in"}</button>
        </form>
      </Panel>
    </div>
  );
}
