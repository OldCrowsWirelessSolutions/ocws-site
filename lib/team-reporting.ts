// lib/team-reporting.ts
// Team reporting — Redis-backed, interval-based, with Corvus AI briefing.
// Used by Team Lead subscribers (Flock/Murder) and VIP team leads.

import Anthropic from '@anthropic-ai/sdk'
import type { ReportRecord } from './reports'

export type TimeInterval = '24h' | '48h' | '72h' | '7d' | '30d' | '90d' | '1y' | string

export interface TeamMemberReport {
  code: string
  codeMasked: string
  name: string | null
  title: string | null
  totalScans: number
  verdicts: number
  reckonings: number
  criticalFindings: number
  warningFindings: number
  goodFindings: number
  avgFindingsPerScan: number
  mostUsedProduct: string
  lastActive: string | null
  locationsScanned: string[]
  scansByDay: { date: string; count: number }[]
  topIssues: string[]
}

export interface TeamReport {
  teamLeadCode: string
  teamLeadName: string
  company: string
  interval: TimeInterval
  intervalLabel: string
  generatedAt: string
  totalTeamScans: number
  totalVerdicts: number
  totalReckonings: number
  totalCriticalFindings: number
  mostActiveCode: string
  leastActiveCode: string
  avgScansPerMember: number
  memberReports: TeamMemberReport[]
  teamScansByDay: { date: string; count: number }[]
  topTeamIssues: string[]
  corvusBriefing: string
}

// ─── Interval helpers ────────────────────────────────────────────────────────

export function getIntervalStart(interval: string): Date {
  const now = new Date()
  if (interval === '24h') return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (interval === '48h') return new Date(now.getTime() - 48 * 60 * 60 * 1000)
  if (interval === '72h') return new Date(now.getTime() - 72 * 60 * 60 * 1000)
  if (interval === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (interval === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (interval === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  if (interval === '1y') return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  // Legacy interval formats
  if (interval === 'this_month') {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  }
  if (interval === 'last_month') {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
  }
  if (interval.startsWith('month:')) {
    const [year, month] = interval.replace('month:', '').split('-').map(Number)
    return new Date(year, month - 1, 1)
  }
  // Legacy "YYYY-MM" format
  const [yyyy, mm] = interval.split('-').map(Number)
  if (yyyy && mm) return new Date(yyyy, mm - 1, 1, 0, 0, 0, 0)
  return new Date(now.getTime() - 24 * 60 * 60 * 1000)
}

export function getIntervalEnd(interval: string): Date {
  const now = new Date()
  if (interval === 'last_month') {
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
  }
  if (interval.startsWith('month:')) {
    const [year, month] = interval.replace('month:', '').split('-').map(Number)
    return new Date(year, month, 0, 23, 59, 59, 999)
  }
  // Legacy "YYYY-MM" format
  const [yyyy, mm] = interval.split('-').map(Number)
  if (yyyy && mm) return new Date(yyyy, mm, 0, 23, 59, 59, 999)
  return now
}

export function getIntervalLabel(interval: string): string {
  const labels: Record<string, string> = {
    '24h': 'Last 24 Hours',
    '48h': 'Last 48 Hours',
    '72h': 'Last 72 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Last 12 Months',
    'this_month': new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    'last_month': (() => {
      const n = new Date()
      return new Date(n.getFullYear(), n.getMonth() - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
    })(),
  }
  if (labels[interval]) return labels[interval]
  if (interval.startsWith('month:')) {
    const [year, month] = interval.replace('month:', '').split('-')
    return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })
  }
  // Legacy "YYYY-MM" format
  const [yyyy, mm] = interval.split('-').map(Number)
  if (yyyy && mm) {
    return new Date(yyyy, mm - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
  return interval
}

export function filterReportsByInterval(reports: ReportRecord[], interval: string): ReportRecord[] {
  const start = getIntervalStart(interval)
  const end = getIntervalEnd(interval)
  return reports.filter((r) => {
    const t = new Date(r.createdAt).getTime()
    return t >= start.getTime() && t <= end.getTime()
  })
}

function maskCode(code: string): string {
  if (code.length <= 4) return code.slice(0, 2) + '**'
  return code.slice(0, 3) + '*'.repeat(code.length - 4) + code.slice(-1)
}

// Returns the last 12 months that have any data, newest first
export function getAvailableMonths(allReports: ReportRecord[]): string[] {
  const months = new Set<string>()
  for (const r of allReports) {
    months.add(r.createdAt.slice(0, 7)) // "YYYY-MM"
  }
  return Array.from(months).sort((a, b) => b.localeCompare(a)).slice(0, 12)
}

// ─── Build member report from ReportRecord[] ─────────────────────────────────

function buildMemberReport(code: string, name: string | null, reports: ReportRecord[]): TeamMemberReport {
  const verdicts = reports.filter((r) => r.type === 'verdict').length
  const reckonings = reports.filter((r) => r.type !== 'verdict').length
  const criticalFindings = reports.filter((r) => r.severity === 'critical').length
  const warningFindings = reports.filter((r) => r.severity === 'warning').length
  const goodFindings = reports.filter((r) => r.severity === 'info').length
  const totalScans = reports.length

  const productCounts: Record<string, number> = {}
  for (const r of reports) {
    productCounts[r.type] = (productCounts[r.type] || 0) + 1
  }
  const mostUsedProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const sorted = [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const lastActive = sorted[0]?.createdAt || null

  const locations = [...new Set(reports.map((r) => r.locationName).filter(Boolean))]

  const dayMap = new Map<string, number>()
  for (const r of reports) {
    const day = r.createdAt.slice(0, 10)
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  }
  const scansByDay = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    code,
    codeMasked: maskCode(code),
    name,
    title: null,
    totalScans,
    verdicts,
    reckonings,
    criticalFindings,
    warningFindings,
    goodFindings,
    avgFindingsPerScan: totalScans > 0
      ? Math.round(((criticalFindings + warningFindings + goodFindings) / totalScans) * 10) / 10
      : 0,
    mostUsedProduct,
    lastActive,
    locationsScanned: locations,
    scansByDay,
    topIssues: [],
  }
}

// ─── Main build function ──────────────────────────────────────────────────────

export async function buildTeamReportWithBriefing(
  teamLeadCode: string,
  teamLeadName: string,
  company: string,
  memberSets: { code: string; name: string; reports: ReportRecord[] }[],
  interval: string
): Promise<TeamReport> {
  const label = getIntervalLabel(interval)

  // Build per-member reports (filter by interval)
  const memberReports: TeamMemberReport[] = memberSets.map(({ code, name, reports }) => {
    const filtered = filterReportsByInterval(reports, interval)
    return buildMemberReport(code, name, filtered)
  })

  // Team-level aggregates
  const totalTeamScans = memberReports.reduce((s, m) => s + m.totalScans, 0)
  const totalVerdicts = memberReports.reduce((s, m) => s + m.verdicts, 0)
  const totalReckonings = memberReports.reduce((s, m) => s + m.reckonings, 0)
  const totalCriticalFindings = memberReports.reduce((s, m) => s + m.criticalFindings, 0)

  const sorted = [...memberReports].sort((a, b) => b.totalScans - a.totalScans)
  const mostActiveCode = sorted[0]?.codeMasked || '—'
  const leastActiveCode = sorted[sorted.length - 1]?.codeMasked || '—'
  const avgScansPerMember = memberReports.length > 0
    ? Math.round(totalTeamScans / memberReports.length)
    : 0

  const teamDayMap = new Map<string, number>()
  for (const m of memberReports) {
    for (const d of m.scansByDay) {
      teamDayMap.set(d.date, (teamDayMap.get(d.date) || 0) + d.count)
    }
  }
  const teamScansByDay = Array.from(teamDayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Corvus management briefing
  let corvusBriefing = `Team briefing for ${label}: ${totalTeamScans} total scans across ${memberReports.length} members. ${totalCriticalFindings} critical findings. That's your team briefing. What you do with it is your problem.`

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system: `You are Corvus generating a management briefing for a Team Lead. Direct, specific, slightly opinionated — still Corvus. Cover: overall team activity, most significant findings, patterns worth attention, one recommendation. Use actual numbers. End with: "That's your team briefing. What you do with it is your problem."`,
      messages: [
        {
          role: 'user',
          content: `Team briefing for ${teamLeadName}${company ? ` at ${company}` : ''}.
Interval: ${label}
Total team scans: ${totalTeamScans}
Total verdicts: ${totalVerdicts}
Total reckonings: ${totalReckonings}
Critical findings: ${totalCriticalFindings}
Most active member: ${mostActiveCode}
Least active member: ${leastActiveCode}
Avg scans per member: ${avgScansPerMember}
Members: ${memberReports.length}`,
        },
      ],
    })
    corvusBriefing = (completion.content[0] as { type: string; text?: string }).text || corvusBriefing
  } catch {
    // Use fallback briefing
  }

  return {
    teamLeadCode,
    teamLeadName,
    company,
    interval,
    intervalLabel: label,
    generatedAt: new Date().toISOString(),
    totalTeamScans,
    totalVerdicts,
    totalReckonings,
    totalCriticalFindings,
    mostActiveCode,
    leastActiveCode,
    avgScansPerMember,
    memberReports,
    teamScansByDay,
    topTeamIssues: [],
    corvusBriefing,
  }
}
