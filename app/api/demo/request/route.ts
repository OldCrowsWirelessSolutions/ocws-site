import { NextRequest, NextResponse } from 'next/server'
import { createDemoRequest } from '@/lib/demoRequests'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body._hp) return NextResponse.json({ success: true })

    const { name, email, company, problem, contactMethod = 'email', phone } = body
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    const request = await createDemoRequest({ name, email, company, problem, contactMethod, phone })
    return NextResponse.json({ success: true, id: request.id })
  } catch (err) {
    console.error('Demo request error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
