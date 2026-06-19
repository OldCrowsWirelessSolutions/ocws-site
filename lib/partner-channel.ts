// lib/partner-channel.ts
// Server-authoritative partner (B2B reseller / help-desk) channel for Crow's Eye.
//
// The Cyclone 365 model: a partner's help desk issues a one-time CORVUS-SCAN-*
// token to a customer over the phone. The customer redeems it in the mobile app,
// runs one WiFi Health scan, and the resulting report shows up in the partner's
// web portal. OCWS bills the partner per billable scan (the partner marks it up
// to their customer however they like). Monthly payout is a manual invoice in v1.
//
// This mirrors lib/team-leads.ts (same Upstash-as-source-of-truth shape) with ONE
// deliberate, important deviation: scan-token redemption is a BILLING EVENT and
// must be atomic. team-leads.ts redeemSubordinateCode is read-then-write, which is
// fine for "one code, one teammate" but would allow a double-redeem race here.
// We gate redemption with a Redis SETNX lock (partner:scan_token_used:{token}).
//
// Redis layout:
//   partner:record:{leadCode}                 PartnerRecord
//   partner:by-email:{email}                  leadCode (idempotent bootstrap lookup)
//   partner:index                             set of all partner leadCodes
//   partner:scan_token:{token}                ScanTokenRecord (self-expires via TTL)
//   partner:scan_token_used:{token}           SETNX redemption lock ("1")
//   partner:tokens:by-partner:{leadCode}      set of issued tokens (active-cap counting)
//   partner:tokens_issued:{leadCode}:{ymd}    daily issue counter (per-day cap)
//   partner:scan:{scanId}                     PartnerScanRecord (summary + reportId ref)
//   partner:scan_log:{leadCode}               sorted set scanId -> ts (newest-first reads)
//   partner:scan_count:{leadCode}:{ym}        atomic INCR billable-scan counter

import redis from "@/lib/redis";
import { PARTNER_CONFIG } from "@/lib/partner-config";
import { saveReport, getReportById, type ReportRecord, type ReportSeverity, type ReportType } from "@/lib/reports";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PartnerRecord {
  leadCode:  string;   // CORVUS-PARTNER-XXXXXX (acts as the portal credential)
  partnerId: string;   // stable lookup key
  name:      string;   // contact name
  email:     string;
  company:   string;
  createdAt: string;
}

export interface ScanTokenRecord {
  token:         string;          // CORVUS-SCAN-XXXXXX
  leadCode:      string;
  issuedAt:      string;          // ISO
  expiresAt:     string;          // ISO
  used:          boolean;
  usedAt:        string | null;
  customerName:  string | null;
  customerNotes: string | null;
  // The scan the agent pre-selected for this caller. The mobile app reads this at
  // redeem time and runs exactly this scan type/level (verdict vs reckoning_*),
  // so the help-desk agent controls what the customer scans. Defaults to verdict
  // for backward-compat with any token issued before this field existed.
  reportType:    ReportType;
}

export interface PartnerScanRecord {
  scanId:        string;          // pscan_{ts}_{rand}
  leadCode:      string;
  reportId:      string;          // -> lib/reports.ts ReportRecord
  token:         string | null;   // the CORVUS-SCAN token this scan was run under
  customerName:  string | null;
  ssid:          string;
  locationName:  string;
  findingCount:  number;
  severity:      ReportSeverity;
  reportType:    ReportType;      // verdict / reckoning_* — drives the per-type bill
  agentName:     string | null;   // which help-desk agent issued the underlying token
  timestamp:     number;          // ms epoch
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I — same as team-leads

function randomSuffix(len: number): string {
  return Array.from(
    { length: len },
    () => CHARS[Math.floor(Math.random() * CHARS.length)],
  ).join("");
}

function ymOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function ymdOf(d: Date): string {
  return `${ymOf(d)}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

const TOKEN_INDEX_TTL = 60 * 60 * 24 * 60; // 60d — outlives any token TTL, self-cleans the per-partner set members lazily

// ─── Partners ──────────────────────────────────────────────────────────────────

/**
 * Idempotent partner bootstrap (admin-only caller). Re-running with the same
 * email returns the existing record so onboarding is safe to retry.
 */
export async function ensurePartner(args: {
  name:    string;
  email:   string;
  company: string;
}): Promise<PartnerRecord> {
  const email = args.email.trim().toLowerCase();
  const existingCode = await redis.get<string>(`partner:by-email:${email}`);
  if (existingCode) {
    const existing = await redis.get<PartnerRecord>(`partner:record:${existingCode}`);
    if (existing) return existing;
  }

  // Allocate a unique partner credential.
  let leadCode = `CORVUS-PARTNER-${randomSuffix(6)}`;
  let attempts = 0;
  while (await redis.get<PartnerRecord>(`partner:record:${leadCode}`)) {
    if (++attempts > 5) throw new Error("Failed to allocate unique partner code");
    leadCode = `CORVUS-PARTNER-${randomSuffix(6)}`;
  }

  const record: PartnerRecord = {
    leadCode,
    partnerId: `partner_${randomSuffix(8).toLowerCase()}`,
    name:      args.name.trim(),
    email,
    company:   args.company.trim(),
    createdAt: new Date().toISOString(),
  };

  await Promise.all([
    redis.set(`partner:record:${leadCode}`, record),
    redis.set(`partner:by-email:${email}`, leadCode),
    redis.sadd("partner:index", leadCode),
  ]);

  return record;
}

export async function getPartnerByCode(leadCode: string): Promise<PartnerRecord | null> {
  return redis.get<PartnerRecord>(`partner:record:${leadCode.toUpperCase().trim()}`);
}

// ─── Scan tokens ───────────────────────────────────────────────────────────────

export class PartnerCapError extends Error {}

/**
 * Issue a one-time CORVUS-SCAN-* token for a partner. Enforces the daily and
 * active-token anti-abuse caps from PARTNER_CONFIG. The token record self-expires
 * from Redis at its TTL; the redemption lock is separate (see redeemScanToken).
 */
export async function issueScanToken(
  leadCode: string,
  opts: { expiresInHours?: number; customerName?: string; customerNotes?: string; reportType?: ReportType; agentName?: string } = {},
): Promise<ScanTokenRecord> {
  const code = leadCode.toUpperCase().trim();

  // Daily cap — INCR first (atomic), revert if over.
  const now = new Date();
  const dayKey = `partner:tokens_issued:${code}:${ymdOf(now)}`;
  const issuedToday = await redis.incr(dayKey);
  await redis.expire(dayKey, 60 * 60 * 48);
  if (issuedToday > PARTNER_CONFIG.maxTokensPerDay) {
    await redis.decr(dayKey);
    throw new PartnerCapError(
      `Daily token limit reached (${PARTNER_CONFIG.maxTokensPerDay}). Try again tomorrow.`,
    );
  }

  // Active-token cap — count still-live, unused tokens for this partner.
  const active = await countActiveTokens(code);
  if (active >= PARTNER_CONFIG.maxActiveTokens) {
    await redis.decr(dayKey);
    throw new PartnerCapError(
      `Too many unused tokens outstanding (${PARTNER_CONFIG.maxActiveTokens}). ` +
        `Have customers redeem existing tokens before issuing more.`,
    );
  }

  const ttlHours = opts.expiresInHours && opts.expiresInHours > 0
    ? opts.expiresInHours
    : PARTNER_CONFIG.scanTokenTtlHours;

  // Allocate a unique token.
  let token = `CORVUS-SCAN-${randomSuffix(6)}`;
  let attempts = 0;
  while (await redis.get<ScanTokenRecord>(`partner:scan_token:${token}`)) {
    if (++attempts > 5) throw new Error("Failed to allocate unique scan token");
    token = `CORVUS-SCAN-${randomSuffix(6)}`;
  }

  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
  const record: ScanTokenRecord = {
    token,
    leadCode:      code,
    issuedAt:      now.toISOString(),
    expiresAt:     expiresAt.toISOString(),
    used:          false,
    usedAt:        null,
    customerName:  opts.customerName?.trim() || null,
    customerNotes: opts.customerNotes?.trim() || null,
    reportType:    opts.reportType ?? "verdict",
  };

  const ttlSeconds = Math.ceil(ttlHours * 60 * 60);
  const writes: Promise<unknown>[] = [
    redis.set(`partner:scan_token:${token}`, record, { ex: ttlSeconds }),
    redis.sadd(`partner:tokens:by-partner:${code}`, token),
    redis.expire(`partner:tokens:by-partner:${code}`, TOKEN_INDEX_TTL),
  ];
  // Agent attribution: persist which help-desk agent issued this token so the
  // completed scan can be tagged at record time WITHOUT a mobile change (the
  // mobile only knows the token). Outlives the token TTL so attribution survives.
  const agentName = opts.agentName?.trim();
  if (agentName) {
    writes.push(redis.set(`partner:token_agent:${token}`, agentName, { ex: 60 * 60 * 24 * 30 }));
  }
  await Promise.all(writes);

  return record;
}

/** Count live (existing, unused, unexpired) tokens for a partner. */
async function countActiveTokens(leadCode: string): Promise<number> {
  const tokens = (await redis.smembers(`partner:tokens:by-partner:${leadCode}`)) as string[];
  if (!tokens.length) return 0;
  const records = await Promise.all(
    tokens.map((t) => redis.get<ScanTokenRecord>(`partner:scan_token:${t}`)),
  );
  const now = Date.now();
  let live = 0;
  for (const r of records) {
    // null => already TTL-expired out of Redis; not counted.
    if (r && !r.used && new Date(r.expiresAt).getTime() > now) live++;
  }
  return live;
}

export interface RedeemResult {
  ok:           boolean;
  reason?:      "invalid" | "expired" | "already_used";
  leadCode?:    string;
  expiresAt?:   string;
  customerName?: string | null;
  reportType?:  ReportType;
}

/**
 * Redeem a scan token. ATOMIC: the SETNX lock guarantees exactly one caller can
 * ever win a given token, so a double-tap / replay can't be billed twice. This is
 * the single place we intentionally diverge from team-leads' read-then-write.
 */
export async function redeemScanToken(rawToken: string): Promise<RedeemResult> {
  const token = rawToken.toUpperCase().trim();
  const record = await redis.get<ScanTokenRecord>(`partner:scan_token:${token}`);
  if (!record) return { ok: false, reason: "invalid" };
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  // Atomic claim. "OK" => we won; null => someone already redeemed it.
  const won = await redis.set(`partner:scan_token_used:${token}`, "1", {
    nx: true,
    ex: 60 * 60 * 24 * 30, // 30d, well past any token TTL
  });
  if (won === null) return { ok: false, reason: "already_used" };

  // Best-effort: flip the display record to used (the lock is the real gate).
  await redis
    .set(`partner:scan_token:${token}`, { ...record, used: true, usedAt: new Date().toISOString() })
    .catch(() => {});

  return {
    ok:           true,
    leadCode:     record.leadCode,
    expiresAt:    record.expiresAt,
    customerName: record.customerName,
    reportType:   record.reportType ?? "verdict", // back-compat: pre-field tokens
  };
}

// ─── Scans (the billable record) ────────────────────────────────────────────

/**
 * Record a completed partner scan. Persists the FULL report via lib/reports.ts
 * (so the portal detail view reuses getReportById), writes a partner scan summary,
 * and atomically increments the monthly billable counter.
 */
export async function recordPartnerScan(args: {
  leadCode:     string;
  token?:       string | null;
  reportData:   string;       // full JSON report body (opaque — same as ReportRecord.reportData)
  ssid?:        string;
  locationName?: string;
  findingCount?: number;
  severity?:    ReportSeverity;
  customerName?: string | null;
  reportType?:  ReportType;
  agentName?:   string | null;
}): Promise<PartnerScanRecord> {
  const leadCode = args.leadCode.toUpperCase().trim();
  const now = new Date();
  const ts = now.getTime();
  const scanId  = `pscan_${ts}_${randomSuffix(4).toLowerCase()}`;
  const reportId = `OCWS-RPT-${ts}-${randomSuffix(6).toLowerCase()}`;

  const severity: ReportSeverity = args.severity ?? "info";
  const locationName = (args.locationName ?? "").trim() || "Partner scan";
  const reportType: ReportType = args.reportType ?? "verdict";

  // Agent attribution: prefer an explicit agentName, else recover it from the
  // token the agent issued (partner:token_agent:{token}, written at issue time).
  let agentName: string | null = (typeof args.agentName === "string" && args.agentName.trim()) || null;
  if (!agentName && args.token) {
    agentName = (await redis.get<string>(`partner:token_agent:${args.token.toUpperCase().trim()}`)) ?? null;
  }

  // Full report body — no TTL (partner reports persist for the relationship).
  // subscriptionId is set to the partner leadCode (not a real subscription) so
  // reports.ts indexes them under the fast sub:{code}:reports zset. That keeps
  // the Corvus chat route's getReportsForCode() on its O(log n) zrange path
  // instead of the O(all-reports) keys('report:*') fallback for operator chat.
  await saveReport(reportId, {
    reportId,
    type:           reportType,
    subscriptionId: leadCode,
    email:          null,
    codeUsed:       leadCode,
    createdAt:      now.toISOString(),
    locationName,
    findingCount:   args.findingCount ?? 0,
    severity,
    reportData:     args.reportData,
    pdfAvailable:   false,
  });

  const scan: PartnerScanRecord = {
    scanId,
    leadCode,
    reportId,
    token:        args.token ?? null,
    customerName: args.customerName ?? null,
    ssid:         (args.ssid ?? "").trim(),
    locationName,
    findingCount: args.findingCount ?? 0,
    severity,
    reportType,
    agentName,
    timestamp:    ts,
  };

  const ym = ymOf(now);
  await Promise.all([
    redis.set(`partner:scan:${scanId}`, scan),
    redis.zadd(`partner:scan_log:${leadCode}`, { score: ts, member: scanId }),
    // The billable event — atomic counters. Total (back-compat) + per-type so
    // the monthly invoice can apply the right rate to each scan type.
    redis.incr(`partner:scan_count:${leadCode}:${ym}`),
    redis.incr(`partner:scan_count:${leadCode}:${ym}:${reportType}`),
  ]);

  return scan;
}

export async function listScans(leadCode: string, since?: number): Promise<PartnerScanRecord[]> {
  const code = leadCode.toUpperCase().trim();
  const ids = (await redis.zrange(`partner:scan_log:${code}`, 0, -1, { rev: true })) as string[];
  if (!ids.length) return [];
  const records = await Promise.all(ids.map((id) => redis.get<PartnerScanRecord>(`partner:scan:${id}`)));
  return records
    .filter((r): r is PartnerScanRecord => r !== null)
    .filter((r) => (since ? r.timestamp >= since : true));
}

export async function getPartnerScan(scanId: string): Promise<PartnerScanRecord | null> {
  return redis.get<PartnerScanRecord>(`partner:scan:${scanId}`);
}

/** Full report body for a scan, ownership-checked against the partner. */
export async function getPartnerScanReport(
  scanId: string,
  leadCode: string,
): Promise<{ scan: PartnerScanRecord; report: ReportRecord } | null> {
  const scan = await getPartnerScan(scanId);
  if (!scan) return null;
  if (scan.leadCode !== leadCode.toUpperCase().trim()) return null; // wrong owner
  const report = await getReportById(scan.reportId);
  if (!report) return null;
  return { scan, report };
}

export async function getScanCount(leadCode: string, month: string): Promise<number> {
  const code = leadCode.toUpperCase().trim();
  const raw = await redis.get<number>(`partner:scan_count:${code}:${month}`);
  return Number(raw ?? 0);
}

export const ALL_REPORT_TYPES: ReportType[] = [
  "verdict",
  "reckoning_small",
  "reckoning_standard",
  "reckoning_commercial",
  "reckoning_pro",
];

/** Completed-scan counts for a month, broken out by scan type (the billing basis). */
export async function getScanCountsByType(
  leadCode: string,
  month: string,
): Promise<Record<ReportType, number>> {
  const code = leadCode.toUpperCase().trim();
  const vals = await Promise.all(
    ALL_REPORT_TYPES.map((t) => redis.get<number>(`partner:scan_count:${code}:${month}:${t}`)),
  );
  const out = {} as Record<ReportType, number>;
  ALL_REPORT_TYPES.forEach((t, i) => { out[t] = Number(vals[i] ?? 0); });
  return out;
}
