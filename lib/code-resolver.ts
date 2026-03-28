// lib/code-resolver.ts
// Central code type resolver. Every API route that validates a user code
// should call resolveCode() first so the classification logic lives in one place.
// Server-side only.

import redis from "@/lib/redis";
import { validateSubordinateCode } from "@/lib/vip-codes";
import { isVIPCode } from "@/lib/vip-codes";
import type { DemoSession } from "@/lib/demoTokens";

export type CodeKind =
  | "founder"       // OCWS-CORVUS-FOUNDER-JOSHUA, CORVUS-NEST, OCWS-ADMIN-*
  | "admin"         // CORVUS-ADMIN
  | "vip"           // CORVUS-ERIC, CORVUS-MIKE, CORVUS-NATE
  | "lifetime"      // CORVUS-KYLE
  | "demo"          // CORVUS-DEMO-XXXXXXXXXX (time-limited client demo tokens)
  | "subordinate"   // CORVUS-SUB-XXXXXX (issued by VIPs)
  | "promo"         // CORVUS-TRY-*, admin-generated promo codes via lib/promo-codes.ts
  | "subscriber"    // OCWS-NEST-*, OCWS-FLOCK-*, OCWS-MURDER-* (real paid subscribers)
  | "unknown";      // Unrecognised — deny

export interface ResolvedCode {
  code: string;
  kind: CodeKind;
  tier: string;        // "vip" | "flock" | "murder" | "nest" | "none"
  isBypass: boolean;   // true = skip validateSubscriptionId / credit deduction
  canScan: boolean;    // true = allowed to run Crow's Eye scans
  subscriptionId: string | null; // non-null only for kind === "subscriber"
  demoSession?: DemoSession;     // non-null only for kind === "demo"
}

// ─── Pattern helpers ──────────────────────────────────────────────────────────

const FOUNDER_CODES = new Set([
  "OCWS-CORVUS-FOUNDER-JOSHUA",
  "CORVUS-NEST",
]);

const ADMIN_CODES = new Set([
  "CORVUS-ADMIN",
  "CORVUS-NEST", // also admin-level
]);

// ─── Resolver ─────────────────────────────────────────────────────────────────

export async function resolveCode(rawCode: string): Promise<ResolvedCode> {
  const code = rawCode.trim().toUpperCase();

  // ── Founder ──────────────────────────────────────────────────────────────
  if (FOUNDER_CODES.has(code) || code.startsWith("OCWS-CORVUS-FOUNDER-") || code.startsWith("OCWS-ADMIN-")) {
    return {
      code, kind: "founder", tier: "vip",
      isBypass: true, canScan: true, subscriptionId: null,
    };
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (ADMIN_CODES.has(code)) {
    return {
      code, kind: "admin", tier: "vip",
      isBypass: true, canScan: true, subscriptionId: null,
    };
  }

  // ── VIP founding members (unlimited) ─────────────────────────────────────
  if (isVIPCode(code)) {
    return {
      code, kind: "vip", tier: "vip",
      isBypass: true, canScan: true, subscriptionId: null,
    };
  }

  // ── Lifetime codes (CORVUS-KYLE, etc.) ───────────────────────────────────
  // These have limited monthly credits managed via Redis — still bypass sub lookup
  if (code === "CORVUS-KYLE" || code.startsWith("CORVUS-KYLE-")) {
    return {
      code, kind: "lifetime", tier: "flock",
      isBypass: true, canScan: true, subscriptionId: null,
    };
  }

  // ── Demo tokens (CORVUS-DEMO-XXXXXXXXXX) ─────────────────────────────────
  if (code.startsWith("CORVUS-DEMO-")) {
    const { validateDemoToken } = await import("@/lib/demoTokens");
    const result = await validateDemoToken(code);
    if (!result.valid || !result.session) {
      return { code, kind: "demo", tier: "none", isBypass: false, canScan: false, subscriptionId: null };
    }
    const session = result.session;
    const tierMap: Record<string, string> = {
      fledgling: "fledgling",
      nest:      "nest",
      flock:     "flock",
      full:      "vip",
    };
    return {
      code, kind: "demo", tier: tierMap[session.accessLevel] ?? "nest",
      isBypass: true, canScan: true, subscriptionId: null,
      demoSession: session,
    };
  }

  // ── Subordinate codes (CORVUS-SUB-XXXXXX) ────────────────────────────────
  if (code.startsWith("CORVUS-SUB-")) {
    const subRecord = await validateSubordinateCode(code);
    if (!subRecord) {
      return {
        code, kind: "subordinate", tier: "none",
        isBypass: true, canScan: false, subscriptionId: null,
      };
    }
    return {
      code, kind: "subordinate", tier: "nest",
      isBypass: true, canScan: true, subscriptionId: null,
    };
  }

  // ── Admin-generated promo codes (via lib/promo-codes.ts, stored at promo:CODE) ──
  if (code.startsWith("CORVUS-TRY-") || code.startsWith("CORVUS-PROMO-") ||
      code.startsWith("CORVUS-UH-")) {
    // Promo codes that are in INTERNAL_CODES (like CORVUS-TRY-9R4M) are validated
    // by validateSubscriptionId; but check redis-backed ones too
    const promoRecord = await redis.get<{ used?: boolean; deactivated?: boolean; expiresAt?: string }>(`promo:${code}`);
    if (promoRecord) {
      const expired = promoRecord.expiresAt ? new Date() >= new Date(promoRecord.expiresAt) : false;
      const spent   = promoRecord.used === true || promoRecord.deactivated === true;
      return {
        code, kind: "promo", tier: "nest",
        isBypass: true, canScan: !expired && !spent, subscriptionId: null,
      };
    }
    // Fall through to INTERNAL_CODES check in validateSubscriptionId
    return {
      code, kind: "promo", tier: "nest",
      isBypass: false, canScan: true, subscriptionId: null,
    };
  }

  // ── Real subscriber codes (OCWS-NEST-*, OCWS-FLOCK-*, OCWS-MURDER-*, CORVUS-FLEDGLING-*) ────
  if (code.startsWith("OCWS-") || code.startsWith("CORVUS-FLEDGLING-")) {
    // For Fledgling, canScan depends on whether the free Verdict has been used
    if (code.startsWith("CORVUS-FLEDGLING-")) {
      const verdictUsed = await redis.get<string>(`sub:${code}:fledgling_verdict_used`);
      return {
        code, kind: "subscriber", tier: "fledgling",
        isBypass: false, canScan: verdictUsed !== "true", subscriptionId: code,
      };
    }
    return {
      code, kind: "subscriber", tier: "unknown", // tier resolved by validateSubscriptionId
      isBypass: false, canScan: true, subscriptionId: code,
    };
  }

  // ── Unknown ───────────────────────────────────────────────────────────────
  return {
    code, kind: "unknown", tier: "none",
    isBypass: true, canScan: false, subscriptionId: null,
  };
}

// ─── Convenience ─────────────────────────────────────────────────────────────

/** Returns true if the code is any type that bypasses subscription validation. */
export function isKnownBypassCode(code: string): boolean {
  const u = code.trim().toUpperCase();
  return (
    u === "OCWS-CORVUS-FOUNDER-JOSHUA" || u.startsWith("OCWS-CORVUS-FOUNDER-") ||
    u === "CORVUS-ADMIN" || u === "CORVUS-NEST" || u.startsWith("OCWS-ADMIN-") ||
    isVIPCode(u) ||
    u === "CORVUS-KYLE" || u.startsWith("CORVUS-KYLE-") ||
    u.startsWith("CORVUS-SUB-") ||
    u.startsWith("CORVUS-TRY-") || u.startsWith("CORVUS-PROMO-") ||
    u.startsWith("CORVUS-DEMO-") || u.startsWith("CORVUS-UH-")
  );
}
