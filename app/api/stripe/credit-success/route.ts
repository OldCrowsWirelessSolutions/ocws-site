import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  const resume = searchParams.get('resume') === 'true'

  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const redirectUrl = new URL('/dashboard', req.url)

  return NextResponse.redirect(redirectUrl)
}
