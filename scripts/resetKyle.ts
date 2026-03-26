import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

async function resetKyle() {
  const kyleData = {
    code: 'CORVUS-KYLE',
    tier: 'flock',
    name: 'Kyle Pitts',
    credits: 15,
    maxCredits: 15,
    resetDay: 1,
    lastReset: new Date().toISOString(),
    permanent: true,
    revoked: false,
    createdAt: Date.now(),
    note: 'Lifetime Flock — Olive Garden story — on the house forever',
  }

  await redis.set('subscriber:CORVUS-KYLE', JSON.stringify(kyleData))
  console.log('✓ CORVUS-KYLE reset to 15 credits')
  console.log('✓ Kyle Pitts — Lifetime Flock restored')
}

resetKyle()
