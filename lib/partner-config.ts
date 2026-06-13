// lib/partner-config.ts
// Single source of truth for the partner-channel business knobs. Everything is
// env-overridable with a sane default so the Cyclone 365 build can ship before
// the final numbers come back from the partner call — change a Vercel env var,
// no code change. Mirrors the "tunables live in one file" approach from
// lib/chat-quota.ts.
//
// Billing model (v1): OCWS sells each scan to the partner at a fixed unit price.
// The partner marks it up to their customer however they like (that markup is
// the partner's, not OCWS's). OCWS's take per scan = unit price × share%.
// PARTNER_REVENUE_SHARE_PCT defaults to 100 (OCWS keeps the whole unit price;
// the markup is purely the partner's margin). Drop it below 100 if the deal is
// a true split of the partner's sale price instead.

function num(envKey: string, fallback: number): number {
  const raw = process.env[envKey];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const PARTNER_CONFIG = {
  /** One-time scan token lifetime, in hours, when the caller doesn't override. */
  scanTokenTtlHours: num("PARTNER_SCAN_TOKEN_TTL_HOURS", 24),

  /** OCWS unit price to the partner, per billable scan (USD). */
  perScanPriceUSD: num("PARTNER_PER_SCAN_PRICE_USD", 15),

  /** OCWS share of the unit price, as a percent (100 = OCWS keeps the unit price). */
  revenueSharePct: num("PARTNER_REVENUE_SHARE_PCT", 100),

  /** Anti-abuse: max simultaneously-active (issued, unused, unexpired) tokens. */
  maxActiveTokens: num("PARTNER_MAX_ACTIVE_TOKENS", 50),

  /** Anti-abuse: max tokens a partner can issue in a single UTC day. */
  maxTokensPerDay: num("PARTNER_MAX_TOKENS_PER_DAY", 100),
} as const;

/** Per-scan revenue math, derived from config. Used by the billing endpoint + portal. */
export function computeBilling(scanCount: number): {
  count: number;
  perScanUSD: number;
  grossUSD: number;
  ocwsShareUSD: number;
} {
  const perScanUSD = PARTNER_CONFIG.perScanPriceUSD;
  const grossUSD = round2(scanCount * perScanUSD);
  const ocwsShareUSD = round2(grossUSD * (PARTNER_CONFIG.revenueSharePct / 100));
  return { count: scanCount, perScanUSD, grossUSD, ocwsShareUSD };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
