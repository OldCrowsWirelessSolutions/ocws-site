// lib/v2-schema.ts
// V2 Redis key schema. Centralizes key string generation so route handlers
// and cron jobs don't drift. Key prefix `corvus:v2:*` keeps V2 data cleanly
// separated from V1 so either generation can be wiped without disturbing
// the other.

export const redisKeys = {
  user: (userId: string) => `corvus:v2:user:${userId}`,

  businessMetricsDaily: (yyyymmdd: string) =>
    `corvus:v2:business:metrics:daily:${yyyymmdd}`,

  anthropicUsage: (yyyymmdd: string) => `corvus:v2:usage:anthropic:${yyyymmdd}`,
  elevenLabsUsage: (yyyymmdd: string) => `corvus:v2:usage:elevenlabs:${yyyymmdd}`,

  verdictPattern: "corvus:v2:verdict:*",
  userPattern: "corvus:v2:user:*",
  chatSessionPattern: "corvus:v2:chat:session:*",
} as const;
