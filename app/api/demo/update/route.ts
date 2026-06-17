import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { isValidAdminKey } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { authKey, token, lockedSSID, locationLabel } = await req.json()
    if (!isValidAdminKey(authKey)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    const key = `demo:token:${token}`
    const existing = await redis.get<Record<string, unknown>>(key)
    if (!existing) return NextResponse.json({ error: 'Token not found' }, { status: 404 })

    const updated = {
      ...existing,
      lockedSSID: lockedSSID ?? existing.lockedSSID,
      locationLabel: locationLabel ?? existing.locationLabel,
    }
    const ttl = await redis.ttl(key)
    if (ttl > 0) {
      await redis.set(key, updated, { ex: ttl })
    } else {
      await redis.set(key, updated)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[demo/update]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
