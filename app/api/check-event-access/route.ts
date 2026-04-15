import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ hasAccess: false })

    const emailKey = email.toLowerCase().trim()

    const [chatAccess, verdictCredits] = await Promise.all([
      redis.get(`event_chat_access:${emailKey}`),
      redis.get(`event_verdicts:${emailKey}`)
    ])

    return NextResponse.json({
      hasChatAccess: !!chatAccess,
      chatAccess: chatAccess || null,
      verdictCredits: verdictCredits ? Number(verdictCredits) : 0
    })
  } catch (err) {
    return NextResponse.json({ hasAccess: false }, { status: 500 })
  }
}
