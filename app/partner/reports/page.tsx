"use client";

// app/partner/reports/page.tsx
// Inbound scan feed for the partner, newest first. Polls list-scans so a report
// run on a customer's phone shows up without a refresh (v1: polling, not push).

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePartnerAuth, partnerHeaders, PartnerShell, Panel, T, SEVERITY_COLORS } from "../_shared";

interface ScanSummary {
  scanId: string; leadCode: string; reportId: string; token: string | null;
  customerName: string | null; ssid: string; locationName: string;
  findingCount: number; severity: "critical" | "warning" | "info"; timestamp: number;
}

export default function PartnerReportsPage() {
  const code = usePartnerAuth();
  const [scans, setScans] = useState<ScanSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/partner/list-scans", { headers: partnerHeaders() });
      const data = await res.json();
      if (!res.ok || !data?.ok) { setError(data?.error ?? "Could not load reports."); return; }
      setScans(data.scans);
      setError(null);
    } catch {
      setError("Could not load reports.");
    }
  }, []);

  useEffect(() => {
    if (!code) return;
    load();
    const id = setInterval(load, 15000); // poll every 15s
    return () => clearInterval(id);
  }, [code, load]);

  if (!code) return null;

  return (
    <PartnerShell active="reports">
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Reports</h1>
      <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
        Scans your customers have run with your tokens. Newest first.
      </p>

      {error && <Panel><p style={{ color: "#f87171", margin: 0 }}>{error}</p></Panel>}

      {scans && scans.length === 0 && (
        <Panel><p style={{ color: T.muted, margin: 0 }}>
          No scans yet. Issue a token and have a customer run a scan — it&apos;ll appear here.
        </p></Panel>
      )}

      {scans && scans.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scans.map((s) => {
            const sev = SEVERITY_COLORS[s.severity] ?? SEVERITY_COLORS.info;
            return (
              <Link key={s.scanId} href={`/partner/reports/${s.scanId}`} style={{ textDecoration: "none" }}>
                <Panel style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.text }}>
                      {s.customerName || s.locationName || "WiFi Health Report"}
                    </div>
                    <div style={{ color: T.muted2, fontSize: 13, marginTop: 2 }}>
                      {s.ssid ? `${s.ssid} · ` : ""}{new Date(s.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                    color: sev.color, background: sev.bg, border: `1px solid ${sev.border}`,
                  }}>
                    {s.findingCount} {s.findingCount === 1 ? "finding" : "findings"}
                  </span>
                </Panel>
              </Link>
            );
          })}
        </div>
      )}
    </PartnerShell>
  );
}
