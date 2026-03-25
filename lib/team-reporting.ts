// lib/team-reporting.ts
// Team reporting types and utilities for time-interval reports.
// Used by Team Lead subscribers (Flock/Murder) and VIP team leads (Eric/Mike/Nate).

import type { ReportRecord } from "./reports";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Supported time intervals:
 *   "7d"         — last 7 days (rolling)
 *   "30d"        — last 30 days (rolling)
 *   "90d"        — last 90 days (rolling)
 *   "this_month" — 1st of current month → now
 *   "last_month" — full previous calendar month
 *   "YYYY-MM"    — specific calendar month, e.g. "2025-01"
 */
export type TimeInterval = "7d" | "30d" | "90d" | "this_month" | "last_month" | string;

export interface TeamMemberSummary {
  code: string;
  name: string;
  totalScans: number;
  lastScan: string | null;
  criticalFindings: number;
  warningFindings: number;
  goodFindings: number;
  totalFindings: number;
  avgFindingsPerScan: number;
  productBreakdown: Record<string, number>;
  scansByDay: { date: string; count: number }[];
  scans: ReportRecord[];
}

export interface TeamReport {
  leaderCode: string;
  interval: TimeInterval;
  intervalLabel: string;
  start: string;    // ISO 8601
  end: string;      // ISO 8601
  generatedAt: string;
  totalScans: number;
  activeMembers: number;
  criticalFindings: number;
  totalFindings: number;
  avgFindingsPerScan: number;
  members: TeamMemberSummary[];
}

// ─── Interval helpers ────────────────────────────────────────────────────────

export function getIntervalBounds(interval: TimeInterval): { start: Date; end: Date; label: string } {
  const now = new Date();

  if (interval === "7d") {
    const start = new Date(now); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0);
    return { start, end: now, label: "Last 7 days" };
  }
  if (interval === "30d") {
    const start = new Date(now); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0);
    return { start, end: now, label: "Last 30 days" };
  }
  if (interval === "90d") {
    const start = new Date(now); start.setDate(start.getDate() - 90); start.setHours(0, 0, 0, 0);
    return { start, end: now, label: "Last 90 days" };
  }
  if (interval === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return { start, end: now, label: `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}` };
  }
  if (interval === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { start, end, label };
  }
  // YYYY-MM specific month
  const [yyyy, mm] = interval.split("-").map(Number);
  if (yyyy && mm) {
    const start = new Date(yyyy, mm - 1, 1, 0, 0, 0, 0);
    const end   = new Date(yyyy, mm, 0, 23, 59, 59, 999);
    const label = start.toLocaleString("en-US", { month: "long", year: "numeric" });
    return { start, end, label };
  }
  // fallback: 30d
  const start = new Date(now); start.setDate(start.getDate() - 30);
  return { start, end: now, label: "Last 30 days" };
}

export function filterReportsByInterval(reports: ReportRecord[], interval: TimeInterval): ReportRecord[] {
  const { start, end } = getIntervalBounds(interval);
  return reports.filter((r) => {
    const t = new Date(r.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

export function getAvailableMonths(allReports: ReportRecord[]): string[] {
  const months = new Set<string>();
  for (const r of allReports) {
    months.add(r.createdAt.slice(0, 7)); // "YYYY-MM"
  }
  return Array.from(months).sort((a, b) => b.localeCompare(a)); // newest first
}

// ─── Build report ─────────────────────────────────────────────────────────────

export function buildTeamReport(
  leaderCode: string,
  memberSets: { code: string; name: string; reports: ReportRecord[] }[],
  interval: TimeInterval,
): TeamReport {
  const { start, end, label } = getIntervalBounds(interval);

  const members: TeamMemberSummary[] = memberSets.map(({ code, name, reports }) => {
    const filtered = filterReportsByInterval(reports, interval);
    const sorted   = [...filtered].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const productBreakdown: Record<string, number> = {};
    const dayCounts: Record<string, number> = {};
    let criticalFindings = 0;
    let warningFindings  = 0;
    let goodFindings     = 0;
    let totalFindings    = 0;

    for (const r of filtered) {
      productBreakdown[r.type] = (productBreakdown[r.type] ?? 0) + 1;
      const day = r.createdAt.slice(0, 10);
      dayCounts[day] = (dayCounts[day] ?? 0) + 1;
      if (r.severity === "critical") criticalFindings++;
      else if (r.severity === "warning") warningFindings++;
      else goodFindings++;
      totalFindings += r.findingCount;
    }

    const scansByDay = Object.entries(dayCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      code, name,
      totalScans:         filtered.length,
      lastScan:           sorted.length ? sorted[sorted.length - 1].createdAt : null,
      criticalFindings,
      warningFindings,
      goodFindings,
      totalFindings,
      avgFindingsPerScan: filtered.length ? Math.round((totalFindings / filtered.length) * 10) / 10 : 0,
      productBreakdown,
      scansByDay,
      scans: filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  });

  const totalScans       = members.reduce((n, m) => n + m.totalScans, 0);
  const criticalFindings = members.reduce((n, m) => n + m.criticalFindings, 0);
  const totalFindings    = members.reduce((n, m) => n + m.totalFindings, 0);
  const activeMembers    = members.filter((m) => m.totalScans > 0).length;

  return {
    leaderCode,
    interval,
    intervalLabel: label,
    start: start.toISOString(),
    end:   end.toISOString(),
    generatedAt: new Date().toISOString(),
    totalScans,
    activeMembers,
    criticalFindings,
    totalFindings,
    avgFindingsPerScan: totalScans ? Math.round((totalFindings / totalScans) * 10) / 10 : 0,
    members,
  };
}
