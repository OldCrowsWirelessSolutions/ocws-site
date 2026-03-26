import { NextRequest, NextResponse } from 'next/server'
import { validateDemoToken } from '@/lib/demoTokens'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ valid: false, reason: 'No token provided' })
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
    const result = await validateDemoToken(token, ip)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ valid: false, reason: 'Server error' })
  }
}
