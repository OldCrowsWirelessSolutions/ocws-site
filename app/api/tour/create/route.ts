import { NextRequest, NextResponse } from 'next/server';
import { createTourToken, getTourURL, TourLevel } from '@/lib/corvusTour';
import { isValidAdminKey } from "@/lib/adminAuth";

const VIP_CODES = [
  process.env.VIP_NATE_CODE,
  process.env.VIP_MIKE_CODE,
  process.env.VIP_ERIC_CODE,
];

export async function POST(req: NextRequest) {
  try {
    const { authKey, level, visitorName, expiresInDays = 7, label } = await req.json();

    const isAdmin = isValidAdminKey(authKey);
    const isVIP = VIP_CODES.includes(authKey);
    if (!isAdmin && !isVIP) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validLevels: TourLevel[] = ['nest', 'flock', 'murder', 'full', 'verdict', 'reckoning', 'compare'];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: 'Invalid tour level' }, { status: 400 });
    }

    const token = await createTourToken(
      level as TourLevel,
      isAdmin ? 'admin' : authKey,
      visitorName || undefined,
      expiresInDays,
      label
    );

    return NextResponse.json({
      success: true,
      token: token.token,
      url: getTourURL(token.token),
      level: token.level,
      visitorName: token.visitorName,
      expiresAt: token.expiresAt,
    });
  } catch (err) {
    console.error('Tour create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
