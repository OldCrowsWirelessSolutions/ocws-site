import { NextRequest, NextResponse } from 'next/server';
import { validateTourToken } from '@/lib/corvusTour';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ valid: false, reason: 'No token provided.' });
    const result = await validateTourToken(token);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ valid: false, reason: 'Server error.' });
  }
}
