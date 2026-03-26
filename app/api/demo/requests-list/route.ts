import { NextRequest, NextResponse } from 'next/server'
import { listDemoRequests, updateDemoRequest } from '@/lib/demoRequests'

export async function POST(req: NextRequest) {
  try {
    const { authKey, action, id, updates } = await req.json()
    if (authKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'update' && id) {
      const updated = await updateDemoRequest(id, updates)
      return NextResponse.json({ success: true, request: updated })
    }

    const requests = await listDemoRequests()
    return NextResponse.json({ requests })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
