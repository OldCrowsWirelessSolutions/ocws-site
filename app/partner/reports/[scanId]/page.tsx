"use client";

// app/partner/reports/[scanId]/page.tsx
// Full report for one partner scan + a Corvus chat scoped to that scan. Chat
// reuses /api/chat (the partner lead code authenticates as unlimited; the parsed
// report is passed as reportContext so every answer references THIS scan).

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  usePartnerAuth, partnerHeaders, getPartnerCode, PartnerShell, Panel, T, SEVERITY_COLORS,
} from "../../_shared";

interface Finding { title: string; severity?: string; detail?: string; recommendation?: string }
interface ReportData { corvus_summary?: string; full_findings?: Finding[]; [k: string]: unknown }
interface ScanSummary {
  scanId: string; reportId: string; customerName: string | null; ssid: string;
  locationName: string; findingCount: number; severity: "critical" | "warning" | "info"; timestamp: number;
}
interface ReportRecord { reportId: string; locationName: string; createdAt: string; reportData: string }
interface ChatMsg { role: "user" | "assistant"; content: string }

export default function PartnerScanDetailPage() {
  const code = usePartnerAuth();
  const params = useParams<{ scanId: string }>();
  const scanId = params?.scanId;

  const [scan, setScan] = useState<ScanSummary | null>(null);
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !scanId) return;
    (async () => {
      try {
        const res = await fetch(`/api/partner/scan/${scanId}`, { headers: partnerHeaders() });
        const data = await res.json();
        if (!res.ok || !data?.ok) { setError(data?.error ?? "Could not load this report."); return; }
        setScan(data.scan);
        setReport(data.report);
      } catch { setError("Could not load this report."); }
    })();
  }, [code, scanId]);

  const parsed: ReportData | null = useMemo(() => {
    if (!report?.reportData) return null;
    try { return JSON.parse(report.reportData) as ReportData; } catch { return null; }
  }, [report]);

  if (!code) return null;

  return (
    <PartnerShell active="reports">
      <Link href="/partner/reports" style={{ color: T.cyan, fontSize: 14, textDecoration: "none" }}>
        ← All reports
      </Link>

      {error && <Panel style={{ marginTop: 16 }}><p style={{ color: "#f87171", margin: 0 }}>{error}</p></Panel>}

      {scan && (
        <>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "14px 0 4px" }}>
            {scan.customerName || scan.locationName || "WiFi Health Report"}
          </h1>
          <p style={{ color: T.muted2, fontSize: 13, margin: "0 0 20px" }}>
            {scan.ssid ? `${scan.ssid} · ` : ""}
            {new Date(scan.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>

          {parsed?.corvus_summary && (
            <Panel style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: T.cyan }}>Summary</h2>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{parsed.corvus_summary}</p>
            </Panel>
          )}

          {parsed?.full_findings && parsed.full_findings.length > 0 && (
            <Panel style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", color: T.cyan }}>
                Findings ({parsed.full_findings.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {parsed.full_findings.map((f, i) => {
                  const sev = SEVERITY_COLORS[String(f.severity ?? "info").toLowerCase()] ?? SEVERITY_COLORS.info;
                  return (
                    <div key={i} style={{
                      borderLeft: `3px solid ${sev.color}`, paddingLeft: 12, background: sev.bg,
                      borderRadius: 8, padding: "10px 12px",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                      {f.detail && <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{f.detail}</div>}
                      {f.recommendation && (
                        <div style={{ color: T.muted2, fontSize: 13, marginTop: 4 }}>
                          <strong style={{ color: T.gold }}>Fix:</strong> {f.recommendation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {!parsed && report && (
            <Panel style={{ marginBottom: 16 }}>
              <p style={{ color: T.muted2, fontSize: 13, margin: 0 }}>
                Raw report data (could not parse structured view):
              </p>
              <pre style={{ color: T.muted, fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap" }}>
                {report.reportData}
              </pre>
            </Panel>
          )}

          <ScopedChat scanId={scan.scanId} parsed={parsed} locationName={scan.customerName || scan.locationName} />
        </>
      )}
    </PartnerShell>
  );
}

// ─── Scoped Corvus chat ──────────────────────────────────────────────────────

function ScopedChat({ scanId, parsed, locationName }: {
  scanId: string; parsed: ReportData | null; locationName: string;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const reportContext = useMemo(() => {
    if (!parsed) return `Report for ${locationName}.`;
    const findings = (parsed.full_findings ?? []).slice(0, 12)
      .map((f) => `- ${f.title} (${f.severity ?? "info"})${f.recommendation ? ` → Fix: ${f.recommendation}` : ""}`)
      .join("\n");
    return `WiFi Health Report for ${locationName}\nSummary: ${parsed.corvus_summary ?? "n/a"}\nFindings:\n${findings}`;
  }, [parsed, locationName]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: getPartnerCode(), message: msg, reportContext }),
      });
      const data = await res.json();
      const reply = data?.response ?? data?.message ?? "Corvus is unavailable right now.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong reaching Corvus." }]);
    } finally {
      setBusy(false);
    }
  }, [input, busy, reportContext]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <Panel>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px", color: T.cyan }}>
        Ask Corvus about this scan
      </h2>
      <p style={{ color: T.muted2, fontSize: 13, margin: "0 0 14px" }}>
        Answers are scoped to this customer&apos;s report — handy for talking them through fixes.
      </p>

      {messages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%", padding: "9px 13px", borderRadius: 12, fontSize: 14, lineHeight: 1.5,
              background: m.role === "user" ? T.cyan : "rgba(255,255,255,0.06)",
              color: m.role === "user" ? T.bg : T.text,
              border: m.role === "user" ? "none" : `1px solid ${T.border}`,
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          ))}
          {busy && <div style={{ color: T.muted2, fontSize: 13 }}>Corvus is thinking…</div>}
          <div ref={endRef} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="e.g. What should I tell them to fix first?"
          style={{
            flex: 1, padding: "11px 14px", borderRadius: 10, fontSize: 14,
            background: "rgba(0,0,0,0.25)", color: T.text, border: `1px solid ${T.border}`, outline: "none",
          }}
        />
        <button onClick={send} disabled={busy || !input.trim()} style={{
          padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700,
          cursor: busy ? "default" : "pointer", background: T.cyan, color: T.bg, border: "none",
          opacity: busy || !input.trim() ? 0.6 : 1,
        }}>Send</button>
      </div>
    </Panel>
  );
}
