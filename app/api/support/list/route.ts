import { NextRequest, NextResponse } from 'next/server'
import { listTickets, TicketStatus } from '@/lib/supportTickets'
import { isValidAdminKey } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { authKey, status } = await req.json()
    if (!isValidAdminKey(authKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tickets = await listTickets(status as TicketStatus | undefined)
    return NextResponse.json({ tickets })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
