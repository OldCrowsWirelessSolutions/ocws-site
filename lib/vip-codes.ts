// lib/vip-codes.ts
// VIP founding member access — static records, subordinate code system, enterprise linking.
// Server-side only. Never import from client components.

import redis from "./redis";

// ─── Static VIP records ───────────────────────────────────────────────────────

export interface VIPCodeRecord {
  name: string;
  title: string;
  company: string;
  tier: "vip";
  creditsRemaining: number;
  creditsMonthly: number;
  seats: number;
  isTeamLead: boolean;
  maxSubordinates: number;
}

export const VIP_CODES: Record<string, VIPCodeRecord> = {
  "CORVUS-ERIC": {
    name: "Eric Mims",
    title: "Executive Director, Enterprise IT Security & Security Operations",
    company: "University of Houston System",
    tier: "vip",
    creditsRemaining: 999999,
    creditsMonthly: 999999,
    seats: 999999,
    isTeamLead: true,
    maxSubordinates: 5,
  },
  "CORVUS-MIKE": {
    name: "Mike Arbouret",
    title: "IBM Field CTO",
    company: "First City Internet",
    tier: "vip",
    creditsRemaining: 999999,
    creditsMonthly: 999999,
    seats: 999999,
    isTeamLead: true,
    maxSubordinates: 5,
  },
  "CORVUS-NATE": {
    name: "Nathanael Farrelly",
    title: "Entrepreneur & Angel Investor",
    company: "Independent",
    tier: "vip",
    creditsRemaining: 999999,
    creditsMonthly: 999999,
    seats: 999999,
    isTeamLead: true,
    maxSubordinates: 5,
  },
};

// ─── Subordinate records ──────────────────────────────────────────────────────

export type SubExpiryType = "1_use" | "24h" | "48h" | "72h" | "7d" | "14d" | "30d";

export interface SubordinateRecord {
  code: string;
  issuedBy: string;       // VIP code (e.g. CORVUS-ERIC)
  issuedByName: string;   // VIP name
  issuedAt: string;       // ISO 8601
  expiresAt: string;      // ISO 8601
  expiryType: SubExpiryType;
  active: boolean;
  usageCount: number;
  lastUsed: string | null;
}

// ─── Redis keys ───────────────────────────────────────────────────────────────

const VIP_SUBS_KEY    = (vipCode: string) => `vip:${vipCode}:subordinates`;
const VIP_LOG_KEY     = (vipCode: string) => `vip:${vipCode}:subordinate_log`;
const SUB_KEY         = (subCode: string) => `subordinate:${subCode}`;
const VIP_LINKED_KEY  = (vipCode: string) => `vip:${vipCode}:linked_subs`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUB_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSubSuffix(): string {
  return Array.from(
    { length: 6 },
    () => SUB_CHARS[Math.floor(Math.random() * SUB_CHARS.length)]
  ).join("");
}

function expiryMs(expiryType: SubExpiryType): number {
  switch (expiryType) {
    case "1_use": return 30 * 86400 * 1000;  // no time limit; expiry is usage-based but store 30d
    case "24h":   return 24 * 3600 * 1000;
    case "48h":   return 48 * 3600 * 1000;
    case "72h":   return 72 * 3600 * 1000;
    case "7d":    return 7  * 86400 * 1000;
    case "14d":   return 14 * 86400 * 1000;
    case "30d":   return 30 * 86400 * 1000;
  }
}

// ─── VIP lookup ───────────────────────────────────────────────────────────────

export function isVIPCode(code: string): boolean {
  return code.toUpperCase() in VIP_CODES;
}

export function getVIPCode(code: string): VIPCodeRecord | null {
  return VIP_CODES[code.toUpperCase()] ?? null;
}

// ─── Subordinate count ────────────────────────────────────────────────────────

export async function getSubordinateCount(vipCode: string): Promise<number> {
  const members = (await redis.smembers(VIP_SUBS_KEY(vipCode.toUpperCase()))) as string[];
  return members.length;
}

// ─── List active subordinates ─────────────────────────────────────────────────

export async function getActiveSubordinates(vipCode: string): Promise<SubordinateRecord[]> {
  const codes = (await redis.smembers(VIP_SUBS_KEY(vipCode.toUpperCase()))) as string[];
  if (!codes.length) return [];
  const records = await Promise.all(codes.map((c) => redis.get<SubordinateRecord>(SUB_KEY(c))));
  return records.filter((r): r is SubordinateRecord => r !== null);
}

// ─── Generate subordinate code ────────────────────────────────────────────────

export async function generateSubordinateCode(
  vipCode: string,
  expiryType: SubExpiryType
): Promise<string> {
  const vip = getVIPCode(vipCode);
  if (!vip) throw new Error("Invalid VIP code");

  const count = await getSubordinateCount(vipCode);
  if (count >= vip.maxSubordinates) {
    throw new Error(`Maximum ${vip.maxSubordinates} active subordinate codes reached`);
  }

  const code = `CORVUS-SUB-${randomSubSuffix()}`;
  const now  = new Date().toISOString();
  const expiresAt = new Date(Date.now() + expiryMs(expiryType)).toISOString();

  const record: SubordinateRecord = {
    code,
    issuedBy:     vipCode.toUpperCase(),
    issuedByName: vip.name,
    issuedAt:     now,
    expiresAt,
    expiryType,
    active:       true,
    usageCount:   0,
    lastUsed:     null,
  };

  await redis.set(SUB_KEY(code), record);
  await redis.sadd(VIP_SUBS_KEY(vipCode.toUpperCase()), code);
  await redis.lpush(VIP_LOG_KEY(vipCode.toUpperCase()), JSON.stringify({
    event: "issued",
    code,
    at: now,
    expiryType,
    expiresAt,
  }));

  return code;
}

// ─── Validate subordinate code ────────────────────────────────────────────────

export async function validateSubordinateCode(subCode: string): Promise<SubordinateRecord | null> {
  const record = await redis.get<SubordinateRecord>(SUB_KEY(subCode));
  if (!record) return null;
  if (!record.active) return null;
  if (new Date() >= new Date(record.expiresAt)) return null;
  // 1_use: only one scan allowed
  if (record.expiryType === "1_use" && record.usageCount >= 1) return null;
  return record;
}

// ─── Track subordinate usage ──────────────────────────────────────────────────

export async function trackSubordinateUsage(subCode: string): Promise<void> {
  const record = await redis.get<SubordinateRecord>(SUB_KEY(subCode));
  if (!record) return;

  const updated: SubordinateRecord = {
    ...record,
    usageCount: record.usageCount + 1,
    lastUsed: new Date().toISOString(),
  };

  // If 1_use and now consumed, deactivate and remove from VIP set
  if (record.expiryType === "1_use" && updated.usageCount >= 1) {
    updated.active = false;
    await redis.srem(VIP_SUBS_KEY(record.issuedBy), subCode);
    await redis.lpush(VIP_LOG_KEY(record.issuedBy), JSON.stringify({
      event: "used_and_expired",
      code: subCode,
      at: new Date().toISOString(),
    }));
  }

  await redis.set(SUB_KEY(subCode), updated);
}

// ─── Revoke subordinate code ──────────────────────────────────────────────────

export async function revokeSubordinateCode(vipCode: string, subCode: string): Promise<void> {
  const record = await redis.get<SubordinateRecord>(SUB_KEY(subCode));
  if (record) {
    await redis.set(SUB_KEY(subCode), { ...record, active: false });
  }
  await redis.srem(VIP_SUBS_KEY(vipCode.toUpperCase()), subCode);
  await redis.lpush(VIP_LOG_KEY(vipCode.toUpperCase()), JSON.stringify({
    event: "revoked",
    code: subCode,
    at: new Date().toISOString(),
  }));
}

// ─── Revoke by code only (admin use) ─────────────────────────────────────────

export async function revokeSubordinateByCode(subCode: string): Promise<{ wasIssuedBy: string } | null> {
  const record = await redis.get<SubordinateRecord>(SUB_KEY(subCode));
  if (!record) return null;
  await redis.set(SUB_KEY(subCode), { ...record, active: false });
  await redis.srem(VIP_SUBS_KEY(record.issuedBy), subCode);
  await redis.lpush(VIP_LOG_KEY(record.issuedBy), JSON.stringify({
    event: "revoked_by_admin",
    code: subCode,
    at: new Date().toISOString(),
  }));
  return { wasIssuedBy: record.issuedBy };
}

// ─── Enterprise subscription linking ─────────────────────────────────────────

export async function linkSubscriptionToVIP(vipCode: string, subscriptionId: string): Promise<void> {
  await redis.sadd(VIP_LINKED_KEY(vipCode.toUpperCase()), subscriptionId);
}

export async function getLinkedSubscriptions(vipCode: string): Promise<string[]> {
  return (await redis.smembers(VIP_LINKED_KEY(vipCode.toUpperCase()))) as string[];
}

// ─── All VIP subordinates (admin view) ───────────────────────────────────────

export async function getAllVIPSubordinates(): Promise<{
  vipCode: string;
  vipName: string;
  maxSubordinates: number;
  subordinates: SubordinateRecord[];
}[]> {
  return Promise.all(
    Object.entries(VIP_CODES).map(async ([code, vip]) => ({
      vipCode: code,
      vipName: vip.name,
      maxSubordinates: vip.maxSubordinates,
      subordinates: await getActiveSubordinates(code),
    }))
  );
}
