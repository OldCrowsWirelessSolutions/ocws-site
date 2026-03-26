import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });
  if (!code.startsWith('CORVUS-FLEDGLING-')) {
    return NextResponse.json({ error: 'Not a Fledgling code' }, { status: 400 });
  }

  const verdictUsedRaw = await redis.get<string>(`sub:${code}:fledgling_verdict_used`);
  const verdictUsed = verdictUsedRaw === 'true';

  // isFirst: true if the key has never been set (new subscriber before any interaction)
  const hasVisited = await redis.get<string>(`sub:${code}:fledgling_visited`);
  const isFirst = !hasVisited;

  // Mark as visited
  if (!hasVisited) {
    await redis.set(`sub:${code}:fledgling_visited`, 'true');
  }

  return NextResponse.json({ verdictUsed, isFirst });
}
