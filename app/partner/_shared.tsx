"use client";

// app/partner/_shared.tsx
// Shared client helpers + chrome for the partner portal. Not a route (plain
// component module). Auth model mirrors the team-leads system: the partner lead
// code IS the credential. We keep it in localStorage and send it as the
// x-partner-lead-code header on every call. (Can be hardened to an httpOnly
// session cookie later — see the plan.)

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "ocws_partner_code";

export function getPartnerCode(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}
export function setPartnerCode(code: string): void {
  window.localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
}
export function clearPartnerCode(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function partnerHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-partner-lead-code": getPartnerCode() ?? "",
  };
}

/** Redirects to /partner/login if no code is present. Returns the code (or null while resolving). */
export function usePartnerAuth(): string | null {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    const c = getPartnerCode();
    if (!c) {
      router.replace("/partner/login");
      return;
    }
    setCode(c);
  }, [router]);
  return code;
}

// ─── Theme tokens (match app/globals.css) ────────────────────────────────────
export const T = {
  bg:     "#0D1520",
  surface:"#1A2332",
  text:   "#F4F6F8",
  muted:  "rgba(255,255,255,0.70)",
  muted2: "rgba(255,255,255,0.55)",
  cyan:   "#22D6DC",
  gold:   "#D8AC32",
  panel:  "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.12)",
};

export const SEVERITY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)" },
  warning:  { color: "#fbbf24", bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.35)"  },
  info:     { color: "#4ade80", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)"  },
};

export function PartnerShell({
  children, active,
}: { children: React.ReactNode; active?: "issue" | "reports" | "billing" }) {
  const router = useRouter();
  const tabs: { key: string; label: string; href: string }[] = [
    { key: "issue",   label: "Issue Token", href: "/partner/issue" },
    { key: "reports", label: "Reports",     href: "/partner/reports" },
    { key: "billing", label: "Billing",     href: "/partner/billing" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontWeight: 800, letterSpacing: 0.5 }}>
            Crow&apos;s Eye <span style={{ color: T.cyan }}>Partner</span>
          </span>
          <nav style={{ display: "flex", gap: 8 }}>
            {tabs.map((t) => (
              <Link key={t.key} href={t.href} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 14,
                color: active === t.key ? T.bg : T.muted,
                background: active === t.key ? T.cyan : "transparent",
                fontWeight: active === t.key ? 700 : 500, textDecoration: "none",
              }}>{t.label}</Link>
            ))}
          </nav>
        </div>
        <button
          onClick={() => { clearPartnerCode(); router.replace("/partner/login"); }}
          style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer",
            background: "transparent", color: T.muted2, border: `1px solid ${T.border}`,
          }}
        >Sign out</button>
      </header>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px" }}>{children}</main>
    </div>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: 24, boxShadow: "0 10px 26px rgba(0,0,0,0.45)", ...style,
    }}>{children}</div>
  );
}
