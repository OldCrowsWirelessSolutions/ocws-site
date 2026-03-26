import { NextRequest, NextResponse } from 'next/server'
import { generateDemoToken, getDemoTokenURL, DemoAccessLevel } from '@/lib/demoTokens'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY!
const VIP_CODES = [process.env.VIP_NATE_CODE, process.env.VIP_MIKE_CODE, process.env.VIP_ERIC_CODE]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { authKey, accessLevel = 'fledgling', expiresInHours = 24, maxUses = 1, label, clientName, allowPDF, allowReckoning } = body

    const isAdmin = authKey === ADMIN_KEY
    const isVIP = VIP_CODES.includes(authKey)
    if (!isAdmin && !isVIP) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (isVIP && !isAdmin) {
      const vipAllowed: DemoAccessLevel[] = ['fledgling', 'nest']
      if (!vipAllowed.includes(accessLevel as DemoAccessLevel)) {
        return NextResponse.json({ error: 'VIPs may only generate fledgling or nest demo tokens' }, { status: 403 })
      }
    }

    const allowedHours = [1, 6, 24, 72, 168]
    if (!allowedHours.includes(expiresInHours)) {
      return NextResponse.json({ error: 'Invalid expiry. Use: 1, 6, 24, 72, or 168 hours' }, { status: 400 })
    }

    const token = await generateDemoToken({
      accessLevel: accessLevel as DemoAccessLevel,
      expiresInHours,
      maxUses,
      createdBy: isAdmin ? 'admin' : authKey,
      label,
      clientName,
      allowPDF: allowPDF ?? false,
      allowReckoning: allowReckoning ?? false,
    })

    return NextResponse.json({
      success: true,
      token: token.token,
      url: getDemoTokenURL(token.token),
      accessLevel: token.accessLevel,
      expiresAt: token.expiresAt,
      maxUses: token.maxUses,
      label: token.label,
    })
  } catch (err) {
    console.error('Demo token generate error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
