// lib/redis.ts
// Upstash Redis client — serverless-safe HTTP REST, no persistent connections.
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment.

import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    "[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. " +
    "Subscription features will not function until these are set."
  );
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

export default redis;
