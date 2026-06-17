import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { isValidAdminKey } from "@/lib/adminAuth";

const redis = Redis.fromEnv()

export async function POST(req: NextRequest) {
  const { adminKey } = await req.json()
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = await redis.lrange('event_redemptions:HACKTHECOAST2026', 0, -1)
  const redemptions = raw.map(r => typeof r === 'string' ? JSON.parse(r) : r)
    .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())

  return NextResponse.json({ redemptions, total: redemptions.length })
}
