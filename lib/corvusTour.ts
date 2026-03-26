import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type TourLevel =
  | 'nest'
  | 'flock'
  | 'murder'
  | 'full'
  | 'verdict'
  | 'reckoning'
  | 'compare';

export type TourToken = {
  token: string;
  level: TourLevel;
  visitorName?: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
  viewCount: number;
  revoked: boolean;
  label?: string;
};

const TOUR_PREFIX = 'tour:token:';
const TOUR_INDEX = 'tour:index';

export async function createTourToken(
  level: TourLevel,
  createdBy: string,
  visitorName?: string,
  expiresInDays = 7,
  label?: string
): Promise<TourToken> {
  const token = 'CORVUS-TOUR-' + nanoid(10).toUpperCase();
  const now = Date.now();
  const expiresAt = now + expiresInDays * 24 * 60 * 60 * 1000;

  const tourToken: TourToken = {
    token,
    level,
    visitorName,
    createdBy,
    createdAt: now,
    expiresAt,
    viewCount: 0,
    revoked: false,
    label,
  };

  const ttl = Math.ceil((expiresAt - now) / 1000) + 3600;
  await redis.set(TOUR_PREFIX + token, JSON.stringify(tourToken), { ex: ttl });
  await redis.zadd(TOUR_INDEX, { score: now, member: token });

  return tourToken;
}

export async function validateTourToken(
  token: string
): Promise<{ valid: boolean; tour?: TourToken; reason?: string }> {
  const raw = await redis.get<string>(TOUR_PREFIX + token);
  if (!raw) return { valid: false, reason: 'Tour link not found or expired.' };

  const tour: TourToken = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (tour.revoked) return { valid: false, reason: 'This tour link has been revoked.' };
  if (Date.now() > tour.expiresAt) return { valid: false, reason: 'This tour link has expired.' };

  tour.viewCount += 1;
  const ttl = Math.ceil((tour.expiresAt - Date.now()) / 1000);
  await redis.set(TOUR_PREFIX + token, JSON.stringify(tour), { ex: ttl });

  return { valid: true, tour };
}

export async function listTourTokens(createdBy?: string): Promise<TourToken[]> {
  const members = await redis.zrange(TOUR_INDEX, 0, -1, { rev: true });
  const tokens: TourToken[] = [];
  for (const m of members) {
    const raw = await redis.get<string>(TOUR_PREFIX + m);
    if (!raw) continue;
    const t: TourToken = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (createdBy && t.createdBy !== createdBy) continue;
    tokens.push(t);
  }
  return tokens;
}

export async function revokeTourToken(token: string): Promise<boolean> {
  const raw = await redis.get<string>(TOUR_PREFIX + token);
  if (!raw) return false;
  const t: TourToken = typeof raw === 'string' ? JSON.parse(raw) : raw;
  t.revoked = true;
  await redis.set(TOUR_PREFIX + token, JSON.stringify(t), { ex: 3600 });
  return true;
}

export function getTourURL(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://oldcrowswireless.com';
  return `${base}/tour/${token}`;
}
