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
  requestId?: string,
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis rate limiting is not configured')

  if (requestId) {
    const firstRequest = await redis.set(`${key}:request:${requestId}`, '1', { nx: true, ex: windowSeconds })
    if (firstRequest === null) return { limited: false, remaining: limit }
  }

  const requests = await redis.incr(key)
  if (requests === 1) await redis.expire(key, windowSeconds)

  return {
    limited: requests > limit,
    remaining: Math.max(0, limit - requests),
  }
}
