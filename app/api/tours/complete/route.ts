export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { markTourComplete } from '@/lib/tour-manager'

export async function POST(request: NextRequest) {
  try {
    const { code, tourId } = await request.json() as { code?: string; tourId?: string }
    if (!code || !tourId) return NextResponse.json({ error: 'Code and tourId required' }, { status: 400 })
    await markTourComplete(code, tourId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to mark tour complete' }, { status: 500 })
  }
}
