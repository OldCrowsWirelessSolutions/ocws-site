// app/api/v2/cron/business-metrics-daily/route.ts
//
// Daily Business Metrics Aggregation (Owner Scope)
//
// Runs once daily at 06:00 Central via Vercel Cron (11:00 UTC). Aggregates
// the last 24 hours of activity from Upstash + Stripe and writes a single
// JSON blob to corvus:v2:business:metrics:daily:YYYYMMDD.
//
// Morning Brief reads the last 7-30 of these blobs and computes trends at
// read time. This job only captures the daily snapshot — trend math stays
// out of here so it can be adjusted without reprocessing history.

import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { redisKeys } from "@/lib/v2-schema";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DailyMetrics {
  date: string;                         // YYYY-MM-DD
  generatedAt: string;                  // ISO timestamp
  verdicts: {
    total: number;
    revenue: number;                    // USD cents
    byTier: Record<string, number>;
  };
  signups: {
    total: number;
    byTier: Record<string, number>;
  };
  activeUsers: {
    dau: number;
    uniqueChatSessions: number;
  };
  apiCosts: {
    anthropicTokens: number | null;
    anthropicEstimatedUsd: number | null;
    elevenLabsChars: number | null;
    elevenLabsEstimatedUsd: number | null;
  };
  errors: {
    failedVerdicts: number;
    timeouts: number;
    crashReports: number;
  };
  stripe: {
    newSubscriptions: number;
    canceledSubscriptions: number;
    mrrChange: number;                  // USD cents
    disputesOpened: number;
  };
}

interface VerdictRecord {
  createdAt?: string;
  status?: "completed" | "failed" | "timeout" | string;
  priceCents?: number;
  tier?: string;
}

interface UserRecord {
  id?: string;
  tier?: string;
  createdAt?: string;
  lastActiveAt?: string;
}

interface ChatSessionRecord {
  lastMessageAt?: string;
}

async function handle(request: NextRequest) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically when
  // CRON_SECRET is set as an env var. Same header protects manual invocations.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized", code: "CRON_AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  try {
    const now = new Date();
    const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const isoDate = now.toISOString().slice(0, 10);
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // ── Verdicts ──────────────────────────────────────────────────────────────
    const verdictKeys = await redis.keys(redisKeys.verdictPattern);
    let verdictCount = 0;
    let verdictRevenue = 0;
    const verdictByTier: Record<string, number> = {};
    let failedVerdicts = 0;
    let timeouts = 0;

    for (const key of verdictKeys) {
      const v = await redis.get<VerdictRecord>(key);
      if (!v?.createdAt) continue;
      const createdAt = new Date(v.createdAt);
      if (createdAt < windowStart || createdAt > now) continue;

      if (v.status === "completed") {
        verdictCount++;
        verdictRevenue += v.priceCents ?? 0;
        const tier = v.tier ?? "unknown";
        verdictByTier[tier] = (verdictByTier[tier] ?? 0) + 1;
      } else if (v.status === "failed") {
        failedVerdicts++;
      } else if (v.status === "timeout") {
        timeouts++;
      }
    }

    // ── Signups + DAU ────────────────────────────────────────────────────────
    const userKeys = await redis.keys(redisKeys.userPattern);
    let newSignups = 0;
    const signupsByTier: Record<string, number> = {};
    const dauSet = new Set<string>();

    for (const key of userKeys) {
      if (key.includes(":token:")) continue;
      const u = await redis.get<UserRecord>(key);
      if (!u) continue;

      if (u.createdAt) {
        const created = new Date(u.createdAt);
        if (created >= windowStart && created <= now) {
          newSignups++;
          const tier = u.tier ?? "unknown";
          signupsByTier[tier] = (signupsByTier[tier] ?? 0) + 1;
        }
      }

      if (u.lastActiveAt) {
        const active = new Date(u.lastActiveAt);
        if (active >= windowStart && active <= now) {
          const id = u.id ?? key.replace(/^corvus:v2:user:/, "");
          dauSet.add(id);
        }
      }
    }

    // ── Stripe ────────────────────────────────────────────────────────────────
    const stripeSinceUnix = Math.floor(windowStart.getTime() / 1000);
    const [subs, disputes] = await Promise.all([
      stripe.subscriptions.list({ created: { gte: stripeSinceUnix }, limit: 100 }),
      stripe.disputes.list({ created: { gte: stripeSinceUnix }, limit: 100 }),
    ]);

    const newSubs = subs.data.filter(
      (s) => s.status === "active" || s.status === "trialing",
    ).length;
    const canceledSubs = subs.data.filter((s) => s.status === "canceled").length;

    let mrrChange = 0;
    for (const sub of subs.data) {
      const price = sub.items.data[0]?.price;
      if (!price?.unit_amount) continue;
      const monthly =
        price.recurring?.interval === "year"
          ? Math.round(price.unit_amount / 12)
          : price.unit_amount;
      if (sub.status === "active") mrrChange += monthly;
      if (sub.status === "canceled") mrrChange -= monthly;
    }

    // ── Chat sessions (approximate unique sessions within window) ────────────
    const chatKeys = await redis.keys(redisKeys.chatSessionPattern);
    let uniqueChatSessions = 0;
    for (const key of chatKeys) {
      const session = await redis.get<ChatSessionRecord>(key);
      if (!session?.lastMessageAt) continue;
      const lastMsg = new Date(session.lastMessageAt);
      if (lastMsg >= windowStart && lastMsg <= now) {
        uniqueChatSessions++;
      }
    }

    // ── API cost usage counters ──────────────────────────────────────────────
    // Anthropic does not expose a real-time usage API on standard tier. We read
    // from an internal counter if wired upstream; otherwise the field is null.
    const anthropicTokens = await redis
      .get<number>(redisKeys.anthropicUsage(yyyymmdd))
      .catch(() => null);
    const anthropicEstimatedUsd =
      typeof anthropicTokens === "number" ? estimateAnthropicCostUsd(anthropicTokens) : null;

    const elevenLabsChars = await redis
      .get<number>(redisKeys.elevenLabsUsage(yyyymmdd))
      .catch(() => null);
    const elevenLabsEstimatedUsd =
      typeof elevenLabsChars === "number" ? estimateElevenLabsCostUsd(elevenLabsChars) : null;

    const metrics: DailyMetrics = {
      date: isoDate,
      generatedAt: now.toISOString(),
      verdicts: {
        total: verdictCount,
        revenue: verdictRevenue,
        byTier: verdictByTier,
      },
      signups: {
        total: newSignups,
        byTier: signupsByTier,
      },
      activeUsers: {
        dau: dauSet.size,
        uniqueChatSessions,
      },
      apiCosts: {
        anthropicTokens,
        anthropicEstimatedUsd,
        elevenLabsChars,
        elevenLabsEstimatedUsd,
      },
      errors: {
        failedVerdicts,
        timeouts,
        crashReports: 0,
      },
      stripe: {
        newSubscriptions: newSubs,
        canceledSubscriptions: canceledSubs,
        mrrChange,
        disputesOpened: disputes.data.length,
      },
    };

    await redis.set(redisKeys.businessMetricsDaily(yyyymmdd), metrics, {
      ex: 60 * 60 * 24 * 400, // retain ~400 days for YoY comparisons
    });

    console.log(
      `[v2/cron/business-metrics] ok date=${isoDate} ` +
        `verdicts=${verdictCount} revenue=${verdictRevenue} ` +
        `signups=${newSignups} dau=${dauSet.size}`,
    );

    return NextResponse.json({ success: true, date: isoDate, metrics });
  } catch (error) {
    console.error("[v2/cron/business-metrics] error", error);
    return NextResponse.json(
      { error: "Aggregation failed", code: "AGGREGATION_ERROR" },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;

function estimateAnthropicCostUsd(tokens: number): number {
  // Blended rate for claude-sonnet-4 family. Replace with input/output split
  // once per-call token logging is wired.
  const blendedCostPerMillion = 6.0;
  return (tokens / 1_000_000) * blendedCostPerMillion;
}

function estimateElevenLabsCostUsd(chars: number): number {
  // Creator-tier estimate ($0.18 per 1k chars). Adjust when plan changes.
  return (chars / 1000) * 0.18;
}
