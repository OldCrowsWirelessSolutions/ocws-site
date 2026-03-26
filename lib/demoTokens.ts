import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export type DemoAccessLevel = 'fledgling' | 'nest' | 'flock' | 'full'

export type DemoTokenConfig = {
  accessLevel: DemoAccessLevel
  expiresInHours: number
  maxUses: number
  createdBy: string
  label?: string
  allowPDF: boolean
  allowReckoning: boolean
}

export type DemoToken = {
  token: string
  accessLevel: DemoAccessLevel
  createdAt: number
  expiresAt: number
  maxUses: number
  useCount: number
  createdBy: string
  label?: string
  allowPDF: boolean
  allowReckoning: boolean
  revoked: boolean
  lastUsedAt?: number
  lastUsedIP?: string
}

export type DemoSession = {
  token: string
  accessLevel: DemoAccessLevel
  expiresAt: number
  allowPDF: boolean
  allowReckoning: boolean
  usesRemaining: number | 'unlimited'
}

const TOKEN_PREFIX = 'demo:token:'
const INDEX_KEY = 'demo:index'

export async function generateDemoToken(config: DemoTokenConfig): Promise<DemoToken> {
  const token = 'CORVUS-DEMO-' + nanoid(10).toUpperCase()
  const now = Date.now()
  const expiresAt = now + config.expiresInHours * 60 * 60 * 1000

  const allowPDF = config.allowPDF ?? (config.accessLevel === 'flock' || config.accessLevel === 'full')
  const allowReckoning = config.allowReckoning ?? (config.accessLevel === 'flock' || config.accessLevel === 'full')

  const demoToken: DemoToken = {
    token,
    accessLevel: config.accessLevel,
    createdAt: now,
    expiresAt,
    maxUses: config.maxUses,
    useCount: 0,
    createdBy: config.createdBy,
    label: config.label,
    allowPDF,
    allowReckoning,
    revoked: false,
  }

  const ttlSeconds = Math.ceil((expiresAt - now) / 1000) + 3600
  await redis.set(TOKEN_PREFIX + token, JSON.stringify(demoToken), { ex: ttlSeconds })
  await redis.zadd(INDEX_KEY, { score: now, member: token })

  return demoToken
}

export async function validateDemoToken(
  token: string,
  ip?: string
): Promise<{ valid: boolean; session?: DemoSession; reason?: string }> {
  const raw = await redis.get<string>(TOKEN_PREFIX + token)
  if (!raw) return { valid: false, reason: 'Token not found or expired' }

  const data: DemoToken = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (data.revoked) return { valid: false, reason: 'Token has been revoked' }

  const now = Date.now()
  if (now > data.expiresAt) return { valid: false, reason: 'Token has expired' }
  if (data.maxUses > 0 && data.useCount >= data.maxUses) {
    return { valid: false, reason: 'Token has reached its use limit' }
  }

  data.useCount += 1
  data.lastUsedAt = now
  if (ip) data.lastUsedIP = ip

  const ttlSeconds = Math.ceil((data.expiresAt - now) / 1000)
  await redis.set(TOKEN_PREFIX + token, JSON.stringify(data), { ex: ttlSeconds })

  const usesRemaining: number | 'unlimited' =
    data.maxUses === 0 ? 'unlimited' : data.maxUses - data.useCount

  return {
    valid: true,
    session: {
      token: data.token,
      accessLevel: data.accessLevel,
      expiresAt: data.expiresAt,
      allowPDF: data.allowPDF,
      allowReckoning: data.allowReckoning,
      usesRemaining,
    },
  }
}

export async function revokeDemoToken(token: string): Promise<boolean> {
  const raw = await redis.get<string>(TOKEN_PREFIX + token)
  if (!raw) return false
  const data: DemoToken = typeof raw === 'string' ? JSON.parse(raw) : raw
  data.revoked = true
  await redis.set(TOKEN_PREFIX + token, JSON.stringify(data), { ex: 3600 })
  return true
}

export async function listDemoTokens(createdBy?: string): Promise<DemoToken[]> {
  const members = await redis.zrange(INDEX_KEY, 0, -1, { rev: true })
  const tokens: DemoToken[] = []
  for (const member of members) {
    const raw = await redis.get<string>(TOKEN_PREFIX + member)
    if (!raw) continue
    const data: DemoToken = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (createdBy && data.createdBy !== createdBy) continue
    tokens.push(data)
  }
  return tokens
}

export function getDemoTokenURL(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://oldcrowswireless.com'
  return `${base}/demo/${token}`
}
