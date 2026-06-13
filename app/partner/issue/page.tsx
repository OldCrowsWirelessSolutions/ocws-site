"use client";

// app/partner/issue/page.tsx
// The help-desk operator's main screen: generate a one-time CORVUS-SCAN token to
// read to (or text) a customer. Shows the code big, with copy + QR + countdown.

import React, { useState } from "react";
import { usePartnerAuth, partnerHeaders, PartnerShell, Panel, T } from "../_shared";

export default function PartnerIssuePage() {
  const code = usePartnerAuth();
  const [customerName, setCustomerName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    setError(null);
    setToken(null);
    setCopied(false);
    try {
      const res = await fetch("/api/partner/issue-scan-token", {
        method: "POST",
        headers: partnerHeaders(),
        body: JSON.stringify({ customerName: customerName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Could not generate a token. Try again.");
        return;
      }
      setToken(data.token);
      setExpiresAt(data.expiresAt);
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  if (!code) return null; // redirecting

  const qrSrc = token
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=1A2332&color=22D6DC&data=${encodeURIComponent(token)}`
    : null;
  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <PartnerShell active="issue">
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Issue a scan token</h1>
      <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
        Generate a one-time code, then read it to your customer or text it over. They enter it in
        the Crow&apos;s Eye app under &ldquo;Have a code from your help desk?&rdquo; to run one scan.
      </p>

      <Panel>
        <label style={{ fontSize: 13, color: T.muted2, display: "block", marginBottom: 6 }}>
          Customer name (optional — helps you match the report later)
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Jane from 14 Oak St"
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15,
            background: "rgba(0,0,0,0.25)", color: T.text, border: `1px solid ${T.border}`,
            outline: "none", marginBottom: 18,
          }}
        />
        <button
          onClick={generate}
          disabled={busy}
          style={{
            width: "100%", padding: "16px", borderRadius: 12, fontSize: 17, fontWeight: 800,
            cursor: busy ? "default" : "pointer", background: T.cyan, color: T.bg,
            border: "none", opacity: busy ? 0.6 : 1,
          }}
        >{busy ? "Generating…" : "Generate Scan Token"}</button>
        {error && <p style={{ color: "#f87171", fontSize: 13, margin: "14px 0 0" }}>{error}</p>}
      </Panel>

      {token && (
        <Panel style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ color: T.muted2, fontSize: 13, margin: "0 0 10px" }}>One-time code</p>
          <div style={{
            fontFamily: "ui-monospace, monospace", fontSize: 30, fontWeight: 800,
            letterSpacing: 2, color: T.cyan, wordBreak: "break-all",
          }}>{token}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "16px 0" }}>
            <button onClick={copy} style={{
              padding: "9px 18px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: copied ? T.gold : "transparent", color: copied ? T.bg : T.text,
              border: `1px solid ${copied ? T.gold : T.border}`,
            }}>{copied ? "Copied!" : "Copy code"}</button>
          </div>
          {qrSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="Scan token QR" width={180} height={180}
              style={{ borderRadius: 12, margin: "4px auto 0", display: "block" }} />
          )}
          {expiryLabel && (
            <p style={{ color: T.muted2, fontSize: 13, marginTop: 14 }}>
              Expires <strong style={{ color: T.muted }}>{expiryLabel}</strong> · single use
            </p>
          )}
        </Panel>
      )}
    </PartnerShell>
  );
}
