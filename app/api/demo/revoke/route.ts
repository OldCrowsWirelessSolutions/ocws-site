import { NextRequest, NextResponse } from 'next/server'
import { revokeDemoToken } from '@/lib/demoTokens'

export async function POST(req: NextRequest) {
  try {
    const { authKey, token } = await req.json()
    if (authKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const revoked = await revokeDemoToken(token)
    return NextResponse.json({ success: revoked })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
