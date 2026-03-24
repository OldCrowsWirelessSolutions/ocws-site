// lib/reports.ts
// Report storage and retrieval. Reports are saved after each Verdict/Reckoning.

import redis from "@/lib/redis";

export type ReportType =
  | "verdict"
  | "reckoning_small"
  | "reckoning_standard"
  | "reckoning_commercial"
  | "reckoning_pro";

export type ReportSeverity = "critical" | "warning" | "info";

export interface ReportRecord {
  reportId: string;           // OCWS-RPT-{timestamp}-{6 random hex}
  type: ReportType;
  subscriptionId: string | null;
  email: string | null;
  codeUsed: string;
  createdAt: string;          // ISO 8601
  locationName: string;       // client name or address from form
  findingCount: number;
  severity: ReportSeverity;   // highest severity across all findings
  reportData: string;         // full JSON stringified findings + recommendations
  pdfAvailable: boolean;
}

// ─── Redis key schema ────────────────────────────────────────────────────────

const REPORT_KEY       = (id: string)    => `report:${id}`;
const SUB_REPORTS_KEY  = (subId: string) => `sub:${subId}:reports`;
const EMAIL_REPORTS_KEY= (email: string) => `email:${email.toLowerCase().trim()}:reports`;
// Global index for admin listing
const ALL_REPORTS_KEY  = "reports:all";

// ─── Save ────────────────────────────────────────────────────────────────────

export async function saveReport(reportId: string, data: ReportRecord): Promise<void> {
  const ts = new Date(data.createdAt).getTime();
  await Promise.all([
    redis.set(REPORT_KEY(reportId), data),
    redis.zadd(ALL_REPORTS_KEY, { score: ts, member: reportId }),
    ...(data.subscriptionId
      ? [redis.zadd(SUB_REPORTS_KEY(data.subscriptionId), { score: ts, member: reportId })]
      : []),
    ...(data.email
      ? [redis.zadd(EMAIL_REPORTS_KEY(data.email), { score: ts, member: reportId })]
      : []),
  ]);
}

// ─── List by subscription ─────────────────────────────────────────────────────

export async function getReportsForSubscription(subscriptionId: string): Promise<ReportRecord[]> {
  const ids = (await redis.zrange(SUB_REPORTS_KEY(subscriptionId), 0, -1, { rev: true })) as string[];
  return fetchReports(ids);
}

// ─── List by email ────────────────────────────────────────────────────────────

export async function getReportsForEmail(email: string): Promise<ReportRecord[]> {
  const ids = (await redis.zrange(EMAIL_REPORTS_KEY(email), 0, -1, { rev: true })) as string[];
  return fetchReports(ids);
}

// ─── Get single ──────────────────────────────────────────────────────────────

export async function getReportById(reportId: string): Promise<ReportRecord | null> {
  return redis.get<ReportRecord>(REPORT_KEY(reportId));
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteReport(reportId: string): Promise<void> {
  const record = await getReportById(reportId);
  await Promise.all([
    redis.del(REPORT_KEY(reportId)),
    redis.zrem(ALL_REPORTS_KEY, reportId),
    ...(record?.subscriptionId
      ? [redis.zrem(SUB_REPORTS_KEY(record.subscriptionId), reportId)]
      : []),
    ...(record?.email
      ? [redis.zrem(EMAIL_REPORTS_KEY(record.email), reportId)]
      : []),
  ]);
}

// ─── List all (admin) ─────────────────────────────────────────────────────────

export async function getAllReports(limit = 100): Promise<ReportRecord[]> {
  const ids = (await redis.zrange(ALL_REPORTS_KEY, 0, limit - 1, { rev: true })) as string[];
  return fetchReports(ids);
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function fetchReports(ids: string[]): Promise<ReportRecord[]> {
  if (!ids.length) return [];
  const records = await Promise.all(ids.map((id) => redis.get<ReportRecord>(REPORT_KEY(id))));
  return records.filter((r): r is ReportRecord => r !== null);
}
