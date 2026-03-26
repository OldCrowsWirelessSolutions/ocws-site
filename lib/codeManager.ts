import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type SubscriberProfile = {
  code: string;
  name?: string;
  email?: string;
  tier: 'nest' | 'flock' | 'murder' | 'vip' | 'team_lead';
  status: 'active' | 'suspended' | 'expired';
  credits: number | null; // null = unlimited
  maxCredits: number | null;
  unlimitedCredits?: boolean;
  unlimitedReckonings?: boolean;
  createdAt: number;
  lastActiveAt?: number;
  notes?: string;
  createdBy?: string;
  revoked?: boolean;
  lifetimeStats?: LifetimeStats;
};

export type LifetimeStats = {
  totalScans: number;
  verdicts: number;
  reckonings: number;
  proReports: number;
  creditsConsumed: number;
  creditsPurchased: number;
  creditsGifted: number;
  creditsRefunded: number;
  lastScanAt?: number;
};

export type ScanRecord = {
  id: string;
  code: string;
  product: 'verdict' | 'reckoning' | 'pro';
  client?: string;
  address?: string;
  findings?: number;
  critical?: number;
  severity?: string;
  createdAt: number;
  reportId?: string;
};

export type CodeEntry = {
  code: string;
  type: 'vip' | 'subscriber' | 'demo' | 'tour' | 'promo' | 'military' | 'subordinate' | 'team_lead';
  tier?: string;
  name?: string;
  email?: string;
  status: 'active' | 'expired' | 'revoked';
  useCount: number;
  maxUses?: number;
  expiresAt?: number;
  createdAt: number;
  createdBy?: string;
  notes?: string;
  discountPct?: number;
  credits?: number | null;
  lastActiveAt?: number;
};

// ── SUBSCRIBER LOOKUP ─────────────────────────────────────────────────────

export async function getSubscriberByCode(code: string): Promise<SubscriberProfile | null> {
  const raw = await redis.get<string>(`subscriber:${code}`);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

export async function getSubscriberByEmail(email: string): Promise<SubscriberProfile | null> {
  const code = await redis.get<string>(`email-index:${email.toLowerCase()}`);
  if (!code) return null;
  return getSubscriberByCode(code);
}

export async function updateSubscriberNotes(code: string, notes: string): Promise<boolean> {
  const raw = await redis.get<string>(`subscriber:${code}`);
  if (!raw) return false;
  const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
  sub.notes = notes;
  sub.updatedAt = Date.now();
  await redis.set(`subscriber:${code}`, JSON.stringify(sub));
  return true;
}

export async function addCreditsToSubscriber(code: string, amount: number): Promise<boolean> {
  const raw = await redis.get<string>(`subscriber:${code}`);
  if (!raw) return false;
  const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (sub.unlimitedCredits) return true;
  sub.credits = (sub.credits || 0) + amount;
  if (sub.lifetimeStats) {
    sub.lifetimeStats.creditsGifted = (sub.lifetimeStats.creditsGifted || 0) + amount;
  }
  await redis.set(`subscriber:${code}`, JSON.stringify(sub));
  return true;
}

// ── SCAN HISTORY ─────────────────────────────────────────────────────────

export async function getScanHistory(code: string, limit = 50): Promise<ScanRecord[]> {
  const key = `scans:${code}`;
  const records = await redis.lrange<string>(key, 0, limit - 1);
  return records.map(r => typeof r === 'string' ? JSON.parse(r) : r);
}

export async function getLifetimeStats(code: string): Promise<LifetimeStats> {
  const scans = await getScanHistory(code, 1000);
  const sub = await getSubscriberByCode(code);

  return {
    totalScans: scans.length,
    verdicts: scans.filter(s => s.product === 'verdict').length,
    reckonings: scans.filter(s => s.product === 'reckoning').length,
    proReports: scans.filter(s => s.product === 'pro').length,
    creditsConsumed: scans.length,
    creditsPurchased: sub?.lifetimeStats?.creditsPurchased || 0,
    creditsGifted: sub?.lifetimeStats?.creditsGifted || 0,
    creditsRefunded: sub?.lifetimeStats?.creditsRefunded || 0,
    lastScanAt: scans[0]?.createdAt,
  };
}

// ── CODE LISTING ──────────────────────────────────────────────────────────

export async function getAllCodes(
  role: 'admin' | 'vip' | 'team_lead',
  requestorCode?: string
): Promise<CodeEntry[]> {
  const index = await redis.zrange<string[]>('codes:index', 0, -1, { rev: true });
  const entries: CodeEntry[] = [];

  for (const code of index) {
    const raw = await redis.get<string>(`code:${code}`);
    if (!raw) continue;
    const entry: CodeEntry = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (role === 'team_lead') {
      if (entry.createdBy !== requestorCode) continue;
      if (entry.type === 'promo' || entry.type === 'military') continue;
    }

    if (role === 'vip') {
      const isOwn = entry.code === requestorCode || entry.createdBy === requestorCode;
      const isPromo = entry.type === 'promo' || entry.type === 'military';
      if (!isOwn && !isPromo) continue;
    }

    entries.push(entry);
  }

  return entries;
}

export async function searchCodes(
  query: string,
  role: 'admin' | 'vip' | 'team_lead',
  requestorCode?: string
): Promise<CodeEntry[]> {
  const all = await getAllCodes(role, requestorCode);
  const q = query.toLowerCase().trim();
  if (!q) return all;

  return all.filter(entry =>
    entry.code.toLowerCase().includes(q) ||
    entry.email?.toLowerCase().includes(q) ||
    entry.name?.toLowerCase().includes(q)
  );
}
