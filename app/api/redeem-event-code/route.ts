import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Hard expiry: Sunday May 10 2026 23:59:00 Central = Monday May 11 04:59:00 UTC
const CODE_EXPIRY_UTC = new Date('2026-05-11T04:59:00Z').getTime()

const EVENT_CODES: Record<string, {
  verdicts: number
  chatHours: number
  label: string
}> = {
  HACKTHECOAST2026: {
    verdicts: 1,
    chatHours: 24,
    label: 'Hack the Coast 2026'
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, name, email, howHeard } = await req.json()

    if (!code || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const normalized = code.trim().toUpperCase()
    const config = EVENT_CODES[normalized]

    if (!config) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 404 })
    }

    // Check code expiry
    if (Date.now() > CODE_EXPIRY_UTC) {
      return NextResponse.json({ error: 'This code has expired.' }, { status: 410 })
    }

    const emailKey = email.toLowerCase().trim()
    const redemptionKey = `event_redemption:${normalized}:${emailKey}`

    // Check if already redeemed
    const alreadyRedeemed = await redis.get(redemptionKey)
    if (alreadyRedeemed) {
      return NextResponse.json({ error: 'This code has already been redeemed with that email.' }, { status: 409 })
    }

    const now = Date.now()
    const chatExpiry = now + config.chatHours * 60 * 60 * 1000

    // Mark redemption (expires with the code window)
    const ttlSeconds = Math.floor((CODE_EXPIRY_UTC - now) / 1000)
    await redis.set(redemptionKey, { name, email: emailKey, redeemedAt: now }, { ex: ttlSeconds })

    // Grant verdict credit
    const verdictKey = `event_verdicts:${emailKey}`
    await redis.incrby(verdictKey, config.verdicts)
    await redis.expireat(verdictKey, Math.floor(CODE_EXPIRY_UTC / 1000))

    // Grant chat access with 24hr expiry
    const chatKey = `event_chat_access:${emailKey}`
    await redis.set(chatKey, { grantedAt: now, expiresAt: chatExpiry }, {
      ex: config.chatHours * 3600
    })

    // Log to CRM list
    await redis.lpush(`event_redemptions:${normalized}`, JSON.stringify({
      name,
      email: emailKey,
      howHeard: howHeard || 'not specified',
      redeemedAt: new Date(now).toISOString(),
      code: normalized
    }))

    // Send notification email to Joshua
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notify-redemption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: emailKey, code: normalized, howHeard })
      })
    } catch (_) {}

    return NextResponse.json({
      success: true,
      grants: {
        verdicts: config.verdicts,
        chatAccess: true,
        chatExpiresAt: new Date(chatExpiry).toISOString(),
        codeLabel: config.label
      }
    })

  } catch (err) {
    console.error('Event code redemption error:', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
