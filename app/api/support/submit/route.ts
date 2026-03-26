import { NextRequest, NextResponse } from 'next/server'
import { createTicket, TicketProduct } from '@/lib/supportTickets'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body._hp) return NextResponse.json({ success: true })

    const { product, description, submitterEmail, submitterName, authKey, tier, screenshotUrls = [] } = body
    if (!product || !description || !submitterEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ticket = await createTicket({
      product: product as TicketProduct,
      description,
      submitterEmail,
      submitterName,
      authKey,
      tier,
      screenshotUrls,
    })

    return NextResponse.json({ success: true, ticketId: ticket.id, priority: ticket.priority })
  } catch (err) {
    console.error('Support ticket error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
