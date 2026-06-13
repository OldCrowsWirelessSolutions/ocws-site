"use client";

// app/partner/billing/page.tsx
// Monthly billable-scan count and the config-driven revenue math. v1 payout is a
// manual invoice (no Stripe automation yet).

import React, { useCallback, useEffect, useState } from "react";
import { usePartnerAuth, partnerHeaders, PartnerShell, Panel, T } from "../_shared";

interface Billing {
  month: string; count: number; perScanUSD: number; grossUSD: number;
  ocwsShareUSD: number; revenueSharePct: number; payoutNote: string;
}

function thisMonthUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function PartnerBillingPage() {
  const code = usePartnerAuth();
  const [month, setMonth] = useState(thisMonthUTC());
  const [data, setData] = useState<Billing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (m: string) => {
    try {
      const res = await fetch(`/api/partner/billing?month=${encodeURIComponent(m)}`, { headers: partnerHeaders() });
      const d = await res.json();
      if (!res.ok || !d?.ok) { setError(d?.error ?? "Could not load billing."); return; }
      setData(d); setError(null);
    } catch { setError("Could not load billing."); }
  }, []);

  useEffect(() => { if (code) load(month); }, [code, month, load]);

  if (!code) return null;

  const money = (n: number) => `$${n.toFixed(2)}`;

  return (
    <PartnerShell active="billing">
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>Billing</h1>
      <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
        Billable scans run with your tokens, by month.
      </p>

      <Panel style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: T.muted2, marginRight: 10 }}>Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value || thisMonthUTC())}
          style={{
            padding: "8px 12px", borderRadius: 9, fontSize: 14,
            background: "rgba(0,0,0,0.25)", color: T.text, border: `1px solid ${T.border}`, outline: "none",
          }}
        />
      </Panel>

      {error && <Panel><p style={{ color: "#f87171", margin: 0 }}>{error}</p></Panel>}

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <Stat label="Billable scans" value={String(data.count)} accent={T.cyan} />
            <Stat label="Per scan" value={money(data.perScanUSD)} />
            <Stat label="Gross" value={money(data.grossUSD)} />
            <Stat label={`OCWS share (${data.revenueSharePct}%)`} value={money(data.ocwsShareUSD)} accent={T.gold} />
          </div>
          <Panel style={{ marginTop: 16 }}>
            <p style={{ color: T.muted2, fontSize: 13, margin: 0 }}>{data.payoutNote}</p>
          </Panel>
        </>
      )}
    </PartnerShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Panel style={{ padding: 18 }}>
      <div style={{ fontSize: 12, color: T.muted2, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent ?? T.text }}>{value}</div>
    </Panel>
  );
}
