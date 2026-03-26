// lib/tour-manager.ts
// Tracks which tours a user has completed via Redis.

import redis from '@/lib/redis'

const TTL = 365 * 24 * 60 * 60 // 1 year

export async function getTourStatus(code: string): Promise<Record<string, boolean>> {
  try {
    const stored = await redis.get(`tours:${code.toUpperCase()}`)
    return stored ? JSON.parse(stored as string) as Record<string, boolean> : {}
  } catch {
    return {}
  }
}

export async function markTourComplete(code: string, tourId: string): Promise<void> {
  const current = await getTourStatus(code)
  current[tourId] = true
  await redis.set(`tours:${code.toUpperCase()}`, JSON.stringify(current), { ex: TTL })
}

export function shouldAutoShowTour(status: Record<string, boolean>, tourId: string): boolean {
  return !status[tourId]
}
