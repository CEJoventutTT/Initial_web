import 'server-only'

import { getRedis } from '@/lib/redis'

export type RateLimitResult = {
  limited: boolean
  remaining: number
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis rate limiting is not configured')

  const requests = await redis.incr(key)
  if (requests === 1) await redis.expire(key, windowSeconds)

  return {
    limited: requests > limit,
    remaining: Math.max(0, limit - requests),
  }
}
