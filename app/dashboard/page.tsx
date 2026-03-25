"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionTier = "nest" | "flock" | "murder";

type ReportType = "verdict" | "reckoning_small" | "reckoning_standard" | "reckoning_commercial" | "reckoning_pro";
type ReportSeverity = "critical" | "warning" | "info";

interface ReportRecord {
  reportId: string;
  type: ReportType;
  subscriptionId: string | null;
  email: string | null;
  codeUsed: string;
  createdAt: string;
  locationName: string;
  findingCount: number;
  severity: ReportSeverity;
  reportData: string;
  pdfAvailable: boolean;
}

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  verdict:              "Verdict",
  reckoning_small:      "Small Reckoning",
  reckoning_standard:   "Standard Reckoning",
  reckoning_commercial: "Commercial Reckoning",
  reckoning_pro:        "Pro Reckoning",
};

const SEVERITY_COLORS: Record<ReportSeverity, { color: string; bg: string; border: string }> = {
  critical: { color: "#f87171", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)"  },
  warning:  { color: "#fbbf24", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.35)"  },
  info:     { color: "#4ade80", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)"  },
};

interface CreditPricing {
  single: string;       singlePrice: number;
  sixPack: string;      sixPackPrice: number;
  twelvePack: string;   twelvePackPrice: number;
}

interface ReckoningPricing {
  small?: string;      smallPrice?: number;
  standard?: string;   standardPrice?: number;
  commercial?: string; commercialPrice?: number;
}

interface ValidationResult {
  valid: boolean;
  type: "subscription" | "founder" | "admin" | "promo" | null;
  tier?: SubscriptionTier;
  customer_name?: string;
  verdicts_remaining?: number;
  verdicts_unlimited?: boolean;
  reckonings_remaining?: { small: number; standard: number; commercial: number };
  reckonings_unlimited?: { small: boolean; standard: boolean; commercial: boolean };
  seat_limit?: number;
  seats_used?: number;
  credit_pricing?: CreditPricing;
  reckoning_pricing?: ReckoningPricing;
  error?: string;
}

interface SubDetails {
  customer_email: string;
  customer_name: string;
  tier: SubscriptionTier;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  verdicts_used: number;
  reckonings_used: { small: number; standard: number; commercial: number };
  extra_verdict_credits: number;
}

// ─── Tier config ─────────────────────────────────────────────────────────────

type TierCfg = {
  label: string;
  color: string;
  textColor: string;
  monthlyVerdicts: number;
  price: string;
};

const TIER_CONFIG: Record<SubscriptionTier, TierCfg> = {
  nest: {
    label: "NEST",
    color: "#00C2C7",
    textColor: "#0D1520",
    monthlyVerdicts: 3,
    price: "$20/mo",
  },
  flock: {
    label: "FLOCK",
    color: "#B8922A",
    textColor: "#0D1520",
    monthlyVerdicts: 15,
    price: "$100/mo",
  },
  murder: {
    label: "MURDER",
    color: "#9B1C1C",
    textColor: "#ffffff",
    monthlyVerdicts: 999999,
    price: "$950/mo",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [phase, setPhase]         = useState<"loading" | "auth" | "dashboard">("loading");
  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [codeVisible, setCodeVisible] = useState(false);
  const [codeCopied, setCodeCopied]   = useState(false);
  const [sub, setSub]         = useState<ValidationResult | null>(null);
  const [details, setDetails] = useState<SubDetails | null>(null);
  const [storedCode, setStoredCode] = useState("");
  const [buyingCredits, setBuyingCredits]       = useState<string | null>(null);
  const [buyingReckoning, setBuyingReckoning]   = useState<string | null>(null);
  const [codeStats, setCodeStats]               = useState<{ usageCount: number; lastUsed: string | null } | null>(null);
  const [resending, setResending]               = useState(false);
  const [resent, setResent]                     = useState(false);
  const [reports, setReports]                   = useState<ReportRecord[]>([]);
  const [reportsLoading, setReportsLoading]     = useState(false);
  const [expandedReport, setExpandedReport]     = useState<string | null>(null);
  const [isAdminView, setIsAdminView]           = useState(false);

  // Team seat state
  interface SeatMember { email: string; name: string; addedAt: string; code: string; }
  interface SeatInfo {
    tier: string; includedSeats: number; additionalSeats: number;
    totalSeats: number; maxTotal: number; maxAdditional: number;
    upgradeRequired: string | null; members: SeatMember[];
  }
  const [seatInfo, setSeatInfo]                 = useState<SeatInfo | null>(null);
  const [seatBillingPeriod, setSeatBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [seatAddCount, setSeatAddCount]         = useState(1);
  const [buyingSeats, setBuyingSeats]           = useState(false);
  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [inviteName, setInviteName]             = useState("");
  const [inviteEmail, setInviteEmail]           = useState("");
  const [inviting, setInviting]                 = useState(false);
  const [inviteError, setInviteError]           = useState("");
  const [removingMember, setRemovingMember]     = useState<string | null>(null);

  // ── Auth + load ────────────────────────────────────────────────────────────

  const loadReports = useCallback(async (code: string) => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/reports/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data = await res.json() as { reports?: ReportRecord[] };
        setReports(data.reports ?? []);
      }
    } catch { /* non-fatal */ }
    finally { setReportsLoading(false); }
  }, []);

  const loadSeatInfo = useCallback(async (code: string) => {
    try {
      const res = await fetch("/api/subscriptions/seat-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data = await res.json() as SeatInfo;
        setSeatInfo(data);
        // Reset seat add count to a valid value for this tier
        setSeatAddCount(1);
      }
    } catch { /* non-fatal */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = useCallback(async (code: string) => {
    setValidating(true);
    try {
      const res  = await fetch("/api/subscriptions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: code }),
      });
      const data: ValidationResult = await res.json();

      if (!data.valid || (data.type !== "subscription" && data.type !== "founder" && data.type !== "admin")) {
        setAuthError(data.error ?? "Invalid or inactive subscription.");
        try { localStorage.removeItem("corvus_sub_code"); } catch { /* */ }
        setPhase("auth");
        return;
      }

      setSub(data);

      if (data.type === "subscription") {
        try {
          const dRes = await fetch(`/api/subscriptions/details?code=${encodeURIComponent(code)}`);
          if (dRes.ok) setDetails(await dRes.json());
        } catch { /* non-fatal */ }
        // Load code usage stats (best-effort)
        try {
          const sRes = await fetch(`/api/subscriptions/code-stats?code=${encodeURIComponent(code)}`);
          if (sRes.ok) setCodeStats(await sRes.json());
        } catch { /* non-fatal */ }
      }

      // Check if this is an admin impersonation session
      try {
        const impersonating = localStorage.getItem("corvus_admin_impersonating") === "true";
        setIsAdminView(impersonating);
      } catch { /* */ }

      setStoredCode(code);
      setPhase("dashboard");
      loadReports(code);
      loadSeatInfo(code);
    } catch {
      setAuthError("Connection error. Please try again.");
      setPhase("auth");
    } finally {
      setValidating(false);
    }
  }, [loadReports, loadSeatInfo]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("corvus_sub_code");
      if (saved) { loadDashboard(saved); } else { setPhase("auth"); }
    } catch {
      setPhase("auth");
    }
  }, [loadDashboard]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setAuthError("");
    await loadDashboard(code);
    if (sub?.valid) {
      try { localStorage.setItem("corvus_sub_code", code); } catch { /* */ }
    }
  }

  // This wrapper ensures we store to localStorage only on successful auth
  const handleLoginWrapped = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setAuthError("");
    setValidating(true);
    try {
      const res  = await fetch("/api/subscriptions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: code }),
      });
      const data: ValidationResult = await res.json();

      if (!data.valid || (data.type !== "subscription" && data.type !== "founder" && data.type !== "admin")) {
        setAuthError(data.error ?? "Invalid or inactive subscription.");
        return;
      }

      try { localStorage.setItem("corvus_sub_code", code); } catch { /* */ }
      setSub(data);

      if (data.type === "subscription") {
        try {
          const dRes = await fetch(`/api/subscriptions/details?code=${encodeURIComponent(code)}`);
          if (dRes.ok) setDetails(await dRes.json());
        } catch { /* non-fatal */ }
      }

      setStoredCode(code);
      setPhase("dashboard");
    } catch {
      setAuthError("Connection error. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  function handleLogout() {
    try {
      localStorage.removeItem("corvus_sub_code");
      localStorage.removeItem("corvus_sub_tier");
      localStorage.removeItem("corvus_admin_impersonating");
    } catch { /* */ }
    router.push("/login");
  }

  function copyCode() {
    navigator.clipboard.writeText(storedCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  async function handleResendCode() {
    const email = details?.customer_email;
    if (!email) return;
    setResending(true);
    try {
      await fetch("/api/subscriptions/recover-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch { /* non-fatal */ }
    finally { setResending(false); }
  }

  async function handleBuyCredits(pack: "single" | "6pack" | "12pack") {
    setBuyingCredits(pack);
    try {
      const res  = await fetch("/api/subscriptions/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, pack }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      if (data.url)   window.location.href = data.url;
    } catch {
      alert("Connection error. Please try again.");
    } finally {
      setBuyingCredits(null);
    }
  }

  async function handleBuyReckoning(type: "small" | "standard" | "commercial") {
    setBuyingReckoning(type);
    try {
      const res  = await fetch("/api/subscriptions/buy-reckoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, type }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      if (data.url)   window.location.href = data.url;
    } catch {
      alert("Connection error. Please try again.");
    } finally {
      setBuyingReckoning(null);
    }
  }

  // ── Seat handlers ──────────────────────────────────────────────────────────

  async function handleBuySeats() {
    if (buyingSeats || !storedCode) return;
    setBuyingSeats(true);
    try {
      const res = await fetch("/api/subscriptions/buy-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, additionalSeats: seatAddCount, billingPeriod: seatBillingPeriod }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { window.location.href = data.url; }
      else { alert(data.error ?? "Could not start checkout. Please try again."); }
    } catch { alert("Connection error. Please try again."); }
    finally { setBuyingSeats(false); }
  }

  async function handleInviteMember() {
    if (inviting || !storedCode) return;
    setInviteError("");
    setInviting(true);
    try {
      const res = await fetch("/api/subscriptions/invite-seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, memberName: inviteName, memberEmail: inviteEmail }),
      });
      const data = await res.json() as { ok?: boolean; seatCode?: string; error?: string };
      if (data.ok) {
        setShowInviteModal(false);
        setInviteName(""); setInviteEmail("");
        await loadSeatInfo(storedCode);
      } else {
        setInviteError(data.error ?? "Failed to invite member.");
      }
    } catch { setInviteError("Connection error. Please try again."); }
    finally { setInviting(false); }
  }

  async function handleRemoveMember(memberEmail: string) {
    if (removingMember || !storedCode) return;
    if (!confirm(`Remove ${memberEmail} from your team? Their access code will be deactivated.`)) return;
    setRemovingMember(memberEmail);
    try {
      const res = await fetch("/api/subscriptions/remove-seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: storedCode, memberEmail }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) { await loadSeatInfo(storedCode); }
      else { alert(data.error ?? "Failed to remove member."); }
    } catch { alert("Connection error."); }
    finally { setRemovingMember(null); }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#00C2C7", fontFamily: "monospace", fontSize: "13px", letterSpacing: "0.2em" }}>
          AUTHENTICATING...
        </p>
      </div>
    );
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (phase === "auth") {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ position: "relative", width: "40px", height: "40px", flexShrink: 0 }}>
                <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="40px" style={{ objectFit: "contain" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, margin: 0 }}>Corvus Dashboard</p>
                <p style={{ color: "#00C2C7", fontSize: "11px", margin: 0 }}>Old Crows Wireless Solutions</p>
              </div>
            </div>
            <p style={{ color: "#888888", fontSize: "13px" }}>
              Enter your Subscription ID to access your dashboard.
            </p>
          </div>

          <form
            onSubmit={handleLoginWrapped}
            style={{
              background: "#1A2332",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "32px",
            }}
          >
            <label style={{
              display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px",
            }}>
              Subscription ID
            </label>
            <input
              type="password"
              autoComplete="off"
              placeholder="OCWS-NEST-XXXXXXXX"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              style={{ ...inputStyle, marginBottom: authError ? "8px" : "20px" }}
            />
            {authError && (
              <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "16px" }}>{authError}</p>
            )}
            <button
              type="submit"
              disabled={validating || !codeInput.trim()}
              style={{
                width: "100%", padding: "12px",
                background: validating || !codeInput.trim() ? "#0D6E7A" : "#00C2C7",
                color: "#0D1520", borderRadius: "10px", border: "none",
                fontSize: "14px", fontWeight: 700,
                cursor: validating || !codeInput.trim() ? "not-allowed" : "pointer",
                letterSpacing: "0.05em",
              }}
            >
              {validating ? "Validating..." : "Access Dashboard"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#555555" }}>
            Don&rsquo;t have a subscription?{" "}
            <Link href="/crows-eye" style={{ color: "#00C2C7" }}>Get Corvus&rsquo; Verdict</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  const tier        = sub?.tier ?? "nest";
  const tc          = TIER_CONFIG[tier];
  const isUnlimited = sub?.verdicts_unlimited ?? false;
  const verdictsRemaining = sub?.verdicts_remaining ?? 0;
  const verdictsUsed = isUnlimited
    ? 0
    : Math.max(0, tc.monthlyVerdicts - verdictsRemaining);
  const progressPct = isUnlimited
    ? 0
    : Math.min(100, (verdictsUsed / tc.monthlyVerdicts) * 100);

  const rec         = sub?.reckonings_remaining  ?? { small: 0, standard: 0, commercial: 0 };
  const recUnlim    = sub?.reckonings_unlimited   ?? { small: false, standard: false, commercial: false };
  const isSubType   = sub?.type === "subscription";

  const card: React.CSSProperties = {
    background: "#1A2332",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  };

  const sectionLabel: React.CSSProperties = {
    color: "#00C2C7",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: "16px",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* ── Admin impersonation banner ── */}
      {isAdminView && (
        <div style={{
          background: "#B8922A",
          color: "#0D1520",
          borderRadius: "12px",
          padding: "14px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>
            🔐 ADMIN VIEW — You are viewing this dashboard as{" "}
            <span style={{ fontFamily: "monospace", letterSpacing: "0.08em" }}>{storedCode}</span>
          </p>
          <button
            onClick={() => {
              try {
                localStorage.removeItem("corvus_admin_impersonating");
                localStorage.removeItem("corvus_sub_code");
              } catch { /* */ }
              window.location.href = "/admin";
            }}
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.3)",
              borderRadius: "8px",
              color: "#0D1520",
              fontSize: "12px",
              fontWeight: 700,
              padding: "6px 14px",
              cursor: "pointer",
            }}
          >
            Exit Admin View
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        ...card,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "16px",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
          <div style={{ position: "relative", width: "44px", height: "44px", flexShrink: 0 }}>
            <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="44px" style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700 }}>
                {sub?.customer_name ?? details?.customer_name ?? "Subscriber"}
              </span>
              <span style={{
                background: tc.color, color: tc.textColor,
                fontSize: "10px", fontWeight: 800, letterSpacing: "0.18em",
                padding: "3px 10px", borderRadius: "20px",
              }}>
                {tc.label}
              </span>
              {!isSubType && (sub?.type === "admin" || sub?.type === "founder") && (
                <span style={{
                  background: "rgba(184,146,42,0.15)", color: "#B8922A",
                  fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em",
                  padding: "3px 8px", borderRadius: "20px", border: "1px solid rgba(184,146,42,0.3)",
                }}>
                  {sub.type.toUpperCase()} ACCESS
                </span>
              )}
            </div>
            <p style={{ color: "#888888", fontSize: "12px", marginTop: "2px" }}>
              Corvus Subscriber Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#555555", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>ID</span>
            <span style={{ color: "#ffffff", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              {codeVisible ? storedCode : "••••••••••••••"}
            </span>
            <button onClick={() => setCodeVisible(v => !v)}
              style={{ background: "none", border: "none", color: "#00C2C7", fontSize: "11px", cursor: "pointer", padding: "2px 6px" }}>
              {codeVisible ? "Hide" : "Show"}
            </button>
          </div>
          <button onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "6px 14px", cursor: "pointer",
            }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Credits grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px", marginBottom: "24px" }}>

        {/* Verdict credits */}
        <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px" }}>
          <p style={{ ...sectionLabel, marginBottom: "8px" }}>Verdict Credits</p>
          <p style={{ color: "#ffffff", fontSize: "52px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
            {isUnlimited ? "∞" : verdictsRemaining}
          </p>
          <p style={{ color: "#888888", fontSize: "12px", marginBottom: isUnlimited ? "16px" : "12px" }}>
            {isUnlimited
              ? "Unlimited this period"
              : `of ${tc.monthlyVerdicts} remaining this period`}
          </p>
          {!isUnlimited && (
            <div style={{
              background: "rgba(255,255,255,0.06)", borderRadius: "100px",
              height: "6px", overflow: "hidden", marginBottom: "12px",
            }}>
              <div style={{
                height: "100%",
                width: `${progressPct}%`,
                background: progressPct > 80 ? "#F87171" : "#00C2C7",
                borderRadius: "100px",
                transition: "width 0.4s ease",
              }} />
            </div>
          )}
          {details?.current_period_end && (
            <p style={{ color: "#555555", fontSize: "11px", marginBottom: "14px" }}>
              Resets {fmtDate(details.current_period_end)}
            </p>
          )}
          <Link href="/crows-eye" style={{
            display: "inline-block",
            background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.25)",
            borderRadius: "8px", color: "#00C2C7", fontSize: "12px", fontWeight: 600,
            padding: "7px 14px", textDecoration: "none",
          }}>
            Buy More Credits
          </Link>
        </div>

        {/* Reckoning credits */}
        <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px" }}>
          <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Full Reckoning Credits
          </p>
          {(["small", "standard", "commercial"] as const).map(key => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#888888", fontSize: "13px", textTransform: "capitalize" }}>{key}</span>
              <span style={{
                color: recUnlim[key] ? "#B8922A" : rec[key] > 0 ? "#ffffff" : "#444444",
                fontSize: "14px", fontWeight: 700, fontFamily: "monospace",
              }}>
                {recUnlim[key] ? "∞" : rec[key]}
              </span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", marginTop: "4px" }}>
            <Link href="/crows-eye" style={{
              display: "inline-block",
              background: "rgba(184,146,42,0.08)", border: "1px solid rgba(184,146,42,0.25)",
              borderRadius: "8px", color: "#B8922A", fontSize: "12px", fontWeight: 600,
              padding: "7px 14px", textDecoration: "none",
            }}>
              Run a Reckoning
            </Link>
          </div>
        </div>

        {/* Team Seats compact tile */}
        {isSubType && seatInfo && (
          <div style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px" }}>
            <p style={{ color: "#888888", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Team Seats
            </p>
            <p style={{ color: "#ffffff", fontSize: "52px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
              {seatInfo.totalSeats}
            </p>
            <p style={{ color: "#888888", fontSize: "12px", marginBottom: "12px" }}>
              of {seatInfo.maxTotal} maximum
            </p>
            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "4px", marginBottom: "12px" }}>
              <div style={{
                background: seatInfo.totalSeats >= seatInfo.maxTotal ? "#F87171" : "#00C2C7",
                borderRadius: "4px", height: "4px",
                width: `${Math.min(100, (seatInfo.totalSeats / seatInfo.maxTotal) * 100)}%`,
                transition: "width 0.3s",
              }} />
            </div>
            <p style={{ color: "#555555", fontSize: "11px", lineHeight: 1.6 }}>
              {seatInfo.includedSeats} included · {seatInfo.additionalSeats} purchased
            </p>
          </div>
        )}
      </div>

      {/* ── Buy More Verdicts ── */}
      {isSubType && (
        <div style={card}>
          <p style={sectionLabel}>Buy More Verdicts</p>
          {tier === "murder" ? (
            <p style={{ color: "#555555", fontSize: "13px" }}>
              Murder subscribers have unlimited Verdict credits included — no purchase needed.
            </p>
          ) : (() => {
            const cp = sub?.credit_pricing;
            const sp = cp?.singlePrice ?? 0;
            const packs: { pack: "single" | "6pack" | "12pack"; label: string; price: number; savings: string | null }[] = [
              { pack: "single",  label: "Single Credit", price: sp,                         savings: null },
              { pack: "6pack",   label: "6-Pack",        price: cp?.sixPackPrice ?? 0,       savings: cp ? `saves $${sp * 6  - cp.sixPackPrice}`  : null },
              { pack: "12pack",  label: "12-Pack",       price: cp?.twelvePackPrice ?? 0,    savings: cp ? `saves $${sp * 12 - cp.twelvePackPrice}` : null },
            ];
            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
                  {packs.map(({ pack, label, price, savings }) => (
                    <div key={pack} style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                      <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                      <p style={{ color: "#00C2C7", fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>${price}</p>
                      {savings
                        ? <p style={{ color: "#4ADE80", fontSize: "10px", marginBottom: "10px" }}>{savings}</p>
                        : <div style={{ height: "18px", marginBottom: "10px" }} />
                      }
                      <button
                        onClick={() => handleBuyCredits(pack)}
                        disabled={buyingCredits !== null}
                        style={{
                          width: "100%",
                          background: buyingCredits === pack ? "#0D6E7A" : "#00C2C7",
                          color: "#0D1520", border: "none", borderRadius: "7px",
                          padding: "8px", fontSize: "12px", fontWeight: 700,
                          cursor: buyingCredits !== null ? "not-allowed" : "pointer",
                        }}>
                        {buyingCredits === pack ? "Redirecting…" : "Buy Now"}
                      </button>
                    </div>
                  ))}
                </div>
                <p style={{ color: "#444444", fontSize: "11px", marginTop: "12px" }}>
                  Credits are added immediately after payment and never expire.
                </p>
              </>
            );
          })()}
        </div>
      )}

      {/* ── Buy More Reckonings ── */}
      {isSubType && (
        <div style={card}>
          <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Buy More Reckonings
          </p>
          {tier === "murder" ? (
            <p style={{ color: "#555555", fontSize: "13px" }}>
              Murder subscribers have unlimited Reckonings included — no purchase needed.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
              {/* Small — available to Nest and Flock */}
              <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Small</p>
                <p style={{ color: "#B8922A", fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
                  ${sub?.reckoning_pricing?.smallPrice ?? (tier === "nest" ? 50 : 35)}
                </p>
                <p style={{ color: "#444444", fontSize: "10px", marginBottom: "10px" }}>≤ 2,500 sq ft</p>
                <button
                  onClick={() => handleBuyReckoning("small")}
                  disabled={buyingReckoning !== null}
                  style={{
                    width: "100%",
                    background: buyingReckoning === "small" ? "#0D6E7A" : "#B8922A",
                    color: "#0D1520", border: "none", borderRadius: "7px",
                    padding: "8px", fontSize: "12px", fontWeight: 700,
                    cursor: buyingReckoning !== null ? "not-allowed" : "pointer",
                  }}>
                  {buyingReckoning === "small" ? "Redirecting…" : "Buy Now"}
                </button>
              </div>

              {/* Standard */}
              {tier === "flock" ? (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Standard</p>
                  <p style={{ color: "#B8922A", fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
                    ${sub?.reckoning_pricing?.standardPrice ?? 75}
                  </p>
                  <p style={{ color: "#444444", fontSize: "10px", marginBottom: "10px" }}>Multi-structure</p>
                  <button
                    onClick={() => handleBuyReckoning("standard")}
                    disabled={buyingReckoning !== null}
                    style={{
                      width: "100%",
                      background: buyingReckoning === "standard" ? "#0D6E7A" : "#B8922A",
                      color: "#0D1520", border: "none", borderRadius: "7px",
                      padding: "8px", fontSize: "12px", fontWeight: 700,
                      cursor: buyingReckoning !== null ? "not-allowed" : "pointer",
                    }}>
                    {buyingReckoning === "standard" ? "Redirecting…" : "Buy Now"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <p style={{ color: "#444444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Standard</p>
                  <p style={{ color: "#333333", fontSize: "12px", marginBottom: "10px" }}>Flock plan required</p>
                  <Link href="/crows-eye" style={{ display: "inline-block", background: "rgba(184,146,42,0.08)", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "7px", color: "#B8922A", fontSize: "11px", fontWeight: 600, padding: "6px 12px", textDecoration: "none" }}>
                    Upgrade
                  </Link>
                </div>
              )}

              {/* Commercial */}
              {tier === "flock" ? (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <p style={{ color: "#888888", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Commercial</p>
                  <p style={{ color: "#B8922A", fontSize: "26px", fontWeight: 800, lineHeight: 1, marginBottom: "4px" }}>
                    ${sub?.reckoning_pricing?.commercialPrice ?? 200}
                  </p>
                  <p style={{ color: "#444444", fontSize: "10px", marginBottom: "10px" }}>Commercial property</p>
                  <button
                    onClick={() => handleBuyReckoning("commercial")}
                    disabled={buyingReckoning !== null}
                    style={{
                      width: "100%",
                      background: buyingReckoning === "commercial" ? "#0D6E7A" : "#B8922A",
                      color: "#0D1520", border: "none", borderRadius: "7px",
                      padding: "8px", fontSize: "12px", fontWeight: 700,
                      cursor: buyingReckoning !== null ? "not-allowed" : "pointer",
                    }}>
                    {buyingReckoning === "commercial" ? "Redirecting…" : "Buy Now"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <p style={{ color: "#444444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Commercial</p>
                  <p style={{ color: "#333333", fontSize: "12px", marginBottom: "10px" }}>Flock plan required</p>
                  <Link href="/crows-eye" style={{ display: "inline-block", background: "rgba(184,146,42,0.08)", border: "1px solid rgba(184,146,42,0.2)", borderRadius: "7px", color: "#B8922A", fontSize: "11px", fontWeight: 600, padding: "6px 12px", textDecoration: "none" }}>
                    Upgrade
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Team Seats Management ── */}
      {isSubType && seatInfo && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ ...sectionLabel, marginBottom: 0 }}>
              Team Seats — {seatInfo.totalSeats} of {seatInfo.maxTotal} maximum
            </p>
            {tier !== "nest" && seatInfo.totalSeats < seatInfo.maxTotal && (
              <button
                onClick={() => { setShowInviteModal(true); setInviteError(""); }}
                style={{
                  background: "rgba(0,194,199,0.1)", border: "1px solid rgba(0,194,199,0.3)",
                  borderRadius: "8px", color: "#00C2C7", fontSize: "12px", fontWeight: 600,
                  padding: "7px 14px", cursor: "pointer",
                }}>
                + Invite Team Member
              </button>
            )}
          </div>

          {tier === "nest" ? (
            /* Nest: upgrade prompt */
            <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
              <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Your plan includes 1 seat.</p>
              <p style={{ color: "#888888", fontSize: "13px", marginBottom: "16px" }}>
                Need more seats? Upgrade to Flock to add up to 4 additional team members.
              </p>
              <a href="/#pricing" style={{
                display: "inline-block", background: "#B8922A", color: "#0D1520",
                borderRadius: "8px", fontSize: "13px", fontWeight: 700, padding: "9px 20px", textDecoration: "none",
              }}>
                Upgrade to Flock →
              </a>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#888888", fontSize: "12px" }}>
                    {seatInfo.members.length} member{seatInfo.members.length !== 1 ? "s" : ""} invited · {seatInfo.totalSeats - seatInfo.members.length - 1} seat{seatInfo.totalSeats - seatInfo.members.length - 1 !== 1 ? "s" : ""} open
                  </span>
                  <span style={{ color: "#555555", fontSize: "12px" }}>{seatInfo.totalSeats} / {seatInfo.maxTotal}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "4px", height: "6px" }}>
                  <div style={{
                    background: seatInfo.totalSeats >= seatInfo.maxTotal ? "#F87171" : "#00C2C7",
                    borderRadius: "4px", height: "6px",
                    width: `${Math.min(100, (seatInfo.totalSeats / seatInfo.maxTotal) * 100)}%`,
                    transition: "width 0.3s",
                  }} />
                </div>
              </div>

              {/* Seat members list */}
              {seatInfo.members.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  {seatInfo.members.map((m) => (
                    <div key={m.email} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <div>
                        <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{m.name}</p>
                        <p style={{ color: "#555555", fontSize: "11px", margin: "2px 0 0" }}>{m.email}</p>
                        <p style={{ color: "#333333", fontSize: "10px", fontFamily: "monospace", margin: "2px 0 0" }}>{m.code}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(m.email)}
                        disabled={removingMember === m.email}
                        style={{
                          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: "6px", color: "#F87171", fontSize: "11px",
                          padding: "4px 10px", cursor: removingMember ? "not-allowed" : "pointer",
                        }}>
                        {removingMember === m.email ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add more seats */}
              {seatInfo.totalSeats < seatInfo.maxTotal ? (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
                  <p style={{ color: "#888888", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
                    Add More Seats
                  </p>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                    {/* Seat count dropdown */}
                    <select
                      value={seatAddCount}
                      onChange={(e) => setSeatAddCount(Number(e.target.value))}
                      style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", padding: "8px 12px", cursor: "pointer" }}
                    >
                      {Array.from({ length: seatInfo.maxAdditional - seatInfo.additionalSeats }, (_, i) => i + 1).map(n => {
                        const priceMap = tier === "flock"
                          ? { 1: 25, 2: 45, 3: 60, 4: 75 } as Record<number, number>
                          : { 1: 75, 2: 140, 3: 195, 4: 240, 5: 275, 6: 300, 7: 315, 8: 320, 9: 325, 10: 330 } as Record<number, number>;
                        const price = priceMap[n] ?? 0;
                        return (
                          <option key={n} value={n}>
                            {n} seat{n !== 1 ? "s" : ""} (+${seatBillingPeriod === "annual" ? Math.round(price * 12 * 0.8) : price}/{seatBillingPeriod === "annual" ? "yr" : "mo"})
                          </option>
                        );
                      })}
                    </select>
                    {/* Billing toggle */}
                    <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {(["monthly", "annual"] as const).map(p => (
                        <button key={p} type="button" onClick={() => setSeatBillingPeriod(p)}
                          style={{
                            padding: "8px 14px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
                            background: seatBillingPeriod === p ? "rgba(0,194,199,0.15)" : "rgba(255,255,255,0.04)",
                            color: seatBillingPeriod === p ? "#00C2C7" : "rgba(255,255,255,0.5)",
                          }}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                    {seatBillingPeriod === "annual" && (
                      <span style={{ color: "#4ADE80", fontSize: "11px", fontWeight: 600 }}>Save 20%</span>
                    )}
                  </div>
                  <button
                    onClick={handleBuySeats}
                    disabled={buyingSeats}
                    style={{
                      background: buyingSeats ? "#0D6E7A" : "#00C2C7", color: "#0D1520",
                      border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                      padding: "10px 20px", cursor: buyingSeats ? "not-allowed" : "pointer",
                    }}>
                    {buyingSeats ? "Redirecting…" : "Add Seats"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  {tier === "flock" ? (
                    <>
                      <p style={{ color: "#888888", fontSize: "13px", marginBottom: "12px" }}>
                        Maximum seats reached. Need more? Upgrade to Murder for up to 15 seats.
                      </p>
                      <a href="/#pricing" style={{
                        display: "inline-block", background: "rgba(155,28,28,0.15)", border: "1px solid rgba(155,28,28,0.3)",
                        borderRadius: "8px", color: "#F87171", fontSize: "12px", fontWeight: 600,
                        padding: "7px 16px", textDecoration: "none",
                      }}>
                        Upgrade to Murder →
                      </a>
                    </>
                  ) : (
                    <p style={{ color: "#888888", fontSize: "13px" }}>Maximum seat capacity reached.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Invite Member Modal ── */}
      {showInviteModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{ background: "#0D1520", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px" }}>
            <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Invite Team Member
            </p>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ color: "#888888", fontSize: "12px", display: "block", marginBottom: "6px" }}>Name</label>
              <input
                type="text"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                placeholder="Jane Smith"
                style={{ ...inputStyle }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#888888", fontSize: "12px", display: "block", marginBottom: "6px" }}>Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="jane@company.com"
                style={{ ...inputStyle }}
              />
            </div>
            {inviteError && (
              <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "12px" }}>{inviteError}</p>
            )}
            <p style={{ color: "#555555", fontSize: "11px", marginBottom: "16px", lineHeight: 1.6 }}>
              A personal access code will be generated and sent to their email.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleInviteMember}
                disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
                style={{
                  flex: 1, background: inviting ? "#0D6E7A" : "#00C2C7", color: "#0D1520",
                  border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                  padding: "10px", cursor: inviting || !inviteName.trim() || !inviteEmail.trim() ? "not-allowed" : "pointer",
                  opacity: !inviteName.trim() || !inviteEmail.trim() ? 0.5 : 1,
                }}>
                {inviting ? "Sending…" : "Send Invite"}
              </button>
              <button
                onClick={() => { setShowInviteModal(false); setInviteError(""); setInviteName(""); setInviteEmail(""); }}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", color: "#888888", fontSize: "13px",
                  padding: "10px 16px", cursor: "pointer",
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Past Reports ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <p style={{ ...sectionLabel, marginBottom: 0 }}>Past Verdicts &amp; Reckonings</p>
          {reports.length > 0 && (
            <span style={{ color: "#555555", fontSize: "12px" }}>{reports.length} report{reports.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {reportsLoading ? (
          <p style={{ color: "#555555", fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            Loading reports...
          </p>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <p style={{ color: "#555555", fontSize: "14px", marginBottom: "10px" }}>No reports yet.</p>
            <p style={{ color: "#888888", fontSize: "13px", marginBottom: "20px" }}>
              Run your first scan at Crow&rsquo;s Eye.
            </p>
            <Link href="/crows-eye" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "#00C2C7", color: "#0D1520", borderRadius: "10px",
              padding: "10px 26px", fontSize: "14px", fontWeight: 700, textDecoration: "none",
            }}>
              Go to Crow&rsquo;s Eye →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reports.map((r) => {
              const sev = SEVERITY_COLORS[r.severity] ?? SEVERITY_COLORS.info;
              const isOpen = expandedReport === r.reportId;
              let parsed: { full_findings?: Array<{ severity: string; title: string; description: string; fix: string }> } = {};
              try { parsed = JSON.parse(r.reportData); } catch { /* */ }
              return (
                <div key={r.reportId} style={{
                  background: "#0D1520",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}>
                  {/* Card header */}
                  <div style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      {/* Type badge */}
                      <span style={{
                        background: "rgba(0,194,199,0.12)",
                        color: "#00C2C7",
                        fontSize: "9px",
                        fontWeight: 800,
                        letterSpacing: "0.18em",
                        padding: "3px 8px",
                        borderRadius: "20px",
                        border: "1px solid rgba(0,194,199,0.25)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        {REPORT_TYPE_LABELS[r.type] ?? r.type}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.locationName || "Untitled"}
                        </p>
                        <p style={{ color: "#555555", fontSize: "11px", margin: 0 }}>
                          {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      {/* Severity badge */}
                      <span style={{
                        background: sev.bg, color: sev.color,
                        border: `1px solid ${sev.border}`,
                        fontSize: "9px", fontWeight: 800,
                        letterSpacing: "0.15em", padding: "3px 8px", borderRadius: "20px",
                      }}>
                        {r.severity.toUpperCase()}
                      </span>
                      <span style={{ color: "#555555", fontSize: "11px" }}>
                        {r.findingCount} finding{r.findingCount !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => setExpandedReport(isOpen ? null : r.reportId)}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "7px",
                          color: "#00C2C7",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "5px 12px",
                          cursor: "pointer",
                        }}
                      >
                        {isOpen ? "Collapse" : "View Report"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded findings */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px" }}>
                      {parsed.full_findings && parsed.full_findings.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {parsed.full_findings.map((f, i) => {
                            const fc = f.severity === "CRITICAL"
                              ? { color: "#f87171", border: "rgba(239,68,68,0.3)" }
                              : f.severity === "GOOD"
                              ? { color: "#4ade80", border: "rgba(34,197,94,0.3)" }
                              : { color: "#fbbf24", border: "rgba(234,179,8,0.3)" };
                            return (
                              <div key={i} style={{
                                background: "rgba(255,255,255,0.03)",
                                border: `1px solid ${fc.border}`,
                                borderRadius: "8px",
                                padding: "12px 14px",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                  <span style={{ color: fc.color, fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em" }}>
                                    {f.severity}
                                  </span>
                                  <span style={{ color: "#ffffff", fontSize: "13px", fontWeight: 600 }}>{f.title}</span>
                                </div>
                                <p style={{ color: "#888888", fontSize: "12px", marginBottom: "6px", lineHeight: 1.6 }}>{f.description}</p>
                                {f.fix && (
                                  <p style={{ color: "#00C2C7", fontSize: "12px", lineHeight: 1.6 }}>
                                    <strong>Fix:</strong> {f.fix}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: "#555555", fontSize: "13px" }}>No detailed findings stored for this report.</p>
                      )}
                      <p style={{ color: "#444444", fontSize: "10px", marginTop: "12px", fontFamily: "monospace" }}>
                        Report ID: {r.reportId}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Subscription ID ── */}
      <div style={card}>
        <p style={sectionLabel}>Your Subscriber Code</p>
        <div style={{
          background: "#0D1520", border: "1px solid #0D6E7A",
          borderRadius: "12px", padding: "20px 24px",
          textAlign: "center", marginBottom: "16px",
        }}>
          <p style={{ color: "#00C2C7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>
            Your Subscriber Code
          </p>
          <p style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {codeVisible ? storedCode : "••••••••••••••••••••"}
          </p>
          {codeStats && (
            <p style={{ color: "#555555", fontSize: "11px", marginTop: "8px" }}>
              Used {codeStats.usageCount} time{codeStats.usageCount !== 1 ? "s" : ""}
              {codeStats.lastUsed ? ` · last used ${fmtDate(codeStats.lastUsed)}` : ""}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
          <button onClick={() => setCodeVisible(v => !v)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", padding: "8px 16px", cursor: "pointer" }}>
            {codeVisible ? "Hide Code" : "Show Code"}
          </button>
          <button onClick={copyCode}
            style={{
              background: codeCopied ? "rgba(0,194,199,0.12)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${codeCopied ? "rgba(0,194,199,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "8px", color: codeCopied ? "#00C2C7" : "#ffffff",
              fontSize: "13px", padding: "8px 16px", cursor: "pointer",
            }}>
            {codeCopied ? "Copied!" : "Copy Code"}
          </button>
          {isSubType && details?.customer_email && (
            <button
              onClick={handleResendCode}
              disabled={resending || resent}
              style={{
                background: resent ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${resent ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px",
                color: resent ? "#4ADE80" : "#888888",
                fontSize: "13px", padding: "8px 16px",
                cursor: resending || resent ? "not-allowed" : "pointer",
              }}>
              {resent ? "Sent!" : resending ? "Sending…" : "Resend Code to Email"}
            </button>
          )}
        </div>
        {tier === "flock" && (
          <p style={{ color: "#888888", fontSize: "12px" }}>
            1 seat included — add up to 4 more in Team Seats below.
          </p>
        )}
        {tier === "murder" && (
          <p style={{ color: "#888888", fontSize: "12px" }}>
            5 seats included — add up to 10 more in Team Seats below (15 maximum).
          </p>
        )}
        {tier === "nest" && (
          <p style={{ color: "#555555", fontSize: "12px" }}>
            Your Nest plan covers a single device. Upgrade to Flock for team access.
          </p>
        )}
        <p style={{ color: "#444444", fontSize: "11px", marginTop: "12px" }}>
          Lost your code?{" "}
          <a href="/recover-code" style={{ color: "#00C2C7" }}>Recover it here</a>
        </p>
      </div>

      {/* ── Account (subscription type only) ── */}
      {isSubType && (
        <div style={card}>
          <p style={sectionLabel}>Account</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {(
                [
                  ["Email on file",   details?.customer_email ?? "—"],
                  ["Plan",            `${tc.label} — ${tc.price}`],
                  ["Status",          details?.status ?? "active"],
                  ["Member since",    fmtDate(details?.created_at)],
                  ["Billing period",  details?.current_period_start && details?.current_period_end
                    ? `${fmtDate(details.current_period_start)} → ${fmtDate(details.current_period_end)}`
                    : "—"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <tr key={label}>
                  <td style={{ color: "#888888", fontSize: "13px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", width: "45%" }}>{label}</td>
                  <td style={{ color: "#ffffff", fontSize: "13px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "right" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button disabled style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", color: "#444444", fontSize: "13px", padding: "8px 16px", cursor: "not-allowed",
            }}>
              Manage Billing (coming soon)
            </button>
          </div>
          <p style={{ color: "#555555", fontSize: "11px", marginTop: "12px" }}>
            To cancel your subscription, contact{" "}
            <a href="mailto:joshua@oldcrowswireless.com" style={{ color: "#00C2C7" }}>joshua@oldcrowswireless.com</a>.
          </p>
        </div>
      )}

      {/* Bypass code notice */}
      {!isSubType && (sub?.type === "admin" || sub?.type === "founder") && (
        <div style={{
          background: "rgba(184,146,42,0.06)", border: "1px solid rgba(184,146,42,0.2)",
          borderRadius: "12px", padding: "16px 20px",
        }}>
          <p style={{ color: "#B8922A", fontSize: "12px", lineHeight: 1.6 }}>
            <strong>Bypass access active.</strong> This is an {sub.type} code. Full account and billing details are not displayed for bypass codes. All Crow&rsquo;s Eye features are available.
          </p>
        </div>
      )}
    </div>
  );
}
