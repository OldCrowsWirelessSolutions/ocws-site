import { NextRequest, NextResponse } from 'next/server'
import { updateTicket } from '@/lib/supportTickets'

export async function POST(req: NextRequest) {
  try {
    const { authKey, ticketId, updates } = await req.json()
    if (authKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const ticket = await updateTicket(ticketId, updates)
    return NextResponse.json({ success: true, ticket })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
