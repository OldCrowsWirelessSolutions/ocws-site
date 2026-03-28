import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscriberByCode,
  getSubscriberByEmail,
  getScanHistory,
  getLifetimeStats,
  updateSubscriberNotes,
  addCreditsToSubscriber,
} from '@/lib/codeManager';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'SpectrumLife2026!!';
const VIP_CODES = [
  process.env.VIP_NATE_CODE,
  process.env.VIP_MIKE_CODE,
  process.env.VIP_ERIC_CODE,
];

export async function POST(req: NextRequest) {
  try {
    const { authKey, action, code, email, notes, credits } = await req.json();

    const isAdmin = authKey === ADMIN_KEY;
    const isVIP = (VIP_CODES as (string | undefined)[]).includes(authKey);

    if (!isAdmin && !isVIP) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'lookup': {
        const sub = code
          ? await getSubscriberByCode(code)
          : email
          ? await getSubscriberByEmail(email)
          : null;

        if (!sub) return NextResponse.json({ found: false });

        const scans = await getScanHistory(sub.code, 50);
        const lifetime = await getLifetimeStats(sub.code);

        return NextResponse.json({ found: true, subscriber: sub, scans, lifetime });
      }

      case 'update_notes': {
        if (!code || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        await updateSubscriberNotes(code, notes || '');
        return NextResponse.json({ success: true });
      }

      case 'add_credits': {
        if (!code || !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        await addCreditsToSubscriber(code, credits || 0);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    console.error('Code manager profile error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
