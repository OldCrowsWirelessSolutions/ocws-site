"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionTier  = "nest" | "flock" | "murder";
type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired";

interface SubRecord {
  subscription_id: string;
  customer_email: string;
  customer_name: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  verdicts_used: number;
  extra_verdict_credits: number;
  reckonings_used: { small: number; standard: number; commercial: number };
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  stripe_subscription_id: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_KEY = "OCWS2026";

const TIER_COLORS: Record<SubscriptionTier, { bg: string; text: string }> = {
  nest:   { bg: "#00C2C7", text: "#0D1520" },
  flock:  { bg: "#B8922A", text: "#0D1520" },
  murder: { bg: "#9B1C1C", text: "#ffffff" },
};

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active:    "#4ADE80",
  cancelled: "#F87171",
  past_due:  "#FBBF24",
  expired:   "#555555",
};

const MONTHLY_VERDICTS: Record<SubscriptionTier, number> = {
  nest: 3, flock: 15, murder: 999999,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined, short = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", short
    ? { month: "short", day: "numeric", year: "numeric" }
    : { year: "numeric", month: "long", day: "numeric" }
  );
}

function creditsLeft(sub: SubRecord): string {
  const monthly = MONTHLY_VERDICTS[sub.tier];
  if (monthly >= 999999) return "∞";
  return String(Math.max(0, monthly - sub.verdicts_used) + sub.extra_verdict_credits);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [phase, setPhase]       = useState<"auth" | "dashboard">("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [subscribers, setSubscribers] = useState<SubRecord[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadError, setLoadError]     = useState("");

  // Generate form
  const [genTier, setGenTier]   = useState<SubscriptionTier>("nest");
  const [genEmail, setGenEmail] = useState("");
  const [genName, setGenName]   = useState("");
  const [generating, setGenerating]   = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [genError, setGenError] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  // Credits form
  const [credSubId, setCredSubId]     = useState("");
  const [credAmount, setCredAmount]   = useState("5");
  const [addingCredits, setAddingCredits] = useState(false);
  const [credFeedback, setCredFeedback]   = useState("");

  // Action feedback
  const [actionMsg, setActionMsg] = useState("");

  // ── Data load ──────────────────────────────────────────────────────────────

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/subscribers", {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setSubscribers(data.subscribers ?? []);
    } catch {
      setLoadError("Failed to load subscribers. Check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("corvus_admin_auth") === ADMIN_KEY) {
        setPhase("dashboard");
        loadSubscribers();
      }
    } catch { /* */ }
  }, [loadSubscribers]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      try { localStorage.setItem("corvus_admin_auth", ADMIN_KEY); } catch { /* */ }
      setPhase("dashboard");
      loadSubscribers();
    } else {
      setAuthError("Incorrect password.");
    }
  }

  function handleLogout() {
    try { localStorage.removeItem("corvus_admin_auth"); } catch { /* */ }
    setPhase("auth");
    setPassword("");
    setSubscribers([]);
  }

  async function handleDeactivate(subscription_id: string) {
    if (!confirm(`Deactivate ${subscription_id}? This cannot be undone from the dashboard.`)) return;
    try {
      const res = await fetch("/api/admin/codes/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ subscription_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      flash(`Deactivated: ${subscription_id}`);
      loadSubscribers();
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : "Deactivation failed.", true);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!genEmail.trim()) return;
    setGenerating(true);
    setGenError("");
    setGeneratedCode("");
    try {
      const res = await fetch("/api/admin/codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({
          tier: genTier,
          email: genEmail.trim().toLowerCase(),
          name: genName.trim() || genEmail.trim(),
          send_email: sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setGeneratedCode(data.subscription_id);
      setGenEmail("");
      setGenName("");
      loadSubscribers();
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddCredits(e: React.FormEvent) {
    e.preventDefault();
    if (!credSubId.trim()) return;
    setAddingCredits(true);
    setCredFeedback("");
    try {
      const res = await fetch("/api/admin/credits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({
          subscription_id: credSubId.trim().toUpperCase(),
          credits: Number(credAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setCredFeedback(`✓ Added ${credAmount} credits to ${credSubId.trim().toUpperCase()}`);
      setCredSubId("");
      loadSubscribers();
    } catch (e: unknown) {
      setCredFeedback(e instanceof Error ? e.message : "Failed to add credits.");
    } finally {
      setAddingCredits(false);
      setTimeout(() => setCredFeedback(""), 5000);
    }
  }

  function flash(msg: string, _isError = false) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 4000);
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const active             = subscribers.filter(s => s.status === "active");
  const totalConsumed      = subscribers.reduce((n, s) => n + s.verdicts_used, 0);
  const recentActivity     = [...subscribers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  // ── Shared styles ─────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: "#1A2332",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
  };

  const inp: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    background: "#0D1520",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "7px",
    color: "#ffffff",
    padding: "9px 11px",
    fontSize: "13px",
    outline: "none",
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  if (phase === "auth") {
    return (
      <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ position: "relative", width: "34px", height: "34px" }}>
                <Image src="/OCWS_Logo_Transparent.png" alt="OCWS" fill sizes="34px" style={{ objectFit: "contain" }} />
              </div>
              <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 700 }}>Corvus Admin</span>
            </div>
            <p style={{ color: "#444444", fontSize: "11px", letterSpacing: "0.1em" }}>RESTRICTED ACCESS</p>
          </div>

          <form onSubmit={handleLogin}
            style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "28px" }}>
            <label style={{ display: "block", color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Admin Password
            </label>
            <input
              type="password"
              autoComplete="off"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inp, marginBottom: authError ? "8px" : "16px" }}
            />
            {authError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "12px" }}>{authError}</p>}
            <button type="submit"
              style={{ width: "100%", background: "#00C2C7", color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "32px 16px 64px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ color: "#00C2C7", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Old Crows Wireless Solutions
          </p>
          <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 800, margin: 0 }}>Admin Dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={loadSubscribers} disabled={loading}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
          <button onClick={handleLogout}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#888888", fontSize: "12px", padding: "7px 14px", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: "rgba(0,194,199,0.08)", border: "1px solid rgba(0,194,199,0.25)", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", color: "#00C2C7", fontSize: "13px" }}>
          {actionMsg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "14px", marginBottom: "24px" }}>
        {([
          { label: "Active Subscribers", value: active.length,        color: "#00C2C7" },
          { label: "Total Subscribers",  value: subscribers.length,   color: "#aaaaaa" },
          { label: "Credits Consumed",   value: totalConsumed,        color: "#B8922A" },
          { label: "Revenue",            value: "$—",                 color: "#444444" },
        ] as { label: string; value: string | number; color: string }[]).map(({ label, value, color }) => (
          <div key={label} style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px 20px" }}>
            <p style={{ color: "#444444", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{label}</p>
            <p style={{ color, fontSize: "30px", fontWeight: 800, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Subscriber table */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Subscribers ({subscribers.length})
          </p>
        </div>

        {loadError && (
          <p style={{ color: "#F87171", fontSize: "13px", marginBottom: "12px" }}>{loadError}</p>
        )}

        {subscribers.length === 0 && !loading ? (
          <p style={{ color: "#444444", fontSize: "13px", padding: "16px 0" }}>No subscribers found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "700px" }}>
              <thead>
                <tr>
                  {["Email", "Name", "Tier", "Status", "Credits Left", "Code", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ color: "#444444", fontWeight: 600, textAlign: "left", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.subscription_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ color: "#aaaaaa", padding: "10px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.customer_email}
                    </td>
                    <td style={{ color: "#888888", padding: "10px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.customer_name}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span style={{
                        background: TIER_COLORS[sub.tier].bg, color: TIER_COLORS[sub.tier].text,
                        fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em",
                        padding: "2px 8px", borderRadius: "20px",
                      }}>
                        {sub.tier.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ color: STATUS_COLORS[sub.status], fontSize: "11px", fontWeight: 600 }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ color: "#ffffff", padding: "10px", fontFamily: "monospace", fontWeight: 700 }}>
                      {creditsLeft(sub)}
                    </td>
                    <td style={{ color: "#555555", padding: "10px", fontFamily: "monospace", fontSize: "11px", whiteSpace: "nowrap" }}>
                      {sub.subscription_id}
                    </td>
                    <td style={{ color: "#444444", padding: "10px", whiteSpace: "nowrap" }}>
                      {fmtDate(sub.created_at, true)}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleDeactivate(sub.subscription_id)}
                        disabled={sub.status === "cancelled" || sub.status === "expired"}
                        style={{
                          background: "rgba(248,113,113,0.08)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: "6px",
                          color: (sub.status === "cancelled" || sub.status === "expired") ? "#444444" : "#F87171",
                          fontSize: "11px", padding: "4px 10px",
                          cursor: (sub.status === "cancelled" || sub.status === "expired") ? "not-allowed" : "pointer",
                        }}>
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code management + Add credits */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "16px", marginBottom: "20px" }}>

        {/* Generate code */}
        <div style={card}>
          <p style={{ color: "#B8922A", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Generate Subscription Code
          </p>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: "11px" }}>
              <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Tier</label>
              <select value={genTier} onChange={e => setGenTier(e.target.value as SubscriptionTier)}
                style={{ ...inp }}>
                <option value="nest">Nest — $20/mo</option>
                <option value="flock">Flock — $100/mo</option>
                <option value="murder">Murder — $950/mo</option>
              </select>
            </div>
            <div style={{ marginBottom: "11px" }}>
              <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Email *</label>
              <input type="email" value={genEmail} onChange={e => setGenEmail(e.target.value)}
                placeholder="subscriber@example.com" style={inp} required />
            </div>
            <div style={{ marginBottom: "11px" }}>
              <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Name (optional)</label>
              <input type="text" value={genName} onChange={e => setGenName(e.target.value)}
                placeholder="Full name" style={inp} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <input type="checkbox" id="sendEmail" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                style={{ accentColor: "#00C2C7" }} />
              <label htmlFor="sendEmail" style={{ color: "#888888", fontSize: "12px", cursor: "pointer" }}>
                Send confirmation email
              </label>
            </div>
            {genError && <p style={{ color: "#F87171", fontSize: "12px", marginBottom: "8px" }}>{genError}</p>}
            <button type="submit" disabled={generating || !genEmail.trim()}
              style={{
                width: "100%",
                background: generating || !genEmail.trim() ? "#0D6E7A" : "#B8922A",
                color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px",
                fontSize: "13px", fontWeight: 700,
                cursor: generating || !genEmail.trim() ? "not-allowed" : "pointer",
              }}>
              {generating ? "Generating…" : "Generate Code"}
            </button>
          </form>
          {generatedCode && (
            <div style={{ marginTop: "14px", background: "#0D1520", border: "1px solid #0D6E7A", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <p style={{ color: "#555555", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>Generated Code</p>
              <p style={{ color: "#00C2C7", fontSize: "15px", fontFamily: "monospace", fontWeight: 700 }}>{generatedCode}</p>
            </div>
          )}
        </div>

        {/* Add credits */}
        <div style={card}>
          <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Add Verdict Credits
          </p>
          <form onSubmit={handleAddCredits}>
            <div style={{ marginBottom: "11px" }}>
              <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Subscription ID</label>
              <input type="text" value={credSubId} onChange={e => setCredSubId(e.target.value)}
                placeholder="OCWS-NEST-XXXXXXXX" style={{ ...inp, fontFamily: "monospace" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#555555", fontSize: "11px", marginBottom: "5px" }}>Credits to Add</label>
              <input type="number" min="1" max="500" value={credAmount}
                onChange={e => setCredAmount(e.target.value)} style={inp} />
            </div>
            {credFeedback && (
              <p style={{ color: credFeedback.startsWith("✓") ? "#4ADE80" : "#F87171", fontSize: "12px", marginBottom: "8px" }}>
                {credFeedback}
              </p>
            )}
            <button type="submit" disabled={addingCredits || !credSubId.trim()}
              style={{
                width: "100%",
                background: addingCredits || !credSubId.trim() ? "#0D6E7A" : "#00C2C7",
                color: "#0D1520", border: "none", borderRadius: "8px", padding: "10px",
                fontSize: "13px", fontWeight: 700,
                cursor: addingCredits || !credSubId.trim() ? "not-allowed" : "pointer",
              }}>
              {addingCredits ? "Adding…" : "Add Credits"}
            </button>
          </form>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "20px", paddingTop: "14px" }}>
            <p style={{ color: "#444444", fontSize: "11px", lineHeight: 1.6 }}>
              Added credits are non-expiring and deplete before the subscriber&rsquo;s monthly allotment.
            </p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={card}>
        <p style={{ color: "#00C2C7", fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
          Recent Activity
        </p>
        {recentActivity.length === 0 ? (
          <p style={{ color: "#444444", fontSize: "13px" }}>No activity yet.</p>
        ) : (
          <div>
            {recentActivity.map(sub => (
              <div key={sub.subscription_id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap" }}>
                <span style={{ color: "#444444", fontSize: "11px", minWidth: "110px", whiteSpace: "nowrap" }}>
                  {fmtDate(sub.created_at, true)}
                </span>
                <span style={{ color: "#888888", fontSize: "12px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: "120px" }}>
                  {sub.customer_email}
                </span>
                <span style={{
                  background: TIER_COLORS[sub.tier].bg, color: TIER_COLORS[sub.tier].text,
                  fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em",
                  padding: "2px 7px", borderRadius: "20px", flexShrink: 0,
                }}>
                  {sub.tier.toUpperCase()}
                </span>
                <span style={{ color: STATUS_COLORS[sub.status], fontSize: "11px", fontWeight: 600, flexShrink: 0 }}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
