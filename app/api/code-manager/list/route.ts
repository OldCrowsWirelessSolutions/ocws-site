import { NextRequest, NextResponse } from 'next/server';
import { getAllCodes, searchCodes } from '@/lib/codeManager';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'SpectrumLife2026!!';
const VIP_CODES = [
  process.env.VIP_NATE_CODE,
  process.env.VIP_MIKE_CODE,
  process.env.VIP_ERIC_CODE,
];

function getRole(authKey: string): 'admin' | 'vip' | 'team_lead' | null {
  if (authKey === ADMIN_KEY) return 'admin';
  if (VIP_CODES.includes(authKey)) return 'vip';
  return 'team_lead';
}

export async function POST(req: NextRequest) {
  try {
    const { authKey, query } = await req.json();
    const role = getRole(authKey);
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const codes = query
      ? await searchCodes(query, role, authKey)
      : await getAllCodes(role, authKey);

    return NextResponse.json({ codes });
  } catch (err) {
    console.error('Code manager list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
