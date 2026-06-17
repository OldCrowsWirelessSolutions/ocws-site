import { NextRequest, NextResponse } from 'next/server'
import { updateTicket } from '@/lib/supportTickets'
import { isValidAdminKey } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { authKey, ticketId, updates } = await req.json()
    if (!isValidAdminKey(authKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const ticket = await updateTicket(ticketId, updates)
    return NextResponse.json({ success: true, ticket })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
