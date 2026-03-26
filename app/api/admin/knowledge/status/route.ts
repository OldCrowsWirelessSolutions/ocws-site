export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeBase, getKnowledgeLastUpdated } from '@/lib/corvus-knowledge'

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [lastUpdated, knowledgeBase] = await Promise.all([
      getKnowledgeLastUpdated(),
      getKnowledgeBase(),
    ])

    // Calculate next scheduled update (1st of next quarter)
    const now = new Date()
    const month = now.getMonth() // 0-indexed
    const quarterMonths = [0, 3, 6, 9] // Jan, Apr, Jul, Oct
    const nextQuarterMonth = quarterMonths.find(m => m > month) ?? 0
    const nextYear = nextQuarterMonth === 0 ? now.getFullYear() + 1 : now.getFullYear()
    const nextScheduled = new Date(nextYear, nextQuarterMonth, 1).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    return NextResponse.json({
      lastUpdated,
      nextScheduled,
      knowledgeSize: knowledgeBase.length,
    })
  } catch (error) {
    console.error('[knowledge/status] failed:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}
