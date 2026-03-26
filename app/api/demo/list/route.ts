import { NextRequest, NextResponse } from 'next/server'
import { listDemoTokens } from '@/lib/demoTokens'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY!
const VIP_CODES = [process.env.VIP_NATE_CODE, process.env.VIP_MIKE_CODE, process.env.VIP_ERIC_CODE]

export async function POST(req: NextRequest) {
  try {
    const { authKey } = await req.json()
    const isAdmin = authKey === ADMIN_KEY
    const isVIP = VIP_CODES.includes(authKey)
    if (!isAdmin && !isVIP) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const tokens = await listDemoTokens(isAdmin ? undefined : authKey)
    return NextResponse.json({ tokens })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
