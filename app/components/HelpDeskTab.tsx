"use client";

// HelpDeskTab — the Murder-tier help-desk console.
//
// Flow: a Murder subscriber (acting as a help-desk agent) is on the phone with a
// caller. They issue a one-time scan code (Verdict or any Reckoning level), read
// it to the caller, the caller redeems it in the Crow's Eye app and runs exactly
// that scan, and the result lands back here so the agent can read the verdict and
// the fix to the caller live.
//
// Auth model: this component first exchanges the subscriber's own code for a
// partner leadCode (POST /api/subscriptions/partner-leadcode, Murder-gated), then
// uses that leadCode as the x-partner-lead-code credential for the partner
// endpoints. All token issuance + scan storage already exists in lib/partner-channel.

import { useCallback, useEffect, useState } from "react";

const CYAN = "#22D6DC";

type ReportType =
  | "verdict"
  | "reckoning_small"
  | "reckoning_standard"
  | "reckoning_commercial"
  | "reckoning_pro";

const SCAN_TYPES: { value: ReportType; label: string; hint: string }[] = [
  { value: "verdict",              label: "WiFi Health Report (Verdict)", hint: "Single-location instant fix — the everyday call" },
  { value: "reckoning_small",      label: "Small Survey",                 hint: "Reckoning · multi-room home / micro-office" },
  { value: "reckoning_standard",   label: "Standard Survey",              hint: "Reckoning · up to 15 locations" },
  { value: "reckoning_commercial", label: "Commercial Survey",            hint: "Reckoning · 16+ locations" },
  { value: "reckoning_pro",        label: "Pro / Enterprise Survey",      hint: "Reckoning · certified, custom-quoted" },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  SCAN_TYPES.map((s) => [s.value, s.label]),
);

interface PartnerScan {
  scanId: string;
  reportId: string;
  customerName: string | null;
  ssid: string;
  locationName: string;
  findingCount: number;
  severity: "critical" | "warning" | "info";
  timestamp: number;
}

const panel: React.CSSProperties = {
  background: "rgba(13,27,30,0.6)",
  border: "1px solid rgba(34,214,220,0.25)",
  borderRadius: 12,
  padding: 18,
  marginBottom: 16,
};
const label: React.CSSProperties = { display: "block", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(244,246,248,0.6)", marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", background: "#0B1F22", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#F4F6F8", padding: "10px 12px", fontSize: 14, marginBottom: 12 };
const btn: React.CSSProperties = { background: CYAN, color: "#04181A", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const sevColor = (s: string) => (s === "critical" ? "#FF5C5C" : s === "warning" ? "#FFC857" : CYAN);

export default function HelpDeskTab({ subscriptionCode }: { subscriptionCode: string }) {
  const [leadCode, setLeadCode] = useState<string | null>(null);
  const [bootError, setBootError] = useState("");

  const [reportType, setReportType] = useState<ReportType>("verdict");
  const [customerName, setCustomerName] = useState("");
  const [expiryHours, setExpiryHours] = useState(24);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState<{ token: string; expiresAt: string; reportType: string } | null>(null);
  const [issueError, setIssueError] = useState("");
  const [copied, setCopied] = useState(false);

  const [scans, setScans] = useState<PartnerScan[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [openScanId, setOpenScanId] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // 1) Exchange the subscriber code for a help-desk leadCode (provisions on first use).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/subscriptions/partner-leadcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: subscriptionCode }),
        });
        const data = await res.json();
        if (!alive) return;
        if (data?.ok && data.leadCode) setLeadCode(data.leadCode);
        else setBootError(data?.error || "Help Desk could not be activated for this account.");
      } catch {
        if (alive) setBootError("Couldn't reach the server. Try again.");
      }
    })();
    return () => { alive = false; };
  }, [subscriptionCode]);

  const loadScans = useCallback(async () => {
    if (!leadCode) return;
    setLoadingScans(true);
    try {
      const res = await fetch("/api/partner/list-scans", { headers: { "x-partner-lead-code": leadCode } });
      const data = await res.json();
      if (data?.ok) setScans(data.scans ?? []);
    } finally {
      setLoadingScans(false);
    }
  }, [leadCode]);

  useEffect(() => { loadScans(); }, [loadScans]);

  async function issueToken() {
    if (!leadCode || issuing) return;
    setIssuing(true); setIssueError(""); setIssued(null); setCopied(false);
    try {
      const res = await fetch("/api/partner/issue-scan-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-partner-lead-code": leadCode },
        body: JSON.stringify({ reportType, customerName: customerName.trim() || undefined, expiresInHours: expiryHours }),
      });
      const data = await res.json();
      if (data?.ok) setIssued({ token: data.token, expiresAt: data.expiresAt, reportType: data.reportType });
      else setIssueError(data?.error || "Could not issue a code.");
    } catch {
      setIssueError("Couldn't reach the server. Try again.");
    } finally {
      setIssuing(false);
    }
  }

  async function viewScan(scanId: string) {
    if (openScanId === scanId) { setOpenScanId(null); setOpenReport(null); return; }
    setOpenScanId(scanId); setOpenReport(null); setLoadingReport(true);
    try {
      const res = await fetch(`/api/partner/scan/${scanId}`, { headers: { "x-partner-lead-code": leadCode || "" } });
      const data = await res.json();
      if (data?.ok) setOpenReport(data.report);
    } finally {
      setLoadingReport(false);
    }
  }

  if (bootError) {
    return <div style={{ ...panel, borderColor: "rgba(255,92,92,0.4)" }}><p style={{ color: "#FF8A8A", margin: 0 }}>{bootError}</p></div>;
  }
  if (!leadCode) {
    return <div style={panel}><p style={{ color: "rgba(244,246,248,0.7)", margin: 0 }}>Activating Help Desk…</p></div>;
  }

  return (
    <div>
      <h2 style={{ color: "#F4F6F8", fontSize: 22, margin: "0 0 4px" }}>🆘 Help Desk</h2>
      <p style={{ color: "rgba(244,246,248,0.6)", fontSize: 14, marginTop: 0, marginBottom: 18 }}>
        Issue a scan code to a caller, then read their verdict and fix back to them live.
      </p>

      {/* Issue a code */}
      <div style={panel}>
        <h3 style={{ color: CYAN, fontSize: 15, marginTop: 0, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>Issue a scan code</h3>
        <label style={label}>Scan type</label>
        <select style={input} value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
          {SCAN_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <p style={{ color: "rgba(244,246,248,0.45)", fontSize: 12, marginTop: -6, marginBottom: 14 }}>
          {SCAN_TYPES.find((s) => s.value === reportType)?.hint}
        </p>

        <label style={label}>Caller name (optional)</label>
        <input style={input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Jane from 142 Oak St" />

        <label style={label}>Code expires in (hours)</label>
        <input style={{ ...input, maxWidth: 140 }} type="number" min={1} max={168} value={expiryHours} onChange={(e) => setExpiryHours(Math.max(1, Math.min(168, Number(e.target.value) || 24)))} />

        <div>
          <button style={{ ...btn, opacity: issuing ? 0.6 : 1 }} onClick={issueToken} disabled={issuing}>
            {issuing ? "Issuing…" : "Issue code"}
          </button>
        </div>

        {issueError && <p style={{ color: "#FF8A8A", fontSize: 13, marginBottom: 0 }}>{issueError}</p>}

        {issued && (
          <div style={{ marginTop: 16, padding: 16, background: "rgba(34,214,220,0.08)", border: `1px dashed ${CYAN}`, borderRadius: 10 }}>
            <p style={{ color: "rgba(244,246,248,0.6)", fontSize: 12, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Read this code to the caller — {TYPE_LABEL[issued.reportType] || issued.reportType}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.06em", color: "#F4F6F8", fontFamily: "monospace" }}>{issued.token}</span>
              <button
                style={{ ...btn, background: "transparent", color: CYAN, border: `1px solid ${CYAN}`, padding: "6px 12px" }}
                onClick={() => { navigator.clipboard?.writeText(issued.token); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p style={{ color: "rgba(244,246,248,0.45)", fontSize: 12, marginBottom: 0, marginTop: 8 }}>
              Expires {new Date(issued.expiresAt).toLocaleString()}. They enter it in the Crow&apos;s Eye app to start the scan.
            </p>
          </div>
        )}
      </div>

      {/* Scans */}
      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ color: CYAN, fontSize: 15, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Caller scans</h3>
          <button style={{ ...btn, background: "transparent", color: CYAN, border: `1px solid ${CYAN}`, padding: "6px 12px" }} onClick={loadScans} disabled={loadingScans}>
            {loadingScans ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {scans.length === 0 && <p style={{ color: "rgba(244,246,248,0.5)", fontSize: 14, margin: 0 }}>No scans yet. Issue a code above — results show up here the moment the caller finishes.</p>}

        {scans.map((s) => (
          <div key={s.scanId} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 10 }} onClick={() => viewScan(s.scanId)}>
              <div>
                <div style={{ color: "#F4F6F8", fontSize: 15, fontWeight: 600 }}>
                  {s.customerName || s.locationName || "Caller"} <span style={{ color: "rgba(244,246,248,0.4)", fontWeight: 400, fontSize: 13 }}>· {s.ssid || "—"}</span>
                </div>
                <div style={{ color: "rgba(244,246,248,0.5)", fontSize: 12 }}>{new Date(s.timestamp).toLocaleString()} · {s.findingCount} finding{s.findingCount === 1 ? "" : "s"}</div>
              </div>
              <span style={{ color: sevColor(s.severity), fontSize: 12, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.severity}</span>
            </div>

            {openScanId === s.scanId && (
              <div style={{ marginTop: 10, padding: 14, background: "#0B1F22", borderRadius: 8 }}>
                {loadingReport && <p style={{ color: "rgba(244,246,248,0.6)", margin: 0, fontSize: 13 }}>Loading report…</p>}
                {!loadingReport && openReport && <ReportBody report={openReport} />}
                {!loadingReport && !openReport && <p style={{ color: "#FF8A8A", margin: 0, fontSize: 13 }}>Couldn&apos;t load this report.</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Render the caller's verdict so the agent can read the problem + fix on the phone.
// reportData is an opaque JSON string from the scan; parse defensively.
function ReportBody({ report }: { report: any }) {
  let parsed: any = null;
  try { parsed = typeof report?.reportData === "string" ? JSON.parse(report.reportData) : report?.reportData; } catch { /* noop */ }

  const findings: any[] =
    (Array.isArray(parsed?.full_findings) && parsed.full_findings) ||
    (Array.isArray(parsed?.findings) && parsed.findings) ||
    [];
  const summary: string = parsed?.corvus_summary || parsed?.summary || "";

  return (
    <div>
      <div style={{ color: "rgba(244,246,248,0.55)", fontSize: 12, marginBottom: 8 }}>
        {report?.locationName} · {new Date(report?.createdAt).toLocaleString()}
      </div>
      {summary && <p style={{ color: "#F4F6F8", fontSize: 14, lineHeight: 1.5, marginTop: 0 }}>{summary}</p>}
      {findings.length === 0 && !summary && (
        <pre style={{ color: "rgba(244,246,248,0.7)", fontSize: 12, whiteSpace: "pre-wrap", margin: 0 }}>{typeof parsed === "object" ? JSON.stringify(parsed, null, 2).slice(0, 1500) : String(report?.reportData ?? "").slice(0, 1500)}</pre>
      )}
      {findings.map((f, i) => (
        <div key={i} style={{ borderLeft: `3px solid ${sevColor(f?.severity || "info")}`, paddingLeft: 12, marginBottom: 12 }}>
          <div style={{ color: "#F4F6F8", fontWeight: 600, fontSize: 14 }}>{f?.title || f?.problem || `Finding ${i + 1}`}</div>
          {f?.description && <div style={{ color: "rgba(244,246,248,0.7)", fontSize: 13, marginTop: 2 }}>{f.description}</div>}
          {(f?.fix || f?.recommendation || (Array.isArray(f?.fixSteps) && f.fixSteps.length > 0)) && (
            <div style={{ marginTop: 6 }}>
              <span style={{ color: CYAN, fontSize: 12, fontWeight: 700 }}>FIX: </span>
              <span style={{ color: "rgba(244,246,248,0.85)", fontSize: 13 }}>
                {f.fix || f.recommendation || (Array.isArray(f.fixSteps) ? f.fixSteps.join(" → ") : "")}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
