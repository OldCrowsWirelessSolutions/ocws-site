import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function POST(req: NextRequest) {
  const { authKey } = await req.json()
  if (authKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = await redis.get<string>('subscriber:CORVUS-KYLE')
  if (!raw) return NextResponse.json({ error: 'Kyle not found' }, { status: 404 })

  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  data.credits = 15
  data.lastReset = new Date().toISOString()
  await redis.set('subscriber:CORVUS-KYLE', JSON.stringify(data))

  return NextResponse.json({ success: true, message: 'CORVUS-KYLE reset to 15 credits' })
}
