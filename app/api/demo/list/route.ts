import { NextRequest, NextResponse } from 'next/server'
import { listDemoTokens } from '@/lib/demoTokens'
import { isValidAdminKey } from "@/lib/adminAuth";

const VIP_CODES = [process.env.VIP_NATE_CODE, process.env.VIP_MIKE_CODE, process.env.VIP_ERIC_CODE]

export async function POST(req: NextRequest) {
  try {
    const { authKey } = await req.json()
    const isAdmin = isValidAdminKey(authKey)
    const isVIP = VIP_CODES.includes(authKey)
    if (!isAdmin && !isVIP) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const tokens = await listDemoTokens(isAdmin ? undefined : authKey)
    return NextResponse.json({ tokens })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
