"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RecoverCodePage() {
  const [email, setEmail]       = useState("");
  const [status, setStatus]     = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res  = await fetch("/api/subscriptions/recover-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json() as { success?: boolean; message?: string };

      if (data.success === false) {
        setStatus("error");
        setErrorMsg(
          data.message ??
          "No active subscription found for that email. Contact joshua@oldcrowswireless.com"
        );
      } else {
        setStatus("sent");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Connection error. Please try again.");
    }
  }

  return (
    <div style={{
      minHeight: "75vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ position: "relative", width: "40px", height: "40px", flexShrink: 0 }}>
              <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="40px" style={{ objectFit: "contain" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, margin: 0 }}>Recover Your Subscriber Code</p>
              <p style={{ color: "#00C2C7", fontSize: "11px", margin: 0 }}>Old Crows Wireless Solutions</p>
            </div>
          </div>
          <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6 }}>
            Enter the email address you used when subscribing.<br />
            We&rsquo;ll send your code right away.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#1A2332",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "32px",
        }}>
          {status === "sent" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>🐦‍⬛</p>
              <p style={{ color: "#00C2C7", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                Check your email.
              </p>
              <p style={{ color: "#888888", fontSize: "13px", lineHeight: 1.6 }}>
                Your code is on its way. If you don&rsquo;t see it within a few minutes, check your spam folder or contact{" "}
                <a href="mailto:joshua@oldcrowswireless.com" style={{ color: "#00C2C7" }}>
                  joshua@oldcrowswireless.com
                </a>.
              </p>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "24px",
                  background: "#00C2C7",
                  color: "#0D1520",
                  borderRadius: "10px",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{
                display: "block",
                color: "#00C2C7",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="email"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#0D1520",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  color: "#ffffff",
                  fontSize: "16px",
                  outline: "none",
                  marginBottom: status === "error" ? "8px" : "20px",
                }}
              />

              {status === "error" && (
                <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px", lineHeight: 1.5 }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !email.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: status === "sending" || !email.trim() ? "#0D6E7A" : "#00C2C7",
                  color: "#0D1520",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: status === "sending" || !email.trim() ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {status === "sending" ? "Sending…" : "Send My Code"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#555555" }}>
          Have your code?{" "}
          <Link href="/dashboard" style={{ color: "#00C2C7" }}>Go to Dashboard</Link>
          {" · "}
          <Link href="/crows-eye" style={{ color: "#00C2C7" }}>Crow&rsquo;s Eye</Link>
        </p>
      </div>
    </div>
  );
}
