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

const btnPrimary = (disabled: boolean, color = "#00C2C7"): React.CSSProperties => ({
  width: "100%",
  padding: "12px",
  background: disabled ? "#0D6E7A" : color,
  color: "#0D1520",
  borderRadius: "10px",
  border: "none",
  fontSize: "14px",
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
  letterSpacing: "0.05em",
});

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "SpectrumLife2026!!";

type LoginStep =
  | "code"
  | "admin_password"
  | "vip_create_password"
  | "vip_enter_password"
  | "sub_create_password"
  | "sub_enter_password";

export default function LoginPage() {
  const router = useRouter();

  // Step 1: code entry
  const [codeInput, setCodeInput]     = useState("");
  const [codeVisible, setCodeVisible] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Step state
  const [step, setStep] = useState<LoginStep>("code");

  // Pending context (after code identified, before password)
  const [pendingCode, setPendingCode]                   = useState("");
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState("");
  const [pendingName, setPendingName]                   = useState("");

  // Admin second factor
  const [adminPw, setAdminPw]         = useState("");
  const [adminPwVisible, setAdminPwVisible] = useState(false);
  const [adminPwError, setAdminPwError]     = useState("");

  // VIP / subscriber password
  const [pw, setPw]               = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function reset() {
    setStep("code");
    setPendingCode("");
    setPendingSubscriptionId("");
    setPendingName("");
    setPw("");
    setPwConfirm("");
    setPwError("");
    setAdminPw("");
    setAdminPwError("");
  }

  function storeAndRedirect(code: string) {
    try { localStorage.setItem("corvus_sub_code", code); } catch { /* */ }
    router.push("/dashboard");
  }

  // ── Step 1: code submit ───────────────────────────────────────────────────

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
        type: "admin" | "admin_first_factor" | "subscriber" | "founder" | "promo" | "invalid";
        tier?: string;
        subscriptionId?: string;
        name?: string;
        passwordSet?: boolean;
      };

      if (data.type === "admin") {
        try { localStorage.setItem("corvus_admin_auth", ADMIN_KEY); } catch { /* */ }
        router.push("/admin");

      } else if (data.type === "admin_first_factor") {
        setStep("admin_password");

      } else if (data.type === "founder") {
        const code = raw.toUpperCase();
        setPendingCode(code);
        setPendingName(data.name ?? "");
        if (data.passwordSet) {
          setStep("vip_enter_password");
        } else {
          setStep("vip_create_password");
        }

      } else if (data.type === "subscriber") {
        const code = data.subscriptionId ?? raw.toUpperCase();
        setPendingCode(raw.toUpperCase());
        setPendingSubscriptionId(code);
        if (data.passwordSet) {
          setStep("sub_enter_password");
        } else {
          setStep("sub_create_password");
        }

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

  // ── Admin password step ───────────────────────────────────────────────────

  function handleAdminPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!adminPw) return;
    setAdminPwError("");
    if (adminPw === ADMIN_KEY) {
      try { localStorage.setItem("corvus_admin_auth", ADMIN_KEY); } catch { /* */ }
      router.push("/admin");
    } else {
      setAdminPwError("Invalid admin password.");
    }
  }

  // ── VIP create password ───────────────────────────────────────────────────

  async function handleVipCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || !pwConfirm) return;
    if (pw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pw !== pwConfirm) { setPwError("Passwords do not match."); return; }
    setPwError("");
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingCode, password: pw }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        storeAndRedirect(pendingCode);
      } else {
        setPwError(data.error ?? "Failed to set password.");
      }
    } catch {
      setPwError("Connection error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  // ── VIP enter password ────────────────────────────────────────────────────

  async function handleVipEnterPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setPwError("");
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingCode, password: pw }),
      });
      const data = await res.json() as { valid?: boolean; error?: string };
      if (data.valid) {
        storeAndRedirect(pendingCode);
      } else if (data.error) {
        setPwError(data.error);
      } else {
        setPwError("Incorrect password.");
      }
    } catch {
      setPwError("Connection error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  // ── Subscriber create password ────────────────────────────────────────────

  async function handleSubCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || !pwConfirm) return;
    if (pw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pw !== pwConfirm) { setPwError("Passwords do not match."); return; }
    setPwError("");
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingSubscriptionId, password: pw }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        storeAndRedirect(pendingSubscriptionId);
      } else {
        setPwError(data.error ?? "Failed to set password.");
      }
    } catch {
      setPwError("Connection error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  // ── Subscriber enter password ─────────────────────────────────────────────

  async function handleSubEnterPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setPwError("");
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingSubscriptionId, password: pw }),
      });
      const data = await res.json() as { valid?: boolean; error?: string };
      if (data.valid) {
        storeAndRedirect(pendingSubscriptionId);
      } else if (data.error) {
        setPwError(data.error);
      } else {
        setPwError("Incorrect password.");
      }
    } catch {
      setPwError("Connection error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  // ── Shared layout wrapper ─────────────────────────────────────────────────

  function Shell({ children, accentColor = "#00C2C7" }: { children: React.ReactNode; accentColor?: string }) {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
                <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="48px" style={{ objectFit: "contain" }} priority />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ color: "#ffffff", fontSize: "17px", fontWeight: 700, margin: 0 }}>Corvus Dashboard</p>
                <p style={{ color: accentColor, fontSize: "11px", margin: 0 }}>Old Crows Wireless Solutions</p>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // ── Admin password ────────────────────────────────────────────────────────

  if (step === "admin_password") {
    return (
      <Shell accentColor="#B8922A">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Admin Authentication</h1>
          <p style={{ color: "#B8922A", fontSize: "12px" }}>Step 2 of 2</p>
        </div>
        <div style={{ background: "#1A2332", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleAdminPassword}>
            <label style={{ display: "block", color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Admin Password
            </label>
            <div style={{ position: "relative", marginBottom: adminPwError ? "8px" : "20px" }}>
              <input
                type={adminPwVisible ? "text" : "password"}
                autoComplete="off"
                autoCapitalize="none"
                placeholder="Admin password"
                value={adminPw}
                onChange={e => setAdminPw(e.target.value)}
                style={{ ...inputStyle, paddingRight: "60px" }}
                autoFocus
              />
              <button type="button" onClick={() => setAdminPwVisible(v => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                {adminPwVisible ? "Hide" : "Show"}
              </button>
            </div>
            {adminPwError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{adminPwError}</p>}
            <button type="submit" disabled={!adminPw} style={btnPrimary(!adminPw, "#B8922A")}>
              Access Admin Dashboard
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── VIP: create password ──────────────────────────────────────────────────

  if (step === "vip_create_password") {
    return (
      <Shell accentColor="#D4AF37">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
            Welcome{pendingName ? `, ${pendingName.split(" ")[0]}` : ""}
          </h1>
          <p style={{ color: "#D4AF37", fontSize: "12px", marginBottom: "4px" }}>VIP Founding Member</p>
          <p style={{ color: "#888888", fontSize: "13px" }}>Create a password to secure your account</p>
        </div>
        <div style={{ background: "#1A2332", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleVipCreatePassword}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={pwVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "60px" }}
                  autoFocus
                />
                <button type="button" onClick={() => setPwVisible(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                  {pwVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: pwError ? "8px" : "20px" }}>
              <label style={{ display: "block", color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                Confirm Password
              </label>
              <input
                type={pwVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                style={inputStyle}
              />
            </div>
            {pwError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{pwError}</p>}
            <button type="submit" disabled={pwLoading || !pw || !pwConfirm} style={btnPrimary(pwLoading || !pw || !pwConfirm, "#D4AF37")}>
              {pwLoading ? "Setting up…" : "Create Password & Enter"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── VIP: enter password ───────────────────────────────────────────────────

  if (step === "vip_enter_password") {
    return (
      <Shell accentColor="#D4AF37">
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
            Welcome back{pendingName ? `, ${pendingName.split(" ")[0]}` : ""}
          </h1>
          <p style={{ color: "#D4AF37", fontSize: "12px" }}>VIP Founding Member</p>
        </div>
        <div style={{ background: "#1A2332", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleVipEnterPassword}>
            <label style={{ display: "block", color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative", marginBottom: pwError ? "8px" : "20px" }}>
              <input
                type={pwVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                style={{ ...inputStyle, paddingRight: "60px" }}
                autoFocus
              />
              <button type="button" onClick={() => setPwVisible(v => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                {pwVisible ? "Hide" : "Show"}
              </button>
            </div>
            {pwError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{pwError}</p>}
            <button type="submit" disabled={pwLoading || !pw} style={btnPrimary(pwLoading || !pw, "#D4AF37")}>
              {pwLoading ? "Verifying…" : "Enter Dashboard"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── Subscriber: create password ───────────────────────────────────────────

  if (step === "sub_create_password") {
    return (
      <Shell>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Create Your Password</h1>
          <p style={{ color: "#888888", fontSize: "13px" }}>Secure your subscriber account with a password</p>
        </div>
        <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleSubCreatePassword}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={pwVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "60px" }}
                  autoFocus
                />
                <button type="button" onClick={() => setPwVisible(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                  {pwVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: pwError ? "8px" : "20px" }}>
              <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                Confirm Password
              </label>
              <input
                type={pwVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                style={inputStyle}
              />
            </div>
            {pwError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{pwError}</p>}
            <button type="submit" disabled={pwLoading || !pw || !pwConfirm} style={btnPrimary(pwLoading || !pw || !pwConfirm)}>
              {pwLoading ? "Setting up…" : "Create Password & Enter"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── Subscriber: enter password ────────────────────────────────────────────

  if (step === "sub_enter_password") {
    return (
      <Shell>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Welcome Back</h1>
          <p style={{ color: "#888888", fontSize: "13px" }}>Enter your password to access your dashboard</p>
        </div>
        <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleSubEnterPassword}>
            <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative", marginBottom: pwError ? "8px" : "20px" }}>
              <input
                type={pwVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                style={{ ...inputStyle, paddingRight: "60px" }}
                autoFocus
              />
              <button type="button" onClick={() => setPwVisible(v => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                {pwVisible ? "Hide" : "Show"}
              </button>
            </div>
            {pwError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{pwError}</p>}
            <button type="submit" disabled={pwLoading || !pw} style={btnPrimary(pwLoading || !pw)}>
              {pwLoading ? "Verifying…" : "Enter Dashboard"}
            </button>
          </form>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── Code step (default) ───────────────────────────────────────────────────

  return (
    <Shell>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Enter Your Access Code</h1>
        <p style={{ color: "#888888", fontSize: "13px" }}>Subscriber code, founding code, or admin access</p>
      </div>

      <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px" }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
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
            <button type="button" onClick={() => setCodeVisible(v => !v)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, letterSpacing: "0.05em", padding: "4px" }}>
              {codeVisible ? "Hide" : "Show"}
            </button>
          </div>
          {error && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px", lineHeight: 1.5 }}>{error}</p>}
          <button type="submit" disabled={loading || !codeInput.trim()} style={btnPrimary(loading || !codeInput.trim())}>
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p style={{ fontSize: "12px", color: "#555555", marginBottom: "8px" }}>
          <Link href="/recover-code" style={{ color: "#00C2C7" }}>Lost your code? Recover it here</Link>
        </p>
        <p style={{ fontSize: "12px", color: "#555555" }}>
          Don&rsquo;t have a subscription?{" "}
          <Link href="/#pricing" style={{ color: "#00C2C7" }}>See plans</Link>
        </p>
      </div>
    </Shell>
  );
}
