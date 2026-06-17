"use client";

// Live counter for the "first 1,000 free fixes" launch promo.
// Reads the public /api/freefix/count endpoint and refreshes every 30s.
//
//   variant="public"  → scarcity countdown for visitors ("X of 1,000 left")
//   variant="admin"   → full tracker for the founder dashboard (claimed/remaining/%)

import { useEffect, useState } from "react";

type CountData = { claimed: number; remaining: number; cap: number };

export default function FreeFixCounter({
  variant = "public",
}: {
  variant?: "public" | "admin";
}) {
  const [data, setData] = useState<CountData | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/freefix/count")
        .then((r) => r.json())
        .then((d) => {
          if (alive && d?.ok) {
            setData({ claimed: d.claimed, remaining: d.remaining, cap: d.cap });
          }
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!data) return null;
  const { claimed, remaining, cap } = data;
  const pct = Math.min(100, Math.round((claimed / cap) * 100));

  if (variant === "admin") {
    return (
      <div
        style={{
          background: "#0D1520",
          border: "1px solid rgba(34,214,220,0.45)",
          borderRadius: 12,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#22D6DC",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          First 1,000 Free Fixes
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
            {claimed.toLocaleString()}
          </span>
          <span style={{ fontSize: 16, color: "#8AAABB" }}>/ {cap.toLocaleString()} claimed</span>
        </div>
        <div
          style={{
            height: 8,
            background: "rgba(34,214,220,0.15)",
            borderRadius: 999,
            overflow: "hidden",
            margin: "12px 0 8px",
          }}
        >
          <div style={{ height: "100%", width: `${pct}%`, background: "#22D6DC" }} />
        </div>
        <div style={{ fontSize: 13, color: "#8AAABB" }}>
          {remaining.toLocaleString()} remaining · {pct}%
        </div>
      </div>
    );
  }

  // public — scarcity countdown
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 13,
          letterSpacing: "0.08em",
          color: "#D8AC32",
          textTransform: "uppercase",
        }}
      >
        🔥 {remaining.toLocaleString()} of {cap.toLocaleString()} free fixes left
      </div>
      <div
        style={{
          width: 280,
          maxWidth: "80vw",
          height: 6,
          background: "rgba(34,214,220,0.15)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#22D6DC,#D8AC32)",
          }}
        />
      </div>
    </div>
  );
}
