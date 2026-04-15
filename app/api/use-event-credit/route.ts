import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 })

    const emailKey = email.toLowerCase().trim()
    const verdictKey = `event_verdicts:${emailKey}`

    // Atomically decrement — only succeeds if value > 0
    const current = await redis.get(verdictKey)
    const credits = current ? Number(current) : 0

    if (credits <= 0) {
      return NextResponse.json({ error: 'No event credits available.' }, { status: 409 })
    }

    const remaining = await redis.decrby(verdictKey, 1)

    return NextResponse.json({ success: true, remaining: Math.max(0, remaining) })
  } catch (err) {
    console.error('use-event-credit error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
