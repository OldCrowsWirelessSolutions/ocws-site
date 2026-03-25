"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CORVUS_FIRST_WELCOME,
  CORVUS_PASSWORD_INSTRUCTIONS,
  CORVUS_PASSWORD_SUCCESS,
  CORVUS_RETURNING_WELCOME,
  CORVUS_WRONG_PASSWORD,
  CORVUS_RATE_LIMITED,
  CORVUS_PASSWORD_STRENGTH,
  CORVUS_VIP_FIRST_WELCOME,
  CORVUS_VIP_RETURNING,
  CORVUS_SESSION_EXPIRED,
  CORVUS_FORGOT_PASSWORD,
  CORVUS_JOSHUA_LOGIN_FIRST,
  CORVUS_JOSHUA_RETURNING,
  CORVUS_JOSHUA_PASSWORD_INSTRUCTION,
} from "@/lib/corvus-ui-strings";
import TributeMessagePanel from "@/app/components/TributeMessage";
import { TRIBUTE_MESSAGES } from "@/lib/tribute-messages";
import type { TributeMessage } from "@/lib/tribute-messages";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? lines[0];
}

function getPasswordStrength(password: string): "weak" | "fair" | "good" | "strong" {
  if (password.length < 8) return "weak";
  const hasNumbers = /\d/.test(password);
  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const isLong     = password.length >= 12;
  if (isLong && hasNumbers && hasUpper && hasLower && hasSymbols) return "strong";
  if (hasNumbers && (hasUpper || hasLower)) return "good";
  if (password.length >= 8) return "fair";
  return "weak";
}

const STRENGTH_COLOR: Record<string, string> = {
  weak:   "#E05555",
  fair:   "#D4AA3C",
  good:   "#00C2C7",
  strong: "#3DBA7A",
};

const STRENGTH_WIDTH: Record<string, string> = {
  weak: "25%", fair: "50%", good: "75%", strong: "100%",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "#0D1520",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
  padding: "12px 14px", color: "#ffffff", fontSize: "16px",
  fontFamily: "monospace", letterSpacing: "0.08em", outline: "none",
};

const btnPrimary = (disabled: boolean, color = "#00C2C7"): React.CSSProperties => ({
  width: "100%", padding: "12px", background: disabled ? "#0D6E7A" : color,
  color: color === "#9B1C1C" ? "#ffffff" : "#0D1520",
  borderRadius: "10px", border: "none", fontSize: "14px", fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.05em",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

// StarFoxPanel — replaces CorvusBubble with typewriter-animated Star Fox style panel.
// Defined at module level (NOT inside LoginPage) to prevent unmount/remount on re-render.
function StarFoxPanel({ line, gold = false }: { line: string; gold?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const lineRef = useRef(line);

  useEffect(() => {
    // Only restart typewriter if the line actually changed
    if (line === lineRef.current && displayed.length > 0) return;
    lineRef.current = line;
    setDisplayed("");
    if (!line) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(line.slice(0, i));
      if (i >= line.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  return (
    <div className={`corvus-starfox-panel${gold ? " gold-accent" : ""}`}>
      <div className="corvus-panel-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/corvus_still.png" className="corvus-panel-image" alt="Corvus" />
        <div className="corvus-panel-label">CORVUS</div>
        <div className="corvus-panel-sublabel">RF INTELLIGENCE</div>
      </div>
      <div className="corvus-panel-speech">
        <div className="corvus-speech-text">
          {displayed}
          {displayed.length < line.length && <span className="corvus-speech-cursor">▋</span>}
        </div>
        {displayed.length >= line.length && displayed.length > 0 && (
          <span className="corvus-speech-cursor">▋</span>
        )}
      </div>
    </div>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  return (
    <div style={{ marginTop: "8px", marginBottom: "4px" }}>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden", marginBottom: "4px" }}>
        <div style={{
          height: "100%", borderRadius: "2px",
          width: STRENGTH_WIDTH[strength],
          background: STRENGTH_COLOR[strength],
          transition: "width 0.3s ease, background 0.3s ease",
        }} />
      </div>
      <p style={{ fontFamily: "monospace", fontSize: "11px", color: STRENGTH_COLOR[strength], margin: 0 }}>
        {CORVUS_PASSWORD_STRENGTH[strength]}
      </p>
    </div>
  );
}

function SuccessFlash({ line, gold = false }: { line: string; gold?: boolean }) {
  return <StarFoxPanel line={line} gold={gold} />;
}

// ─── Exempt codes ─────────────────────────────────────────────────────────────

// These codes bypass the password flow entirely and go straight to dashboard.
const CODES_EXEMPT_FROM_PASSWORD = new Set(["CORVUS-NEST"]);

// These codes are for Crow's Eye only — not dashboard logins.
const CROWS_EYE_ONLY_CODES = new Set(["CORVUS-HONOR"]);

// ─── Types ────────────────────────────────────────────────────────────────────

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "SpectrumLife2026!!";

type LoginStep =
  | "code"
  | "admin_password"
  | "vip_create_password"
  | "vip_enter_password"
  | "sub_create_password"
  | "sub_enter_password";

// ─── Shell (module-level — must NOT be defined inside LoginPage or it remounts
//     on every keystroke, dismissing the mobile keyboard) ─────────────────────

function Shell({ children, accentColor = "#00C2C7" }: { children: React.ReactNode; accentColor?: string }) {
  return (
    <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  // Code entry
  const [codeInput, setCodeInput] = useState("");
  const [codeVisible, setCodeVisible] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Step
  const [step, setStep] = useState<LoginStep>("code");

  // Pending context
  const [pendingCode, setPendingCode]                     = useState("");
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState("");
  const [pendingName, setPendingName]                     = useState("");

  // Admin second factor
  const [adminPw, setAdminPw]               = useState("");
  const [adminPwVisible, setAdminPwVisible] = useState(false);
  const [adminPwError, setAdminPwError]     = useState("");

  // Password fields
  const [pw, setPw]               = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [showForgot, setShowForgot]   = useState(false);

  // Success flash
  const [showSuccess, setShowSuccess] = useState(false);
  const [successLine, setSuccessLine] = useState("");

  // Tribute — one-time overlay shown on first login for founding friends
  const [showTribute, setShowTribute]         = useState(false);
  const [tributeMessage, setTributeMessage]   = useState<TributeMessage | null>(null);
  const [tributeCode, setTributeCode]         = useState("");

  // Founder (Joshua) stats for personalized greeting
  const founderGreetingRef = useRef<string>("");

  // Session expired
  const [sessionExpired, setSessionExpired] = useState(false);

  // Stable Corvus lines per step (pick once when step/code changes)
  const corvusLineRef    = useRef<string>("");
  const instructionRef   = useRef<string>("");
  const sessionExpiredLineRef = useRef<string>("");

  useEffect(() => {
    // Read session expired flag
    try {
      const expired = sessionStorage.getItem("corvus_session_expired");
      if (expired) {
        sessionStorage.removeItem("corvus_session_expired");
        sessionExpiredLineRef.current = pick(CORVUS_SESSION_EXPIRED);
        setSessionExpired(true);
      }
    } catch { /* */ }
  }, []);

  useEffect(() => {
    setRateLimited(false);
    setShowForgot(false);
    setPwError("");
    // Pick new Corvus lines when step or pending code changes
    if (step === "admin_password" && pendingCode === "OCWS-CORVUS-FOUNDER-JOSHUA") {
      // Joshua founder greeting — fetched async below, use a placeholder meanwhile
      if (!founderGreetingRef.current) {
        corvusLineRef.current = pick(CORVUS_JOSHUA_LOGIN_FIRST);
      } else {
        corvusLineRef.current = founderGreetingRef.current;
      }
      instructionRef.current = pick(CORVUS_JOSHUA_PASSWORD_INSTRUCTION);
    } else if (step === "vip_create_password") {
      const lines = CORVUS_VIP_FIRST_WELCOME[pendingCode] ?? CORVUS_FIRST_WELCOME;
      corvusLineRef.current = pick(lines);
      instructionRef.current = pick(CORVUS_PASSWORD_INSTRUCTIONS);
    } else if (step === "vip_enter_password") {
      const lines = CORVUS_VIP_RETURNING[pendingCode] ?? CORVUS_RETURNING_WELCOME;
      corvusLineRef.current = pick(lines);
      instructionRef.current = pick(CORVUS_PASSWORD_INSTRUCTIONS);
    } else if (step === "sub_create_password") {
      corvusLineRef.current = pick(CORVUS_FIRST_WELCOME);
      instructionRef.current = pick(CORVUS_PASSWORD_INSTRUCTIONS);
    } else if (step === "sub_enter_password") {
      corvusLineRef.current = pick(sessionExpired ? CORVUS_SESSION_EXPIRED : CORVUS_RETURNING_WELCOME);
      instructionRef.current = pick(CORVUS_PASSWORD_INSTRUCTIONS);
    } else {
      instructionRef.current = pick(CORVUS_PASSWORD_INSTRUCTIONS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pendingCode]);

  // Fetch founder stats when Joshua's code is detected — personalizes the greeting
  useEffect(() => {
    if (pendingCode !== "OCWS-CORVUS-FOUNDER-JOSHUA") return;
    fetch("/api/analytics/founder-stats", {
      headers: { "x-admin-key": ADMIN_KEY },
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: { totalScans: number; newScans: number; activeSubscribers: number; pendingTestimonials: number } | null) => {
        if (!data) return;
        const lines = CORVUS_JOSHUA_RETURNING(
          data.totalScans,
          data.newScans,
          data.activeSubscribers,
          data.pendingTestimonials
        );
        founderGreetingRef.current = pick(lines);
        // Update the active Corvus line so the panel re-animates with live stats
        corvusLineRef.current = founderGreetingRef.current;
      })
      .catch(() => { /* non-fatal — uses CORVUS_JOSHUA_LOGIN_FIRST fallback */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCode]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function reset() {
    setStep("code");
    setPendingCode(""); setPendingSubscriptionId(""); setPendingName("");
    setPw(""); setPwConfirm(""); setPwError(""); setPwVisible(false);
    setAdminPw(""); setAdminPwError("");
    setRateLimited(false); setShowForgot(false); setShowSuccess(false);
  }

  function storeAndRedirect(code: string) {
    try {
      localStorage.setItem("corvus_sub_code", code);
    } catch { /* */ }
    router.push("/dashboard");
  }

  // Store code in localStorage then check if a one-time tribute should display.
  // If tribute has already been shown (or code has no tribute), redirect normally.
  async function maybeShowTribute(code: string) {
    try {
      localStorage.setItem("corvus_sub_code", code);
    } catch { /* */ }

    const msg = TRIBUTE_MESSAGES[code];
    if (msg) {
      try {
        const res = await fetch("/api/auth/check-tribute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json() as { shown?: boolean };
        if (!data.shown) {
          setTributeCode(code);
          setTributeMessage(msg);
          setShowTribute(true);
          return;
        }
      } catch { /* non-fatal — fall through to redirect */ }
    }

    router.push("/dashboard");
  }

  async function handleTributeDismiss() {
    try {
      await fetch("/api/auth/mark-tribute-shown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tributeCode }),
      });
    } catch { /* non-fatal */ }
    router.push("/dashboard");
  }

  async function flashSuccessAndRedirect(code: string) {
    const line = pick(CORVUS_PASSWORD_SUCCESS);
    setSuccessLine(line);
    setShowSuccess(true);
    setTimeout(() => storeAndRedirect(code), 1600);
  }

  // ── Step 1: code submit ──────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = codeInput.trim();
    if (!raw) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/identify-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: raw }),
      });
      const data = await res.json() as {
        type: "admin" | "admin_first_factor" | "subscriber" | "founder" | "promo" | "invalid";
        tier?: string; subscriptionId?: string; name?: string; passwordSet?: boolean;
      };

      const upperRaw = raw.toUpperCase();

      if (data.type === "admin") {
        try { localStorage.setItem("corvus_admin_auth", ADMIN_KEY); } catch { /* */ }
        router.push("/admin");
      } else if (data.type === "admin_first_factor") {
        setPendingCode(upperRaw);
        setStep("admin_password");
      } else if (data.type === "founder") {
        // Exempt founding codes skip password entirely
        if (CODES_EXEMPT_FROM_PASSWORD.has(upperRaw)) {
          storeAndRedirect(upperRaw);
          return;
        }
        setPendingCode(upperRaw); setPendingName(data.name ?? "");
        setStep(data.passwordSet ? "vip_enter_password" : "vip_create_password");
      } else if (data.type === "subscriber") {
        const code = data.subscriptionId ?? upperRaw;
        // Exempt subscriber codes skip password entirely
        if (CODES_EXEMPT_FROM_PASSWORD.has(upperRaw)) {
          storeAndRedirect(upperRaw);
          return;
        }
        setPendingCode(upperRaw); setPendingSubscriptionId(code);
        setStep(data.passwordSet ? "sub_enter_password" : "sub_create_password");
      } else if (data.type === "promo") {
        setError("Promo codes are used on the Crow's Eye page, not here.");
      } else if (CROWS_EYE_ONLY_CODES.has(upperRaw)) {
        setError("This code is for Crow\u2019s Eye discounts, not dashboard access. Use it at oldcrowswireless.com/crows-eye.");
      } else {
        setError("Invalid code. Check your welcome email or recover your code.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally { setLoading(false); }
  }

  // ── Admin password ───────────────────────────────────────────────────────────

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

  // ── VIP: create password ─────────────────────────────────────────────────────

  async function handleVipCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || !pwConfirm) return;
    if (pw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pw !== pwConfirm) { setPwError("Passwords do not match."); return; }
    setPwError(""); setPwLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingCode, password: pw }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        // Tribute codes skip the success flash and go straight to the tribute overlay
        if (pendingCode in TRIBUTE_MESSAGES) {
          await maybeShowTribute(pendingCode);
        } else {
          await flashSuccessAndRedirect(pendingCode);
        }
      } else {
        setPwError(data.error ?? "Failed to set password.");
      }
    } catch { setPwError("Connection error. Please try again."); }
    finally { setPwLoading(false); }
  }

  // ── VIP: enter password ──────────────────────────────────────────────────────

  async function handleVipEnterPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setPwError(""); setPwLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingCode, password: pw }),
      });
      const data = await res.json() as { valid?: boolean; rateLimited?: boolean; error?: string };
      if (data.rateLimited) { setRateLimited(true); }
      else if (data.valid) { await maybeShowTribute(pendingCode); }
      else { setPwError(pick(CORVUS_WRONG_PASSWORD)); }
    } catch { setPwError("Connection error. Please try again."); }
    finally { setPwLoading(false); }
  }

  // ── Subscriber: create password ──────────────────────────────────────────────

  async function handleSubCreatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || !pwConfirm) return;
    if (pw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pw !== pwConfirm) { setPwError("Passwords do not match."); return; }
    setPwError(""); setPwLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingSubscriptionId, password: pw }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        await flashSuccessAndRedirect(pendingSubscriptionId);
      } else {
        setPwError(data.error ?? "Failed to set password.");
      }
    } catch { setPwError("Connection error. Please try again."); }
    finally { setPwLoading(false); }
  }

  // ── Subscriber: enter password ───────────────────────────────────────────────

  async function handleSubEnterPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setPwError(""); setPwLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pendingSubscriptionId, password: pw }),
      });
      const data = await res.json() as { valid?: boolean; rateLimited?: boolean; error?: string };
      if (data.rateLimited) { setRateLimited(true); }
      else if (data.valid) { storeAndRedirect(pendingSubscriptionId); }
      else { setPwError(pick(CORVUS_WRONG_PASSWORD)); }
    } catch { setPwError("Connection error. Please try again."); }
    finally { setPwLoading(false); }
  }

  // ── Tribute overlay — one-time display for founding friends ──────────────────

  if (showTribute && tributeMessage) {
    return <TributeMessagePanel message={tributeMessage} onDismiss={handleTributeDismiss} />;
  }

  // ── Admin password step ──────────────────────────────────────────────────────

  if (step === "admin_password") {
    const isJoshua = pendingCode === "OCWS-CORVUS-FOUNDER-JOSHUA";
    return (
      <Shell accentColor="#B8922A">
        {isJoshua && <StarFoxPanel line={corvusLineRef.current} gold={true} />}
        {!isJoshua && (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>Admin Authentication</h1>
          <p style={{ color: "#B8922A", fontSize: "12px" }}>Step 2 of 2</p>
        </div>
        )}
        <div style={{ background: "#1A2332", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "16px", padding: "32px" }}>
          <form onSubmit={handleAdminPassword}>
            <label style={{ display: "block", color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Admin Password
            </label>
            <div style={{ position: "relative", marginBottom: adminPwError ? "8px" : "20px" }}>
              <input
                type={adminPwVisible ? "text" : "password"}
                autoComplete="off" autoCapitalize="off" autoCorrect="off"
                placeholder="Admin password"
                value={adminPw} onChange={e => setAdminPw(e.target.value)}
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

  // ── VIP: create password ─────────────────────────────────────────────────────

  if (step === "vip_create_password") {
    return (
      <Shell accentColor="#D4AF37">
        {showSuccess
          ? <SuccessFlash line={successLine} gold={true} />
          : (
          <>
            <StarFoxPanel line={corvusLineRef.current} gold={true} />
            <div style={{ background: "#1A2332", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "16px", padding: "28px 32px" }}>
              <p style={{ color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
                VIP Founding Member
              </p>
              <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
                Create Your Password
              </h1>
              <p style={{ color: "#888888", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: "20px" }}>
                {instructionRef.current}
              </p>
              <form onSubmit={handleVipCreatePassword}>
                <div style={{ marginBottom: "6px" }}>
                  <label style={{ display: "block", color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={pwVisible ? "text" : "password"} autoComplete="new-password" autoCorrect="off" autoCapitalize="off"
                      placeholder="At least 8 characters"
                      value={pw} onChange={e => setPw(e.target.value)}
                      style={{ ...inputStyle, paddingRight: "60px" }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setPwVisible(v => !v)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                      {pwVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                  <PasswordStrengthBar password={pw} />
                </div>
                <div style={{ marginBottom: pwError ? "8px" : "20px", marginTop: "8px" }}>
                  <label style={{ display: "block", color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Confirm Password
                  </label>
                  <input
                    type={pwVisible ? "text" : "password"} autoComplete="new-password" autoCorrect="off" autoCapitalize="off"
                    placeholder="Repeat password"
                    value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {pwError && (
                  <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#E05555", marginBottom: "16px" }}>
                    {pwError}
                  </p>
                )}
                <button type="submit" disabled={pwLoading || !pw || !pwConfirm} style={btnPrimary(pwLoading || !pw || !pwConfirm, "#D4AF37")}>
                  {pwLoading ? "Setting up…" : "Set Password & Enter Dashboard"}
                </button>
              </form>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                ← Back
              </button>
            </div>
          </>
        )}
      </Shell>
    );
  }

  // ── VIP: enter password ──────────────────────────────────────────────────────

  if (step === "vip_enter_password") {
    return (
      <Shell accentColor="#D4AF37">
        <StarFoxPanel line={corvusLineRef.current} gold={true} />
        <div style={{ background: "#1A2332", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "16px", padding: "28px 32px" }}>
          <p style={{ color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
            VIP Founding Member
          </p>
          <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
            Welcome Back{pendingName ? `, ${pendingName.split(" ")[0]}` : ""}
          </h1>
          {rateLimited ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#E05555", marginBottom: "8px" }}>
                {pick(CORVUS_RATE_LIMITED)}
              </p>
              <p style={{ color: "#888888", fontSize: "12px" }}>Try again in 60 minutes.</p>
            </div>
          ) : (
            <form onSubmit={handleVipEnterPassword}>
              <label style={{ display: "block", color: "#D4AF37", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <input
                  type={pwVisible ? "text" : "password"} autoComplete="current-password" autoCorrect="off" autoCapitalize="off"
                  placeholder="Your password"
                  value={pw} onChange={e => setPw(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "60px" }}
                  autoFocus
                />
                <button type="button" onClick={() => setPwVisible(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                  {pwVisible ? "Hide" : "Show"}
                </button>
              </div>
              {pwError && (
                <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#E05555", marginBottom: "12px" }}>
                  {pwError}
                </p>
              )}
              <div style={{ marginBottom: "20px" }}>
                <button type="button" onClick={() => setShowForgot(v => !v)}
                  style={{ background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", padding: 0 }}>
                  Forgot your password?
                </button>
              </div>
              {showForgot && (
                <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#888888", lineHeight: 1.8, marginBottom: "16px" }}>
                  {pick(CORVUS_FORGOT_PASSWORD)}
                </p>
              )}
              <button type="submit" disabled={pwLoading || !pw} style={btnPrimary(pwLoading || !pw, "#D4AF37")}>
                {pwLoading ? "Verifying…" : "Enter Dashboard"}
              </button>
            </form>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── Subscriber: create password ──────────────────────────────────────────────

  if (step === "sub_create_password") {
    return (
      <Shell>
        {showSuccess
          ? <SuccessFlash line={successLine} />
          : (
          <>
            <StarFoxPanel line={corvusLineRef.current} />
            <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 32px" }}>
              <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Create Your Password</h1>
              <p style={{ color: "#888888", fontSize: "12px", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: "20px" }}>
                {instructionRef.current}
              </p>
              <form onSubmit={handleSubCreatePassword}>
                <div style={{ marginBottom: "6px" }}>
                  <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={pwVisible ? "text" : "password"} autoComplete="new-password" autoCorrect="off" autoCapitalize="off"
                      placeholder="At least 8 characters"
                      value={pw} onChange={e => setPw(e.target.value)}
                      style={{ ...inputStyle, paddingRight: "60px" }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setPwVisible(v => !v)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                      {pwVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                  <PasswordStrengthBar password={pw} />
                </div>
                <div style={{ marginBottom: pwError ? "8px" : "20px", marginTop: "8px" }}>
                  <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                    Confirm Password
                  </label>
                  <input
                    type={pwVisible ? "text" : "password"} autoComplete="new-password" autoCorrect="off" autoCapitalize="off"
                    placeholder="Repeat password"
                    value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {pwError && (
                  <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#E05555", marginBottom: "16px" }}>
                    {pwError}
                  </p>
                )}
                <button type="submit" disabled={pwLoading || !pw || !pwConfirm} style={btnPrimary(pwLoading || !pw || !pwConfirm)}>
                  {pwLoading ? "Setting up…" : "Set Password & Enter Dashboard"}
                </button>
              </form>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                ← Back
              </button>
            </div>
          </>
        )}
      </Shell>
    );
  }

  // ── Subscriber: enter password ───────────────────────────────────────────────

  if (step === "sub_enter_password") {
    return (
      <Shell>
        <StarFoxPanel line={corvusLineRef.current} />
        <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 32px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Welcome Back</h1>
          {rateLimited ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ fontFamily: "monospace", fontSize: "13px", color: "#E05555", marginBottom: "8px" }}>
                {pick(CORVUS_RATE_LIMITED)}
              </p>
              <p style={{ color: "#888888", fontSize: "12px" }}>Try again in 60 minutes.</p>
            </div>
          ) : (
            <form onSubmit={handleSubEnterPassword}>
              <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <input
                  type={pwVisible ? "text" : "password"} autoComplete="current-password" autoCorrect="off" autoCapitalize="off"
                  placeholder="Your password"
                  value={pw} onChange={e => setPw(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "60px" }}
                  autoFocus
                />
                <button type="button" onClick={() => setPwVisible(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "4px" }}>
                  {pwVisible ? "Hide" : "Show"}
                </button>
              </div>
              {pwError && (
                <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#E05555", marginBottom: "12px" }}>
                  {pwError}
                </p>
              )}
              <div style={{ marginBottom: "20px" }}>
                <button type="button" onClick={() => setShowForgot(v => !v)}
                  style={{ background: "none", border: "none", color: "#555555", fontSize: "11px", cursor: "pointer", padding: 0 }}>
                  Forgot your password?
                </button>
              </div>
              {showForgot && (
                <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#888888", lineHeight: 1.8, marginBottom: "16px" }}>
                  {pick(CORVUS_FORGOT_PASSWORD)}
                </p>
              )}
              <button type="submit" disabled={pwLoading || !pw} style={btnPrimary(pwLoading || !pw)}>
                {pwLoading ? "Verifying…" : "Enter Dashboard"}
              </button>
            </form>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "12px", cursor: "pointer", padding: 0 }}>
            ← Back
          </button>
        </div>
      </Shell>
    );
  }

  // ── Code entry (default) ─────────────────────────────────────────────────────

  return (
    <Shell>
      {sessionExpired && (
        <StarFoxPanel line={sessionExpiredLineRef.current || pick(CORVUS_SESSION_EXPIRED)} />
      )}
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
              autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="text"
              placeholder="OCWS-NEST-XXXXXXXX"
              value={codeInput} onChange={e => setCodeInput(e.target.value)}
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
