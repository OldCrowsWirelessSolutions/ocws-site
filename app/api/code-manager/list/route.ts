import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { getSubscription } from '@/lib/subscriptions';
import { TIER_ENTITLEMENTS } from '@/lib/subscriptions';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'SpectrumLife2026!!';
const VIP_CODES = [
  process.env.VIP_NATE_CODE,
  process.env.VIP_MIKE_CODE,
  process.env.VIP_ERIC_CODE,
];

function getRole(authKey: string): 'admin' | 'vip' | null {
  if (authKey === ADMIN_KEY) return 'admin';
  if ((VIP_CODES as (string | undefined)[]).includes(authKey)) return 'vip';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { authKey, query } = await req.json();
    const role = getRole(authKey);
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Pull from code:CORVUS-* keys — this is where subscriptions are stored
    const codeKeys = await redis.keys('code:CORVUS-*') as string[];
    const entries = [];

    for (const key of codeKeys) {
      const raw = await redis.get<string>(key);
      if (!raw) continue;
      const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const code = record.subscriptionId || key.replace('code:', '');

      // Get full subscription record for credits
      const sub = await getSubscription(code);
      const tier = record.tier || sub?.tier || 'nest';
      const ent = TIER_ENTITLEMENTS[tier as keyof typeof TIER_ENTITLEMENTS];
      const isUnlimited = ent ? ent.verdicts_per_month >= 999999 : false;
      const creditsRemaining = sub
        ? isUnlimited ? null : Math.max(0, (ent?.verdicts_per_month || 0) - sub.verdicts_used) + sub.extra_verdict_credits
        : null;

      const entry = {
        code,
        type: 'subscriber',
        tier,
        name: sub?.customer_name || record.name || null,
        email: sub?.customer_email || record.email || null,
        status: sub?.status === 'active' ? 'active' : sub?.status || (record.active ? 'active' : 'expired'),
        useCount: record.usageCount || 0,
        createdAt: record.createdAt ? new Date(record.createdAt).getTime() : Date.now(),
        credits: creditsRemaining,
        lastActiveAt: record.lastUsed ? new Date(record.lastUsed).getTime() : undefined,
      };

      // Apply search filter
      if (query) {
        const q = query.toLowerCase();
        if (
          !entry.code.toLowerCase().includes(q) &&
          !entry.email?.toLowerCase().includes(q) &&
          !entry.name?.toLowerCase().includes(q)
        ) continue;
      }

      // VIP only sees their own subordinate codes
      if (role === 'vip') continue;

      entries.push(entry);
    }

    // Also pull from old codes:index if it exists
    try {
      const oldIndex = await redis.zrange<string[]>('codes:index', 0, -1, { rev: true });
      for (const code of oldIndex) {
        if (entries.find(e => e.code === code)) continue; // deduplicate
        const raw = await redis.get<string>(`code:${code}`);
        if (!raw) continue;
        const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (query) {
          const q = query.toLowerCase();
          if (
            !code.toLowerCase().includes(q) &&
            !record.email?.toLowerCase().includes(q) &&
            !record.name?.toLowerCase().includes(q)
          ) continue;
        }
        entries.push({
          code,
          type: record.type || 'subscriber',
          tier: record.tier || 'nest',
          name: record.name || null,
          email: record.email || null,
          status: record.status || 'active',
          useCount: record.useCount || 0,
          createdAt: record.createdAt || Date.now(),
          credits: record.credits ?? null,
          lastActiveAt: record.lastActiveAt || undefined,
        });
      }
    } catch { /* old index may not exist */ }

    // Sort by createdAt descending
    entries.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ codes: entries });
  } catch (err) {
    console.error('Code manager list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
