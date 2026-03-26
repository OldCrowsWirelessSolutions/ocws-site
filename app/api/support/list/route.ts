import { NextRequest, NextResponse } from 'next/server'
import { listTickets, TicketStatus } from '@/lib/supportTickets'

export async function POST(req: NextRequest) {
  try {
    const { authKey, status } = await req.json()
    if (authKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tickets = await listTickets(status as TicketStatus | undefined)
    return NextResponse.json({ tickets })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
