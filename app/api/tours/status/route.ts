export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { getTourStatus } from '@/lib/tour-manager'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json() as { code?: string }
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })
    const status = await getTourStatus(code)
    return NextResponse.json({ status })
  } catch {
    return NextResponse.json({ status: {} })
  }
}
