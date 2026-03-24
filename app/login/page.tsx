"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#0D1520",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  padding: "12px 14px",
  color: "#ffffff",
  fontSize: "14px",
  fontFamily: "monospace",
  letterSpacing: "0.08em",
  outline: "none",
};

export default function LoginPage() {
  const router = useRouter();
  const [codeInput, setCodeInput]       = useState("");
  const [codeVisible, setCodeVisible]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = codeInput.trim();
    if (!raw) return;
    setError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/identify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: raw }),
      });
      const data = await res.json() as {
        type: "admin" | "subscriber" | "founder" | "crowseye_bypass" | "promo" | "invalid";
        tier?: string;
        subscriptionId?: string;
      };

      if (data.type === "admin") {
        try { localStorage.setItem("corvus_admin_auth", "true"); } catch { /* */ }
        router.push("/admin");
      } else if (data.type === "subscriber" || data.type === "founder") {
        // Store the code so the dashboard auto-authenticates
        const code = data.type === "subscriber" ? (data.subscriptionId ?? raw.toUpperCase()) : raw.toUpperCase();
        try { localStorage.setItem("corvus_sub_code", code); } catch { /* */ }
        router.push("/dashboard");
      } else if (data.type === "crowseye_bypass") {
        // OCWS2026 is only valid on the Crow's Eye page
        setError("That code is for Crow's Eye only. Use it on the Crow's Eye page.");
      } else if (data.type === "promo") {
        setError("Promo codes are used on the Crow's Eye page, not here.");
      } else {
        setError("Invalid code. Check your welcome email or recover your code.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
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
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
              <Image
                src="/OCWS_Logo_Transparent.png"
                alt="Old Crows Wireless Solutions"
                fill
                sizes="48px"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#ffffff", fontSize: "17px", fontWeight: 700, margin: 0 }}>
                Corvus Dashboard
              </p>
              <p style={{ color: "#00C2C7", fontSize: "11px", margin: 0 }}>
                Old Crows Wireless Solutions
              </p>
            </div>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            Enter Your Access Code
          </h1>
          <p style={{ color: "#888888", fontSize: "13px" }}>
            Subscriber code, founding code, or admin access
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: "#1A2332",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "32px",
        }}>
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
              Access Code
            </label>

            <div style={{ position: "relative", marginBottom: error ? "8px" : "20px" }}>
              <input
                type={codeVisible ? "text" : "password"}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="OCWS-NEST-XXXXXXXX"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                style={{ ...inputStyle, paddingRight: "60px" }}
              />
              <button
                type="button"
                onClick={() => setCodeVisible(v => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#555555",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  padding: "4px",
                }}
              >
                {codeVisible ? "Hide" : "Show"}
              </button>
            </div>

            {error && (
              <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px", lineHeight: 1.5 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !codeInput.trim()}
              style={{
                width: "100%",
                padding: "12px",
                background: loading || !codeInput.trim() ? "#0D6E7A" : "#00C2C7",
                color: "#0D1520",
                borderRadius: "10px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading || !codeInput.trim() ? "not-allowed" : "pointer",
                letterSpacing: "0.05em",
              }}
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "12px", color: "#555555", marginBottom: "8px" }}>
            <Link href="/recover-code" style={{ color: "#00C2C7" }}>
              Lost your code? Recover it here
            </Link>
          </p>
          <p style={{ fontSize: "12px", color: "#555555" }}>
            Don&rsquo;t have a subscription?{" "}
            <Link href="/#pricing" style={{ color: "#00C2C7" }}>
              See plans
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
