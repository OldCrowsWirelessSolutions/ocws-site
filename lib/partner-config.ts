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

import type { ReportType } from "@/lib/reports";

function num(envKey: string, fallback: number): number {
  const raw = process.env[envKey];
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function numOrNull(envKey: string, fallback: number | null): number | null {
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

// ─── Help-desk per-type billing (the Murder-tier model) ──────────────────────
// OCWS's cut is a flat 60% of MSRP per scan: Verdict $30 ($50 MSRP), Small
// Reckoning $90 ($150 MSRP). The larger reckonings are also 60% of MSRP but stay
// null (rate TBD) until those MSRPs are set — flip them on with one Vercel env
// var, no deploy. Invoiced on COMPLETED scans, per type, on top of the flat
// $950/mo Murder platform fee (which Stripe already charges automatically).

export const MURDER_PLATFORM_USD = num("MURDER_PLATFORM_USD", 950);

export const HELP_DESK_RATES: Record<ReportType, number | null> = {
  verdict:              numOrNull("PARTNER_RATE_VERDICT", 30),
  reckoning_small:      numOrNull("PARTNER_RATE_RECKONING_SMALL", 90),
  reckoning_standard:   numOrNull("PARTNER_RATE_RECKONING_STANDARD", null),
  reckoning_commercial: numOrNull("PARTNER_RATE_RECKONING_COMMERCIAL", null),
  reckoning_pro:        numOrNull("PARTNER_RATE_RECKONING_PRO", null),
};

export interface HelpDeskBillLine {
  type:        ReportType;
  count:       number;
  rateUSD:     number | null;   // null = rate not set yet (larger reckonings pending MSRP)
  subtotalUSD: number | null;
}
export interface HelpDeskBill {
  month:         string;
  lines:         HelpDeskBillLine[];
  usageUSD:      number;        // sum of priced line subtotals
  unpricedCount: number;        // completed scans whose type has no rate set yet
  platformUSD:   number;        // flat Murder platform fee
  totalUSD:      number;        // platform + priced usage
}

/** Build the month's help-desk invoice readout from per-type completed-scan counts. */
export function computeHelpDeskBill(
  month: string,
  counts: Record<ReportType, number>,
): HelpDeskBill {
  const lines: HelpDeskBillLine[] = (Object.keys(HELP_DESK_RATES) as ReportType[]).map((type) => {
    const count = counts[type] ?? 0;
    const rateUSD = HELP_DESK_RATES[type];
    return { type, count, rateUSD, subtotalUSD: rateUSD === null ? null : round2(count * rateUSD) };
  });
  const usageUSD = round2(lines.reduce((s, l) => s + (l.subtotalUSD ?? 0), 0));
  const unpricedCount = lines.filter((l) => l.rateUSD === null).reduce((s, l) => s + l.count, 0);
  return {
    month,
    lines,
    usageUSD,
    unpricedCount,
    platformUSD: MURDER_PLATFORM_USD,
    totalUSD: round2(MURDER_PLATFORM_USD + usageUSD),
  };
}
