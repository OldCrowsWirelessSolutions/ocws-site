// lib/analytics.ts
// Usage event recording and aggregation for Corvus intelligence briefings.
// Server-side only. All data stored in Upstash Redis.

import redis from "./redis";
import { isVIPCode, getActiveSubordinates, getLinkedSubscriptions } from "./vip-codes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsageEvent {
  eventId: string;
  timestamp: string;
  code: string;
  codeType: "subscriber" | "vip" | "subordinate" | "promo" | "bypass";
  issuedBy: string | null;         // for subordinate codes
  subscriptionId: string | null;
  tier: string;
  product: "verdict" | "reckoning_small" | "reckoning_standard" | "reckoning_commercial" | "reckoning_pro";
  locationName: string;
  locationState: string;
  findingCount: number;
  criticalCount: number;
  warningCount: number;
  goodCount: number;
  severity: "critical" | "warning" | "info" | "good";
  itComfortLevel: number;
  reportId: string;
}

export interface DailyScanData  { date: string; count: number }
export interface ProductBreakdown { product: string; count: number }
export interface SeverityBreakdown { critical: number; warning: number; info: number; good: number }
export interface TierBreakdown { tier: string; count: number }

export interface CodeSummary {
  code: string;
  totalScans: number;
  firstScan: string | null;
  lastScan: string | null;
  mostUsedProduct: string;
  averageFindings: number;
  criticalFindings: number;
  locationsScanned: string[];
  scansByDay: DailyScanData[];
  productBreakdown: ProductBreakdown[];
  severityBreakdown: SeverityBreakdown;
}

export interface SubscriptionSummary extends CodeSummary {
  subscriptionId: string;
  seatBreakdown: { code: string; name: string; totalScans: number }[];
}

export interface PlatformAnalytics {
  totalScans: number;
  scansByDay: DailyScanData[];
  productBreakdown: ProductBreakdown[];
  severityBreakdown: SeverityBreakdown;
  tierBreakdown: TierBreakdown[];
}

// ─── Redis keys ───────────────────────────────────────────────────────────────

const EVENTS_ALL_KEY    = "analytics:events";
const CODE_EVENTS_KEY   = (code: string) => `analytics:code:${code}:events`;
const SUB_EVENTS_KEY    = (subId: string) => `analytics:sub:${subId}:events`;
const EVENT_KEY         = (id: string)   => `analytics:event:${id}`;
const DAILY_KEY         = (date: string) => `analytics:daily:${date}`;

// ─── Record ───────────────────────────────────────────────────────────────────

export async function recordUsageEvent(event: UsageEvent): Promise<void> {
  const ts = new Date(event.timestamp).getTime();
  const key = EVENT_KEY(event.eventId);

  await Promise.all([
    redis.set(key, event),
    redis.zadd(EVENTS_ALL_KEY,   { score: ts, member: event.eventId }),
    redis.zadd(CODE_EVENTS_KEY(event.code), { score: ts, member: event.eventId }),
    event.subscriptionId
      ? redis.zadd(SUB_EVENTS_KEY(event.subscriptionId), { score: ts, member: event.eventId })
      : Promise.resolve(),
    // Daily counter
    redis.hincrby(DAILY_KEY(event.timestamp.slice(0, 10)), "count", 1),
    // Product counter
    redis.hincrby("analytics:products", event.product, 1),
    // Tier counter
    redis.hincrby("analytics:tiers", event.tier || "unknown", 1),
    // Severity counter
    redis.hincrby("analytics:severity", event.severity, 1),
  ]);
}

// ─── Fetch events ─────────────────────────────────────────────────────────────

async function fetchEvents(ids: string[]): Promise<UsageEvent[]> {
  if (!ids.length) return [];
  const records = await Promise.all(ids.map((id) => redis.get<UsageEvent>(EVENT_KEY(id))));
  return records.filter((r): r is UsageEvent => r !== null);
}

export async function getEventsForCode(code: string, limit = 200): Promise<UsageEvent[]> {
  const ids = (await redis.zrange(CODE_EVENTS_KEY(code), 0, limit - 1, { rev: true })) as string[];
  return fetchEvents(ids);
}

export async function getEventsForSubscription(subscriptionId: string, limit = 500): Promise<UsageEvent[]> {
  const ids = (await redis.zrange(SUB_EVENTS_KEY(subscriptionId), 0, limit - 1, { rev: true })) as string[];
  return fetchEvents(ids);
}

export async function getEventsForVIP(vipCode: string): Promise<UsageEvent[]> {
  const [subCodes, linkedSubs] = await Promise.all([
    getActiveSubordinates(vipCode).then((subs) => subs.map((s) => s.code)),
    getLinkedSubscriptions(vipCode),
  ]);

  const allEventSets = await Promise.all([
    getEventsForCode(vipCode),
    ...subCodes.map((c) => getEventsForCode(c)),
    ...linkedSubs.map((s) => getEventsForSubscription(s)),
  ]);

  return allEventSets
    .flat()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ─── Summary building ─────────────────────────────────────────────────────────

export function buildSummary(code: string, events: UsageEvent[]): CodeSummary {
  if (!events.length) {
    return {
      code, totalScans: 0, firstScan: null, lastScan: null,
      mostUsedProduct: "—", averageFindings: 0, criticalFindings: 0,
      locationsScanned: [], scansByDay: [], productBreakdown: [],
      severityBreakdown: { critical: 0, warning: 0, info: 0, good: 0 },
    };
  }

  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const productCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};
  const locations = new Set<string>();
  const sev: SeverityBreakdown = { critical: 0, warning: 0, info: 0, good: 0 };

  for (const e of events) {
    productCounts[e.product] = (productCounts[e.product] ?? 0) + 1;
    const day = e.timestamp.slice(0, 10);
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
    if (e.locationName) locations.add(e.locationName);
    sev[e.severity] = (sev[e.severity] ?? 0) + 1;
  }

  const mostUsedProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const productBreakdown = Object.entries(productCounts).map(([product, count]) => ({ product, count }));
  const scansByDay = Object.entries(dayCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    code,
    totalScans: events.length,
    firstScan: sorted[0].timestamp,
    lastScan:  sorted[sorted.length - 1].timestamp,
    mostUsedProduct,
    averageFindings: Math.round((events.reduce((n, e) => n + e.findingCount, 0) / events.length) * 10) / 10,
    criticalFindings: events.reduce((n, e) => n + e.criticalCount, 0),
    locationsScanned: Array.from(locations),
    scansByDay,
    productBreakdown,
    severityBreakdown: sev,
  };
}

// ─── Platform analytics ───────────────────────────────────────────────────────

export async function getPlatformAnalytics(days = 30): Promise<PlatformAnalytics> {
  // Total scans from sorted set
  const totalScans = await redis.zcard(EVENTS_ALL_KEY) as number;

  // Daily counts for last N days
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const dailyCountsRaw = await Promise.all(
    dates.map(async (date) => ({
      date,
      count: Number((await redis.hget(DAILY_KEY(date), "count")) ?? 0),
    }))
  );

  // Product breakdown
  const productRaw = (await redis.hgetall("analytics:products") ?? {}) as Record<string, string>;
  const productBreakdown: ProductBreakdown[] = Object.entries(productRaw)
    .map(([product, count]) => ({ product, count: Number(count) }))
    .sort((a, b) => b.count - a.count);

  // Tier breakdown
  const tierRaw = (await redis.hgetall("analytics:tiers") ?? {}) as Record<string, string>;
  const tierBreakdown: TierBreakdown[] = Object.entries(tierRaw)
    .map(([tier, count]) => ({ tier, count: Number(count) }))
    .sort((a, b) => b.count - a.count);

  // Severity breakdown
  const sevRaw = (await redis.hgetall("analytics:severity") ?? {}) as Record<string, string>;
  const severityBreakdown: SeverityBreakdown = {
    critical: Number(sevRaw.critical ?? 0),
    warning:  Number(sevRaw.warning  ?? 0),
    info:     Number(sevRaw.info     ?? 0),
    good:     Number(sevRaw.good     ?? 0),
  };

  return {
    totalScans,
    scansByDay: dailyCountsRaw,
    productBreakdown,
    severityBreakdown,
    tierBreakdown,
  };
}

// ─── Chat analytics ───────────────────────────────────────────────────────────

const CHAT_TOTAL_KEY      = "analytics:chat:total";
const CHAT_DAILY_KEY      = (date: string) => `analytics:chat:daily:${date}`;
const CHAT_CODES_KEY      = "analytics:chat:codes"; // sorted set code → total messages

export async function recordChatEvent(code: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await Promise.all([
    redis.incr(CHAT_TOTAL_KEY),
    redis.incr(CHAT_DAILY_KEY(today)),
    redis.zincrby(CHAT_CODES_KEY, 1, code),
  ]);
}

export interface ChatAnalytics {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  topChatters: Array<{ code: string; count: number }>;
}

export async function getChatAnalytics(): Promise<ChatAnalytics> {
  const today = new Date().toISOString().slice(0, 10);

  // Weekly dates
  const weekDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDates.push(d.toISOString().slice(0, 10));
  }

  const [totalRaw, todayRaw, weekCounts, topRaw] = await Promise.all([
    redis.get<number>(CHAT_TOTAL_KEY),
    redis.get<number>(CHAT_DAILY_KEY(today)),
    Promise.all(weekDates.map((date) => redis.get<number>(CHAT_DAILY_KEY(date)))),
    redis.zrange(CHAT_CODES_KEY, 0, 9, { rev: true, withScores: true }),
  ]);

  const messagesThisWeek = (weekCounts as (number | null)[]).reduce<number>((sum, v) => sum + (v ?? 0), 0);

  // topRaw from withScores is [member, score, member, score, ...]
  const topChatters: Array<{ code: string; count: number }> = [];
  const arr = topRaw as (string | number)[];
  for (let i = 0; i < arr.length; i += 2) {
    topChatters.push({ code: String(arr[i]), count: Number(arr[i + 1]) });
  }

  return {
    totalMessages: Number(totalRaw ?? 0),
    messagesToday: Number(todayRaw ?? 0),
    messagesThisWeek,
    topChatters,
  };
}

// ─── Daily scans helper ───────────────────────────────────────────────────────

export async function getDailyScans(days = 30): Promise<DailyScanData[]> {
  const result: DailyScanData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const count = Number((await redis.hget(DAILY_KEY(date), "count")) ?? 0);
    result.push({ date, count });
  }
  return result;
}
